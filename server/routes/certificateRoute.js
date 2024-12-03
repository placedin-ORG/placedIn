const router=require('express').Router();

const {certificate}=require('../controllers/certificateController');
console.log('in')
router.post("/update-certificate",certificate);

module.exports=router;