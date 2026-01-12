# Vercel Deployment Guide

## Quick Deploy Options

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to production:
   ```bash
   cd frontend
   vercel --prod
   ```

   Or for first-time setup:
   ```bash
   vercel
   ```
   Then follow the prompts, and deploy to production with:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard (GitHub/GitLab)

1. Push your code to GitHub/GitLab
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your repository
5. Configure project settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install --legacy-peer-deps`
6. Add environment variables if needed (see below)
7. Click "Deploy"

### Option 3: Deploy via Vercel Dashboard (Drag & Drop)

1. Build the app:
   ```bash
   cd frontend
   npm run build
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Drag and drop the `frontend` folder
4. Vercel will automatically detect the configuration

## Environment Variables

If your app needs environment variables, add them in Vercel:
1. Go to Project Settings → Environment Variables
2. Add variables like:
   - `REACT_APP_BACKEND_URL` (or other variables your app needs)
3. Redeploy after adding variables

## Configuration Files

- `vercel.json` - Vercel configuration (already created)
  - Handles client-side routing with rewrites
  - Configures build settings
  - Sets up framework detection

## Build Output

The build folder is located at: `frontend/build`

## Notes

- Vercel automatically handles React Router client-side routing
- The `vercel.json` file includes rewrites for all routes to `/index.html`
- Make sure to use `--legacy-peer-deps` flag for npm install if you encounter dependency conflicts
