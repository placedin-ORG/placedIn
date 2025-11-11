const router = require("express").Router();
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Exam=require("../models/ExamModel");
const { uploadFile } = require("../utils/cloudinary");
const { isAuth } = require("../middlewares/auth");
  
router.post("/createCourse", async (req, res) => {
  try {
    const {
      courseTitle,
      description,
      chapters,
      paid,
      price,
      questions,
      examDuration,
      courseThumbnail,
      id,
      discountAmount,
      courseCategory,
      adminId,
      setLive,
    } = req.body;

    let finalThumbnailUrl = courseThumbnail; // Default to what we received

    const isBase64 =
      courseThumbnail &&
      courseThumbnail.startsWith("data:") &&
      courseThumbnail.includes(";base64,");

    if (isBase64) {
      const base64Data = courseThumbnail.split(";base64,").pop();
      const buffer = Buffer.from(base64Data, "base64");
      const image = await uploadFile(buffer, "placedIn/teacher/course");
      finalThumbnailUrl = image.url;
    }

    if (id === null) {
      const newCourse = new Course({
        teacher: adminId,
        paid,
        price,
        title: courseTitle,
        description,
        chapters,
        questions,
        discountAmount,
        examDuration,
        courseThumbnail: finalThumbnailUrl, // <-- FIX
        courseCategory,
        setLive: setLive,
      });
      await newCourse.save();
      return res.json({ status: true });
    } else {
      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        {
          paid,
          price,
          title: courseTitle,
          description,
          discountAmount,
          chapters,
          questions,
          examDuration,
          courseThumbnail: finalThumbnailUrl, // <-- FIX
          courseCategory,
          setLive: setLive,
        },
        { new: true } // Ensures the response is the updated document
      );

      if (!updatedCourse) {
        return res
          .status(404)
          .json({ status: false, message: "Course not found" });
      }

      return res.json({ status: true, updatedCourse });
    }
  } catch (err) {
    console.log(err);
    // Always send a response in case of an error
    res.status(500).json({ status: false, message: "Server error" });
  }
});

router.get("/teacher-courses", isAuth, async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id });

    if (!courses || courses.length == 0) {
      return res.json({ status: false, message: "No Courses Found" });
    }
    console.log(courses[0]);
    return res.status(200).json({ courses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/getCourses", async (req, res) => {
  try {
    // console.log(await Course.find());
    const courses = await Course.find()
  .sort({ studentEnrolled: -1 })
  .limit(3)
  .populate("teacher");

    return res.status(200).json({ courses });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/courses/all", async (req, res) => {
  try {
    const courses = await Course.find({ setLive: true }).sort({
      createdAt: -1,
    }).populate("teacher");

    return res.status(200).json({ courses });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/topRatedCourses", async (req, res) => {
  try {
  const allCourses = await Course.find()
  .populate("teacher") 
  .lean();
  
// Compute average rating for each course
const coursesWithAvg = allCourses.map(course => {
  const ratings = course.reviews || [];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  return { ...course, avgRating };
});

// Sort by avgRating descending and take top 3
const courses = coursesWithAvg
  .sort((a, b) => b.avgRating - a.avgRating)
  .slice(0, 3);


    res.status(200).json({ courses });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});
router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      return res.json({ status: false, msg: "Email already exist" });
    }
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    res.json({
      status: true,
      msg: "please check your email to activate yur account",
    });
    // res.status(201).json({
    //   success: true,
    //   message: "Please check your email to activate your account",
    // });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    /* Take the infomation from the form */
    const { email, password } = req.body;

    /* Check if user exists */
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ status: false, msg: "user does not exist" });
    }

    /* Compare the password with the hashed password */

    if (user.password !== password) {
      return res.json({ status: false, msg: "wrong password" });
    }

    // Generate The token

    res.json({
      status: true,
      msg: "User logged in Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
