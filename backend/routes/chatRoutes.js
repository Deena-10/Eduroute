// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const chatController = require("../controllers/chatController");

router.use(authMiddleware);

router.get("/", chatController.getMessages);
router.post("/", chatController.saveMessage);
router.delete("/", chatController.clearHistory);

module.exports = router;
