const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const schedule = require("node-schedule");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  password: { type: String, required: true },
  coins: { type: Number, default: 0 },
  avatar: {
    type: String,
    default: "/images/avatar.png",
  },
  dailyLogin: {
    
    questions:[String],
    dailyQAndA:{
      categories:[String],
      question:{
        type:String
      },
      options:[String],
      completed:{
        type:Boolean,
        default:false,
      },
      correct:{
        type:String
      },
      yourAnswer:{
        type:String
      }
    }
  },
  // achievements: [
  //   {
  //     courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  //     rank: { type: String },
  //     score: { type: Number },
  //     certification: { type: Boolean, default: false }
  //   }
  // ],

  ongoingCourses: [
    {
      courseId: {
        type: String,
        required: true,
      },
      examDuration: {
        type: String,
      },

      courseName: {
        type: String,
      },
      chapters: [
        {
          title: {
            type: String,
          },
          isCompleted: {
            type: Boolean,
            default: false,
          },
          isCurrent: {
            type: Boolean,
            default: false, // The first chapter is unlocked by default
          },
          topics: [
            {
              name: {
                type: String,
              },
              content: {
                type: String,
              },
              videoUrl: {
                type: String,
              },
              isCompleted: {
                type: Boolean,
                default: false,
              },
              isCurrent: {
                type: Boolean,
                default: false, // The first topic of the first chapter is unlocked by default
              },
            },
          ],
          quiz: {
            quizQuestions: [
              {
                question: { type: String },
                options: [String],
                correctAnswer: { type: String },
              },
            ],
            isCurrent: {
              type: Boolean,
              default: false,
            },
            isCompleted: {
              type: Boolean,
              default: false,
            },
          },
        },
      ],
      finalExam: {
        questions: [
          {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true },
            image: { type: String }, // Optional for image-based questions
            level:{type:String}
          },
        ],
        isCurrent: {
          type: Boolean,
          default: false,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
        result: {
          answers: [
            {
              type: Map,
              of: String,
            },
          ],
          accuracy: {
            type: Number,
          },
        },
        certificate: {
          name: {
            type: String,
          },
          downloaded: {
            type: Boolean,
            default: false,
          },
        },
      },
    },
  ],
 
  examsAttempted: [
    {
      examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
      score: { type: Number },
      rank: { type: String },
      attempts: { type: Number, default: 0 },
    },
  ],
  profileLinks: {
    resume: { type: String },
  },
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
