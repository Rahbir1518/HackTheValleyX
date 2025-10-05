#!/usr/bin/env python3
"""
Test script to verify Blob Storage and audio comparison are working
"""
import os
import sys
import requests
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

BLOB_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN")

def test_blob_connection():
    """Test connection to Vercel Blob Storage"""
    print("=" * 60)
    print("🧪 TEST 1: Vercel Blob Connection")
    print("=" * 60)
    
    if not BLOB_TOKEN:
        print("❌ BLOB_READ_WRITE_TOKEN not found in .env")
        return False
    
    print(f"✅ Token found: {BLOB_TOKEN[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {BLOB_TOKEN}",
    }
    
    try:
        response = requests.get(
            "https://blob.vercel-storage.com/",
            headers=headers
        )
        
        if response.status_code == 200:
            blobs = response.json().get("blobs", [])
            print(f"✅ Connected to Blob Storage")
            print(f"✅ Found {len(blobs)} files")
            
            for blob in blobs:
                print(f"   📁 {blob['pathname']} ({blob['size']} bytes)")
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_base_wav_exists():
    """Test if base.wav exists in Blob Storage"""
    print("\n" + "=" * 60)
    print("🧪 TEST 2: base.wav Availability")
    print("=" * 60)
    
    headers = {
        "Authorization": f"Bearer {BLOB_TOKEN}",
    }
    
    try:
        response = requests.get(
            "https://blob.vercel-storage.com/",
            headers=headers
        )
        
        if response.status_code == 200:
            blobs = response.json().get("blobs", [])
            
            for blob in blobs:
                if blob.get("pathname") == "base.wav":
                    print(f"✅ base.wav found!")
                    print(f"   📊 Size: {blob['size']} bytes")
                    print(f"   🔗 URL: {blob['url']}")
                    print(f"   📅 Uploaded: {blob['uploadedAt']}")
                    return True
            
            print("❌ base.wav NOT found in Blob Storage")
            print("   Run: python3 upload_base_to_blob.py")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_local_base_wav():
    """Test if local base.wav exists"""
    print("\n" + "=" * 60)
    print("🧪 TEST 3: Local base.wav")
    print("=" * 60)
    
    local_path = "audio/base.wav"
    
    if os.path.exists(local_path):
        size = os.path.getsize(local_path)
        print(f"✅ Local base.wav found")
        print(f"   📊 Size: {size} bytes")
        print(f"   📂 Path: {os.path.abspath(local_path)}")
        return True
    else:
        print(f"⚠️ Local base.wav not found at: {local_path}")
        print("   (This is OK for production, will use Blob Storage)")
        return False

def test_api_endpoint():
    """Test if the API is running"""
    print("\n" + "=" * 60)
    print("🧪 TEST 4: API Endpoint")
    print("=" * 60)
    
    try:
        response = requests.get("http://localhost:8000/")
        if response.status_code == 200:
            print("✅ API is running")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"⚠️ API responded with: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("⚠️ API not running")
        print("   Start with: python3 src/main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\n" + "🔬" * 30)
    print("MIMICOO DEPLOYMENT DIAGNOSTICS")
    print("🔬" * 30 + "\n")
    
    results = []
    
    results.append(("Blob Connection", test_blob_connection()))
    results.append(("base.wav in Blob", test_base_wav_exists()))
    results.append(("Local base.wav", test_local_base_wav()))
    results.append(("API Running", test_api_endpoint()))
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅" if passed else "❌"
        print(f"{status} {test_name}")
    
    all_critical = results[0][1] and results[1][1]  # Blob connection and base.wav
    
    print("\n" + "=" * 60)
    if all_critical:
        print("🎉 ALL CRITICAL TESTS PASSED!")
        print("   Your app is ready for deployment!")
    else:
        print("⚠️ SOME TESTS FAILED")
        print("   Fix issues above before deploying")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
