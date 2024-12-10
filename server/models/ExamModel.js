const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    startDate: { type: Date, required: true }, // Start date and time of the exam
    duration: { type: Number, required: true }, // Duration in minutes
    acceptedResultDate: { type: Date, required: true }, // Date when results are accepted/published
    price: { type: Number, required: true },
    category: { type: String, required: true }, // Price for the exam
    enrolledStudents: [
      {
        userId: {
          type: String,
        },
        enrolledAt: {
          type: Date,
        },
      },
    ],
    questions: [
      {
        questionText: { type: String, required: true },
        weightage: {
          type: Number,
          required: true,
          default: 1,
        },
        level: {
          type: String,
          required: true,
          default: "Easy",
        },

        type: {
          type: String,
          enum: ["objective", "subjective"],
          required: true,
        }, // Type of question
        options: [String], // Array of options for objective questions (optional for subjective)
        correctAnswer: { type: String },
      },
    ],
    examThumbnail: {
      type: String,
    },
    examTitle: {
      type: String,
    },
    discountAmount: {
      type: Number,
      required: false,
      default: 0,
    },
    description: {
      type: String,
    },
    publishResult: { type: Boolean, default: false },
    topics: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);
const Exam = mongoose.model("Exam", examSchema);

const examResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to User
    ExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    }, // Reference to Exam
    userAnswers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the question in the Exam schema
        score: {
          type: Number,
          default: 0,
        },
        answer: { type: mongoose.Schema.Types.Mixed, required: true }, // Answer provided by the user (text or option index)
      },
    ],
    score: { type: Number, default: 0 }, // Score obtained by the user
    publishResult: { type: Boolean, default: false }, // Whether the result has been published
  },
  {
    timestamps: true,
  }
);

const ExamResult = mongoose.model("ExamResult", examResultSchema);

module.exports = { ExamResult, Exam };
