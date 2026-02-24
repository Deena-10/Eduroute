// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.use(authMiddleware);

router.post("/save-profile", userController.saveProfile);
router.get("/profile", userController.getProfile);
router.get("/roadmap", userController.getRoadmap);
router.delete("/roadmap", userController.resetRoadmap);
router.post("/roadmap/complete-task", userController.completeTask);
router.get("/streak", userController.getStreak);

module.exports = router;
