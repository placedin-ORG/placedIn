const router = require("express").Router();
const {
  register,
  login,
  resetPassword,
  sendResetPassword,
  updatePassword,
  getCurrentUser,
  updateProfile,
} = require("../controllers/adminAuthController");
const { isAuth, authoriseRoles } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", isAuth, getCurrentUser);

router.put("/update-password", isAuth, updatePassword);
router.post("/update-profile", isAuth, updateProfile);

router.post("/forgot-password", sendResetPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
