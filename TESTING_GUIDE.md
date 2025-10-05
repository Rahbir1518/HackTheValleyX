# 🧪 COMPLETE TESTING & DEPLOYMENT GUIDE

## 📍 WHERE TO PUT ENVIRONMENT VARIABLES

### **1. Local Development (Your Computer)**
✅ **ALREADY DONE!** They're in `.env` file:
```bash
# Location: /Users/stephaniexia/Documents/GitHub/HackTheValleyX/.env
GEMINI_API_KEY=AIzaSyCLftvHPDWsaohLFBKe0nsRybLuFv2K4kk
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_uxdTS1xY7jn5A72Y_AntBzyMIH4pO9PnUu0LTGDb4EqmQYq
```

### **2. Render (Production Backend)**
Go to Render Dashboard:
```
1. Go to: https://dashboard.render.com/
2. Click on your service (your FastAPI backend)
3. Click "Environment" in the left sidebar
4. Click "Add Environment Variable"
5. Add these TWO variables:

   Key: BLOB_READ_WRITE_TOKEN
   Value: vercel_blob_rw_uxdTS1xY7jn5A72Y_AntBzyMIH4pO9PnUu0LTGDb4EqmQYq

   Key: GEMINI_API_KEY
   Value: AIzaSyCLftvHPDWsaohLFBKe0nsRybLuFv2K4kk

6. Click "Save Changes"
7. Render will automatically redeploy
```

### **3. Vercel (If deploying frontend there)**
Go to Vercel Dashboard:
```
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the same variables if your frontend needs them
```

---

## 🧪 TESTING - Step by Step

### **TEST 1: Verify Blob Storage Setup (1 minute)**

```bash
# Run diagnostics
cd /Users/stephaniexia/Documents/GitHub/HackTheValleyX
python3 test_deployment.py
```

**Expected Output:**
```
✅ Blob Connection
✅ base.wav in Blob
✅ Local base.wav
✅ API Running (or warning if not running)

🎉 ALL CRITICAL TESTS PASSED!
```

---

### **TEST 2: Start Your Backend API (Local Test)**

**Open Terminal 1:**
```bash
cd /Users/stephaniexia/Documents/GitHub/HackTheValleyX
python3 src/main.py
```

**Expected Output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Backend is now running!** Keep this terminal open.

---

### **TEST 3: Test the Upload Endpoint**

**Open Terminal 2 (keep Terminal 1 running):**

**Option A: Test with curl (command line)**
```bash
cd /Users/stephaniexia/Documents/GitHub/HackTheValleyX

# Upload the base.wav file as a test
curl -X POST http://localhost:8000/upload-base-audio \
  -F "file=@audio/base.wav" \
  | python3 -m json.tool
```

**Option B: Test with Python script**
```bash
python3 << 'EOF'
import requests

# Upload a test audio file
with open('audio/base.wav', 'rb') as f:
    files = {'file': ('test.wav', f, 'audio/wav')}
    response = requests.post('http://localhost:8000/upload-base-audio', files=files)
    
print("Status:", response.status_code)
print("\nResponse:")
import json
print(json.dumps(response.json(), indent=2))
EOF
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Audio processed successfully",
  "uploaded_features": {
    "avg_pitch": 215.43,
    "pitch_variability": 45.23,
    "avg_energy": 0.0289,
    "voicing_ratio": 0.7123,
    "duration": 7.5
  },
  "base_features": {
    "avg_pitch": 215.43,
    "pitch_variability": 45.23,
    "avg_energy": 0.0289,
    "voicing_ratio": 0.7123,
    "duration": 7.5
  },
  "analysis": {
    "risk_assessment": [
      {
        "condition": "Autism Spectrum Disorder (ASD)",
        "risk_percentage": 20,
        "status": "Low Risk",
        "reasoning": "..."
      },
      ...
    ],
    "overall_status": "Normal Development",
    "next_steps": [...],
    "key_findings": "..."
  },
  "blob_url": "https://uxdts1xy7jn5a72y.public.blob.vercel-storage.com/compare-..."
}
```

**Look for in Terminal 1 (where API is running):**
```
[DEBUG] Received file: test.wav, content_type: audio/wav
[DEBUG] Read 1134804 bytes from uploaded file
[DEBUG] Uploading compare.wav to Vercel Blob...
[DEBUG] Successfully uploaded to: https://...
[DEBUG] Downloaded to temporary file: /tmp/compare_12345.wav
[DEBUG] Successfully extracted features from uploaded audio
[DEBUG] Checking Vercel Blob Storage for base.wav...
[DEBUG] ✅ Found base.wav in Blob Storage: https://...
[DEBUG] ✅ Successfully downloaded base.wav to: /tmp/base_12345.wav
[DEBUG] ✅ Base features extracted successfully:
[DEBUG]   - avg_pitch: 215.43 Hz
[DEBUG] 🤖 Starting Gemini analysis comparison...
[DEBUG] ✅ Gemini analysis complete!
```

---

### **TEST 4: Test with Your React Frontend**

**Open Terminal 3 (keep Terminal 1 running):**
```bash
cd /Users/stephaniexia/Documents/GitHub/HackTheValleyX
npm run dev
```

**Then:**
1. Open browser to `http://localhost:5173` (or whatever port it shows)
2. Go to Dashboard page
3. Upload an audio file
4. Check Terminal 1 for the debug logs above
5. Check browser console/network tab for the response

---

## 🚀 TESTING ON RENDER (Production)

### **Step 1: Add Environment Variables to Render**

Go to Render and add the variables (see section at top).

### **Step 2: Deploy**

**Option A: Automatic (if connected to GitHub)**
```bash
git add .
git commit -m "Add Vercel Blob storage integration"
git push origin main
```
Render will auto-deploy when it sees the push.

**Option B: Manual Deploy**
Go to Render Dashboard → Your Service → Manual Deploy → Deploy Latest Commit

### **Step 3: Wait for Deployment**
Watch the logs in Render. Look for:
```
✅ Build successful
✅ Server starting
INFO: Uvicorn running on http://0.0.0.0:8000
```

### **Step 4: Test Production Endpoint**

Get your Render URL (something like `https://your-app.onrender.com`)

**Test with curl:**
```bash
# Replace YOUR_RENDER_URL with your actual URL
curl -X POST https://YOUR_RENDER_URL.onrender.com/upload-base-audio \
  -F "file=@audio/base.wav" \
  | python3 -m json.tool
```

### **Step 5: Check Render Logs**

In Render Dashboard → Your Service → Logs

Look for:
```
✅ Found base.wav in Blob Storage
✅ Successfully downloaded base.wav to: /tmp/base_xxxxx.wav
🤖 Starting Gemini analysis comparison...
✅ Gemini analysis complete!
```

---

## ❌ TROUBLESHOOTING

### **Problem: "BLOB_READ_WRITE_TOKEN not found"**
**Solution:** 
- Local: Check `.env` file exists and has the token
- Render: Go to Environment variables and add it

### **Problem: "base.wav not found in Blob Storage"**
**Solution:**
```bash
python3 upload_base_to_blob.py
```

### **Problem: "Connection refused" when testing**
**Solution:** Make sure backend is running:
```bash
python3 src/main.py
```

### **Problem: Analysis is null**
**Solution:** Check logs for:
- ✅ Base features extracted?
- ✅ Gemini analysis started?
- Check GEMINI_API_KEY is set

### **Problem: CORS error in browser**
**Solution:** Make sure your frontend URL is in `ALLOWED_ORIGINS`:
```python
# In main.py
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", 
  "http://localhost:5173,http://localhost:5175,http://localhost:3000"
).split(",")
```

---

## 📊 VISUAL GUIDE: Environment Variables

```
┌─────────────────────────────────────────┐
│         LOCAL DEVELOPMENT               │
│  (Your Computer)                        │
├─────────────────────────────────────────┤
│  .env file                              │
│  ├─ GEMINI_API_KEY=xxx                 │
│  └─ BLOB_READ_WRITE_TOKEN=xxx          │
│                                         │
│  Python reads these automatically       │
│  with load_dotenv()                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         RENDER (Production)             │
│  https://dashboard.render.com           │
├─────────────────────────────────────────┤
│  Environment Variables Section:         │
│  ├─ GEMINI_API_KEY=xxx                 │
│  └─ BLOB_READ_WRITE_TOKEN=xxx          │
│                                         │
│  Set these in dashboard UI              │
│  Render injects them at runtime         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│    VERCEL (If using for frontend)       │
│  https://vercel.com/dashboard           │
├─────────────────────────────────────────┤
│  Settings → Environment Variables:      │
│  └─ VITE_API_URL=https://your-render-  │
│     url.onrender.com                    │
│                                         │
│  Frontend needs to know backend URL     │
└─────────────────────────────────────────┘
```

---

## ✅ QUICK START TESTING

**Run this one command to test everything:**
```bash
cd /Users/stephaniexia/Documents/GitHub/HackTheValleyX && \
python3 test_deployment.py && \
echo "✅ Tests passed! Now start the server:" && \
echo "   python3 src/main.py"
```

---

## 🎯 SUCCESS CHECKLIST

- [ ] `.env` file has both tokens
- [ ] `python3 test_deployment.py` shows all ✅
- [ ] `python3 src/main.py` starts without errors
- [ ] Upload test returns `"status": "success"`
- [ ] `analysis` is NOT null in response
- [ ] Render environment variables added
- [ ] Production deployment successful
- [ ] Production endpoint returns valid response

---

**Need help?** Run diagnostics:
```bash
python3 test_deployment.py
```

**Ready to deploy?** Run checklist:
```bash
./render-deploy-check.sh
```
