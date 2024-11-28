const router = require("express").Router();
const {
  register,
  login,
  resetPassword,
  sendResetPassword,
  updatePassword,
  verifyEmail,
  getCurrentUser,
  updateProfile,
} = require("../controllers/authController");
const isAuth = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", isAuth, getCurrentUser);

router.route("/verify-email").post(verifyEmail).get(verifyEmail);
router.put("/update-password", isAuth, updatePassword);
router.post("/update-profile", isAuth, updateProfile);

router.post("/forgot-password", sendResetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
