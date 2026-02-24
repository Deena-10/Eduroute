// backend/routes/aiRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const aiController = require("../controllers/aiController");

router.get("/health", aiController.healthCheck);

router.use(authMiddleware);

router.post("/chat", aiController.chat);
router.post("/generate-career-roadmap", aiController.generateRoadmap);
router.get("/career-onboarding-state", aiController.getOnboardingState);

module.exports = router;
