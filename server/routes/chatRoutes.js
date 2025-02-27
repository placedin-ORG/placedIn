// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Send message
router.post('/sendMessage',chatController.uploadMiddleware, chatController.sendMessage);

// Get messages
router.get('/getMessages/:senderId/:receiverId/:senderType/:receiverType', chatController.getMessages);

// Get chat partners (previous conversations)
router.get('/getChatPartners', chatController.getChatPartners);

// Get all messages in a specific chat
router.post('/getAllMessages', chatController.getAllMessages);

module.exports = router;
