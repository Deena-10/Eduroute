// backend/routes/eventsRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const eventsController = require("../controllers/eventsController");

router.use(authMiddleware);
router.get("/", eventsController.getEvents);

module.exports = router;
