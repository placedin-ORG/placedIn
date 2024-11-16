const router = require("express").Router();
const User=require("../schems/userSchema")
const bcrypt=require("bcryptjs");
router.post("/register", async (req, res) => {
    try {
      /* Take all information from the form */
      const { name,email, password } = req.body;
      console.log(req.body)
  console.log(email)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists!" });
      }
  
      /* Hass the password */
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
  
      /* Create a new User */
      const newUser = new User({
        name:name,
        email,
        password: hashedPassword,
      });
      console.log(newUser);
      /* Save the new User */
      await newUser.save();
  
      /* Send a successful message */
      res.json({status:true,user: newUser})
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Registration failed!", error: err.message });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      /* Take the infomation from the form */
      const { email, password } = req.body
  
      /* Check if user exists */
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({status:false,message:"user does not exist"})
      }
  
      /* Compare the password with the hashed password */
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.json({status:false,message:"wrong password"})
      }
  
      res.json({status:true,user})
  
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: err.message })
    }
  })

  module.exports = router