#!/usr/bin/env python3
"""
Interactive Test Suite for Mimicoo Audio Analysis
Run this to test your entire setup step-by-step
"""
import os
import sys
import time
import requests
from dotenv import load_dotenv

load_dotenv()

GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{text.center(60)}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text):
    print(f"{BLUE}ℹ️  {text}{RESET}")

def test_env_variables():
    """Test 1: Check environment variables"""
    print_header("TEST 1: Environment Variables")
    
    blob_token = os.getenv("BLOB_READ_WRITE_TOKEN")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if blob_token:
        print_success(f"BLOB_READ_WRITE_TOKEN found: {blob_token[:20]}...")
    else:
        print_error("BLOB_READ_WRITE_TOKEN not found in .env")
        return False
    
    if gemini_key:
        print_success(f"GEMINI_API_KEY found: {gemini_key[:20]}...")
    else:
        print_error("GEMINI_API_KEY not found in .env")
        return False
    
    return True

def test_blob_storage():
    """Test 2: Check Blob Storage connection"""
    print_header("TEST 2: Vercel Blob Storage")
    
    blob_token = os.getenv("BLOB_READ_WRITE_TOKEN")
    headers = {"Authorization": f"Bearer {blob_token}"}
    
    try:
        response = requests.get("https://blob.vercel-storage.com/", headers=headers, timeout=10)
        
        if response.status_code == 200:
            blobs = response.json().get("blobs", [])
            print_success(f"Connected to Blob Storage - {len(blobs)} files found")
            
            # Check for base.wav
            base_found = False
            for blob in blobs:
                pathname = blob.get("pathname", "")
                if pathname == "base.wav":
                    print_success(f"base.wav found: {blob['size']} bytes")
                    print_info(f"URL: {blob['url']}")
                    base_found = True
                    break
            
            if not base_found:
                print_warning("base.wav not found in Blob Storage")
                print_info("Run: python3 upload_base_to_blob.py")
                return False
            
            return True
        else:
            print_error(f"Failed to connect: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Connection error: {e}")
        return False

def test_local_files():
    """Test 3: Check local files"""
    print_header("TEST 3: Local Files")
    
    if os.path.exists("audio/base.wav"):
        size = os.path.getsize("audio/base.wav")
        print_success(f"Local base.wav found: {size} bytes")
    else:
        print_warning("Local base.wav not found (OK for production)")
    
    if os.path.exists("src/main.py"):
        print_success("main.py found")
    else:
        print_error("main.py not found!")
        return False
    
    if os.path.exists("requirements.txt"):
        print_success("requirements.txt found")
        with open("requirements.txt") as f:
            if "requests" in f.read():
                print_success("requests library in requirements.txt")
            else:
                print_error("requests library missing from requirements.txt")
                return False
    else:
        print_error("requirements.txt not found!")
        return False
    
    return True

def test_api_running():
    """Test 4: Check if API is running"""
    print_header("TEST 4: API Server")
    
    try:
        response = requests.get("http://localhost:8000/", timeout=3)
        if response.status_code == 200:
            data = response.json()
            print_success("API is running!")
            print_info(f"Message: {data.get('message', 'N/A')}")
            return True
        else:
            print_warning("API responded but with unexpected status")
            return False
    except requests.exceptions.ConnectionError:
        print_warning("API not running on http://localhost:8000")
        print_info("Start it with: python3 src/main.py")
        return False
    except Exception as e:
        print_error(f"Error checking API: {e}")
        return False

def test_upload_endpoint():
    """Test 5: Test upload endpoint"""
    print_header("TEST 5: Upload Endpoint Test")
    
    # First check if API is running
    try:
        requests.get("http://localhost:8000/", timeout=3)
    except:
        print_warning("API not running - skipping upload test")
        print_info("Start API with: python3 src/main.py")
        return None  # Skip test
    
    if not os.path.exists("audio/base.wav"):
        print_warning("No test audio file found - skipping upload test")
        return None  # Skip test
    
    try:
        print_info("Uploading test audio file...")
        
        with open("audio/base.wav", "rb") as f:
            files = {"file": ("test.wav", f, "audio/wav")}
            response = requests.post(
                "http://localhost:8000/upload-base-audio",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("status") == "success":
                print_success("Upload successful!")
                
                # Check if features were extracted
                if data.get("uploaded_features"):
                    print_success("Uploaded audio features extracted")
                    features = data["uploaded_features"]
                    print_info(f"  Pitch: {features.get('avg_pitch', 'N/A')} Hz")
                    print_info(f"  Energy: {features.get('avg_energy', 'N/A')}")
                
                # Check if base features were loaded
                if data.get("base_features"):
                    print_success("Base audio features loaded!")
                    features = data["base_features"]
                    print_info(f"  Pitch: {features.get('avg_pitch', 'N/A')} Hz")
                else:
                    print_warning("Base features not loaded - comparison may not work")
                
                # Check if analysis was performed
                if data.get("analysis"):
                    print_success("🤖 AI Analysis completed!")
                    analysis = data["analysis"]
                    print_info(f"  Status: {analysis.get('overall_status', 'N/A')}")
                    
                    # Show risk assessments
                    for risk in analysis.get("risk_assessment", []):
                        condition = risk.get("condition", "Unknown")
                        status = risk.get("status", "Unknown")
                        percentage = risk.get("risk_percentage", 0)
                        print_info(f"  {condition}: {percentage}% - {status}")
                    
                    return True
                else:
                    print_warning("Analysis not performed - check logs")
                    return False
            else:
                print_error(f"Upload failed: {data.get('message', 'Unknown error')}")
                return False
        else:
            print_error(f"Upload failed: HTTP {response.status_code}")
            print_error(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print_error(f"Upload test error: {e}")
        return False

def main():
    print(f"\n{BLUE}{'🔬' * 30}{RESET}")
    print(f"{BLUE}{'MIMICOO INTERACTIVE TEST SUITE'.center(60)}{RESET}")
    print(f"{BLUE}{'🔬' * 30}{RESET}\n")
    
    results = []
    
    # Run all tests
    results.append(("Environment Variables", test_env_variables()))
    
    if results[-1][1]:  # Only continue if env vars are set
        results.append(("Blob Storage", test_blob_storage()))
        results.append(("Local Files", test_local_files()))
        results.append(("API Server", test_api_running()))
        
        # Upload test (can be skipped)
        upload_result = test_upload_endpoint()
        if upload_result is not None:
            results.append(("Upload Test", upload_result))
    
    # Print summary
    print_header("TEST SUMMARY")
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        if result:
            print_success(test_name)
            passed += 1
        else:
            print_error(test_name)
            failed += 1
    
    print(f"\n{GREEN}Passed: {passed}{RESET}")
    if failed > 0:
        print(f"{RED}Failed: {failed}{RESET}")
    
    # Final recommendations
    print_header("NEXT STEPS")
    
    if failed == 0:
        print_success("All tests passed! You're ready to deploy!")
        print_info("\nTo deploy to Render:")
        print_info("1. Add environment variables to Render dashboard")
        print_info("2. Push code to GitHub")
        print_info("3. Check Render logs for success messages")
    else:
        print_warning("Some tests failed. Fix issues above before deploying.")
        
        if not any(name == "API Server" for name, _ in results):
            print_info("\nTo start API locally:")
            print_info("  python3 src/main.py")
        
        if not any(name == "Upload Test" and result for name, result in results):
            print_info("\nIf upload test failed, check:")
            print_info("  - API is running")
            print_info("  - base.wav is in Blob Storage")
            print_info("  - GEMINI_API_KEY is valid")
    
    print(f"\n{BLUE}{'='*60}{RESET}\n")

if __name__ == "__main__":
    main()
