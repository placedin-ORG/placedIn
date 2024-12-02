const router = require("express").Router();
const { isAuth } = require("../middlewares/auth");
const {
  getAllPurchases,
  createPurchase,
  getPurchaseInfo,
} = require("../controllers/purchaseController");

router.post("/create", createPurchase);
router.get("/get", isAuth, getPurchaseInfo);
router.get("/all", isAuth, getAllPurchases);

module.exports = router;
