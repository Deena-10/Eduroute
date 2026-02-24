// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/test", (req, res) => {
  res.success({ timestamp: new Date().toISOString() }, "Backend is running");
});

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/google-signin", authController.googleSignin);

module.exports = router;
