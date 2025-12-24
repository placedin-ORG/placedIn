const router = require("express").Router();

const {aiController} =require("../controllers/aiController");

router.post("/ai", aiController);

module.exports=router;