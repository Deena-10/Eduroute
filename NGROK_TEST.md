# Test the PWA with ngrok

Use ngrok to get a public HTTPS URL and test on your phone from any network (no same WiFi needed).

## 1. Install ngrok

- Download: https://ngrok.com/download
- Sign up at ngrok.com, then: `ngrok config add-authtoken YOUR_TOKEN`

## 2. Start your app locally

- Terminal 1: `cd backend && npm start`
- Terminal 2: `cd ai_service && python application.py`
- Terminal 3: `cd frontend && npm start`

## 3. Run two ngrok tunnels

**Terminal A – frontend:**
```bash
ngrok http 3000
```
Copy the **HTTPS** URL (e.g. `https://abc123.ngrok-free.app`) → this is **FRONTEND_URL**.

**Terminal B – backend:**
```bash
ngrok http 5000
```
Copy the **HTTPS** URL (e.g. `https://def456.ngrok-free.app`) → this is **API base**.

## 4. Restart backend and frontend with ngrok URLs

Stop backend and frontend (Ctrl+C), then:

**Backend** (use frontend ngrok URL):
```bash
cd backend
set FRONTEND_URL=https://abc123.ngrok-free.app
npm start
```

**Frontend** (use backend ngrok URL + /api):
```bash
cd frontend
set REACT_APP_API_URL=https://def456.ngrok-free.app/api
npm start
```

Keep both ngrok terminals open.

## 5. Open on phone

In the phone browser, open the **frontend** ngrok URL:  
`https://abc123.ngrok-free.app`

Works on any network (e.g. mobile data). Free ngrok URLs change when you restart ngrok; update the env vars and restart backend/frontend if you restart the tunnels.
