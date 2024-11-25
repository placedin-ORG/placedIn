const router = require("express").Router();
const {
  register,
  login,
  resetPassword,
  sendResetPassword,
  updatePassword,
  verifyEmail,
} = require("../controllers/authController");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const isAuth = require("../middlewares/auth");
router.post("/register", register);

router.post("/login", login);

// router.get("/me", isAuth, getCurrentUser);
router.route("/verify-email").post(verifyEmail).get(verifyEmail);
router.put("/update-password/:id", updatePassword);
router.post("/forgot-password", sendResetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
