const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderType: { type: String, enum: ["User", "Admin"], required: true },
  receiverType: { type: String, enum: ["User", "Admin"], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "senderType" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "receiverType" },
  content: { type: String },
  file: { type: String }, // Stores file URL
  timestamp: { type: Date, default: Date.now },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message", // Reference to another message
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
