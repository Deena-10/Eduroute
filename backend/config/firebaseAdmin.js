// backend/config/firebaseAdmin.js
const admin = require("firebase-admin");

// Initialize Firebase only when credentials are present (required for Google sign-in)
const hasFirebaseCreds =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length && hasFirebaseCreds) {
  try {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  } catch (e) {
    console.warn("[Firebase] Init failed:", e.message);
  }
}

module.exports = admin;
