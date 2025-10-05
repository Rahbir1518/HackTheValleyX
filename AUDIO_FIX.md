# 🔧 AUDIO PROCESSING FIX

## Issue: "Failed to extract features from uploaded audio"

This error happens because audio processing failed on the backend.

## ✅ What I Fixed:

### 1. Added Better Error Logging
- Added detailed debug logs to `main.py`
- Shows exactly where the audio processing fails
- Helps diagnose the issue

### 2. Created Build Script
- Added `build.sh` for Render deployment
- Ensures dependencies install correctly

### 3. Updated render.yaml
- Added `ALLOWED_ORIGINS` to environment variables
- Uses new build script

## 🚀 Deploy These Changes:

### Step 1: Make build.sh executable
```bash
chmod +x build.sh
```

### Step 2: Commit and push
```bash
git add .
git commit -m "fix: Add better error logging for audio processing"
git push
```

### Step 3: Check Render Logs
After deploying, check the logs on Render to see the detailed error:

1. Go to https://dashboard.render.com
2. Click your backend service
3. Click "Logs" tab
4. Try uploading audio again
5. Look for `[DEBUG]` and `[ERROR]` messages

## 🔍 Expected Debug Output:

When you upload audio, you should see:
```
[DEBUG] Extracting features from: /tmp/...
[DEBUG] File exists: True
[DEBUG] File size: 12345 bytes
[DEBUG] Loading audio with parselmouth...
[DEBUG] Duration: 2.5s
[DEBUG] Extracting pitch...
[DEBUG] Loading audio with librosa...
[DEBUG] Audio loaded: 40000 samples at 16000Hz
[DEBUG] Extracting RMS energy...
[DEBUG] Feature extraction completed successfully!
```

## 🐛 Possible Issues & Solutions:

### Issue 1: Missing System Libraries
**Error:** `libsndfile.so: cannot open shared object file`

**Solution:** Add system dependencies to Render:
1. Go to Render dashboard
2. Click your service
3. Go to "Settings" → "Build & Deploy"
4. Add this to "Build Command":
   ```
   apt-get update && apt-get install -y ffmpeg libsndfile1 && pip install -r requirements.txt
   ```

### Issue 2: Audio Format Not Supported
**Error:** `Error loading audio file`

**Solution:** The issue is with the uploaded audio format. Try:
- Converting audio to WAV format on frontend before upload
- Or install more audio codecs on backend

### Issue 3: File Path Issues
**Error:** `File not found` or `Permission denied`

**Solution:** Already handled with better logging. Check logs to see actual path.

### Issue 4: Memory Issues
**Error:** `MemoryError` or process killed

**Solution:** Upgrade Render plan (free tier has limited memory)

## 📱 Frontend Fix (Optional):

If backend logs show audio format issues, we can convert audio on frontend:

```typescript
// In Dashboard.tsx, before uploading
const convertToWav = async (blob: Blob): Promise<Blob> => {
  // Convert to WAV using Web Audio API
  const audioContext = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // ... conversion logic
  return wavBlob;
};
```

## 🧪 Test Locally First:

Before deploying, test locally:

```bash
# Terminal 1: Run backend
cd /Users/stephaniexia/Documents/GitHub/HackTheValleyX
python -m uvicorn src.main:app --reload

# Terminal 2: Run frontend
npm run dev

# Try uploading audio and check terminal logs
```

## ✅ After Deploying:

1. **Check Render Logs** - Look for [DEBUG] messages
2. **Try uploading audio** - Use a simple WAV file first
3. **Share the logs with me** - Copy the error from Render logs

## 📋 Quick Checklist:

- [ ] Make build.sh executable (`chmod +x build.sh`)
- [ ] Commit and push changes
- [ ] Wait for Render to deploy
- [ ] Check Render logs
- [ ] Try uploading audio
- [ ] Share error logs if still failing

The detailed logging will tell us exactly what's wrong! 🔍
