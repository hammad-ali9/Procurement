# Vercel Deployment Guide

This guide explains how to deploy your full-stack application (React Frontend + Express Backend) to Vercel.

## 1. Project Configuration (Already Completed)
I have configured your project for a seamless Vercel deployment:
- **`vercel.json`**: Created to handle routing. API requests (`/api/*`) are routed to your Express backend, while all other requests go to your React frontend.
- **`package.json`**: Added a `postinstall` script to ensure backend dependencies are installed during the build process.
- **`vite.config.js`**: Configured a proxy so your local development environment works exactly like production.

## 2. Prerequisites
- **Vercel Account**: Sign up at [vercel.com](https://vercel.com/signup).
- **Vercel CLI**: Install it globally via terminal:
  ```bash
  npm i -g vercel
  ```

## 3. Environment Variables
You need to set up your environment variables in Vercel.
1. Go to your Vercel Dashboard -> Project Settings -> Environment Variables.
2. Add the following keys (copy from your local `.env` files):
   - `GROQ_API_KEY`
   - `GOOGLE_GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## 4. Deployment Steps

### Option A: Deploy via CLI (Recommended for first time)
Run the following command in your root directory:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** [Y]
- **Which scope?** [Select your account]
- **Link to existing project?** [N]
- **Project Name:** `procurement-app` (or your choice)
- **In which directory is your code located?** `./` (Just press Enter)
- **Want to modify these settings?** [N] (Our `vercel.json` handles this)

### Option B: Deploy via GitHub
1. Push your code to a GitHub repository.
2. Go to Vercel Dashboard -> "Add New..." -> "Project".
3. Import your GitHub repository.
4. **Build settings**: Vercel should auto-detect Vite. If not, ensure:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. **Environment Variables**: Add them as described in step 3.
6. Click **Deploy**.

## 5. Verifying Deployment
Once deployed, open your Vercel URL.
- **Frontend**: Should load your Dashboard.
- **Backend**: Test by uploading a document or parsing a quotation. The format will be `https://your-app.vercel.app/api/health`.

## Troubleshooting
- **API 404 Errors**: Ensure `vercel.json` is in the root directory and the rewrite rules are correct.
- **Server Error 500**: Check Vercel Function Logs. Often due to missing Environment Variables (API Keys).
