// controllers/chatController.js
const Message = require("../models/messageModel");
const Student = require("../models/userModel");
const Teacher = require("../models/adminModel");
const mongoose = require("mongoose");

const multer = require("multer");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Store files in the "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

exports.sendMessage = async (req, res) => {
  try {
    const { senderType, senderId, receiverType, receiverId, content,replyTo  } = req.body;
    let file = req.file ? `/uploads/${req.file.filename}` : null; // Handle file upload
  
    // Validate sender and receiver
    const sender =
      senderType === "User"
        ? await Student.findById(senderId)
        : await Teacher.findById(senderId);
    const receiver =
      receiverType === "User"
        ? await Student.findById(receiverId)
        : await Teacher.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create message entry
    const newMessage = await Message.create({
      senderType,
      senderId,
      receiverType,
      receiverId,
      content: content || "", // Store text message
      file,
      replyTo, // Store file path if available
    });

    res.status(201).json({ status: true, message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// controllers/chatController.js
exports.getMessages = async (req, res) => {
  const { senderId, receiverId, senderType, receiverType } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        {
          senderId,
          receiverId,
          senderType,
          receiverType,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
          senderType: receiverType,
          receiverType: senderType,
        },
      ],
    }).sort("createdAt");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// controllers/chatController.js
exports.getChatPartners = async (req, res) => {
  try {
    const { userId, userType } = req.query;
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
              then: "$receiverId", // Set _id to senderId if senderId matches userId
              else: "$senderId" // Otherwise set _id to receiverId
            }
          },
          lastInteraction: { $first: "$createdAt" },
        },
      },
      { $sort: { lastInteraction: -1 } },
    ]);
    
    
console.log(messages)
    const receivers = await Promise.all(
      messages.map(async (message) => {
        const receiver = await (userType === "User"
          ? Teacher.findById(message._id).select("name avatar")
          : Student.findById(message._id).select("name avatar"));

        return { receiver, lastInteraction: message.lastInteraction };
      })
    );

    res.json({ status: true, receivers });
  } catch (err) {
    console.log(err.message);
  }
};

// controllers/chatController.js
exports.getAllMessages = async (req, res) => {
  try {
    const { userId, receiverId } = req.body;
    console.log('userId',userId);
    console.log('receiverId',receiverId)
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    }).sort("createdAt").populate('replyTo');
console.log(messages)
    res.json({ status: true, messages });
  } catch (err) {
    console.log(err.message);
  }
};


exports.uploadMiddleware = upload.single("file");
