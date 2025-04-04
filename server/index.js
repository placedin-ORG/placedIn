const express = require("express");
const path = require("path");

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
const internShipRoute=require("./routes/internshipRoute")
const jobRoute=require("./routes/jobRoute")
const axios = require("axios");
const notificationRoute=require("./routes/notificationRoute")
const AtsRoute=require("./routes/atsRoute");
const chatRoutes = require("./routes/chatRoutes");
const Message=require("./models/messageModel")
const Wishlist=require("./routes/wishlistRoutes");

const socketIo = require("socket.io");

const http=require('http')
require("dotenv").config();
const cloudinary = require("cloudinary");
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"]
  },
});

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI("AIzaSyCLgsSfQhcXZdUj9inr7n6fB0E5DZpHK0w"); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const port = process.env.PORT;
app.use(express.json({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1", QuizRoute);
app.use("/api/v1/create", CourseRoute);
app.use("/api/v1/auth", UserRoute);
app.use("/api/v1/admin-auth", adminAuthRoute);
app.use("/api/v1/login", ResetDailyLogin);
app.use("/api/v1/learn", StartCourseRoute);
app.use("/api/v1/discussion", DiscussionRoute);
app.use("/api/v1/rating", RatingRoute);
app.use("/api/v1/exam", ExamRoute);
app.use("/api/v1/search", SearchRoute);
app.use("/api/v1/purchase", purchaseRoutes);
app.use("/api/v1/certificate", certificateRoute);
app.use("/api/v1/ranking", rankingRoute);
app.use("/api/v1/teacher", teacherRoute);
app.use("/api/v1/internship",internShipRoute)
app.use("/api/v1/job",jobRoute)
app.use("/api/v1/notification",notificationRoute)
app.use("/api/v1/ats",AtsRoute)
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/wishlist",Wishlist);
const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/placedInDB`);
    console.log("mongoose connection successfull");
  } catch (error) {
    console.log(error.message);
  }
};

connectDb()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(() => {
    console.log("Error Connecting to databse");
  })
  
  //Messaging
  io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Handling sendMessage
    socket.on("sendMessage", (message) => {
      // Broadcast to all OTHER clients (not the sender)
      socket.broadcast.emit("receiveMessage", message);
    });
    
    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
// Function to parse the quiz into a structured format
function parseQuizToQuestionsArray(quizString) {
  if (typeof quizString !== "string") {
    throw new TypeError("Expected a string input for parsing questions");
  }

  // Split quiz into question blocks
  const questionBlocks = quizString.split(/\n\n+/);
  const questionsArray = [];

  questionBlocks.forEach((block) => {
    const lines = block.split("\n").filter((line) => line.trim() !== "");

    if (lines.length > 0) {
      const questionText = lines[0].trim();
      const options = lines.slice(1, 5).map((opt) => opt.trim()); // Next 4 lines are options

      // Extract the correct answer
      const correctAnswerLine = lines.find((line) =>
        line.trim().startsWith("correctAnswer:")
      );
      const correctAnswer = correctAnswerLine
        ? correctAnswerLine.split(":").slice(1).join(":").trim()
        : null;

      if (options.length === 4 && correctAnswer) {
        questionsArray.push({
          question: questionText,
          options,
          correctAnswer,
        });
      }
    }
  });

  return questionsArray;
}

app.use("/api/v1/dailyQuestion", async (req, res) => {
  try {
    // Fetch all users
    const { userId } = req.body;
    const users = await User.find();
    //  const {userId}=req.body;
    for (const user of users) {
      const currentQuestion = user.dailyLogin?.dailyQAndA?.question;

      // Add current question to the `questions` array if it exists
      if (currentQuestion) {
        user.dailyLogin.questions.push(currentQuestion);
      }
    }
    const user = await User.findById(userId);
    if (user.dailyLogin.dailyQAndA.completed) {
      return res.json({ status: false, daily: user.dailyLogin.dailyQAndA });
    }
    if (user.dailyLogin.dailyQAndA.categories.length === 0) {
      return res.json({ status: false, daily: user.dailyLogin.dailyQAndA });
    }
    user.dailyLogin.questions.push(user.dailyLogin.dailyQAndA.question);
    console.log("sd")
    await user.save();
    console.log("asfe")
    const generatedContent = await axios.post(
      `${process.env.SERVER_URL}/api/v1/generate`,
      {
        content: user.dailyLogin.dailyQAndA.categories,
        already: user.dailyLogin.questions,
      }
    );
    console.log(generatedContent.data.questions[0].options);
    user.dailyLogin.dailyQAndA.question =
      generatedContent.data.questions[0].question; // Assuming the first question is the daily Q&A
    user.dailyLogin.dailyQAndA.options =
      generatedContent.data.questions[0].options;
    user.dailyLogin.dailyQAndA.correct =
      generatedContent.data.questions[0].correctAnswer;
    await user.save();
    console.log(generatedContent.data.questions);
    res.json({ status: true, daily: user.dailyLogin.dailyQAndA });
    console.log("Daily login updated for all users.");
  } catch (error) {
    console.error("Error resetting daily login:", error.message);
  }
});

const resetDailyLogin = async () => {
  schedule.scheduleJob("0 0 * * *", async () => {
    await User.updateMany(
      { "dailyLogin.dailyQAndA.completed": true },
      { $set: { "dailyLogin.dailyQAndA.completed": false } }
    );
  });
};

resetDailyLogin();


