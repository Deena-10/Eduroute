// backend/controllers/userController.js
const pool = require("../config/postgres");

// Helper to flatten task IDs from roadmap
const getFlatTaskIds = (roadmapContent) => {
    if (!roadmapContent) return [];

    // Support for the new "roadmap.units" structure
    if (roadmapContent.roadmap && Array.isArray(roadmapContent.roadmap.units)) {
        const ids = [];
        roadmapContent.roadmap.units.forEach(unit => {
            (unit.tasks || []).forEach(task => {
                ids.push(task.task_id || task.id);
            });
        });
        return ids;
    }

    // Support for the old "phases" structure (fallback)
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
        res.success(rows.length > 0 ? rows[0] : null, "Roadmap fetched successfully");
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
            "SELECT id, roadmap_content, completed_tasks FROM user_roadmaps WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
            [userId]
        );
        if (roadmapRows.length === 0) return res.error("No active roadmap found", "Task completion failed", 404);

        const roadmap = roadmapRows[0];
        const content = typeof roadmap.roadmap_content === 'string' ? JSON.parse(roadmap.roadmap_content) : roadmap.roadmap_content;
        const allTaskIds = getFlatTaskIds(content);

        if (!allTaskIds.includes(taskId)) return res.error("Task not found in roadmap", "Task completion failed", 400);

        let completedTasks = Array.isArray(roadmap.completed_tasks) ? roadmap.completed_tasks : JSON.parse(roadmap.completed_tasks || "[]");
        if (!completedTasks.includes(taskId)) {
            completedTasks.push(taskId);

            // Recalculate progress based on total tasks in the content
            const progress = allTaskIds.length > 0 ? Math.min(100, Math.round((completedTasks.length / allTaskIds.length) * 100)) : 0;

            await pool.query(
                "UPDATE user_roadmaps SET progress_percentage = $1, completed_tasks = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
                [progress, JSON.stringify(completedTasks), roadmap.id]
            );
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

        res.success({ progress_percentage: roadmap.progress_percentage, completed_tasks: completedTasks, streak: currentStreak }, "Task completed");
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
