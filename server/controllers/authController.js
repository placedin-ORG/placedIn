const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ejs = require("ejs");
const path = require("path");
const { sendEmail } = require("../utils/sendMail.js");
const crypto = require("crypto");

const createActivationToken = (user) => {
  const token = jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: process.env.ACTIVATION_EXPIRE,
  });
  return token;
};

const sendVerficationEmail = async (user) => {
  const activationToken = createActivationToken(user);
  const activationUrl = `${process.env.SERVER_URL}/api/v1/auth/verify-email?token=${activationToken}`;
  const data = { user: { name: user.name }, activationUrl };
  const html = await ejs.renderFile(
    path.join(__dirname, "../emails/activation-email.ejs"),
    data
  );
  await sendEmail({
    to: user.email,
    subject: "Activate Your Acount",
    html,
  });
};

const register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    await sendVerficationEmail(req.body);

    res.status(201).json({
      success: true,
      message: "Please check your email to activate your account",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    /* Take the infomation from the form */
    const { email, password } = req.body;

    /* Check if user exists */
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "user does not exist" });
    }

    /* Compare the password with the hashed password */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid Credentials" });
    }

    const userData = await User.findById(user._id).select("-password");
    // Generate The token
    const token = user.generateToken();
    res.json({
      success: true,
      message: "User logged in Successfully",
      token,
      user: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const decodeData = jwt.verify(token, process.env.ACTIVATION_SECRET);
    console.log(decodeData);
    const hashedPassword = await bcrypt.hash(decodeData.password, 10);
    decodeData.password = hashedPassword;
    await User.create(decodeData);

    res.redirect(`${process.env.CLIENT_URL}/login`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const signToken = (data) => {
  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "10d" });
  return token;
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "user does not exist" });
    }

    res.json({
      success: true,
      message: "User logged in Successfully",
      user,
    });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: "Failed to get Current User" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const id = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Failed to updated password" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const id = req.user._id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(req.body);

    await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Failed to updated password" });
  }
};

// Passowrd forgot------------------------>

// Send reset password email
const sendResetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not registered" });

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
  const html = await ejs.renderFile(
    path.join(__dirname, "../emails/resetPassword.ejs"),
    { name: user.name, resetUrl }
  );

  await sendEmail({ to: user.email, subject: "Password Reset", html });
  await user.save();

  res.status(200).json({ message: "Please check your mail" });
};

// Reset password using token
const resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword || password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Passwords do not match or are missing" });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  const html = await ejs.renderFile(
    path.join(__dirname, "../emails/passwordSuccessfull.ejs"),
    { user }
  );
  await sendEmail({ to: user.email, subject: "Password Reset Success", html });

  await user.save();

  res.status(200).json({ message: "Password has been updated successfully" });
};

module.exports = {
  register,
  login,
  updatePassword,
  resetPassword,
  sendResetPassword,
  verifyEmail,
  getCurrentUser,
  updateProfile,
};
