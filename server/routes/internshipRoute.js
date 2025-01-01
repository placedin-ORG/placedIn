const router=require('express').Router();

const {create,get}= require("../controllers/internshipController");

router.post("/create",create);
router.post("/get",get)
module.exports=router;