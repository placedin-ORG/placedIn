const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require("body-parser");
const cors = require("cors");
const QuizRoute = require("./routes/quizRoute");
const mongoose = require("mongoose");
const CourseRoute = require("./routes/createRoute");
const UserRoute = require("./routes/userRoutes");
const adminAuthRoute = require("./routes/adminAuthRoute");
const schedule = require("node-schedule");
const User = require("./models/userModel");
const StartCourseRoute = require("./routes/startCourseRoute");
const DiscussionRoute = require("./routes/discussionRoute");
const RatingRoute = require("./routes/ratingRoute");
const ExamRoute = require("./routes/examRoute");
const SearchRoute = require("./routes/SearchRoute");
const ResetDailyLogin = require("./routes/ScheduleDailyLogin");
const purchaseRoutes = require("./routes/purchaseRoutes");
const certificateRoute = require("./routes/certificateRoute");
const rankingRoute = require("./routes/userRankingRoutes");
const teacherRoute = require("./routes/teacherRoutes");
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
const port = process.env.PORT;
app.use(express.json({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/api/v1", QuizRoute);
app.use("/api/v1/create", CourseRoute);
app.use("/api/v1/auth", UserRoute);
app.use("/api/v1/admin-auth", adminAuthRoute);
app.use("/api/v1/login", ResetDailyLogin);
app.use("/api/v1/learn", StartCourseRoute);
app.use("/create", CourseRoute);
app.use("/api/discussion", DiscussionRoute);
app.use("/api/rating", RatingRoute);
app.use("/api/v1/exam", ExamRoute);
app.use("/api/v1/search", SearchRoute);
app.use("/api/v1/purchase", purchaseRoutes);
app.use("/api/v1/certificate", certificateRoute);
app.use("/api/v1/ranking", rankingRoute);
app.use("/api/v1/teacher", teacherRoute);

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
const resetDailyLogin = () => {
  schedule.scheduleJob("0 0 * * *", async () => {
    try {
      await User.updateMany({}, { $set: { dailyLogin: false } });
      console.log("Daily login reset for all users.");
    } catch (error) {
      console.error("Error resetting daily login:", error);
    }
  });
};

resetDailyLogin();
