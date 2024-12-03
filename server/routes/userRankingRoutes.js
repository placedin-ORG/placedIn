const router=require('express').Router();

const {ranking}=require("../controllers/userRankingController");

router.post("/getRanking",ranking);

module.exports=router