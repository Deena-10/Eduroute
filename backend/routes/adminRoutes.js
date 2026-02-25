// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/events", adminController.requireAdmin, adminController.createEvent);

module.exports = router;
