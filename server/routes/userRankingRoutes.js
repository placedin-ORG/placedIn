const router=require('express').Router();

const {ranking,leaderboard,profileData}=require("../controllers/userRankingController");

router.post("/getRanking",ranking);
router.get("/site-leaderboard",leaderboard);
router.post("/profileData",profileData);

module.exports=router