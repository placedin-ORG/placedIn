const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  startDate: { type: Date, required: true }, // Start date and time of the exam
  duration: { type: Number, required: true }, // Duration in minutes
  acceptedResultDate: { type: Date, required: true }, // Date when results are accepted/published
  price: { type: Number, required: true },
  category: { type: String, required: true }, // Price for the exam
  numberOfStudents: [{ 
    userId:{
        type: String 
    }
    }], // Number of students attempting the exam
  questions: [
    {
      questionText: { type: String, required: true }, // The question text
      type: { type: String, enum: ['objective', 'subjective'], required: true }, // Type of question
      options: [String], // Array of options for objective questions (optional for subjective)
    },
  ],
});
const Exam = mongoose.model('Exam', examSchema);




const examResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true }, // Reference to Exam
  userAnswers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to the question in the Exam schema
      answer: { type: mongoose.Schema.Types.Mixed, required: true }, // Answer provided by the user (text or option index)
    },
  ],
  score: { type: Number, default: 0 }, // Score obtained by the user
  publishResult: { type: Boolean, default: false }, // Whether the result has been published
});

const ExamResult = mongoose.model('ExamResult', examResultSchema);

module.exports = {ExamResult,Exam};



