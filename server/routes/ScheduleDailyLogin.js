
const router = require("express").Router();
const User = require('../models/userModel'); 

router.post('/dailyLogin', async (req, res) => {
    try {
      const { userId } = req.body;
  
      if (!userId) {
        return res.status(400).json({ status: false, message: 'User ID is required' });
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
  
      if (!user.dailyLogin) {
        user.dailyLogin = true; // Mark daily login as true
        user.coins += 5; // Reward coins
        await user.save(); // Save the updated user
        return res.json({ status: true, coins: user.coins });
      } else {
        return res.json({ status: false, message: 'Daily login already completed' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  });
  
module.exports = router;
