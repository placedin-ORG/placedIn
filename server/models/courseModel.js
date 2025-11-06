const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // <-- for populate()
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // not required but keeps nested docs cleaner
);

const courseSchema = new mongoose.Schema(
  {
    paid: {
      type: Boolean,
      default: false,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    reviews: [reviewSchema],
    studentEnrolled: {
      type: Number,
    },
    price: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    discussion: [
      {
        username: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Assuming you have a User model
        },

      reply: {
      text: String,
      date: { type: Date, default: Date.now },
      },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
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
            videoDuration:{type:String},
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
        level: { type: String, default: "Easy" },
        weightage: { type: Number, default: 0 },
        correctAnswer: { type: String },
        image: { type: String }, // Optional for image-based questions
      },
    ],
    setLive: {
      type: Boolean,
      default: false,
    },
    examDuration: {
      type: Number,
    },
    sponsoredBy: { type: String }, // e.g., 'Google', 'Facebook'
    isSponsored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
