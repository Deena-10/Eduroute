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
   3. GENERATE CAREER ROADMAP
   - Domain-level storage: first user for a domain creates domain_roadmap; others reuse it.
   - User roadmap links via domain; progress tracked per user.
========================================= */
exports.generateRoadmap = async (req, res) => {
    const { domain, proficiency_level, professional_goal, current_status } = req.body;
    const domainKey = (domain || "General").trim();

    try {
        let roadmapPayload;

        // 1. Check domain_roadmaps for existing roadmap
        const domainResult = await pool.query(
            "SELECT id, roadmap_content FROM domain_roadmaps WHERE domain = $1",
            [domainKey]
        );

        if (domainResult.rows.length > 0) {
            const content = domainResult.rows[0].roadmap_content;
            roadmapPayload = typeof content === "string" ? JSON.parse(content) : content;
        } else {
            // 2. Generate via AI and store in domain_roadmaps
            const response = await aiService.postWithRetry(
                "/generate-roadmap",
                { domain: domainKey, proficiency_level, professional_goal, current_status },
                { timeout: 60000 }
            );
            if (!response.data || !response.data.roadmap) {
                return res.status(502).json({
                    success: false,
                    message: "AI service returned invalid structure",
                });
            }
            roadmapPayload = response.data;
            await pool.query(
                "INSERT INTO domain_roadmaps (domain, roadmap_content, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)",
                [domainKey, JSON.stringify(roadmapPayload)]
            );
        }

        // 3. Pause existing active roadmaps for this user
        await pool.query(
            "UPDATE user_roadmaps SET status = 'paused' WHERE user_id = $1 AND status = 'active'",
            [req.user.id]
        );

        // 4. Create user roadmap (domain-linked; content comes from domain_roadmaps on fetch)
        await pool.query(
            `INSERT INTO user_roadmaps 
            (user_id, domain, roadmap_content, status, progress_percentage, completed_tasks, updated_at)
            VALUES ($1, $2, $3, 'active', 0, '[]', CURRENT_TIMESTAMP)`,
            [req.user.id, domainKey, JSON.stringify(roadmapPayload)]
        );

        // 5. Persist mandatory one-time inputs
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