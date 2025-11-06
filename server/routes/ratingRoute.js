const express = require('express');
const router = express.Router();
const {addReview,getReviews}=require("../controllers/reviewController");

router.post('/:courseId/rate',addReview);
router.get('/:courseId/getReview',getReviews);

module.exports = router;
