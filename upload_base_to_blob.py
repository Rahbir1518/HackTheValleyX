#!/usr/bin/env python3
"""
Script to upload base.wav to Vercel Blob Storage
Run this once to upload your base audio file to the cloud
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

BLOB_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN")
BASE_AUDIO_PATH = "audio/base.wav"

def upload_to_blob(file_content: bytes, filename: str) -> str:
    """Upload file to Vercel Blob Storage and return the URL"""
    try:
        print(f"Uploading {filename} to Vercel Blob...")
        
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
            print(f"✅ Successfully uploaded to: {blob_url}")
            return blob_url
        else:
            print(f"❌ Failed to upload: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error uploading: {e}")
        return None

def main():
    if not BLOB_TOKEN:
        print("❌ BLOB_READ_WRITE_TOKEN not found in .env file")
        return
    
    if not os.path.exists(BASE_AUDIO_PATH):
        print(f"❌ Base audio file not found at: {BASE_AUDIO_PATH}")
        return
    
    print(f"📁 Reading {BASE_AUDIO_PATH}...")
    with open(BASE_AUDIO_PATH, 'rb') as f:
        content = f.read()
    
    print(f"📦 File size: {len(content)} bytes")
    
    blob_url = upload_to_blob(content, "base.wav")
    
    if blob_url:
        print("\n✨ Base audio successfully uploaded to Vercel Blob Storage!")
        print(f"🔗 URL: {blob_url}")
        print("\nYour app will now use this file in production.")
    else:
        print("\n❌ Upload failed. Please check your BLOB_READ_WRITE_TOKEN.")

if __name__ == "__main__":
    main()
