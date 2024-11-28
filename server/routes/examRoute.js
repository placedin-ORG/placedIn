
const router = require("express").Router();
const {
create,get,update,deleteExam
} = require("../controllers/examController");

router.post("/create", create);

module.exports = router;

