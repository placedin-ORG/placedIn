
const router = require("express").Router();
const {
create,get,update,deleteExam,getSpeceficExam,submitExam,fetchExam
} = require("../controllers/examController");

router.post("/create", create);
router.post("/speceficExam",getSpeceficExam)
router.post("/submit-exam",submitExam)
router.get("/get",get)
router.post("/fetchExam",fetchExam)
module.exports = router;

