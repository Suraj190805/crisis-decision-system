# Deployment Guide — Global Crisis Decision System (GCDS)

This guide walks you through deploying the **Backend to Railway** and the **Frontend to Vercel**.

---

## 1. Backend Deployment (Railway)

### Step 1: Connect Repository to Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select `Suraj190805/crisis-decision-system`.
4. Railway will automatically detect Python using the provided `railway.json`, `Procfile`, and `requirements.txt`.

### Step 2: Configure Environment Variables on Railway
In your Railway project settings -> **Variables**, add:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | **(Required)** Your Groq API key from [console.groq.com](https://console.groq.com) | `gsk_...` |
| `GROQ_MODEL_ID` | **(Required/Recommended)** Active Groq Model ID | `groq/openai/gpt-oss-120b` or `groq/qwen/qwen3.8-27b` |
| `NEWS_API_KEY` | *(Optional)* NewsAPI key from [newsapi.org](https://newsapi.org) | `your_news_key` |
| `DATABASE_URL` | *(Optional)* SQLite by default (`sqlite:///crisis.db`). Or connect Railway PostgreSQL | `sqlite:///crisis.db` |
| `PORT` | Set automatically by Railway | `8000` |

### Step 3: Generate Public Domain
1. In your service settings under **Networking**, click **Generate Domain** (e.g. `https://crisis-decision-system-production.up.railway.app`).
2. Test the health endpoint: `https://your-domain.up.railway.app/health`.
3. Copy this URL — you will need it for Vercel.

---

## 2. Frontend Deployment (Vercel)

### Step 1: Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Select your GitHub repository: `Suraj190805/crisis-decision-system`.
3. In **Project Configuration**:
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: Click **Edit** and select `crisis-frontend` (IMPORTANT!)
   - **Build Command**: `next build` (default)
   - **Install Command**: `npm install` (default)

### Step 2: Set Environment Variables on Vercel
Expand **Environment Variables** and add:

| Name | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL (e.g. `https://crisis-decision-system-production.up.railway.app`) |

> **Note**: Do not include a trailing slash in `NEXT_PUBLIC_API_URL`.

### Step 3: Deploy
1. Click **Deploy**.
2. Once the build finishes, your Next.js application with the 3D globe and all intelligence modules will be live!

---

## 3. Local Development

```bash
# Terminal 1: Backend
cd crisis-decision-system
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd crisis-decision-system/crisis-frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
