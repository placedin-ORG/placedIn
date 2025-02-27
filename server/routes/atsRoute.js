const router=require('express').Router();
const {internship}=require('../controllers/atsController');
const {job}=require('../controllers/jobAtsController');
router.post('/internship',internship);
router.post('/job',job);

module.exports=router