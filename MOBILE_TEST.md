# Test the PWA on your phone (no deploy)

Use this when your phone and laptop are on the same network (e.g. phone hotspot → laptop connected, or both on same Wi‑Fi).

## 1. Get your laptop’s IP

- **Windows:** Open Command Prompt, run `ipconfig`, find **IPv4 Address** under your active adapter (e.g. “Wireless LAN adapter Wi‑Fi” or “Ethernet” when using USB / hotspot). Example: `192.168.43.45`.
- **If laptop is connected to the phone’s hotspot:** That IPv4 is the one to use.

## 2. Allow the frontend origin on the backend (CORS)

Before starting the backend, set the frontend URL to your laptop IP so the phone can call the API:

```bash
cd backend
set FRONTEND_URL=http://YOUR_LAPTOP_IP:3000
npm start
```

Example: if your IP is `192.168.43.45`:

```bash
set FRONTEND_URL=http://192.168.43.45:3000
npm start
```

Leave this terminal open.

## 3. Start the frontend so the phone can reach it

React must listen on all interfaces (`0.0.0.0`) and use your laptop IP for API calls:

```bash
cd frontend
set HOST=0.0.0.0
set REACT_APP_API_URL=http://YOUR_LAPTOP_IP:5000/api
npm start
```

Example:

```bash
set HOST=0.0.0.0
set REACT_APP_API_URL=http://192.168.43.45:5000/api
npm start
```

Leave this terminal open.

## 4. Start the AI service (if you use it)

```bash
cd ai_service
python application.py
```

(If it’s bound only to localhost, you may need to run it with host `0.0.0.0`; the backend calls it from the same machine so usually default is fine.)

## 5. Open the app on your phone

1. On the phone, connect to the same network (e.g. use the phone’s hotspot and connect the laptop to it, or use the same Wi‑Fi).
2. Open the browser and go to: **`http://YOUR_LAPTOP_IP:3000`**  
   Example: `http://192.168.43.45:3000`.
3. Use the app as usual (login, roadmap, etc.). API calls will go to your laptop.

## Option 2: Use ngrok (any network, HTTPS)

You can use **ngrok** so your phone can open your app from anywhere (different WiFi or mobile data). ngrok gives a public HTTPS URL that tunnels to your localhost.

1. **Install ngrok:** https://ngrok.com/download — sign up and run `ngrok config add-authtoken YOUR_TOKEN`.
2. **Start your app:** backend (5000), ai_service (5001), frontend (3000) as usual.
3. **Two tunnels:** In one terminal run `ngrok http 3000` and copy the HTTPS URL (e.g. `https://abc123.ngrok-free.app`) → **FRONTEND_URL**. In another run `ngrok http 5000` and copy the HTTPS URL → **API base**.
4. **Restart with ngrok URLs:** Stop backend and frontend. Start backend with `set FRONTEND_URL=https://YOUR_FRONTEND_NGROK_URL` and npm start. Start frontend with `set REACT_APP_API_URL=https://YOUR_BACKEND_NGROK_URL/api` and npm start. Keep both ngrok terminals open.
5. **On phone:** Open the frontend ngrok URL in the browser. Works on any network. Free tier URLs change when you restart ngrok (then update env vars and restart backend/frontend).

## Optional: one script (Windows)

1. Edit `start-dev-mobile.bat` and set `LAPTOP_IP=YOUR_IP` at the top (e.g. `192.168.43.45`).
2. Run `start-dev-mobile.bat`.
3. On the phone open `http://YOUR_IP:3000`.

---

# Option 2: Use ngrok (any network, HTTPS)

You can use **ngrok** so your phone can reach your laptop from anywhere (different WiFi, mobile data, etc.). ngrok gives you a public HTTPS URL that tunnels to your localhost.

## 1. Install ngrok

- Download from [ngrok.com](https://ngrok.com/download) or install with: `choco install ngrok` / `npm install -g ngrok`
- Sign up at ngrok.com and add your auth token: `ngrok config add-authtoken YOUR_TOKEN`

## 2. Start your app locally (as usual)

- Start **backend** (terminal 1): `cd backend && npm start`
- Start **AI service** (terminal 2): `cd ai_service && python application.py`
- Start **frontend** (terminal 3): `cd frontend && npm start`

Leave all three running.

## 3. Create two tunnels

Open **two new** terminals and run:

**Terminal A – frontend (port 3000):**
```bash
ngrok http 3000
```
Copy the **HTTPS** URL it shows (e.g. `https://abc123.ngrok-free.app`). This is your **FRONTEND_URL**.

**Terminal B – backend (port 5000):**
```bash
ngrok http 5000
```
Copy the **HTTPS** URL (e.g. `https://def456.ngrok-free.app`). This is your **API base** (backend).

## 4. Restart backend and frontend with ngrok URLs

- **Stop** the backend and frontend (Ctrl+C in their terminals).

- **Backend** – allow CORS from the frontend ngrok URL:
  ```bash
  cd backend
  set FRONTEND_URL=https://abc123.ngrok-free.app
  npm start
  ```
  (Use the **frontend** ngrok URL from Terminal A.)

- **Frontend** – point API to the backend ngrok URL:
  ```bash
  cd frontend
  set REACT_APP_API_URL=https://def456.ngrok-free.app/api
  npm start
  ```
  (Use the **backend** ngrok URL from Terminal B + `/api`.)

- **Keep both ngrok terminals (A and B) open** while testing.

## 5. Open the app on your phone

On your phone’s browser, open the **frontend** ngrok URL:  
`https://abc123.ngrok-free.app` (your actual URL from Terminal A).

You can use any network (e.g. mobile data); no need to be on the same WiFi as the laptop.

## ngrok notes

- **Free tier:** URLs change each time you restart ngrok. You’ll need to update `FRONTEND_URL` and `REACT_APP_API_URL` and restart backend/frontend if you restart the tunnels.
- **Browser warning:** ngrok may show an “Visit Site” interstitial once per session; click through to reach your app.
- **HTTPS:** ngrok gives you HTTPS, which is better for PWA “Add to Home Screen” and secure cookies.

---

## Troubleshooting

- **Can’t load the page on the phone:**  
  - Check firewall: allow inbound for ports 3000 and 5000 (Node).  
  - Confirm phone and laptop use the same network and the IP is correct.

- **Page loads but login/API fails:**  
  - You must set `REACT_APP_API_URL=http://YOUR_LAPTOP_IP:5000/api` when starting the frontend (step 3).  
  - Backend must be started with `FRONTEND_URL=http://YOUR_LAPTOP_IP:3000` (step 2).

- **HTTPS / “Add to Home Screen”:**  
  For a real PWA install on the phone, you’d use HTTPS (e.g. deploy or a tunnel). For quick testing, HTTP on the local IP is enough.
