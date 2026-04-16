// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.use(authMiddleware);

router.post("/save-profile", userController.saveProfile);
router.get("/profile", userController.getProfile);
router.get("/profile/dashboard", userController.getProfileDashboard);
router.get("/roadmap", userController.getRoadmap);
router.get("/onboarding-preferences", userController.getOnboardingPreferences);
router.delete("/roadmap", userController.resetRoadmap);
router.post("/roadmap/complete-task", userController.completeTask);
router.get("/streak", userController.getStreak);
router.get("/rank", userController.getRank);
router.get("/leaderboard", userController.getLeaderboard);
router.get("/achievements", userController.getAchievements);
router.get("/resources", userController.getResources);
router.post("/push-subscription", userController.savePushSubscription);
router.get("/notifications", userController.getNotifications);
router.put("/notifications/:id/read", userController.markNotificationRead);

module.exports = router;
