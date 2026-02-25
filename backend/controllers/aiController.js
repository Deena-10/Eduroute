// backend/controllers/aiController.js
const aiService = require("../services/aiService");
const pool = require("../config/postgres");

/* =========================================
   1. AI SERVICE HEALTH CHECK
========================================= */
exports.healthCheck = async (req, res) => {
    try {
        const response = await aiService.get("/health");
        return res.status(200).json({
            success: true,
            aiService: response.data,
            message: "AI service connected",
        });
    } catch (error) {
        console.error("AI Health Check Error:", error.message);
        return res.status(503).json({
            success: false,
            message: "AI service unavailable",
        });
    }
};

/* =========================================
   2. CHAT WITH AI
========================================= */
exports.chat = async (req, res, next) => {
    const { message } = req.body;
    try {
        const response = await aiService.postWithRetry("/ask_ai", {
            question: message,
            uid: req.user.id,
        });
        return res.status(200).json({
            success: true,
            reply: response.data.answer,
        });
    } catch (error) {
        console.error("Chat error:", error.message);
        next(error);
    }
};

/* =========================================
   FALLBACK: Generate roadmap when AI service is down
========================================= */
function buildFallbackRoadmap(domain) {
    const colors = ["#3B82F6", "#10B981", "#F59E0B"];
    const units = [];
    for (let i = 1; i <= 3; i++) {
        const level = i <= 1 ? "beginner" : i <= 2 ? "intermediate" : "advanced";
        const titles = [
            `Getting started with ${domain}`,
            `Core skills in ${domain}`,
            `Advanced ${domain} mastery`,
        ];
        units.push({
            unit_number: i,
            title: titles[i - 1],
            level,
            tasks: [
                { task_id: `u${i}_t1`, task_name: `Task 1` },
                { task_id: `u${i}_t2`, task_name: `Task 2` },
                { task_id: `u${i}_t3`, task_name: `Task 3` },
                { task_id: `u${i}_t4`, task_name: `Task 4` },
            ],
            mcqs: [
                { question: `What is the main focus of "${titles[i - 1]}" in ${domain}?`, options: ["Building foundational skills", "Memorizing only", "Skipping practice", "Avoiding hands-on work"], correctIndex: 0 },
                { question: `In "${titles[i - 1]}", which approach best supports progress?`, options: ["Applying concepts through exercises", "Reading only", "Copying blindly", "Skipping"], correctIndex: 0 },
                { question: `How does "${titles[i - 1]}" fit into your ${domain} path?`, options: ["Establishes skills for next level", "Optional", "Replaces others", "No connection"], correctIndex: 0 },
                { question: `After "${titles[i - 1]}", what should you be able to do?`, options: ["Explain and apply key concepts", "Only recall definitions", "Move on without practice", "Ignore next chapter"], correctIndex: 0 },
                { question: `Why is "${titles[i - 1]}" at the ${level} stage?`, options: ["Matches complexity and builds on prior learning", "Random", "Hardest", "Unrelated"], correctIndex: 0 },
            ],
        });
    }
    return {
        roadmap: { domain, units },
        ui_metadata: { node_config: units.map((u, idx) => ({ unit: u.unit_number, offset: idx % 2 ? "right" : "left", color: colors[idx] })) },
        gamification: { daily_streak_goal_xp: 50 },
    };
}

/* =========================================
   3. GENERATE CAREER ROADMAP
   - AI-first: always calls AI service for new domains; uses cache only when domain exists.
   - forceRegenerate: when true, always calls AI and updates domain_roadmaps.
   - Domain-level storage: domain_roadmaps stores AI content; user_roadmaps stores per-user progress.
   - Fallback: if AI service fails, uses buildFallbackRoadmap and still stores in DB.
========================================= */
exports.generateRoadmap = async (req, res) => {
    const { domain, proficiency_level, professional_goal, current_status, forceRegenerate } = req.body;
    const domainKey = (domain || "General").trim();

    try {
        let roadmapPayload;

        // 1. Check domain_roadmaps for existing roadmap (skip cache if forceRegenerate)
        const domainResult = await pool.query(
            "SELECT id, roadmap_content FROM domain_roadmaps WHERE domain = $1",
            [domainKey]
        );

        const useCache = domainResult.rows.length > 0 && !forceRegenerate;

        if (useCache) {
            const content = domainResult.rows[0].roadmap_content;
            roadmapPayload = typeof content === "string" ? JSON.parse(content) : content;
        } else {
            // 2. Generate via AI (or fallback if AI down)
            try {
                const response = await aiService.postWithRetry(
                    "/generate-roadmap",
                    { domain: domainKey, proficiency_level, professional_goal, current_status },
                    { timeout: 60000 }
                );
                if (response.data && response.data.roadmap) {
                    roadmapPayload = response.data;
                } else {
                    throw new Error("AI returned invalid structure");
                }
            } catch (aiErr) {
                console.warn("AI service unavailable, using fallback roadmap:", aiErr.message);
                roadmapPayload = buildFallbackRoadmap(domainKey);
            }

            // 3. Store in domain_roadmaps (upsert: insert new or update existing)
            await pool.query(
                `INSERT INTO domain_roadmaps (domain, roadmap_content, updated_at)
                 VALUES ($1, $2, CURRENT_TIMESTAMP)
                 ON CONFLICT (domain) DO UPDATE SET roadmap_content = $2, updated_at = CURRENT_TIMESTAMP`,
                [domainKey, JSON.stringify(roadmapPayload)]
            );
        }

        // 4. Pause existing active roadmaps for this user
        await pool.query(
            "UPDATE user_roadmaps SET status = 'paused' WHERE user_id = $1 AND status = 'active'",
            [req.user.id]
        );

        // 5. Create user roadmap (domain-linked; content comes from domain_roadmaps on fetch)
        await pool.query(
            `INSERT INTO user_roadmaps 
            (user_id, domain, roadmap_content, status, progress_percentage, completed_tasks, updated_at)
            VALUES ($1, $2, $3, 'active', 0, '[]', CURRENT_TIMESTAMP)`,
            [req.user.id, domainKey, JSON.stringify(roadmapPayload)]
        );

        // 6. Persist mandatory one-time inputs
        const uid = String(req.user.id);
        try {
            await pool.query(
                `INSERT INTO career_onboarding_state (uid, step, domain, proficiency_level, professional_goal, current_status, updated_at)
                 VALUES ($1, 'done', $2, $3, $4, $5, CURRENT_TIMESTAMP)
                 ON CONFLICT (uid) DO UPDATE SET domain = $2, proficiency_level = $3, professional_goal = $4, current_status = $5, updated_at = CURRENT_TIMESTAMP`,
                [uid, domainKey, proficiency_level || null, professional_goal || null, current_status || null]
            );
        } catch (colError) {
            if (colError.code === "42703" || (colError.message && colError.message.includes("professional_goal"))) {
                await pool.query(
                    `INSERT INTO career_onboarding_state (uid, step, domain, proficiency_level, current_status, updated_at)
                     VALUES ($1, 'done', $2, $3, $4, CURRENT_TIMESTAMP)
                     ON CONFLICT (uid) DO UPDATE SET domain = $2, proficiency_level = $3, current_status = $4, updated_at = CURRENT_TIMESTAMP`,
                    [uid, domainKey, proficiency_level || null, current_status || null]
                );
            } else {
                throw colError;
            }
        }

        return res.status(200).json({
            success: true,
            roadmap: roadmapPayload,
            message: "Roadmap generated and saved successfully",
        });
    } catch (error) {
        console.error("Generate roadmap error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to generate roadmap",
        });
    }
};

/* =========================================
   4. FETCH ACTIVE ROADMAP (Onboarding State)
========================================= */
exports.getOnboardingState = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT roadmap_content, progress_percentage, updated_at
             FROM user_roadmaps
             WHERE user_id = $1 AND status = 'active'
             ORDER BY updated_at DESC
             LIMIT 1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                hasActiveRoadmap: false,
                roadmap: null,
            });
        }

        return res.status(200).json({
            success: true,
            hasActiveRoadmap: true,
            roadmap: result.rows[0].roadmap_content,
            progress: result.rows[0].progress_percentage,
            updatedAt: result.rows[0].updated_at,
        });

    } catch (error) {
        console.error("Fetch roadmap error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch roadmap state",
        });
    }
};