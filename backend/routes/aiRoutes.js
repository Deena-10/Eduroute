const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const axios = require("axios");
const pool = require("../config/postgres");

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

// =======================
// AI Chat Route - Proxy to Flask Service
// =======================
router.post("/chat", authMiddleware, async (req, res) => {
  const { message, engine = "gemini" } = req.body;
  const uid = req.user.id;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/ask_ai`, {
      question: message,
      engine: engine,
      uid: uid
    });

    res.json({ 
      reply: response.data.answer,
      engine: engine 
    });
  } catch (error) {
    const isConnectionRefused = error.code === "ECONNREFUSED" || error.message?.includes("ECONNREFUSED");
    console.error("AI Service error:", error.response?.data || error.message);
    res.status(500).json({
      error: isConnectionRefused
        ? "AI service is not running. Start it with: cd backend/service && python application.py"
        : "AI service failed",
    });
  }
});

// =======================
// Get Chat History Route
// =======================
router.get("/chat-history", authMiddleware, async (req, res) => {
  const uid = req.user.id;

  try {
    const response = await axios.get(`${AI_SERVICE_URL}/get_chat_history`, {
      params: { uid: uid }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Chat history error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// =======================
// Clear Chat History Route
// =======================
router.delete("/chat-history", authMiddleware, async (req, res) => {
  const uid = req.user.id;

  try {
    const response = await axios.delete(`${AI_SERVICE_URL}/clear_chat_history`, {
      params: { uid: uid }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Clear chat history error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to clear chat history" });
  }
});

// =======================
// Career Chat (conversational roadmap: domain → proficiency → status → generate)
// =======================
router.post("/career-chat", authMiddleware, async (req, res) => {
  const { message, start = false } = req.body;
  const uid = String(req.user.id);

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/career_chat`, {
      uid,
      message: message || "",
      start: !!start,
    });

    const data = response.data;
    if (data.roadmap) {
      try {
        await pool.query(
          `INSERT INTO user_roadmaps (user_id, roadmap_content, status, progress_percentage, completed_tasks)
           VALUES ($1, $2, 'active', 0, '[]')`,
          [req.user.id, JSON.stringify(data.roadmap)]
        );
      } catch (err) {
        console.error("Save roadmap error:", err);
      }
    }

    res.json({
      reply: data.reply,
      state: data.state,
      roadmap: data.roadmap || null,
    });
  } catch (error) {
    const isConnectionRefused =
      error.code === "ECONNREFUSED" || error.message?.includes("ECONNREFUSED");
    console.error("Career chat error:", error.response?.data || error.message);
    res.status(500).json({
      error: isConnectionRefused
        ? "AI service is not running. Start it with: cd backend/service && python application.py"
        : "Career chat failed",
    });
  }
});

// =======================
// Generate career roadmap directly (form: domain, proficiency, status)
// =======================
router.post("/generate-career-roadmap", authMiddleware, async (req, res) => {
  const { domain, proficiency_level, professional_goal, current_status } = req.body;
  if (!domain || typeof domain !== "string" || !domain.trim()) {
    return res.status(400).json({ error: "domain is required" });
  }
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/generate_career_roadmap_direct`, {
      domain: domain.trim(),
      proficiency_level: proficiency_level || "Beginner",
      professional_goal: professional_goal || "job-ready",
      current_status: current_status || "College student",
    });
    const roadmap = response.data.roadmap;
    if (roadmap) {
      await pool.query(
        `INSERT INTO user_roadmaps (user_id, roadmap_content, status, progress_percentage, completed_tasks)
         VALUES ($1, $2, 'active', 0, '[]')`,
        [req.user.id, JSON.stringify(roadmap)]
      );
    }
    res.json({ success: true, roadmap });
  } catch (error) {
    const isConnectionRefused =
      error.code === "ECONNREFUSED" || error.message?.includes("ECONNREFUSED");
    console.error("Generate career roadmap error:", error.response?.data || error.message);
    res.status(500).json({
      error: isConnectionRefused
        ? "AI service is not running. Start it with: cd backend/service && python application.py"
        : "Failed to generate roadmap",
    });
  }
});

// =======================
// Get Career Onboarding State
// =======================
router.get("/career-onboarding-state", authMiddleware, async (req, res) => {
  const uid = String(req.user.id);
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/career_onboarding_state`, {
      params: { uid },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Career onboarding state error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch career onboarding state" });
  }
});

// =======================
// Generate Roadmap Route
// =======================
router.post("/generate-roadmap", authMiddleware, async (req, res) => {
  const { skills_to_learn, planning_days = 30 } = req.body;
  const uid = req.user.id;

  if (!skills_to_learn || !Array.isArray(skills_to_learn)) {
    return res.status(400).json({ error: "skills_to_learn array is required" });
  }

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/generate_roadmap`, {
      uid: uid,
      skills_to_learn: skills_to_learn,
      planning_days: planning_days
    });

    res.json(response.data);
  } catch (error) {
    console.error("Roadmap generation error:", error.response?.data || error.message);
    res.status(500).json({ error: "Roadmap generation failed" });
  }
});

// =======================
// Suggest Events Route
// =======================
router.post("/suggest-events", authMiddleware, async (req, res) => {
  const { domain, completion_percentage = 0 } = req.body;
  const uid = req.user.id;

  if (!domain) {
    return res.status(400).json({ error: "domain is required" });
  }

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/suggest_event`, {
      uid: uid,
      domain: domain,
      completion_percentage: completion_percentage
    });

    res.json(response.data);
  } catch (error) {
    console.error("Event suggestion error:", error.response?.data || error.message);
    res.status(500).json({ error: "Event suggestion failed" });
  }
});

// =======================
// Suggest Projects Route
// =======================
router.post("/suggest-projects", authMiddleware, async (req, res) => {
  const { domain, completion_percentage = 0 } = req.body;
  const uid = req.user.id;

  if (!domain) {
    return res.status(400).json({ error: "domain is required" });
  }

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/suggest_project`, {
      uid: uid,
      domain: domain,
      completion_percentage: completion_percentage
    });

    res.json(response.data);
  } catch (error) {
    console.error("Project suggestion error:", error.response?.data || error.message);
    res.status(500).json({ error: "Project suggestion failed" });
  }
});

// =======================
// Send Notification Route
// =======================
router.post("/send-notification", authMiddleware, async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  try {
    const response = await axios.post(`${AI_SERVICE_URL}/send_notification`, {
      email: email,
      subject: subject || "Career Roadmap Update",
      message: message || ""
    });

    res.json(response.data);
  } catch (error) {
    console.error("Notification error:", error.response?.data || error.message);
    res.status(500).json({ error: "Notification failed" });
  }
});

module.exports = router;
