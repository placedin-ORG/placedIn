const router=require("express").Router();

const {getNotification,viewNotification}=require("../controllers/notificationController");

router.post("/getNotifications",getNotification);
router.post("/viewNotification",viewNotification)

module.exports=router