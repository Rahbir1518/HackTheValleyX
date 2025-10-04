import numpy as np
import os
import matplotlib.pyplot as plt
from extractor import extract_audio_features 

current_directory = os.getcwd()

def plot_comparison(features1, features2):
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10), sharex=True)
    fig.suptitle("Acoustic Feature Comparison (Pitch & Energy)", fontsize=18, fontweight='bold')
    
    color1 = '#3498db'  # Blue
    color2 = '#e74c3c'  # Red
    
    max_duration = max(features1['duration'], features2['duration'])

    pitch_ts1 = features1['pitch_time_series']
    pitch_times1 = features1['pitch_timestamps']
    voiced_indices1 = pitch_ts1 > 0
    ax1.plot(pitch_times1[voiced_indices1], pitch_ts1[voiced_indices1], 
             color=color1, linewidth=2, alpha=0.7, 
             label=f"{features1['file_name']} (Avg: {features1['avg_pitch']} Hz)")

    pitch_ts2 = features2['pitch_time_series']
    pitch_times2 = features2['pitch_timestamps']
    voiced_indices2 = pitch_ts2 > 0
    ax1.plot(pitch_times2[voiced_indices2], pitch_ts2[voiced_indices2], 
             color=color2, linewidth=2, alpha=0.7, 
             label=f"{features2['file_name']} (Avg: {features2['avg_pitch']} Hz)")
    
    ax1.set_title('Voiced Pitch (F0) Trajectory Comparison', fontsize=14)
    ax1.set_ylabel('Pitch (Hz)', fontsize=12)
    ax1.legend(loc='upper right')
    ax1.grid(True, linestyle=':', alpha=0.7)

    rms_ts1 = features1['rms_time_series']
    rms_times1 = features1['rms_timestamps']
    ax2.plot(rms_times1, rms_ts1, 
             color=color1, linewidth=2, alpha=0.7, 
             label=f"{features1['file_name']} (Avg: {features1['avg_energy']:.4f})")

    rms_ts2 = features2['rms_time_series']
    rms_times2 = features2['rms_timestamps']
    ax2.plot(rms_times2, rms_ts2, 
             color=color2, linewidth=2, alpha=0.7, 
             label=f"{features2['file_name']} (Avg: {features2['avg_energy']:.4f})")

    ax2.set_title('RMS Energy Trajectory Comparison', fontsize=14)
    ax2.set_ylabel('RMS Energy (Magnitude)', fontsize=12)
    ax2.set_xlabel('Time (seconds)', fontsize=12)
    ax2.legend(loc='upper right')
    ax2.grid(True, linestyle=':', alpha=0.7)

    ax2.set_xlim(0, max_duration * 1.05) 

    plt.tight_layout(rect=[0, 0, 1, 0.97])
    plt.show()

if __name__ == '__main__':
    AUDIO_FILE_1 = os.path.join(current_directory, r'..\audio\base.wav')
    AUDIO_FILE_2 = os.path.join(current_directory, r'..\audio\compare.wav')

    features_file1 = extract_audio_features(AUDIO_FILE_1)
    features_file2 = extract_audio_features(AUDIO_FILE_2)

    if features_file1 and features_file2:
        print("\n--- COMPARISON SUMMARY ---")
        
        summary_keys = ["avg_pitch", "pitch_variability", "avg_energy", "voicing_ratio", "duration"]
        
        print(f"{'Feature':<20} | {features_file1['file_name']:<15} | {features_file2['file_name']}")
        print("-" * 55)
        
        for key in summary_keys:
            label = key.replace('_', ' ').title()
            val1 = features_file1[key]
            val2 = features_file2[key]
            print(f"{label:<20} | {val1:<15} | {val2}")

        plot_comparison(features_file1, features_file2)
    else:
        print("\nCould not complete analysis due to missing or unreadable audio files.")