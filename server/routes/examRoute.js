const router = require("express").Router();
const {
  create,
  get,
  update,
  deleteExam,
  getSpeceficExam,
  submitExam,
  fetchExam,
  getUpcomingExams,
  getUserCompletedExams,
  getExamSubmissions,
  getTeacherExams,
  getExamById,
  getSubmissionById,
  saveScore,
  enrollUser,
  liveResults,
} = require("../controllers/examController");
const { isAuth, authoriseRoles } = require("../middlewares/auth");

// TODO: Add role authentication

router.post("/create", isAuth, create);
router.post("/speceficExam", getSpeceficExam);

router.post("/submit-exam", isAuth, submitExam);
router.get("/upcoming-exams", isAuth, getUpcomingExams);
router.get("/completed-exams", isAuth, getUserCompletedExams);
router.get("/submissions/:id", isAuth, getExamSubmissions);
router.get("/submissions-detail/:id", isAuth, getSubmissionById);
router.put("/save-score/:id", isAuth, saveScore);
router.put("/live-results/:id", isAuth, liveResults);
router.put("/enroll-user/:id", isAuth, enrollUser);

router.get("/teacher/all", isAuth, getTeacherExams);

router.get("/get/:id", getExamById);
router.put("/update/:id", update);

router.get("/get", get);
router.post("/fetchExam", fetchExam);
module.exports = router;
