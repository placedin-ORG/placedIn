const { Exam } = require("../models/ExamModel"); // Assuming Exam model is in the models folder
const { ExamResult } = require("../models/ExamModel");
const { uploadFile } = require("../utils/cloudinary");
// Create a new exam
const create = async (req, res) => {
  try {
    const {
      startDate,
      duration,
      acceptedResultDate,
      price,
      numberOfStudents,
      questions,
      category,
      examTitle,
      topics,
      description,
      examThumbnail,
      discountAmount = 0,
      examDescription,
    } = req.body;

    // Decode Base64 string to buffer
    const base64Data = examThumbnail.split(";base64,").pop(); // Remove metadata
    const buffer = Buffer.from(base64Data, "base64");

    const image = await uploadFile(buffer, "placedIn/teacher/exam");
    const thumbnail = image.url;

    const exam = new Exam({
      teacher: req.user._id,
      startDate,
      duration,
      acceptedResultDate,
      price,
      questions,
      category,
      examTitle,
      topics,
      description,
      discountAmount,
      examThumbnail: thumbnail,
      description,
    });

    await exam.save();
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitExam = async (req, res) => {
  try {
    const { userId, ExamId, userAnswers } = req.body;

    // Check if the exam exists
    const exam = await Exam.findById(ExamId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Transform and validate user answers
    const answersArray = [];

    // Process objective answers
    if (userAnswers.objective) {
      Object.entries(userAnswers.objective).forEach(([index, answer]) => {
        const question = exam.questions[index];
        if (!question || question.type !== "objective") {
          throw new Error(
            `Invalid question or type mismatch for index ${index}`
          );
        }
        answersArray.push({ questionId: question._id, answer });
      });
    }

    // Process subjective answers
    if (userAnswers.subjective) {
      Object.entries(userAnswers.subjective).forEach(([index, answer]) => {
        const question = exam.questions[index];
        if (!question || question.type !== "subjective") {
          throw new Error(
            `Invalid question or type mismatch for index ${index}`
          );
        }
        answersArray.push({ questionId: question._id, answer });
      });
    }

    // Calculate score for objective questions
    let score = 0;
    answersArray.forEach(({ questionId, answer }) => {
      const question = exam.questions.find(
        (q) => q._id.toString() === questionId.toString()
      );
      if (question.type === "objective" && question.options[0] === answer) {
        score += 1; // Increment score for correct answer
      }
    });

    // Save the submission
    const submission = new ExamResult({
      userId,
      ExamId,
      userAnswers: answersArray,
      score,
    });

    await submission.save();

    res.status(201).json({
      message: "Exam submitted successfully",
      submissionId: submission._id,
      score,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error.message);
  }
};

// Get all exams
const get = async (req, res) => {
  try {
    const exams = await Exam.find();
    res.status(200).json({ exams });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Error" });
  }
};

// GEt Upcoming exams

const getUpcomingExams = async (req, res) => {
  try {
    const userId = req.user._id;

    const exams = await Exam.find({
      "numberOfStudents.userId": userId,
      startDate: { $gt: new Date() },
    });

    const upcomingExams = exams.filter((exam) =>
      exam?.enrolledStudents?.some((student) => student.userId === userId)
    );

    res.status(200).json({ exams: upcomingExams });
  } catch (error) {
    res.status(500).json({ error: "Failed to get upcoming exams data" });
  }
};

const getUserCompletedExams = async (req, res) => {
  try {
    const exams = await getCompletedExams(req.user._id);
    res.status(200).json({ exams, mesage: "Exams data fetched" });
  } catch (error) {
    res.status(500).json({ error: "Failed to get exams data" });
  }
};

// Get Teacher exams

const getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.find({ teacher: req.user._id });

    if (!exams || exams.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Exams Found" });
    }

    res.status(200).json({ exams, mesage: "Exams data fetched" });
  } catch (error) {
    res.status(500).json({ message: "Failed to get exams data" });
  }
};

// Get exam by id

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    res.status(200).json({ exam, msg: "exam found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get completed exams

const getCompletedExams = async (userId) => {
  try {
    const completedExams = await ExamResult.find({ userId }).populate("ExamId");

    return completedExams;
  } catch (error) {
    console.log(error);
  }
};

// fetch a exam
const fetchExam = async (req, res) => {
  try {
    const { id, userId } = req.body;
    const exam = await Exam.findById(id);
    const relatedExams = await Exam.find({
      category: exam?.category,
      _id: { $ne: id },
    });
    const user = await ExamResult.findOne({ userId, ExamId: id });

    if (user !== null) {
      if (user) {
        return res.json({
          status: true,
          msg: "user found",
          relatedExams,
          exam,
          attempted: true,
        });
      }
      if (!exam) return res.json({ status: false, msg: "Exam not found" });

      res.json({
        status: true,
        exam,
        msg: "exam found",
        relatedExams,
        attempted: false,
      });
    } else {
      res.json({
        status: true,
        exam,
        msg: "exam found",
        relatedExams,
        attempted: false,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

// Get a specific exam by ID
const getSpeceficExam = async (req, res) => {
  try {
    const { ExamId, userId } = req.body;
    console.log(ExamId, userId);
    const exam = await Exam.findById(ExamId);
    const user = await ExamResult.findOne({ userId, ExamId });
    if (user) {
      return res.json({ msg: "user found" });
    }
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    res.status(200).json({ exam, msg: "exam found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an exam
const update = async (req, res) => {
  try {
    const base64Data = req.body.examThumbnail.split(";base64,").pop();
    if (base64Data) {
      const buffer = Buffer.from(base64Data, "base64");
      const image = await uploadFile(buffer, "placedIn/teacher/exam");
      req.body.examThumbnail = image.url;
    }

    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json({ message: "Exam updated successfully", exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Enroll user in the course
const enrollUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          enrolledStudents: {
            userId: userId,
            enrolledAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json({
      message: "User Enrolled successfully",
      updatedExam: exam,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all the submitted exams

const getExamSubmissions = async (req, res) => {
  try {
    const submissions = await ExamResult.find({
      ExamId: req.params.id,
    }).populate("userId");

    if (!submissions || submissions.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Exam Data Found" });
    }

    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get submissoins by id

const getSubmissionById = async (req, res) => {
  try {
    const submission = await ExamResult.findById(req.params.id)
      .populate("userId")
      .populate("ExamId");

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "No Exam Data Found" });
    }

    return res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save the score

const saveScore = async (req, res) => {
  try {
    const { totalScore, individualScores } = req.body;
    const examId = req.params.id;

    await ExamResult.findByIdAndUpdate(examId, { score: totalScore });

    // Update individual question scores
    for (const { questionId, score } of individualScores) {
      await ExamResult.updateOne(
        { "userAnswers.questionId": questionId },
        { $set: { "userAnswers.$.score": score } }
      );
    }

    res.status(200).json({ message: "Scores saved successfully!" });
  } catch (error) {
    console.error("Error saving scores:", error);
    res.status(500).json({ message: "Failed to save scores" });
  }
};

// Delete an exam
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create,
  get,
  update,
  deleteExam,
  getSpeceficExam,
  submitExam,
  fetchExam,
  getUserCompletedExams,
  getUpcomingExams,
  getTeacherExams,
  getExamSubmissions,
  getExamById,
  getSubmissionById,
  saveScore,
  enrollUser,
};
