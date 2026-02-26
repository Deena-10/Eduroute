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

// Helper: get duration in hours for a task from roadmap content (default 1)
const getTaskDurationHours = (roadmapContent, taskId) => {
    if (!roadmapContent || !taskId) return 1;
    const units = roadmapContent?.roadmap?.units || roadmapContent?.units || [];
    for (const unit of units) {
        for (const task of unit.tasks || []) {
            const id = task.task_id || task.id;
            if (id === taskId) {
                const h = task.duration_hours ?? task.duration;
                return typeof h === "number" && h > 0 ? h : 1;
            }
        }
    }
    return 1;
};

exports.getProfileDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profileRes = await pool.query(
            `SELECT up.*, u.name AS user_name, u.email AS user_email
             FROM user_profiles up
             LEFT JOIN users u ON u.id = up.user_id
             WHERE up.user_id = $1`,
            [userId]
        );
        const roadmapRes = await pool.query(
            "SELECT domain, completed_tasks, completed_hours, progress_percentage, roadmap_content FROM user_roadmaps WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
            [userId]
        );
        const achievementsRes = await pool.query(
            "SELECT achievement_type, achieved_at FROM user_achievements WHERE user_id = $1 ORDER BY achieved_at DESC",
            [userId]
        );
        const activityRes = await pool.query(
            "SELECT activity_type, title, created_at FROM user_activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
            [userId]
        ).catch(() => ({ rows: [] }));
        const scoreRes = await pool.query(
            "SELECT total_correct, total_questions FROM user_scores WHERE user_id = $1",
            [userId]
        ).catch(() => ({ rows: [] }));

        let p = profileRes.rows[0];
        const r = roadmapRes.rows[0];
        if (!p) {
            const userRow = await pool.query("SELECT name, email FROM users WHERE id = $1", [userId]);
            p = userRow.rows[0] ? { user_name: userRow.rows[0].name, user_email: userRow.rows[0].email, interests: [], skills_learned: [], skills_to_learn: [], streak_snapshots: [] } : {};
        }
        const achievementsDefs = {
            first_task: { title: "First Step", desc: "Complete your first task", icon: "🎯" },
            half_roadmap: { title: "Halfway There", desc: "Complete 50% of your roadmap", icon: "⭐" },
            full_roadmap: { title: "Path Master", desc: "Complete your full roadmap", icon: "🏆" },
        };
        const achievements = (achievementsRes.rows || []).map(row => ({
            ...row,
            ...achievementsDefs[row.achievement_type],
        }));

        const skillsLearned = Array.isArray(p?.skills_learned) ? p.skills_learned : (typeof p?.skills_learned === "string" ? JSON.parse(p?.skills_learned || "[]") : []);
        const skillsToLearn = Array.isArray(p?.skills_to_learn) ? p.skills_to_learn : (typeof p?.skills_to_learn === "string" ? JSON.parse(p?.skills_to_learn || "[]") : []);
        const domain = r?.domain || null;
        const completedTasks = r?.completed_tasks ? (Array.isArray(r.completed_tasks) ? r.completed_tasks : JSON.parse(r.completed_tasks || "[]")) : [];
        const progressPct = r?.progress_percentage ?? 0;
        const skills = [
            ...skillsLearned.map(s => ({ name: typeof s === "string" ? s : s?.name || "Skill", level: 85, category: "Learned" })),
            ...skillsToLearn.map(s => ({ name: typeof s === "string" ? s : s?.name || "Skill", level: Math.min(progressPct, 70), category: "Learning" })),
        ];
        if (domain && !skills.some(s => s.name.toLowerCase().includes(domain.toLowerCase()))) {
            skills.unshift({ name: domain, level: progressPct, category: "Domain" });
        }
        if (skills.length === 0 && domain) {
            skills.push({ name: domain, level: progressPct, category: "Domain" });
        }

        const formatTime = (d) => {
            const diff = (Date.now() - new Date(d)) / 1000;
            if (diff < 60) return "Just now";
            if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
            if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
            return new Date(d).toLocaleDateString();
        };
        const recentActivity = (activityRes.rows || []).map(row => {
            let action = "Activity";
            if (row.activity_type === "task_completed") action = "Completed task";
            else if (row.activity_type === "achievement") action = "Earned achievement";
            const title = row.activity_type === "achievement" ? (achievementsDefs[row.title]?.title || row.title) : (row.title || "Task");
            return { action, title, time: formatTime(row.created_at), created_at: row.created_at };
        });

        const lessonsCompleted = completedTasks.length;
        let totalTaskCount = 0;
        if (r?.roadmap_content) {
            const content = typeof r.roadmap_content === "string" ? JSON.parse(r.roadmap_content) : r.roadmap_content;
            totalTaskCount = getFlatTaskIds(content).length;
        }
        if (totalTaskCount === 0 && r?.domain) {
            const dmRes = await pool.query("SELECT roadmap_content FROM domain_roadmaps WHERE domain = $1", [r.domain]);
            if (dmRes.rows?.length > 0) {
                const content = typeof dmRes.rows[0].roadmap_content === "string" ? JSON.parse(dmRes.rows[0].roadmap_content) : dmRes.rows[0].roadmap_content;
                totalTaskCount = getFlatTaskIds(content).length;
            }
        }
        const totalHours = Number(r?.completed_hours) || 0;
        const completionRatePct = totalTaskCount > 0 ? Math.round((lessonsCompleted / totalTaskCount) * 100) : 0;
        const scoreRow = scoreRes.rows?.[0];
        const totalCorrect = scoreRow?.total_correct ?? 0;
        const totalQuestions = scoreRow?.total_questions ?? 0;
        const quizAccuracy = totalQuestions > 0 ? Math.round(100 * totalCorrect / totalQuestions) : 0;

        res.success({
            profile: {
                name: p?.user_name ?? p?.email ?? null,
                email: p?.email ?? p?.user_email ?? null,
                interests: Array.isArray(p?.interests) ? p.interests : (typeof p?.interests === "string" ? JSON.parse(p?.interests || "[]") : []),
                streak_snapshots: Array.isArray(p?.streak_snapshots) ? p.streak_snapshots : [],
            },
            overview: {
                lessonsCompleted,
                totalLessons: totalTaskCount,
                totalHours,
                completionRatePct,
                skillsCount: skills.length,
                quizAccuracy,
                totalCorrect,
                totalQuestions,
            },
            skills,
            achievements,
            recentActivity,
        }, "Profile dashboard fetched");
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT up.*, u.name AS user_name, u.email AS user_email
             FROM user_profiles up
             LEFT JOIN users u ON u.id = up.user_id
             WHERE up.user_id = $1`,
            [req.user.id]
        );
        if (rows.length === 0) {
            const { rows: userRows } = await pool.query(
                "SELECT name, email FROM users WHERE id = $1",
                [req.user.id]
            );
            const u = userRows[0];
            return res.success({
                user_name: u?.name,
                user_email: u?.email,
                email: u?.email,
                interests: [],
                education_grade: null,
                education_department: null,
                education_year: null,
                skills_learned: [],
                skills_to_learn: [],
                planning_days: null,
                phone: null,
                streak_snapshots: [],
            }, "Profile fetched successfully");
        }
        const p = rows[0];
        const profile = {
            ...p,
            name: p.user_name ?? p.email ?? null,
            email: p.email ?? p.user_email ?? null,
        };
        res.success(profile, "Profile fetched successfully");
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
        // Recalculate progress for accuracy (completed / total from current content)
        const content = row.roadmap_content?.roadmap || row.roadmap_content;
        const allTaskIds = getFlatTaskIds(row.roadmap_content);
        const completedTasks = Array.isArray(row.completed_tasks) ? row.completed_tasks : JSON.parse(row.completed_tasks || "[]");
        if (allTaskIds.length > 0) {
            row.progress_percentage = Math.min(100, Math.round((completedTasks.length / allTaskIds.length) * 100));
        }
        row.completed_hours = Number(row.completed_hours) ?? 0;
        row.total_task_count = allTaskIds.length;
        res.success(row, "Roadmap fetched successfully");
    } catch (error) {
        next(error);
    }
};

exports.resetRoadmap = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await pool.query(
            "UPDATE user_roadmaps SET status = 'paused', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND status = 'active'",
            [userId]
        );
        // Reset streak when user resets their learning journey (start from 0)
        await pool.query(
            "INSERT INTO user_learning_streak (user_id, current_streak, last_activity_date, updated_at) VALUES ($1, 0, NULL, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET current_streak = 0, last_activity_date = NULL, updated_at = CURRENT_TIMESTAMP",
            [userId]
        );
        // Clear streak history in profile
        await pool.query(
            "UPDATE user_profiles SET streak_snapshots = '[]', updated_at = CURRENT_TIMESTAMP WHERE user_id = $1",
            [userId]
        );
        res.success(null, "Roadmap reset successfully");
    } catch (error) {
        next(error);
    }
};

exports.completeTask = async (req, res, next) => {
    const { taskId, quizCorrect, quizTotal } = req.body;
    const userId = req.user.id;

    try {
        const { rows: roadmapRows } = await pool.query(
            "SELECT id, domain, roadmap_content, completed_tasks, COALESCE(completed_hours, 0) AS completed_hours FROM user_roadmaps WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
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
        let completedHours = Number(roadmap.completed_hours) || 0;
        const isNewCompletion = !completedTasks.includes(taskId);
        if (isNewCompletion) {
            completedTasks.push(taskId);
            progress = allTaskIds.length > 0 ? Math.min(100, Math.round((completedTasks.length / allTaskIds.length) * 100)) : 0;
            const taskHours = getTaskDurationHours(content, taskId);
            completedHours += taskHours;
            await pool.query(
                "UPDATE user_roadmaps SET progress_percentage = $1, completed_tasks = $2, completed_hours = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
                [progress, JSON.stringify(completedTasks), completedHours, roadmap.id]
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

        // Streak: only when a NEW task was completed — daily snapshot, +1 per day max; reset if a day is skipped
        const { rows: streakRows } = await pool.query(
            "SELECT current_streak, last_activity_date FROM user_learning_streak WHERE user_id = $1",
            [userId]
        );
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().slice(0, 10);

        let currentStreak = streakRows.length > 0 ? (streakRows[0].current_streak ?? 0) : 0;
        const lastDate = streakRows[0]?.last_activity_date ? new Date(streakRows[0].last_activity_date).toISOString().slice(0, 10) : null;
        if (!lastDate || (lastDate !== today && lastDate !== yesterday)) {
            currentStreak = 0; // reset if inactive
        }

        if (isNewCompletion) {
            const row = streakRows[0];
            const lastDate = row?.last_activity_date ? new Date(row.last_activity_date).toISOString().slice(0, 10) : null;

            if (lastDate === today) {
                currentStreak = row?.current_streak ?? 0; // same day: no increment
            } else if (lastDate === yesterday) {
                currentStreak = (row?.current_streak ?? 0) + 1; // consecutive day
            } else {
                currentStreak = 1; // new or reset
            }

            await pool.query(
                "INSERT INTO user_learning_streak (user_id, current_streak, last_activity_date, updated_at) VALUES ($1,$2,$3,CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET current_streak=$2, last_activity_date=$3, updated_at=CURRENT_TIMESTAMP",
                [userId, currentStreak, today]
            );

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

            const c = Math.max(0, parseInt(quizCorrect, 10) || 0);
            const t = Math.max(0, parseInt(quizTotal, 10) || 0);
            if (t > 0) {
                const { rows: scoreRows } = await pool.query("SELECT total_correct, total_questions FROM user_scores WHERE user_id = $1", [userId]);
                if (scoreRows.length > 0) {
                    await pool.query("UPDATE user_scores SET total_correct = total_correct + $1, total_questions = total_questions + $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3", [c, t, userId]);
                } else {
                    await pool.query("INSERT INTO user_scores (user_id, total_correct, total_questions, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)", [userId, c, t]);
                }
            }

            const pct = allTaskIds.length > 0 ? Math.round((completedTasks.length / allTaskIds.length) * 100) : 0;
            for (const { type, cond } of [
                { type: "first_task", cond: completedTasks.length >= 1 },
                { type: "half_roadmap", cond: pct >= 50 },
                { type: "full_roadmap", cond: pct >= 100 },
            ]) {
                if (cond) {
                    await pool.query("INSERT INTO user_achievements (user_id, achievement_type) VALUES ($1, $2)", [userId, type]).catch(() => {});
                    await pool.query("INSERT INTO user_activity_log (user_id, activity_type, title) VALUES ($1, 'achievement', $2)", [userId, type]).catch(() => {});
                }
            }
            await pool.query("INSERT INTO user_activity_log (user_id, activity_type, title) VALUES ($1, 'task_completed', $2)", [userId, taskId]).catch(() => {});
        }

        res.success({ progress_percentage: progress, completed_tasks: completedTasks, streak: currentStreak, completed_hours: completedHours }, "Task completed");
    } catch (error) {
        next(error);
    }
};

exports.getStreak = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT current_streak, last_activity_date FROM user_learning_streak WHERE user_id = $1",
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.success({ current_streak: 0, last_activity_date: null }, "Streak fetched");
        }

        const row = rows[0];
        const lastDate = row.last_activity_date ? new Date(row.last_activity_date).toISOString().slice(0, 10) : null;
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const yesterdayDate = new Date(now);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().slice(0, 10);
        let currentStreak = row.current_streak ?? 0;

        // Streak resets if last activity was before yesterday (missed a day)
        if (!lastDate || (lastDate !== today && lastDate !== yesterday)) {
            currentStreak = 0;
        }

        res.success({ current_streak: currentStreak, last_activity_date: row.last_activity_date }, "Streak fetched");
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

exports.getRank = async (req, res, next) => {
    try {
        let rows = [];
        try {
            const result = await pool.query(
                `SELECT u.id, u.name, COALESCE(s.total_correct, 0)::int AS total_correct, COALESCE(s.total_questions, 0)::int AS total_questions,
                 CASE WHEN s.total_questions > 0 THEN ROUND(100.0 * s.total_correct / s.total_questions, 1) ELSE 0 END AS accuracy_pct
                 FROM user_scores s
                 JOIN users u ON u.id = s.user_id
                 ORDER BY s.total_correct DESC
                 LIMIT 100`
            );
            rows = result.rows || [];
        } catch (_) {
            rows = [];
        }
        const currentUserId = req.user.id;
        const withRank = rows.map((r, i) => ({ ...r, rank: i + 1, isCurrentUser: r.id === currentUserId }));
        res.success(withRank, "Rank fetched");
    } catch (error) {
        next(error);
    }
};

exports.getAchievements = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT achievement_type, achieved_at FROM user_achievements WHERE user_id = $1 ORDER BY achieved_at DESC",
            [req.user.id]
        );
        const defs = {
            first_task: { title: "First Step", desc: "Complete your first task", icon: "🎯" },
            half_roadmap: { title: "Halfway There", desc: "Complete 50% of your roadmap", icon: "⭐" },
            full_roadmap: { title: "Path Master", desc: "Complete your full roadmap", icon: "🏆" },
        };
        const list = rows.map(r => ({ ...r, ...defs[r.achievement_type] }));
        res.success(list, "Achievements fetched");
    } catch (error) {
        next(error);
    }
};

const DOMAIN_VIDEOS = {
    "python full stack": ["kqtD5dpn9C8", "rfscVS0vtbw", "PppslXOR7TA"],
    "python": ["kqtD5dpn9C8", "rfscVS0vtbw", "kqtD5dpn9C8"],
    "web development": ["8pDqJVdNa44", "kqtD5dpn9C8", "PkZNo7MFNFg"],
    "react": ["dGcsHMXbSOA", "SqcY0G6Hsnk", "Tn6-PIqc4Ks"],
    "node.js": ["TlB_eWDSMt4", "RLtyhwFtXQA", "Oe421EPjeBE"],
    "javascript": ["W6NZfCO5SIk", "PkZNo7MFNFg", "hdI2bqOjy3c"],
    "data science": ["aircAruvnKk", "JNxTgzQz0mg", "B42n3pI6J2c"],
    "machine learning": ["aircAruvnKk", "ukzFI9rgwfU", "JNxTgzQz0mg"],
};

exports.getResources = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT domain FROM user_roadmaps WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
            [req.user.id]
        );
        const domain = (rows[0]?.domain || "web development").toLowerCase();
        const keys = Object.keys(DOMAIN_VIDEOS);
        const match = keys.find(k => domain.includes(k) || k.includes(domain)) || keys[0];
        const ids = DOMAIN_VIDEOS[match] || DOMAIN_VIDEOS["web development"];
        const videos = ids.map((id, i) => ({
            id,
            url: `https://www.youtube.com/embed/${id}`,
            title: `${domain} - Resource ${i + 1}`,
        }));
        res.success({ domain: match, videos }, "Resources fetched");
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
