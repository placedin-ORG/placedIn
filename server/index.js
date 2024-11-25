
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bodyParser = require('body-parser');
const cors = require('cors');
const QuizRoute=require("./routes/quizRoute");
const mongoose=require("mongoose");
const CourseRoute=require("./routes/createRoute")
const UserRoute=require("./routes/userRoutes");
const StartCourseRoute=require("./routes/startCourseRoute");
const cloudinary=require("cloudinary")
// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyBBBaZ58MqJjDdPNhwCGKqlDyFepGRit8g'); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
cloudinary.config({
  cloud_name: "duhadnqmh",
  api_key: "848465882823534",
  api_secret: "Y_3JPUnLtfQALfq2SGcuNDpi5do",
});
const app = express();
const port = 5000;
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use("/api",QuizRoute);
app.use("/create",CourseRoute);
app.use("/auth",UserRoute);
app.use("/learn",StartCourseRoute)
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb+srv://placedIn:1111@placedin1.emyup.mongodb.net/");
    console.log("mongoose connection successfull");
   
  } catch (error) {
    console.log(error);
  }
};

connectDb();