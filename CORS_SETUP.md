# CORS Configuration for Render Deployment

## What You Need to Do

Your backend already has CORS middleware configured in `main.py`. You just need to set the environment variable on Render to allow your frontend URL.

## Steps to Configure CORS on Render

### 1. Get Your Frontend URL
First, you need to know your frontend URL. It should be something like:
- **Vercel**: `https://your-app-name.vercel.app`
- **Netlify**: `https://your-app-name.netlify.app`

### 2. Add ALLOWED_ORIGINS to Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your **backend service** (the Python/FastAPI service)
3. Click on **"Environment"** in the left sidebar
4. Find or add the environment variable:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://your-frontend-url.vercel.app,https://your-frontend-url.netlify.app`
   
   **Important**: 
   - Add your production frontend URL(s)
   - Separate multiple URLs with commas (no spaces)
   - Include the full protocol (https://)
   - Don't add trailing slashes

Example:
```
ALLOWED_ORIGINS=https://mimicoo.vercel.app,https://www.mimicoo.com
```

5. Click **"Save Changes"**
6. Render will automatically redeploy your backend with the new settings

### 3. Verify Your Other Environment Variables

Make sure you also have these set on Render:

```
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

### 4. Test CORS

After deploying, test if CORS is working:

1. Open your frontend URL in a browser
2. Open the browser console (F12)
3. Try uploading audio or generating a sentence
4. Check for CORS errors in the console

If you see CORS errors, they'll look like:
```
Access to fetch at 'https://your-backend.onrender.com/...' from origin 'https://your-frontend.vercel.app' has been blocked by CORS policy
```

## Current CORS Configuration in Your Code

Your `main.py` already has this:

```python
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5175,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This means:
- ✅ If `ALLOWED_ORIGINS` env var is set, it uses that
- ✅ Otherwise, it defaults to localhost (for development)
- ✅ Splits multiple origins by comma

## Troubleshooting

### If you still see CORS errors:

1. **Double-check the URL format**:
   - ✅ Correct: `https://mimicoo.vercel.app`
   - ❌ Wrong: `https://mimicoo.vercel.app/`
   - ❌ Wrong: `mimicoo.vercel.app`
   - ❌ Wrong: `http://mimicoo.vercel.app` (should be https)

2. **Check if Render redeployed**:
   - After changing env vars, Render should auto-redeploy
   - Wait for the deployment to complete (check the "Logs" tab)

3. **Test with curl** (from terminal):
   ```bash
   curl -H "Origin: https://your-frontend-url.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://your-backend.onrender.com/upload-base-audio
   ```
   
   You should see headers like:
   ```
   access-control-allow-origin: https://your-frontend-url.vercel.app
   access-control-allow-methods: *
   ```

4. **Check Render logs**:
   - Go to your backend service on Render
   - Click "Logs" tab
   - Look for startup messages showing the ALLOWED_ORIGINS value

## Quick Checklist

- [ ] Frontend is deployed and you have the URL
- [ ] Added `ALLOWED_ORIGINS` env var to Render backend
- [ ] Backend redeployed successfully
- [ ] Frontend has correct `VITE_API_URL` and `VITE_WS_URL` pointing to backend
- [ ] Tested the app and no CORS errors in console

## Need Help?

If you're still having issues, check:
1. Render backend logs for any errors
2. Browser console for specific CORS error messages
3. Network tab to see the actual request/response headers
