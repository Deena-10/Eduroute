# Google Sign-In Setup

To make "Continue with Google" work correctly (locally and in deployment):

## 1. Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project (`upteduroute`)
2. **Authentication** → **Settings** → **Authorized domains**
3. Add your deployment URLs:
   - `localhost` (for local dev)
   - `eduroute-gce9.onrender.com` (or your Render frontend domain)

Without your domain in Authorized domains, the Google popup will fail with an `auth/unauthorized-domain` error.

## 2. Backend Environment (Render)

On the **backend** service, set these env vars (from Firebase Console → Project Settings → Service accounts → Generate new private key):

| Variable | Example |
|----------|---------|
| `FIREBASE_PROJECT_ID` | `upteduroute` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxx@upteduroute.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n` |

**Important:** `FIREBASE_PRIVATE_KEY` must be the full key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. In Render, paste it as a single line; the backend converts `\n` to newlines automatically.

## 3. Frontend Environment

The frontend uses Firebase client config from `firebase.js`. For deployment, set in the frontend service:

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN` (e.g. `upteduroute.firebaseapp.com`)
- `REACT_APP_FIREBASE_PROJECT_ID`
- etc.

Or keep the hardcoded values in `firebase.js` if the project is the same.

## 4. Common errors

| Error | Fix |
|-------|-----|
| Popup blocked | User must allow popups for your site |
| auth/unauthorized-domain | Add your domain to Firebase Authorized domains |
| Google sign-in is not configured | Set FIREBASE_* vars on the backend |
| auth/configuration-error | Check Firebase client config in frontend |
