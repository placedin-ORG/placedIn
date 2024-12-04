const { default: mongoose } = require("mongoose");
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

const getPurchaseInfo = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const purchases = await Purchase.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courseInfo",
        },
      },
      {
        $lookup: {
          from: "exams",
          localField: "exam",
          foreignField: "_id",
          as: "examInfo",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          _id: 0,
          course: {
            $cond: {
              if: { $ne: ["$courseInfo", []] },
              then: {
                id: { $arrayElemAt: ["$courseInfo._id", 0] },
                title: { $arrayElemAt: ["$courseInfo.title", 0] },
              },
              else: null,
            },
          },
          exam: {
            $cond: {
              if: { $ne: ["$examInfo", []] }, // If examInfo exists
              then: {
                id: { $arrayElemAt: ["$examInfo._id", 0] },
                title: { $arrayElemAt: ["$examInfo.examTitle", 0] },
              },
              else: null,
            },
          },
          paymentId: 1,
          amount: 1,
          purchaseFor: 1,
          success: 1,
          createdAt: 1,
        },
      },
    ]);

    if (!purchases || purchases.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Purchase info found" });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase info retrieved",
      data: purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve purchase info",
      error: error.message,
    });
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
