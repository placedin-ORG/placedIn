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

module.exports = isAuth;
