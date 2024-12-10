
const router = require("express").Router();
const User = require('../models/userModel'); 

router.post('/dailyLogin', async (req, res) => {
    try {
      const { userId,coin } = req.body;
  
      if (!userId) {
        return res.status(400).json({ status: false, message: 'User ID is required' });
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      
        // Mark daily login as true
        user.coins += coin; // Reward coins
        await user.save(); // Save the updated user
        return res.json({ status: true, coins: user.coins });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  });
  
module.exports = router;
