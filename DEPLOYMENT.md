# Deployment Guide for HackTheValleyX

This guide will help you deploy both the frontend (React + Vite) and backend (FastAPI) of your application.

## Prerequisites
- GitHub account
- Render account (recommended for backend) - https://render.com
- Vercel account (recommended for frontend) - https://vercel.com
- Your Gemini API key
- Your Clerk publishable key

---

## Part 1: Deploy Backend to Render

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Step 2: Create Render Service

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Rahbir1518/HackTheValleyX`
4. Configure the service:
   - **Name**: `hackthevalleyx-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables (in Render dashboard):
   - `GEMINI_API_KEY`: Your Gemini API key
   - `ALLOWED_ORIGINS`: `https://your-app-name.vercel.app` (you'll update this after deploying frontend)
   - `PYTHON_VERSION`: `3.9.18`

6. Click "Create Web Service"

7. Wait for deployment to complete (5-10 minutes)

8. **Copy your backend URL**: It will be something like `https://hackthevalleyx-backend.onrender.com`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Configuration

Before deploying, you need to create environment variables for Vercel.

Create a `.env.production` file (this won't be committed):
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=https://your-backend-url.onrender.com
VITE_WS_URL=wss://your-backend-url.onrender.com
```

### Step 2: Update Dashboard.tsx

The WebSocket URL needs to be dynamic. We'll update this in the next step.

### Step 3: Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository: `Rahbir1518/HackTheValleyX`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables (in Vercel):
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_API_URL`: `https://your-backend-url.onrender.com` (from Step 1.8)
   - `VITE_WS_URL`: `wss://your-backend-url.onrender.com` (Note: wss, not ws)

6. Click "Deploy"

7. Wait for deployment (2-5 minutes)

8. **Copy your frontend URL**: It will be something like `https://hackthevalleyx.vercel.app`

### Step 4: Update Backend CORS

Go back to Render and update the `ALLOWED_ORIGINS` environment variable:
```
https://hackthevalleyx.vercel.app,http://localhost:5173
```

This allows both your production frontend and local development to access the backend.

---

## Part 3: Update Clerk Settings

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to "Domains" or "Settings" → "Domains"
4. Add your production domain: `hackthevalleyx.vercel.app`
5. Update allowed origins and redirect URLs to include your production URL

---

## Part 4: Test Your Deployment

1. Visit your Vercel URL: `https://hackthevalleyx.vercel.app`
2. Try logging in with Clerk
3. Upload an audio file to test the backend connection
4. Check browser console for any errors

---

## Alternative: Deploy Both to Railway

If you prefer to deploy both frontend and backend to the same platform:

### Railway Deployment

1. Go to https://railway.app
2. Create a new project from GitHub repo
3. Add two services:
   - **Backend Service**:
     - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
     - Add environment variables (GEMINI_API_KEY, ALLOWED_ORIGINS)
   - **Frontend Service**:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm run preview`
     - Add environment variables (VITE_CLERK_PUBLISHABLE_KEY, VITE_API_URL, VITE_WS_URL)

---

## Troubleshooting

### Backend Issues

**Problem**: Backend fails to start
- Check Render logs for errors
- Verify `requirements.txt` is in root directory
- Ensure Python version is 3.9 or higher

**Problem**: CORS errors
- Verify `ALLOWED_ORIGINS` includes your Vercel URL
- Check that the URL doesn't have a trailing slash

### Frontend Issues

**Problem**: Can't connect to backend
- Verify `VITE_API_URL` and `VITE_WS_URL` are correct
- Check that WebSocket URL uses `wss://` not `ws://`
- Ensure backend is deployed and running

**Problem**: Clerk authentication fails
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is set
- Check Clerk dashboard for correct domain settings

### WebSocket Issues

**Problem**: WebSocket connection fails
- Render free tier supports WebSockets
- Ensure you're using `wss://` (secure WebSocket) in production
- Check Render logs for connection errors

---

## Free Tier Limitations

### Render (Backend)
- Free tier spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free

### Vercel (Frontend)
- 100 GB bandwidth/month
- Unlimited deployments
- Edge network for fast loading

### Upgrade Options
If you need better performance:
- Render: $7/month for always-on service
- Railway: Pay-as-you-go pricing
- Heroku: $5-7/month for hobby dynos

---

## Need Help?

Check these resources:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
