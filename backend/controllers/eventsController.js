// backend/controllers/eventsController.js
const pool = require("../config/postgres");

/**
 * Get career events, webinars, and job openings.
 * Filters by user's domain and progress when available.
 */
exports.getEvents = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        let domain = null;
        let progressPct = 0;

        if (userId) {
            const [prefsRes, roadmapRes] = await Promise.all([
                pool.query("SELECT domain FROM career_onboarding_state WHERE uid = $1", [String(userId)]),
                pool.query(
                    "SELECT domain, progress_percentage FROM user_roadmaps WHERE user_id = $1 AND status = 'active' ORDER BY updated_at DESC LIMIT 1",
                    [userId]
                ),
            ]);
            if (prefsRes.rows[0]?.domain) domain = prefsRes.rows[0].domain;
            if (roadmapRes.rows[0]) {
                domain = domain || roadmapRes.rows[0].domain;
                progressPct = roadmapRes.rows[0].progress_percentage || 0;
            }
        }

        let query = "SELECT id, type, title, description, url, domain, level, event_date, created_at FROM career_events WHERE 1=1";
        const params = [];
        if (domain) {
            params.push(domain);
            query += ` AND (domain IS NULL OR domain = $${params.length})`;
        }
        query += " ORDER BY event_date DESC NULLS LAST, created_at DESC LIMIT 50";

        const { rows } = await pool.query(query, params);
        const events = rows.map((r) => ({
            id: r.id,
            type: r.type,
            title: r.title,
            description: r.description,
            url: r.url,
            domain: r.domain,
            level: r.level,
            event_date: r.event_date,
            created_at: r.created_at,
        }));

        res.success(
            {
                events,
                user_context: { domain, progress_percentage: progressPct },
            },
            "Events fetched"
        );
    } catch (error) {
        next(error);
    }
};
