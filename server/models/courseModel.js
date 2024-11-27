const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
  paid: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    default: 0,
  }, discussion: [
    {
      username: {
        type: String,
        required: true,  // Ensure username is required
      },
      comment: {
        type: String,
        required: true,  // Ensure comment is required
      },
      timestamp: {
        type: Date,
        default: Date.now,  // Automatically set the current date and time
      }
    }
  ],
  title: { type: String, required: true },
  courseCategory: {
    type: String,
  },
  courseThumbnail: {
    type: String,
  },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "live"],
    default: "pending",
  },
  chapters: [
    {
      title: { type: String },
      topics: [
        {
          name: { type: String },
          videoUrl: { type: String },
          content: { type: String },
        },
      ],
      quiz: [
        {
          question: { type: String },
          options: [String],
          correctAnswer: { type: String },
        },
      ],
    },
  ],

  questions: [
    {
      questionText: { type: String },
      options: [{ type: String }],
      correctAnswer: { type: String },
      image: { type: String }, // Optional for image-based questions
    },
  ],
  setLive: {
    type: Boolean,
    default: false,
  },
  examDuration:{
    type:Number
  },
  sponsoredBy: { type: String }, // e.g., 'Google', 'Facebook'
  isSponsored: { type: Boolean, default: false },
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
