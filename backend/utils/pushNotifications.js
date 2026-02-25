// backend/utils/pushNotifications.js
const webpush = require("web-push");
const pool = require("../config/postgres");

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails("mailto:support@eduroute.ai", VAPID_PUBLIC, VAPID_PRIVATE);
}

async function getSubscriptionsForUsers(userIds) {
    if (!userIds.length) return [];
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(",");
    const { rows } = await pool.query(
        `SELECT user_id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id IN (${placeholders})`,
        userIds
    );
    return rows;
}

async function sendPushToUsers(userIds, payload) {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
        console.warn("VAPID keys not set; skipping push notifications");
        return;
    }
    const subs = await getSubscriptionsForUsers(userIds);
    const results = await Promise.allSettled(
        subs.map((s) => {
            const sub = {
                endpoint: s.endpoint,
                keys: { p256dh: s.p256dh || "", auth: s.auth || "" },
            };
            return webpush.sendNotification(sub, JSON.stringify(payload));
        })
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length) console.warn("Push failed for", failed.length, "subscriptions");
}

module.exports = { sendPushToUsers, getSubscriptionsForUsers };
