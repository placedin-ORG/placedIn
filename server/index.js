const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser");
const cors = require("cors");
const QuizRoute = require("./routes/quizRoute");
const mongoose = require("mongoose");
const CourseRoute = require("./routes/createRoute");
const UserRoute = require("./routes/userRoutes");
const adminAuthRoute = require("./routes/adminAuthRoute");

const StartCourseRoute = require("./routes/startCourseRoute");
const DiscussionRoute = require("./routes/discussionRoute");
const RatingRoute = require("./routes/ratingRoute");
const ExamRoute = require("./routes/examRoute");
const SearchRoute = require("./routes/SearchRoute");
require("dotenv").config();
const cloudinary = require("cloudinary");

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyBBBaZ58MqJjDdPNhwCGKqlDyFepGRit8g"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
const port = 5000;
app.use(express.json({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/api/v1", QuizRoute);
app.use("/api/v1/create", CourseRoute);
app.use("/api/v1/auth", UserRoute);
app.use("/api/v1/admin-auth", adminAuthRoute);

app.use("/api/v1/learn", StartCourseRoute);
app.use("/create", CourseRoute);
app.use("/api/discussion", DiscussionRoute);
app.use("/api/rating", RatingRoute);
app.use("/api/v1/exam", ExamRoute);
app.use("/api/v1/search", SearchRoute);
const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/placedInDB`);
    console.log("mongoose connection successfull");
  } catch (error) {
    console.log(error);
  }
};

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(() => {
    console.log("Error Connecting to databse");
  });
