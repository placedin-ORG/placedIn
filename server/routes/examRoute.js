
const router = require("express").Router();
const {
create,get,update,deleteExam,getSpeceficExam,submitExam
} = require("../controllers/examController");

router.post("/create", create);
router.post("/speceficExam",getSpeceficExam)
router.post("/submit-exam",submitExam)
module.exports = router;

