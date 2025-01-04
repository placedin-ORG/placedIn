const router=require('express').Router();

const {create,get,apply,IncreaseView,getForHost,submitions,allInternship}= require("../controllers/internshipController");
const {upload} =require("../middlewares/filterPDF")
console.log(upload)
router.post("/create",create);
router.post("/get",get)
router.post("/apply",upload.single('resume'),apply)
router.post("/IncreaseView",IncreaseView)
router.post("/getForHost",getForHost)
router.post("/submitions",submitions)
router.get("/allInternship",allInternship);
module.exports=router;