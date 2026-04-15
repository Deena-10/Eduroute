// backend/controllers/adminController.js
const pool = require("../config/postgres");
const { sendPushToUsers } = require("../utils/pushNotifications");

const ADMIN_KEY = process.env.ADMIN_API_KEY;

function requireAdmin(req, res, next) {
    if (!ADMIN_KEY) {
        return res.status(503).json({
            success: false,
            message: "Admin route not configured. Set ADMIN_API_KEY on backend service.",
        });
    }
    const key = req.headers["x-admin-key"] || req.body?.admin_key;
    if (!key || key !== ADMIN_KEY) {
        return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
}

/**
 * Admin POST: Create event + notify matching users (in-app + PWA push).
 */
async function createEvent(req, res, next) {
    try {
        const { type, title, description, url, domain, level, event_date } = req.body;
        if (!type || !title) {
            return res.status(400).json({ success: false, message: "type and title required" });
        }

        const { rows } = await pool.query(
            `INSERT INTO career_events (type, title, description, url, domain, level, event_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, type, title, description, url, domain, level, event_date, created_at`,
            [type || "event", title, description || null, url || null, domain || null, level || null, event_date || null]
        );
        const event = rows[0];

        // Find users with matching domain (or all if domain is null)
        let userQuery = "SELECT DISTINCT u.id FROM users u";
        const params = [];
        if (domain) {
            userQuery += ` LEFT JOIN career_onboarding_state cos ON cos.uid = u.id::text
             LEFT JOIN user_roadmaps ur ON ur.user_id = u.id AND ur.status = 'active'
             WHERE (cos.domain = $1 OR ur.domain = $1)`;
            params.push(domain);
        } else {
            userQuery += " WHERE 1=1";
        }
        const { rows: userRows } = await pool.query(userQuery, params);
        const userIds = userRows.map((r) => r.id);

        // Create in-app notifications
        const notifTitle = `New ${type}: ${title}`;
        const notifMessage = description || `Check out this ${type} in your Events page.`;
        for (const uid of userIds) {
            await pool.query(
                "INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)",
                [uid, `event_${type}`, notifTitle, notifMessage]
            );
        }

        // PWA push notifications
        await sendPushToUsers(userIds, {
            title: notifTitle,
            body: notifMessage.slice(0, 100),
            url: url || "/events",
            tag: `event-${event.id}`,
        });

        res.status(201).json({
            success: true,
            event,
            notified_users: userIds.length,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { createEvent, requireAdmin };
