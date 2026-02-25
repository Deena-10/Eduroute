// frontend/src/utils/pushSubscription.js
import axiosInstance from '../api/axiosInstance';

export async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const serverRoot = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : '';
    const vapidRes = await fetch(`${serverRoot}/api/vapid-public`);
    const { publicKey } = await vapidRes.json();
    if (!publicKey) return null;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const sub = subscription.toJSON();
    await axiosInstance.post('/user/push-subscription', {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.keys?.p256dh, auth: sub.keys?.auth },
    });
    return subscription;
  } catch (e) {
    console.warn('Push subscription failed:', e);
    return null;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}
