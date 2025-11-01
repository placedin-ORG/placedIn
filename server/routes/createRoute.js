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
      adminId
    } = req.body;

    let thumbnail = courseThumbnail;
    const base64Data = courseThumbnail?.split(";base64,").pop(); // Remove metadata
    if (base64Data) {
      const buffer = Buffer.from(base64Data, "base64");

      const image = await uploadFile(buffer, "placedIn/teacher/course");
      thumbnail = image.url;
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
        courseThumbnail: thumbnail,
        courseCategory,
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
          courseThumbnail: thumbnail,
          courseCategory,
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
    const courses = await Course.aggregate([
      {
        $sort: { studentEnrolled: -1 }, // Sort by studentEnrolled in descending order
      },
      {
        $limit: 3, // Limit the result to the top 3
      },
    ]);

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
    const courses = await Course.aggregate([
      {
        $addFields: {
          avgRating: {
            $avg: "$rating.rating", // Calculate average rating
          },
        },
      },
      {
        $sort: { avgRating: -1 }, // Sort by highest rating
      },
      {
        $limit: 3, // Limit to top 3 courses
      },
    ]);

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
