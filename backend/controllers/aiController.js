// backend/controllers/aiController.js
const aiService = require("../services/aiService");
const pool = require("../config/postgres");

exports.healthCheck = async (req, res, next) => {
    try {
        const response = await aiService.get("/");
        res.success({ aiService: response.data }, "AI service connected");
    } catch (error) {
        res.error(error, "AI service unavailable", 503);
    }
};

exports.chat = async (req, res, next) => {
    const { message, engine = "gemini" } = req.body;
    try {
        const response = await aiService.postWithRetry("/ask_ai", {
            question: message,
            engine,
            uid: req.user.id
        });
        res.success({ reply: response.data.answer, engine });
    } catch (error) {
        next(error);
    }
};

exports.generateRoadmap = async (req, res, next) => {
    const { domain, proficiency_level, professional_goal, current_status } = req.body;
    try {
        const response = await aiService.postWithRetry("/generate_career_roadmap_direct", {
            domain, proficiency_level, professional_goal, current_status
        }, { timeout: 60000 });

        const roadmap = response.data?.roadmap;
        if (!roadmap) return res.error("AI service did not return a roadmap", "Generation failed", 502);

        // Save to DB
        await pool.query(
            "UPDATE user_roadmaps SET status = 'paused' WHERE user_id = $1 AND status = 'active'",
            [req.user.id]
        );
        await pool.query(
            "INSERT INTO user_roadmaps (user_id, roadmap_content, status, progress_percentage) VALUES ($1, $2, 'active', 0)",
            [req.user.id, JSON.stringify(roadmap)]
        );

        res.success({ roadmap }, "Roadmap generated and saved");
    } catch (error) {
        next(error);
    }
};

exports.getOnboardingState = async (req, res, next) => {
    try {
        const response = await aiService.get("/career_onboarding_state", { uid: req.user.id });
        res.success(response.data, "Onboarding state fetched");
    } catch (error) {
        next(error);
    }
};
