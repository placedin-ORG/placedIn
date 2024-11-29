const jwt = require("jsonwebtoken");
// Auth middleware
const isAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Please login to account" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const authoriseRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied for ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { isAuth, authoriseRoles };
