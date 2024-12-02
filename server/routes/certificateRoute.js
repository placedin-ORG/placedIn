const router=require('express').Router();

const {certificate}=require('../controllers/certificateController');
console.log('in')
router.post("/certificate-download",certificate);

module.exports=router;