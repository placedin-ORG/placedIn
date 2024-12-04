const router = require("express").Router();

const {
  getTeacherProfileStats,
  getTeacherChartStats,
} = require("../controllers/teacherProfileController");
const { isAuth, authoriseRoles } = require("../middlewares/auth");

router.get("/stats", isAuth, getTeacherProfileStats);
router.get("/charts", isAuth, getTeacherChartStats);

module.exports = router;
