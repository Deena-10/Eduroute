// Lazy Firebase Auth loader - only loads when needed to avoid gapi errors on initial page load
let firebaseAuthPromise = null;

export async function getFirebaseAuth() {
  if (firebaseAuthPromise) return firebaseAuthPromise;
  firebaseAuthPromise = import("./firebase").then((mod) => ({
    auth: mod.auth,
    googleProvider: mod.googleProvider,
  }));
  return firebaseAuthPromise;
}

export function isFirebaseLoaded() {
  return firebaseAuthPromise != null;
}
