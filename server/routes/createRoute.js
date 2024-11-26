const router = require("express").Router();
const Course = require("../schems/courseSchema");
const User=require("../schems/userSchema");
const bcrypt=require("bcryptjs")
router.post("/createCourse", async (req, res) => {
  try {
    const { courseTitle, description, chapters, paid, price, questions } =
      req.body;

    const newCourse = new Course({
      paid,
      price,
      title: courseTitle,
      description,
      chapters,
      questions,
    });
    await newCourse.save();
    return res.json({ status: true });
  } catch (err) {
    console.log(err);
  }
});
router.get("/getCourses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ courses });
  } catch (err) {
    console.log(err);
  }
});
router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.json({status:false,msg:"Email already exist"})
    }
     await User.create({
      name:req.body.name,
      email:req.body.email,
      password:req.body.password
     })
res.json({status:true,msg:"please check your email to activate yur account"})
    // res.status(201).json({
    //   success: true,
    //   message: "Please check your email to activate your account",
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login",async(req,res)=>{
  try {
    /* Take the infomation from the form */
    const { email, password } = req.body;

    /* Check if user exists */
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ status: false, msg: "user does not exist" });
    }

    /* Compare the password with the hashed password */
    
    if (user.password!==password) {
      return res.json({ status: false, msg: "wrong password" });
    }

    // Generate The token
  
    res.json({
      status: true,
      msg: "User logged in Successfully",
      user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;
