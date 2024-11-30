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
} = require("../controllers/examController");
const { isAuth, authoriseRoles } = require("../middlewares/auth");

router.post("/create", isAuth, authoriseRoles("teacher"), create);
router.post("/speceficExam", getSpeceficExam);
router.post("/submit-exam", isAuth, submitExam);
router.get("/upcoming-exams", isAuth, getUpcomingExams);
router.get("/completed-exams", isAuth, getUserCompletedExams);

router.get("/get", get);
router.post("/fetchExam", isAuth, fetchExam);
module.exports = router;
