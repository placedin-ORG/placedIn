const { Purchase } = require("../models/purchaseInfoModel");

const createPurchase = async (req, res) => {
  try {
    const existingPurchase = await Purchase.findOne({
      paymentId: req.body.paymentId,
      success: req.body.success,
    });
    if (existingPurchase) {
      return res
        .status(200)
        .json({ success: true, message: "Purchase info already saved" });
    }
    const purchase = await Purchase.create(req.body);
    if (!purchase) {
      return res
        .status(404)
        .json({ success: false, message: "Failed to save purchase info" });
    }
    return res
      .status(201)
      .json({ success: true, message: "Purchase info saved" });
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to create purchase info" });
  }
};

// TODO: Only get the course id and it's name

const getPurchaseInfo = async (req, res) => {
  try {
    const purchase = await Purchase.find({ user: req.user._id })
      .populate("user")
      .populate("course")
      .populate("exam");
    if (!purchase || purchase.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Purchase info found" });
    }
    return res
      .status(201)
      .json({ success: true, message: "Purchase info saved", data: purchase });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to create purchase info" });
  }
};

// Admin
const getAllPurchases = async (req, res) => {
  try {
    const purchase = await Purchase.find({})
      .populate("user")
      .populate("course")
      .populate("exam");
    if (!purchase || purchase.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Purchase info found" });
    }
    return res
      .status(201)
      .json({ success: true, message: "Purchase info saved", data: purchase });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to create purchase info" });
  }
};

module.exports = { getAllPurchases, getPurchaseInfo, createPurchase };
