const router = require("express").Router();
const passport = require("passport");
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
const { isAuth } = require("../middlewares/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", isAuth, getCurrentUser);

router.route("/verify-email").post(verifyEmail).get(verifyEmail);
router.put("/update-password", isAuth, updatePassword);
router.post("/update-profile", isAuth, updateProfile);

router.post("/forgot-password", sendResetPassword);
router.post("/reset-password/:token", resetPassword);

// Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const token = req.user.generateToken();
    res.redirect(`${process.env.CLIENT_URL}/social-auth?token=${token}`);
  }
);

// Facebook Auth Routes
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const token = req.user.generateToken();
    res.redirect(`${process.env.CLIENT_URL}/social-auth?token=${token}`);
  }
);

// GitHub Auth Routes
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const token = req.user.generateToken();
    res.redirect(`${process.env.CLIENT_URL}/social-auth?token=${token}`);
  }
);


module.exports = router;
