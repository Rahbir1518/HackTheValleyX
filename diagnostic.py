#!/usr/bin/env python3
"""
Quick diagnostic - paste the error output here
"""

print("""
🔍 DIAGNOSTIC QUESTIONS

Please answer these to help me understand the issue:

1. WHERE are you seeing the error?
   [ ] Local (running python3 src/main.py)
   [ ] Render (production deployment)
   [ ] Frontend (React app)

2. WHAT is the error message? (copy-paste below)
   


3. Is base_features NULL in the response?
   [ ] Yes - base_features is null
   [ ] No - base_features has data
   [ ] Don't know

4. Is analysis NULL in the response?
   [ ] Yes - analysis is null  
   [ ] No - analysis has data
   [ ] Don't know

5. Did you add environment variables to Render?
   [ ] Yes - added BLOB_READ_WRITE_TOKEN
   [ ] Yes - added GEMINI_API_KEY
   [ ] No - haven't added them yet
   [ ] Not sure

6. Can you access this URL in your browser?
   https://uxdts1xy7jn5a72y.public.blob.vercel-storage.com/base-x1WYS9mKBL72p5dnR7NW5rwLNZfd9X.wav
   [ ] Yes - downloads the file
   [ ] No - error

7. What do the Render logs say? (copy relevant lines)


""")

# Let's also check the current main.py
import os
if os.path.exists("src/main.py"):
    print("\n" + "="*60)
    print("Checking your main.py for blob storage code...")
    print("="*60)
    
    with open("src/main.py", "r") as f:
        content = f.read()
        
    # Check for key functions
    checks = {
        "upload_to_blob function": "def upload_to_blob" in content,
        "download_from_blob function": "def download_from_blob" in content,
        "list_blobs function": "def list_blobs" in content,
        "BLOB_TOKEN variable": "BLOB_TOKEN" in content,
        "requests import": "import requests" in content,
    }
    
    print("\nCode checks:")
    for check, present in checks.items():
        status = "✅" if present else "❌"
        print(f"{status} {check}")
    
    if not all(checks.values()):
        print("\n❌ Some blob storage code is missing!")
        print("   Your main.py might not have the latest changes.")
    else:
        print("\n✅ All blob storage code is present in main.py")
