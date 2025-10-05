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
import requests

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

# Configure Vercel Blob
BLOB_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN")

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

# Vercel Blob Storage Helper Functions
def upload_to_blob(file_content: bytes, filename: str) -> str:
    """Upload file to Vercel Blob Storage and return the URL"""
    try:
        print(f"[DEBUG] Uploading {filename} to Vercel Blob...")
        
        headers = {
            "Authorization": f"Bearer {BLOB_TOKEN}",
        }
        
        # Use Vercel Blob API to upload
        response = requests.put(
            f"https://blob.vercel-storage.com/{filename}",
            headers=headers,
            data=file_content,
            params={"filename": filename}
        )
        
        if response.status_code == 200:
            blob_url = response.json().get("url")
            print(f"[DEBUG] Successfully uploaded to: {blob_url}")
            return blob_url
        else:
            print(f"[ERROR] Failed to upload to Blob: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Error uploading to Blob: {e}")
        return None

def download_from_blob(blob_url: str, local_path: str) -> bool:
    """Download file from Vercel Blob Storage to local path"""
    try:
        print(f"[DEBUG] Downloading from Blob: {blob_url}")
        
        response = requests.get(blob_url)
        
        if response.status_code == 200:
            with open(local_path, 'wb') as f:
                f.write(response.content)
            print(f"[DEBUG] Successfully downloaded to: {local_path}")
            return True
        else:
            print(f"[ERROR] Failed to download from Blob: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Error downloading from Blob: {e}")
        return False

def list_blobs() -> dict:
    """List all blobs in storage"""
    try:
        headers = {
            "Authorization": f"Bearer {BLOB_TOKEN}",
        }
        
        response = requests.get(
            "https://blob.vercel-storage.com/",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"[ERROR] Failed to list blobs: {response.status_code}")
            return {"blobs": []}
            
    except Exception as e:
        print(f"[ERROR] Error listing blobs: {e}")
        return {"blobs": []}

def extract_audio_features(audio_path: str) -> Dict:
    """Extract acoustic features from audio file"""
    try:
        print(f"[DEBUG] Extracting features from: {audio_path}")
        print(f"[DEBUG] File exists: {os.path.exists(audio_path)}")
        print(f"[DEBUG] File size: {os.path.getsize(audio_path) if os.path.exists(audio_path) else 0} bytes")
        
        # Check if file exists and has content
        if not os.path.exists(audio_path):
            print(f"[ERROR] Audio file not found: {audio_path}")
            return None
            
        if os.path.getsize(audio_path) == 0:
            print(f"[ERROR] Audio file is empty: {audio_path}")
            return None
        
        print("[DEBUG] Loading audio with parselmouth...")
        sound = parselmouth.Sound(audio_path)
        duration = sound.get_total_duration()
        print(f"[DEBUG] Duration: {duration}s")
        
        print("[DEBUG] Extracting pitch...")
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
        
        print("[DEBUG] Loading audio with librosa...")
        y, sr = librosa.load(audio_path, sr=SAMPLE_RATE)
        print(f"[DEBUG] Audio loaded: {len(y)} samples at {sr}Hz")
        
        print("[DEBUG] Extracting RMS energy...")
        rms_data = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)
        rms_time_series = rms_data[0]
        rms_timestamps = librosa.frames_to_time(np.arange(len(rms_time_series)), sr=sr, hop_length=512)
        avg_energy = float(np.mean(rms_time_series))
        
        print("[DEBUG] Feature extraction completed successfully!")
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
        import traceback
        print(f"[ERROR] Error extracting features: {e}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
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
    compare_path = None
    base_path = None
    
    try:
        print(f"[DEBUG] Received file: {file.filename}, content_type: {file.content_type}")
        
        # Read uploaded file content
        content = await file.read()
        print(f"[DEBUG] Read {len(content)} bytes from uploaded file")
        
        # Upload to Vercel Blob Storage
        blob_url = upload_to_blob(content, "compare.wav")
        
        if not blob_url:
            return {"status": "error", "message": "Failed to upload audio to cloud storage"}
        
        # Download to temporary local file for processing
        compare_path = os.path.join(tempfile.gettempdir(), f'compare_{os.getpid()}.wav')
        
        if not download_from_blob(blob_url, compare_path):
            return {"status": "error", "message": "Failed to download audio from cloud storage"}
        
        print(f"[DEBUG] Downloaded to temporary file: {compare_path}")
        print(f"[DEBUG] File size: {os.path.getsize(compare_path)} bytes")
        
        # Extract features from uploaded file
        uploaded_features = extract_audio_features(compare_path)
        
        if not uploaded_features:
            print("[ERROR] Failed to extract features from uploaded audio")
            return {"status": "error", "message": "Failed to extract features from uploaded audio"}
        
        print("[DEBUG] Successfully extracted features from uploaded audio")
        
        # Try to load base.wav from Vercel Blob Storage
        base_features = None
        analysis = None
        
        # First check if base.wav exists in local audio folder (for local development)
        local_base_path = os.path.join(os.path.dirname(__file__), '..', 'audio', 'base.wav')
        
        if os.path.exists(local_base_path):
            print(f"[DEBUG] Found local base.wav at: {local_base_path}")
            base_path = local_base_path
        else:
            # Try to find base.wav in Vercel Blob Storage
            print("[DEBUG] Checking Vercel Blob Storage for base.wav...")
            print(f"[DEBUG] BLOB_TOKEN present: {bool(BLOB_TOKEN)}")
            
            blobs = list_blobs()
            print(f"[DEBUG] Found {len(blobs.get('blobs', []))} blobs in storage")
            
            base_blob_url = None
            
            for blob in blobs.get("blobs", []):
                pathname = blob.get("pathname", "")
                blob_url = blob.get("url", "")
                print(f"[DEBUG] Checking blob: pathname='{pathname}', url='{blob_url}'")
                
                # Check for exact match or ends with base.wav
                if pathname == "base.wav" or pathname.endswith("/base.wav") or "base" in pathname.lower():
                    base_blob_url = blob_url
                    print(f"[DEBUG] ✅ Found base.wav in Blob Storage: {base_blob_url}")
                    break
            
            if base_blob_url:
                # Download base.wav to temp location
                base_path = os.path.join(tempfile.gettempdir(), f'base_{os.getpid()}.wav')
                print(f"[DEBUG] Attempting to download base.wav to: {base_path}")
                
                if download_from_blob(base_blob_url, base_path):
                    print(f"[DEBUG] ✅ Successfully downloaded base.wav to: {base_path}")
                    print(f"[DEBUG] Downloaded file size: {os.path.getsize(base_path)} bytes")
                else:
                    print("[ERROR] ❌ Failed to download base.wav from Blob Storage")
                    base_path = None
            else:
                print("[ERROR] ❌ base.wav not found in Blob Storage")
        
        if base_path and os.path.exists(base_path):
            print(f"[DEBUG] ✅ Loading base audio from: {base_path}")
            base_features = extract_audio_features(base_path)
            
            if base_features:
                print(f"[DEBUG] ✅ Base features extracted successfully:")
                print(f"[DEBUG]   - avg_pitch: {base_features['avg_pitch']} Hz")
                print(f"[DEBUG]   - pitch_variability: {base_features['pitch_variability']}")
                print(f"[DEBUG]   - avg_energy: {base_features['avg_energy']}")
                print(f"[DEBUG]   - voicing_ratio: {base_features['voicing_ratio']}")
                
                global BASE_FEATURES
                BASE_FEATURES = {
                    "avg_pitch": base_features["avg_pitch"],
                    "pitch_variability": base_features["pitch_variability"],
                    "avg_energy": base_features["avg_energy"],
                    "voicing_ratio": base_features["voicing_ratio"],
                    "duration": base_features["duration"]
                }
                
                # Analyze with Gemini
                print("[DEBUG] 🤖 Starting Gemini analysis comparison...")
                print(f"[DEBUG] Uploaded audio features:")
                print(f"[DEBUG]   - avg_pitch: {uploaded_features['avg_pitch']} Hz")
                print(f"[DEBUG]   - pitch_variability: {uploaded_features['pitch_variability']}")
                print(f"[DEBUG]   - avg_energy: {uploaded_features['avg_energy']}")
                print(f"[DEBUG]   - voicing_ratio: {uploaded_features['voicing_ratio']}")
                
                analysis = await analyze_with_gemini(uploaded_features, BASE_FEATURES)
                print("[DEBUG] ✅ Gemini analysis complete!")
                
                if analysis:
                    print(f"[DEBUG] Analysis result: {analysis.get('overall_status', 'Unknown')}")
            else:
                print("[ERROR] ❌ Failed to extract features from base.wav")
        else:
            print(f"[WARNING] ⚠️ base.wav not found, will proceed without comparison")
            print(f"[WARNING] Upload a base.wav file to enable risk assessment")
        
        print("[DEBUG] Returning success response")
        return {
            "status": "success",
            "message": "Audio processed successfully",
            "uploaded_features": uploaded_features,
            "base_features": base_features,
            "analysis": analysis,
            "blob_url": blob_url
        }
        
    except Exception as e:
        import traceback
        print(f"[ERROR] Error in upload endpoint: {e}")
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        return {"status": "error", "message": str(e)}
        
    finally:
        # Clean up temporary files
        try:
            if compare_path and os.path.exists(compare_path):
                os.unlink(compare_path)
                print(f"[DEBUG] Cleaned up temporary compare file: {compare_path}")
            
            # Only clean up base if it was downloaded from blob (not local)
            if base_path and base_path.startswith(tempfile.gettempdir()) and os.path.exists(base_path):
                os.unlink(base_path)
                print(f"[DEBUG] Cleaned up temporary base file: {base_path}")
        except Exception as cleanup_error:
            print(f"[DEBUG] Cleanup warning: {cleanup_error}")

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