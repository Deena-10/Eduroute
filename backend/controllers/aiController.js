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
========================================= */
exports.generateRoadmap = async (req, res) => {
    const { domain, proficiency_level, professional_goal, current_status } = req.body;

    try {
        // 1. Call Python AI Service
        const response = await aiService.postWithRetry(
            "/generate-roadmap",
            { domain, proficiency_level, professional_goal, current_status },
            { timeout: 60000 }
        );

        // 2. Validate Response (expects units and ui_metadata)
        if (!response.data || !response.data.roadmap) {
            return res.status(502).json({
                success: false,
                message: "AI service returned invalid structure",
            });
        }

        // 3. Pause existing active roadmaps
        await pool.query(
            "UPDATE user_roadmaps SET status = 'paused' WHERE user_id = $1 AND status = 'active'",
            [req.user.id]
        );

        // 4. Save the FULL payload to JSONB
        await pool.query(
            `INSERT INTO user_roadmaps 
            (user_id, roadmap_content, status, progress_percentage, updated_at)
            VALUES ($1, $2, 'active', 0, CURRENT_TIMESTAMP)`,
            [req.user.id, JSON.stringify(response.data)]
        );

        return res.status(200).json({
            success: true,
            roadmap: response.data,
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