const router=require('express').Router();

const {ranking,leaderboard}=require("../controllers/userRankingController");

router.post("/getRanking",ranking);
router.get("/site-leaderboard",leaderboard);

module.exports=router