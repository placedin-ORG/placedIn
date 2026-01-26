const router = require("express").Router();

const {
  getTeacherProfileStats,
  getTeacherChartStats,
} = require("../controllers/teacherProfileController");
const { generateQuestions, teacherChat } = require("../controllers/teacherAiController");

const { isAuth, authoriseRoles } = require("../middlewares/auth");

router.get("/stats", isAuth, getTeacherProfileStats);
router.get("/charts", isAuth, getTeacherChartStats);

router.post("/generate-questions", generateQuestions);
router.post("/chat", teacherChat);

module.exports = router;
