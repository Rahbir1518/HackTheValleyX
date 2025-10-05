from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import librosa
import parselmouth
import json
import os
import tempfile
import google.generativeai as genai
from typing import Dict, List
import asyncio

app = FastAPI()

# CORS configuration - supports both local and production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5175,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash-preview-05-20')

SAMPLE_RATE = 16000
MIN_F0 = 75.0
MAX_F0 = 500.0

# Store base audio features (from base.wav analysis)
BASE_FEATURES = {
    "avg_pitch": 0.0,
    "pitch_variability": 0.0,
    "avg_energy": 0.0,
    "voicing_ratio": 0.0,
    "duration": 0.0
}

def extract_audio_features(audio_path: str) -> Dict:
    """Extract acoustic features from audio file"""
    try:
        sound = parselmouth.Sound(audio_path)
        duration = sound.get_total_duration()
        
        pitch = sound.to_pitch(time_step=0.01, pitch_floor=MIN_F0, pitch_ceiling=MAX_F0)
        pitch_time_series = pitch.selected_array['frequency']
        pitch_interval = pitch.get_time_step()
        pitch_timestamps = np.arange(len(pitch_time_series)) * pitch_interval
        
        voiced_pitch_values = pitch_time_series[pitch_time_series > 0]
        total_frames = len(pitch_time_series)
        voiced_frames = len(voiced_pitch_values)
        voicing_ratio = voiced_frames / total_frames if total_frames > 0 else 0.0

        if len(voiced_pitch_values) > 0:
            avg_pitch = float(np.mean(voiced_pitch_values))
            pitch_variability = float(np.std(voiced_pitch_values))
        else:
            avg_pitch = 0.0
            pitch_variability = 0.0
        
        y, sr = librosa.load(audio_path, sr=SAMPLE_RATE)
        rms_data = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)
        rms_time_series = rms_data[0]
        rms_timestamps = librosa.frames_to_time(np.arange(len(rms_time_series)), sr=sr, hop_length=512)
        avg_energy = float(np.mean(rms_time_series))

        return {
            "avg_pitch": round(avg_pitch, 2),
            "pitch_variability": round(pitch_variability, 4),
            "avg_energy": round(avg_energy, 4),
            "voicing_ratio": round(voicing_ratio, 4),
            "duration": round(duration, 2),
            "pitch_time_series": pitch_time_series.tolist(),
            "pitch_timestamps": pitch_timestamps.tolist(),
            "rms_time_series": rms_time_series.tolist(),
            "rms_timestamps": rms_timestamps.tolist(),
        }
    except Exception as e:
        print(f"Error extracting features: {e}")
        return None

async def analyze_with_gemini(uploaded_features: Dict, base_features: Dict) -> Dict:
    """Use Gemini to analyze babble patterns and generate risk assessment"""
    prompt = f"""
You are a pediatric speech-language pathology AI assistant analyzing baby babble audio data.

**Base Audio (Normal Reference) Metrics:**
- Average Pitch: {base_features['avg_pitch']} Hz
- Pitch Variability: {base_features['pitch_variability']}
- Average Energy: {base_features['avg_energy']}
- Voicing Ratio: {base_features['voicing_ratio']}
- Duration: {base_features['duration']}s

**Uploaded Baby Audio Metrics:**
- Average Pitch: {uploaded_features['avg_pitch']} Hz
- Pitch Variability: {uploaded_features['pitch_variability']}
- Average Energy: {uploaded_features['avg_energy']}
- Voicing Ratio: {uploaded_features['voicing_ratio']}
- Duration: {uploaded_features['duration']}s

Based on these acoustic features, provide a detailed analysis in the following JSON format:

{{
  "risk_assessment": [
    {{
      "condition": "Autism Spectrum Disorder (ASD)",
      "risk_percentage": <number 0-100>,
      "status": "<Low Risk|Moderate Risk|High Risk>",
      "reasoning": "<brief explanation>"
    }},
    {{
      "condition": "Developmental Language Disorder (DLD)",
      "risk_percentage": <number 0-100>,
      "status": "<Low Risk|Moderate Risk|High Risk>",
      "reasoning": "<brief explanation>"
    }},
    {{
      "condition": "Hearing Impairment",
      "risk_percentage": <number 0-100>,
      "status": "<Low Risk|Moderate Risk|High Risk>",
      "reasoning": "<brief explanation>"
    }}
  ],
  "overall_status": "<Normal Development|Monitor Closely|Consult Specialist>",
  "next_steps": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>"
  ],
  "key_findings": "<brief summary of analysis>"
}}

Consider:
- Lower voicing ratio may indicate less vocal engagement
- Abnormal pitch patterns (too high/low or variable) may signal developmental concerns
- Energy patterns reflect vocal strength and consistency
- Compare deviations from baseline to assess risk levels

Respond ONLY with valid JSON, no additional text.
"""
    
    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean up markdown code blocks if present
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        
        result_text = result_text.strip()
        analysis = json.loads(result_text)
        return analysis
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return {
            "risk_assessment": [
                {"condition": "ASD", "risk_percentage": 0, "status": "Analysis Error", "reasoning": str(e)},
                {"condition": "DLD", "risk_percentage": 0, "status": "Analysis Error", "reasoning": str(e)},
                {"condition": "Hearing Impairment", "risk_percentage": 0, "status": "Analysis Error", "reasoning": str(e)}
            ],
            "overall_status": "Error",
            "next_steps": ["Please try uploading again"],
            "key_findings": f"Error during analysis: {str(e)}"
        }

@app.post("/upload-base-audio")
async def upload_base_audio(file: UploadFile = File(...)):
    """Upload and process audio, compare with base reference"""
    try:
        # Create audio directory if it doesn't exist
        audio_dir = os.path.join(os.path.dirname(__file__), '..', 'audio')
        os.makedirs(audio_dir, exist_ok=True)
        
        # Save as compare.wav
        compare_path = os.path.join(audio_dir, 'compare.wav')
        
        with open(compare_path, 'wb') as f:
            content = await file.read()
            f.write(content)
        
        print(f"Saved uploaded file to: {compare_path}")
        
        # Extract features from uploaded file
        uploaded_features = extract_audio_features(compare_path)
        
        if not uploaded_features:
            if os.path.exists(compare_path):
                os.unlink(compare_path)
            return {"status": "error", "message": "Failed to extract features from uploaded audio"}
        
        # Load base audio features if base.wav exists
        base_path = os.path.join(audio_dir, 'base.wav')
        base_features = None
        analysis = None
        
        if os.path.exists(base_path):
            print(f"Loading base audio from: {base_path}")
            base_features = extract_audio_features(base_path)
            
            if base_features:
                global BASE_FEATURES
                BASE_FEATURES = {
                    "avg_pitch": base_features["avg_pitch"],
                    "pitch_variability": base_features["pitch_variability"],
                    "avg_energy": base_features["avg_energy"],
                    "voicing_ratio": base_features["voicing_ratio"],
                    "duration": base_features["duration"]
                }
                
                # Analyze with Gemini
                print("Analyzing with Gemini...")
                analysis = await analyze_with_gemini(uploaded_features, BASE_FEATURES)
        else:
            print(f"Warning: base.wav not found at {base_path}")
        
        # Clean up compare.wav
        if os.path.exists(compare_path):
            os.unlink(compare_path)
            print("Cleaned up compare.wav")
        
        return {
            "status": "success",
            "message": "Audio processed successfully",
            "uploaded_features": uploaded_features,
            "base_features": base_features,
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"Error in upload: {e}")
        # Clean up on error
        compare_path = os.path.join(os.path.dirname(__file__), '..', 'audio', 'compare.wav')
        if os.path.exists(compare_path):
            os.unlink(compare_path)
        return {"status": "error", "message": str(e)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
                
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.send_json({"type": "error", "message": str(e)})

@app.get("/")
async def root():
    return {"message": "Mimicoo Audio Analysis API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)