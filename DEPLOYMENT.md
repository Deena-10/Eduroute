# Career Roadmap App – Deployment Guide

Your app has **three parts**:
- **Frontend** (React) – `frontend/`
- **Backend** (Node.js/Express, Prisma, PostgreSQL/MongoDB) – `backend/`
- **AI service** (Python) – `backend/service/` (optional, can run separately)

You can deploy using **Vercel** (simplest for frontend) or **Google Cloud** (full stack on one platform).

---

## Option A: Vercel (frontend) + Backend elsewhere

**Best for:** Quick frontend deploy; backend on a separate service.

- **Frontend → Vercel** (static site, very easy).
- **Backend →** Keep on **Google Cloud Run**, **Railway**, **Render**, or **Fly.io** (you need a server or serverless Node app that runs 24/7).

### 1. Deploy frontend to Vercel

1. Push your code to **GitHub** (if not already).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo.
3. Set **Root Directory** to `frontend`.
4. Set **Build Command:** `npm run build`
5. Set **Output Directory:** `build`
6. Add **Environment Variable** (required for API calls):
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://YOUR-BACKEND-URL/api`  
   (e.g. `https://your-backend.run.app/api` or `https://api.yourapp.com/api`)
7. Deploy. Vercel will build and host the React app.

Your frontend already uses `REACT_APP_API_URL` in `frontend/src/api/axiosInstance.js`, so no code change is needed.

### 2. Deploy backend (required for app to work)

You must host the backend somewhere and use that URL in `REACT_APP_API_URL` above.

- **Railway / Render / Fly.io:** Create a new project, connect the repo, set root to `backend`, add env vars from `backend/env.example`, and deploy. They will give you a URL like `https://your-app.up.railway.app`.
- **Google Cloud Run:** See **Option B** below for backend on Cloud Run; then use that Cloud Run URL as `REACT_APP_API_URL` in Vercel.

**Backend env vars to set in production:**
- `PORT` (often set by the host, e.g. 5000 or 8080)
- `FRONTEND_URL` = your Vercel URL (e.g. `https://your-app.vercel.app`) so CORS works
- `DATABASE_URL` or `DB_*` for PostgreSQL
- `JWT_SECRET`, `FIREBASE_*`, `AI_SERVICE_URL`, and any API keys from `backend/env.example`

---

## Option B: Google Cloud (full stack)

**Best for:** Running frontend + backend (and optionally AI service) on Google Cloud, with one cloud account.

### Architecture

| Part       | Where on GCP              |
|-----------|----------------------------|
| Frontend  | Cloud Storage + Cloud CDN (or Cloud Run) |
| Backend   | Cloud Run                 |
| Database  | Cloud SQL (PostgreSQL)    |
| AI service| Cloud Run (optional)      |

### 1. Prepare the backend for Cloud Run

Cloud Run expects the server to listen on `PORT` (provided by the environment). Your `server.js` already uses:

```js
const PORT = process.env.PORT || 5000;
```

So no code change is needed. Ensure all config comes from env (DB, JWT, Firebase, etc.).

### 2. Deploy backend to Cloud Run

From your machine (with [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and logged in):

```bash
cd backend

# Build and push image (replace PROJECT_ID and REGION)
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1

gcloud builds submit --tag gcr.io/$PROJECT_ID/eduroute-backend

gcloud run deploy eduroute-backend \
  --image gcr.io/$PROJECT_ID/eduroute-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,FRONTEND_URL=https://YOUR-FRONTEND-URL"
```

Then in **Cloud Run → your service → Edit & Deploy → Variables** add all secrets (e.g. `JWT_SECRET`, `DATABASE_URL` or `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, Firebase, API keys). Prefer **Secret Manager** for sensitive values.

You will get a URL like: `https://eduroute-backend-xxxxx-uc.a.run.app`. Use this as the backend URL for the frontend.

### 3. Database on Google Cloud

- Create a **Cloud SQL for PostgreSQL** instance in the same project/region.
- Set connection name and credentials in backend env (e.g. `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, or a single `DATABASE_URL` if your app supports it).
- For Cloud Run → Cloud SQL, use the Cloud SQL Auth Proxy or the Cloud SQL connector so the backend can reach the DB securely.

### 4. Deploy frontend (two options)

**Option 4a – Static hosting (Cloud Storage + CDN)**

```bash
cd frontend
npm run build
# Set REACT_APP_API_URL to your Cloud Run backend URL before building, e.g.:
# set REACT_APP_API_URL=https://eduroute-backend-xxxxx-uc.a.run.app/api  (Windows)
# export REACT_APP_API_URL=https://eduroute-backend-xxxxx-uc.a.run.app/api  (Mac/Linux)
npm run build

# Upload build folder to a GCS bucket, then enable the bucket for static website + CDN (Load Balancer).
# Or use Firebase Hosting: firebase init hosting -> point to frontend/build.
```

**Option 4b – Frontend on Cloud Run (using your existing Dockerfile)**

```bash
cd frontend
# Build with backend URL (Windows PowerShell):
$env:REACT_APP_API_URL="https://eduroute-backend-xxxxx-uc.a.run.app/api"; npm run build

# Then build and deploy the image (Dockerfile already builds and serves with nginx)
gcloud builds submit --tag gcr.io/$PROJECT_ID/eduroute-frontend
gcloud run deploy eduroute-frontend \
  --image gcr.io/$PROJECT_ID/eduroute-frontend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated
```

Then set **FRONTEND_URL** in the backend (Cloud Run) to this frontend URL so CORS works.

---

## Checklist before going live

- [ ] **Backend:** All env vars from `backend/env.example` set in production (DB, JWT, Firebase, `FRONTEND_URL`, etc.).
- [ ] **Frontend:** `REACT_APP_API_URL` points to the **production backend URL** (including `/api` if your backend serves under `/api`).
- [ ] **CORS:** Backend `FRONTEND_URL` (or allowed origins) includes the exact frontend URL (e.g. Vercel or Cloud Run frontend).
- [ ] **Database:** Migrations applied (e.g. `npx prisma db push` or your SQL migrations) on the production DB.
- [ ] **Secrets:** No `.env` or secrets committed to git; use platform env vars or Secret Manager.

---

## Quick comparison

| Criteria           | Vercel (frontend) + backend elsewhere | Google Cloud (full stack)     |
|-------------------|---------------------------------------|------------------------------|
| Ease of frontend  | Easiest (connect repo, add env)       | More steps (build, GCS or Run)|
| Backend           | You deploy to Railway/Render/Cloud Run| Same backend on Cloud Run    |
| Cost              | Vercel free tier; backend varies      | Pay for Cloud Run + Cloud SQL|
| Full control      | Split across platforms                | Everything in one GCP project |
| DB                | Use any (e.g. Railway Postgres)       | Cloud SQL or external        |

**Recommendation:**
- For **fastest path:** deploy **frontend on Vercel** and **backend on Railway or Render** (or Cloud Run), then set `REACT_APP_API_URL` and `FRONTEND_URL`.
- For **everything on Google Cloud:** use **Cloud Run for backend + frontend** and **Cloud SQL for PostgreSQL** as in Option B.

If you tell me your choice (Vercel vs full Google Cloud), I can give you step-by-step commands tailored to your repo and folder names.
