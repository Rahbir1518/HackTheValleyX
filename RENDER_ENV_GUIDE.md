# 🎯 RENDER ENVIRONMENT VARIABLES - VISUAL GUIDE

## 📍 WHERE TO ADD ENVIRONMENT VARIABLES ON RENDER

### **Step-by-Step with Screenshots Description**

```
1. Go to: https://dashboard.render.com/
   
2. You'll see your services list:
   ┌─────────────────────────────────────┐
   │  My Services                        │
   ├─────────────────────────────────────┤
   │  ▶ your-fastapi-backend             │ ← Click this
   │  ▶ other-service                    │
   └─────────────────────────────────────┘

3. Click on your FastAPI service name

4. You'll see a sidebar on the left:
   ┌─────────────────────────────────────┐
   │  Events                             │
   │  Logs                               │
   │  Shell                              │
   │  Metrics                            │
   │  ▶ Environment                      │ ← Click this
   │  Settings                           │
   │  ...                                │
   └─────────────────────────────────────┘

5. On Environment page, you'll see:
   ┌─────────────────────────────────────────────────┐
   │  Environment Variables                          │
   │                                                 │
   │  [Add Environment Variable] ← Click this button │
   │                                                 │
   │  Secret Files                                   │
   └─────────────────────────────────────────────────┘

6. A form will appear:
   ┌─────────────────────────────────────────────────┐
   │  Add Environment Variable                       │
   │                                                 │
   │  Key:   [________________]                      │
   │  Value: [________________]                      │
   │                                                 │
   │  [ Cancel ]  [ Add Variable ]                   │
   └─────────────────────────────────────────────────┘
```

### **Add These TWO Variables:**

#### **Variable 1: Blob Storage Token**
```
Key:   BLOB_READ_WRITE_TOKEN
Value: vercel_blob_rw_uxdTS1xY7jn5A72Y_AntBzyMIH4pO9PnUu0LTGDb4EqmQYq
```

#### **Variable 2: Gemini API Key**
```
Key:   GEMINI_API_KEY
Value: AIzaSyCLftvHPDWsaohLFBKe0nsRybLuFv2K4kk
```

### **After Adding Both:**

```
7. Click "Save Changes" button at the bottom

8. Render will show:
   ┌─────────────────────────────────────────────────┐
   │  ⚠️  Your service will be redeployed             │
   │                                                 │
   │  [ Cancel ]  [ Save Changes ]  ← Confirm        │
   └─────────────────────────────────────────────────┘

9. Your service will automatically redeploy (takes 2-3 min)

10. Check "Logs" tab to see deployment progress:
    ┌─────────────────────────────────────────────────┐
    │  Logs                                           │
    ├─────────────────────────────────────────────────┤
    │  ==> Building...                                │
    │  ==> Installing dependencies...                 │
    │  ==> Starting service...                        │
    │  INFO: Uvicorn running on http://0.0.0.0:8000   │
    │  ✅ Service started successfully                │
    └─────────────────────────────────────────────────┘
```

---

## 🔍 HOW TO VERIFY IT WORKED

### **Check 1: Environment Variables Appear**

After adding, you should see them listed:

```
┌─────────────────────────────────────────────────────────┐
│  Environment Variables                                  │
├─────────────────────────────────────────────────────────┤
│  BLOB_READ_WRITE_TOKEN                                  │
│  vercel_blob_rw_uxdTS...  [Edit] [Delete]              │
│                                                         │
│  GEMINI_API_KEY                                         │
│  AIzaSyCLftvHPDW...       [Edit] [Delete]              │
└─────────────────────────────────────────────────────────┘
```

### **Check 2: Deployment Logs**

Go to "Logs" tab and look for these success messages:

```bash
✅ Build successful
✅ Starting service
INFO: Uvicorn running on http://0.0.0.0:8000
INFO: Application startup complete
```

### **Check 3: Test the Endpoint**

Get your Render URL (shown at top of service page):
```
https://your-app-name.onrender.com
```

Test it:
```bash
# Test root endpoint
curl https://your-app-name.onrender.com/

# Should return:
{"message":"Mimicoo Audio Analysis API","status":"running"}
```

### **Check 4: Test Upload (The Full Test)**

```bash
# Upload a test audio file
curl -X POST https://your-app-name.onrender.com/upload-base-audio \
  -F "file=@audio/base.wav" \
  | python3 -m json.tool
```

**Look for in response:**
```json
{
  "status": "success",
  "base_features": { ... },  ← NOT null
  "analysis": { ... }        ← NOT null
}
```

**Look for in Render logs:**
```
[DEBUG] ✅ Found base.wav in Blob Storage
[DEBUG] ✅ Successfully downloaded base.wav
[DEBUG] 🤖 Starting Gemini analysis comparison...
[DEBUG] ✅ Gemini analysis complete!
```

---

## 🎨 VISUAL DIAGRAM

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    YOUR COMPUTER                         │
│                                                          │
│  .env file has:                                          │
│  ├─ BLOB_READ_WRITE_TOKEN=xxx                           │
│  └─ GEMINI_API_KEY=xxx                                  │
│                                                          │
│  Used for LOCAL testing                                 │
│  ✅ Working (as shown by interactive_test.py)           │
│                                                          │
└──────────────────────────────────────────────────────────┘
                            │
                            │ git push
                            ↓
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                       GITHUB                             │
│                                                          │
│  Your code (but NOT .env - git ignores it)              │
│                                                          │
└──────────────────────────────────────────────────────────┘
                            │
                            │ auto-deploy
                            ↓
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                        RENDER                            │
│                                                          │
│  Environment Variables (ADD MANUALLY):                   │
│  ├─ BLOB_READ_WRITE_TOKEN=xxx   ← ADD THIS             │
│  └─ GEMINI_API_KEY=xxx          ← ADD THIS             │
│                                                          │
│  Render injects these at runtime                         │
│  Your code reads them with os.getenv()                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
                            │
                            │ uses
                            ↓
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                  VERCEL BLOB STORAGE                     │
│                                                          │
│  Files stored:                                           │
│  ├─ base.wav (1.1 MB)                                   │
│  └─ compare.wav (uploaded by users)                     │
│                                                          │
│  Accessible from ANYWHERE with the token                 │
│  ✅ Works from local computer                           │
│  ✅ Works from Render                                   │
│  ✅ Works from Vercel                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## ⚡ QUICK COPY-PASTE

**For Render Environment Variables:**

```
Key: BLOB_READ_WRITE_TOKEN
Value: vercel_blob_rw_uxdTS1xY7jn5A72Y_AntBzyMIH4pO9PnUu0LTGDb4EqmQYq
```

```
Key: GEMINI_API_KEY
Value: AIzaSyCLftvHPDWsaohLFBKe0nsRybLuFv2K4kk
```

---

## 🆘 NEED MORE HELP?

**Video Tutorial Style Instructions:**

1. Open https://dashboard.render.com/ in browser
2. Click your service name in the list
3. Click "Environment" in left sidebar
4. Click blue "Add Environment Variable" button
5. Type key name: `BLOB_READ_WRITE_TOKEN`
6. Paste value: `vercel_blob_rw_uxdTS1xY7jn5A72Y_AntBzyMIH4pO9PnUu0LTGDb4EqmQYq`
7. Click "Add Environment Variable" again
8. Type key name: `GEMINI_API_KEY`
9. Paste value: `AIzaSyCLftvHPDWsaohLFBKe0nsRybLuFv2K4kk`
10. Click "Save Changes" at bottom
11. Wait 2-3 minutes for redeploy
12. Check "Logs" tab for success

**Done!** 🎉
