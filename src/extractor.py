import numpy as np
import librosa
import parselmouth
import os
import matplotlib.pyplot as plt

# Global constants (can be imported by other files)
SAMPLE_RATE = 16000
MIN_F0 = 75.0 # Hz
MAX_F0 = 500.0 # Hz 

def extract_audio_features(audio_path: str):
    """
    Loads an audio file and extracts key acoustic features, including time-series data
    needed for plotting.

    Args:
        audio_path: The file path to the audio (.wav, .mp3, etc.).

    Returns:
        A dictionary containing the summary statistics and time-series data, or None if an error occurs.
    """
    if not os.path.exists(audio_path):
        print(f"Error: Audio file not found at {audio_path}")
        return None

    print(f"\nAnalyzing {os.path.basename(audio_path)}...")
    try:
        # --- Pitch (F0) Extraction using Parselmouth ---
        sound = parselmouth.Sound(audio_path)
        duration = sound.get_total_duration() 
        
        pitch = sound.to_pitch(time_step=0.01, pitch_floor=MIN_F0, pitch_ceiling=MAX_F0)
        
        pitch_time_series = pitch.selected_array['frequency']
        
        pitch_interval = pitch.get_time_step() 
        pitch_timestamps = np.arange(len(pitch_time_series)) * pitch_interval
        
        # Voiced segments analysis
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
        
        # --- Energy (RMS) Extraction using Librosa ---
        y, sr = librosa.load(audio_path, sr=SAMPLE_RATE)
        # Using standard frame/hop lengths for general RMS calculation
        rms_data = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)
        rms_time_series = rms_data[0]

        rms_timestamps = librosa.frames_to_time(np.arange(len(rms_time_series)), sr=sr, hop_length=512)

        avg_energy = float(np.mean(rms_time_series))

        return {
            "file_name": os.path.basename(audio_path),
            "avg_pitch": round(avg_pitch, 2), 
            "pitch_variability": round(pitch_variability, 4),
            "avg_energy": round(avg_energy, 4),
            "voicing_ratio": round(voicing_ratio, 4),
            "duration": round(duration, 2), 
            "pitch_time_series": pitch_time_series,
            "pitch_timestamps": pitch_timestamps,
            "rms_time_series": rms_time_series,
            "rms_timestamps": rms_timestamps,
        }

    except Exception as e:
        print(f"An error occurred during feature extraction for {os.path.basename(audio_path)}: {e}")
        return None

def plot_audio_features(features, audio_path):
    """
    Plots the time-series data for Pitch and RMS Energy of a single audio file.
    """
    plt.style.use('ggplot')
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), sharex=True)
    fig.suptitle(f"Acoustic Feature Analysis: {os.path.basename(audio_path)}", fontsize=16)

    pitch_ts = features['pitch_time_series']
    pitch_times = features['pitch_timestamps']
    
    # Only plot voiced segments (where F0 > 0)
    voiced_indices = pitch_ts > 0
    ax1.plot(pitch_times[voiced_indices], pitch_ts[voiced_indices], 
              color='#1f77b4', linewidth=2)
    ax1.set_title('Voiced Pitch (F0) over Time', fontsize=12)
    ax1.set_ylabel('Pitch (Hz)', fontsize=10)
    ax1.grid(True, linestyle='--', alpha=0.6)
    ax1.axhline(y=features['avg_pitch'], color='red', linestyle='-', linewidth=1, 
                  label=f"Avg Pitch: {features['avg_pitch']} Hz")
    ax1.legend(loc='upper right')

    # --- Energy Plot (RMS) ---
    rms_ts = features['rms_time_series']
    rms_times = features['rms_timestamps']

    ax2.plot(rms_times, rms_ts, color='#ff7f0e', linewidth=2)
    ax2.set_title('RMS Energy over Time', fontsize=12)
    ax2.set_ylabel('RMS Energy (Magnitude)', fontsize=10)
    ax2.set_xlabel('Time (seconds)', fontsize=10)
    ax2.grid(True, linestyle='--', alpha=0.6)
    ax2.axhline(y=features['avg_energy'], color='red', linestyle='-', linewidth=1, 
                  label=f"Avg Energy: {features['avg_energy']:.4f}")
    ax2.legend(loc='upper right')

    plt.tight_layout(rect=[0, 0, 1, 0.96])
    plt.show()