// backend/controllers/userController.js
const pool = require("../config/postgres");
const aiService = require("../services/aiService");

const MAX_MCQS_PER_CHAPTER = 5;

// Normalize: max 5 MCQs per unit; move excess to next chapter
function normalizeRoadmapUnits(payload, domain) {
    const units = payload?.roadmap?.units || payload?.units || [];
    if (units.length === 0) return payload;
    const domainKey = domain || payload?.roadmap?.domain || "General";
    const result = [];
    let overflow = [];
    for (const u of units) {
        const mcqs = Array.isArray(u.mcqs) ? [...u.mcqs] : [];
        const unitCopy = { ...u, mcqs: overflow.length ? [...overflow, ...mcqs] : mcqs };
        overflow = [];
        if (unitCopy.mcqs.length > MAX_MCQS_PER_CHAPTER) {
            overflow = unitCopy.mcqs.slice(MAX_MCQS_PER_CHAPTER);
            unitCopy.mcqs = unitCopy.mcqs.slice(0, MAX_MCQS_PER_CHAPTER);
        }
        result.push(unitCopy);
    }
    while (overflow.length > 0) {
        const last = result[result.length - 1];
        const newUnitNum = (last?.unit_number ?? result.length) + 1;
        const take = Math.min(MAX_MCQS_PER_CHAPTER, overflow.length);
        const mcqsForUnit = overflow.splice(0, take);
        result.push({
            unit_number: newUnitNum,
            title: `${domainKey} — Chapter ${newUnitNum}`,
            level: "intermediate",
            tasks: [{ task_id: `u${newUnitNum}_t1`, task_name: "Task 1" }, { task_id: `u${newUnitNum}_t2`, task_name: "Task 2" }, { task_id: `u${newUnitNum}_t3`, task_name: "Task 3" }, { task_id: `u${newUnitNum}_t4`, task_name: "Task 4" }],
            mcqs: mcqsForUnit,
        });
    }
    const base = payload.roadmap || payload;
    const nodeConfig = (payload.ui_metadata?.node_config || []).slice(0, result.length);
    for (let i = nodeConfig.length; i < result.length; i++) {
        nodeConfig.push({ unit: result[i].unit_number, offset: i % 2 ? "right" : "left", color: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"][i % 5] });
    }
    return { ...payload, roadmap: { ...base, units: result }, ui_metadata: { ...(payload.ui_metadata || {}), node_config: nodeConfig } };
}

// Helper: get completable IDs from roadmap (unit-level "u1","u2" when chapter MCQs, else task-level)
const getFlatTaskIds = (roadmapContent) => {
    if (!roadmapContent) return [];

    if (roadmapContent.roadmap && Array.isArray(roadmapContent.roadmap.units)) {
        const units = roadmapContent.roadmap.units;
        // Chapter-level completion: each unit has .mcqs (5 per chapter); complete by unit id "u1", "u2"
        if (units.length > 0 && Array.isArray(units[0].mcqs)) {
            return units.map(u => `u${u.unit_number}`);
        }
        // Task-level (legacy): each task has its own completion
        const ids = [];
        units.forEach(unit => {
            (unit.tasks || []).forEach(task => {
                ids.push(task.task_id || task.id);
            });
        });
        return ids;
    }

    if (roadmapContent.phases) {
        const ids = [];
        (roadmapContent.phases || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .forEach((phase) => {
                (phase.topics || []).sort((a, b) => (a.order || 0) - (b.order || 0)).forEach((topic) => {
                    (topic.tasks || []).forEach((t) => ids.push(t.id));
                });
            });
        return ids;
    }

    return [];
};

exports.getProfile = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM user_profiles WHERE user_id = $1",
            [req.user.id]
        );
        res.success(rows.length > 0 ? rows[0] : null, "Profile fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.saveProfile = async (req, res, next) => {
    const { profile, roadmap } = req.body;
    const userId = req.user.id;

    try {
        const { rows: existing } = await pool.query("SELECT id FROM user_profiles WHERE user_id = $1", [userId]);

        const query = existing.length > 0
            ? `UPDATE user_profiles SET education_grade=$1, education_department=$2, education_year=$3, interests=$4, skills_learned=$5, skills_to_learn=$6, planning_days=$7, email=$8, phone=$9, updated_at=CURRENT_TIMESTAMP WHERE user_id=$10`
            : `INSERT INTO user_profiles (education_grade, education_department, education_year, interests, skills_learned, skills_to_learn, planning_days, email, phone, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;

        const params = [
            profile.education?.grade, profile.education?.department, profile.education?.year,
            JSON.stringify(profile.interests || []), JSON.stringify(profile.skillsLearned || []), JSON.stringify(profile.skillsToLearn || []),
            profile.planningDays, profile.email, profile.phone, userId
        ];

        await pool.query(query, params);

        if (roadmap) {
            await pool.query(
                "INSERT INTO user_roadmaps (user_id, roadmap_content, status, progress_percentage, updated_at) VALUES ($1, $2, 'active', 0, CURRENT_TIMESTAMP)",
                [userId, JSON.stringify(roadmap)]
            );
        }

        res.success(null, "Profile saved successfully");
    } catch (error) {
        next(error);
    }
};

exports.getRoadmap = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM user_roadmaps WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
            [req.user.id]
        );
        if (rows.length === 0) {
            return res.success(null, "Roadmap fetched successfully");
        }
        const row = rows[0];
        // Domain-linked: fetch latest content from domain_roadmaps (includes auto-generated chapters)
        if (row.domain) {
            const dmResult = await pool.query(
                "SELECT roadmap_content FROM domain_roadmaps WHERE domain = $1",
                [row.domain]
            );
            if (dmResult.rows.length > 0) {
                let content = dmResult.rows[0].roadmap_content;
                content = typeof content === "string" ? JSON.parse(content) : content;
                row.roadmap_content = normalizeRoadmapUnits(content, row.domain);
            }
        }
        if (!row.domain && row.roadmap_content) {
            let content = typeof row.roadmap_content === "string" ? JSON.parse(row.roadmap_content) : row.roadmap_content;
            row.roadmap_content = normalizeRoadmapUnits(content, content?.roadmap?.domain || "General");
        }
        res.success(row, "Roadmap fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.resetRoadmap = async (req, res, next) => {
    try {
        await pool.query(
            "UPDATE user_roadmaps SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND status = 'active'",
            [req.user.id]
        );
        res.success(null, "Roadmap reset successfully");
    } catch (error) {
        next(error);
    }
};

exports.completeTask = async (req, res, next) => {
    const { taskId } = req.body;
    const userId = req.user.id;

    try {
        const { rows: roadmapRows } = await pool.query(
            "SELECT id, domain, roadmap_content, completed_tasks FROM user_roadmaps WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
            [userId]
        );
        if (roadmapRows.length === 0) return res.error("No active roadmap found", "Task completion failed", 404);

        const roadmap = roadmapRows[0];
        // Use domain_roadmaps content when domain-linked (has latest chapters)
        let content = roadmap.roadmap_content;
        if (roadmap.domain) {
            const dmRes = await pool.query("SELECT roadmap_content FROM domain_roadmaps WHERE domain = $1", [roadmap.domain]);
            if (dmRes.rows.length > 0) {
                let raw = dmRes.rows[0].roadmap_content;
                raw = typeof raw === "string" ? JSON.parse(raw) : raw;
                content = normalizeRoadmapUnits(raw, roadmap.domain);
            }
        }
        if (typeof content === "string") content = JSON.parse(content);
        content = normalizeRoadmapUnits(content, roadmap.domain || content?.roadmap?.domain);
        const allTaskIds = getFlatTaskIds(content);

        if (!allTaskIds.includes(taskId)) return res.error("Task not found in roadmap", "Task completion failed", 400);

        let completedTasks = Array.isArray(roadmap.completed_tasks) ? roadmap.completed_tasks : JSON.parse(roadmap.completed_tasks || "[]");
        let progress = roadmap.progress_percentage != null ? Number(roadmap.progress_percentage) : 0;
        if (!completedTasks.includes(taskId)) {
            completedTasks.push(taskId);
            progress = allTaskIds.length > 0 ? Math.min(100, Math.round((completedTasks.length / allTaskIds.length) * 100)) : 0;
            await pool.query(
                "UPDATE user_roadmaps SET progress_percentage = $1, completed_tasks = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
                [progress, JSON.stringify(completedTasks), roadmap.id]
            );
        }

        // Auto-generate next chapter when user completes the last chapter
        const units = content?.roadmap?.units || content?.units || [];
        const isChapterLevel = units.length > 0 && Array.isArray(units[0].mcqs);
        if (isChapterLevel && roadmap.domain && completedTasks.length === units.length) {
            const lastUnit = units[units.length - 1];
            const lastUnitNum = lastUnit?.unit_number ?? units.length;
            try {
                const { data } = await aiService.postWithRetry(
                    "/generate-next-chapter",
                    { domain: roadmap.domain, last_unit_number: lastUnitNum },
                    { timeout: 30000 }
                );
                const newUnits = data?.units || (data?.unit ? [data.unit] : []);
                if (newUnits.length > 0) {
                    const updatedUnits = [...units, ...newUnits];
                    const base = content.roadmap || content;
                    const nodeConfig = [...(content.ui_metadata?.node_config || [])];
                    const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
                    const offsets = ["left", "right"];
                    newUnits.forEach((nu) => {
                        if (!nodeConfig.find((c) => c.unit === nu.unit_number)) {
                            nodeConfig.push({
                                unit: nu.unit_number,
                                offset: offsets[(nu.unit_number - 1) % 2],
                                color: colors[(nu.unit_number - 1) % colors.length],
                            });
                        }
                    });
                    let updatedPayload = {
                        roadmap: { ...base, units: updatedUnits },
                        ui_metadata: { ...(content.ui_metadata || {}), node_config: nodeConfig },
                        gamification: content.gamification || {},
                    };
                    updatedPayload = normalizeRoadmapUnits(updatedPayload, roadmap.domain);
                    await pool.query(
                        "UPDATE domain_roadmaps SET roadmap_content = $1, updated_at = CURRENT_TIMESTAMP WHERE domain = $2",
                        [JSON.stringify(updatedPayload), roadmap.domain]
                    );
                    // Recalculate progress (new chapter added; user has completed previous only)
                    const newTotal = updatedUnits.length;
                    const pct = newTotal > 0 ? Math.round((completedTasks.length / newTotal) * 100) : 0;
                    await pool.query(
                        "UPDATE user_roadmaps SET progress_percentage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                        [pct, roadmap.id]
                    );
                    progress = pct;
                }
            } catch (aiErr) {
                console.warn("Auto-generate next chapter failed:", aiErr.message);
            }
        }

        // Streak Logic
        const today = new Date().toISOString().slice(0, 10);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const { rows: streakRows } = await pool.query("SELECT * FROM user_learning_streak WHERE user_id = $1", [userId]);

        let currentStreak = 1;
        if (streakRows.length > 0) {
            const lastDate = streakRows[0].last_activity_date ? new Date(streakRows[0].last_activity_date).toISOString().slice(0, 10) : null;
            if (lastDate === today) currentStreak = streakRows[0].current_streak;
            else if (lastDate === yesterday) currentStreak = streakRows[0].current_streak + 1;
        }

        await pool.query(
            "INSERT INTO user_learning_streak (user_id, current_streak, last_activity_date, updated_at) VALUES ($1,$2,$3,CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET current_streak=$2, last_activity_date=$3, updated_at=CURRENT_TIMESTAMP",
            [userId, currentStreak, today]
        );

        // Store streak snapshot in profile (day-based: one snapshot per day)
        try {
            const { rows: profRows } = await pool.query(
                "SELECT streak_snapshots FROM user_profiles WHERE user_id = $1",
                [userId]
            );
            let snapshots = [];
            if (profRows.length > 0 && profRows[0].streak_snapshots != null) {
                const raw = profRows[0].streak_snapshots;
                snapshots = Array.isArray(raw) ? raw : (typeof raw === "string" ? JSON.parse(raw || "[]") : []);
            }
            const withoutToday = snapshots.filter((s) => s && s.date !== today);
            snapshots = [...withoutToday, { date: today, streak: currentStreak }].sort(
                (a, b) => (b?.date || "").localeCompare(a?.date || "")
            );
            const snapJson = JSON.stringify(snapshots.slice(0, 90));
            if (profRows.length > 0) {
                await pool.query(
                    "UPDATE user_profiles SET streak_snapshots = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
                    [snapJson, userId]
                );
            }
        } catch (snapErr) {
            if (snapErr.code !== "42703") console.warn("Streak snapshot update failed:", snapErr.message);
        }

        res.success({ progress_percentage: progress, completed_tasks: completedTasks, streak: currentStreak }, "Task completed");
    } catch (error) {
        next(error);
    }
};

exports.getStreak = async (req, res, next) => {
    try {
        const { rows } = await pool.query("SELECT * FROM user_learning_streak WHERE user_id = $1", [req.user.id]);
        res.success(rows.length > 0 ? rows[0] : { current_streak: 0, last_activity_date: null }, "Streak fetched");
    } catch (error) {
        next(error);
    }
};

exports.savePushSubscription = async (req, res, next) => {
    try {
        const { endpoint, keys } = req.body;
        if (!endpoint) return res.error("endpoint required", "Invalid subscription", 400);
        const userId = req.user.id;
        const p256dh = keys?.p256dh || null;
        const auth = keys?.auth || null;
        await pool.query(
            `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, endpoint) DO UPDATE SET p256dh = $3, auth = $4`,
            [userId, endpoint, p256dh, auth]
        );
        res.success(null, "Push subscription saved");
    } catch (error) {
        next(error);
    }
};

exports.getNotifications = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
            [req.user.id]
        );
        res.success(rows, "Notifications fetched");
    } catch (error) {
        next(error);
    }
};

exports.markNotificationRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2", [id, req.user.id]);
        res.success(null, "Marked as read");
    } catch (error) {
        next(error);
    }
};

exports.getOnboardingPreferences = async (req, res, next) => {
    try {
        const uid = String(req.user.id);
        let rows;
        try {
            const result = await pool.query(
                "SELECT domain, proficiency_level, professional_goal, current_status FROM career_onboarding_state WHERE uid = $1",
                [uid]
            );
            rows = result.rows;
        } catch (colError) {
            // Column professional_goal may not exist yet (migration not run)
            if (colError.code === '42703' || (colError.message && colError.message.includes('professional_goal'))) {
                const result = await pool.query(
                    "SELECT domain, proficiency_level, current_status FROM career_onboarding_state WHERE uid = $1",
                    [uid]
                );
                rows = (result.rows || []).map(r => ({ ...r, professional_goal: null }));
            } else {
                throw colError;
            }
        }
        res.success(rows.length > 0 ? rows[0] : null, "Onboarding preferences fetched");
    } catch (error) {
        next(error);
    }
};
