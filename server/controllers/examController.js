const e = require("express");
const { Exam } = require("../models/ExamModel"); // Assuming Exam model is in the models folder
const { ExamResult } = require("../models/ExamModel");
const { uploadFile } = require("../utils/cloudinary");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const generateQuizFromContent = async (content) => {
  const prompt = `
You are a duplicate question detector. You will receive a JSON object containing two arrays of questions: "newQuestions" and "existingQuestions".
Compare each question in "newQuestions" against all questions in "existingQuestions".
If you find any pair of questions that are semantically the same, your response MUST be a single valid JSON object with the key "duplicateFound" set to true, and include the text of the matching "newQuestion" and "existingQuestion".
If no duplicates are found after checking all combinations, your response MUST be a single valid JSON object with the key "duplicateFound" set to false.

Example of a duplicate found:
{ "duplicateFound": true, "newQuestion": "What is the capital of France?", "existingQuestion": "Which city is the capital of France?" }

Example of no duplicate:
{ "duplicateFound": false }

Here is the content to evaluate:
${content}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse;
  } catch (error) {
    console.error("Error generating quiz from Gemini AI:", error);
    // In case of AI error, we'll assume no duplicate to avoid blocking exam creation.
    return { duplicateFound: false };
  }
};
// Create a new exam
const create = async (req, res) => {
  const { questions } = req.body;
  try {
    // 1. Efficiently fetch all existing question texts
    const allExams = await Exam.find({}).select("questions.questionText");
    const existingQuestions = allExams.flatMap((exam) =>
      exam.questions.map((q) => q.questionText)
    );

    // 2. Perform a single, batched AI call to check for duplicates
    if (existingQuestions.length > 0 && questions.length > 0) {
      const newQuestions = questions.map((q) => q.questionText);
      const comparisonContent = JSON.stringify({ newQuestions, existingQuestions });
      const duplicateCheckResult = await generateQuizFromContent(comparisonContent);

      if (duplicateCheckResult.duplicateFound) {
        // 3. If a duplicate is found, STOP execution and return the error
        return res.status(409).json({
          error: "exist",
          message: "A similar question already exists.",
          current: duplicateCheckResult.newQuestion,
          exist: duplicateCheckResult.existingQuestion,
        });
      }
    }

    // 4. Handle thumbnail upload (with a check for missing thumbnail)
    if (req.body.examThumbnail && req.body.examThumbnail.includes(";base64,")) {
      const base64Data = req.body.examThumbnail.split(";base64,").pop();
      const buffer = Buffer.from(base64Data, "base64");
      const image = await uploadFile(buffer, "placedIn/teacher/exam");
      req.body.examThumbnail = image.url;
    } else {
      // Set a default or remove the field if no new image is provided
      delete req.body.examThumbnail;
    }

    // 5. Create the exam
    req.body.teacher = req.user._id;
    const exam = await Exam.create(req.body);
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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

    // Save the submission
    const submission = new ExamResult({
      userId,
      ExamId,
      userAnswers: answersArray,
      score: 0,
    });

    await submission.save();

    res.status(201).json({
      message: "Exam submitted successfully",
      submissionId: submission._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error.message);
  }
};

// Get all exams
const get = async (req, res) => {
  try {
    const exams = await Exam.find({}).populate("teacher", "name");
    res.status(200).json({ exams });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};

// GEt Upcoming exams

const getUpcomingExams = async (req, res) => {
  try {
    const userId = req.user._id;

    const completedExams = await getCompletedExams(userId);

    const exams = await Exam.find({
      _id: { $nin: completedExams.map((exam) => exam.ExamId._id) },
      startDate: { $gt: new Date() },
    });

    const upcomingExams = exams.filter((exam) =>
      exam.enrolledStudents?.some(
        (student) => student.userId.toString() === userId.toString()
      )
    );

    res.status(200).json({ exams: upcomingExams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get upcoming exams data" });
  }
};

// GEt Ongoing exams

const getOngoingExams = async (req, res) => {
  try {
    const userId = req.user._id;

    const completedExams = await getCompletedExams(userId);

    const exams = await Exam.find({
      _id: { $nin: completedExams.map((exam) => exam.ExamId._id) },
      startDate: { $lt: new Date() },
    });

    const ongoingExams = exams.filter((exam) =>
      exam.enrolledStudents?.some(
        (student) => student.userId.toString() === userId.toString()
      )
    );

    res.status(200).json({ exams: ongoingExams });
  } catch (error) {
    console.error(error);
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
    const exams = await Exam.find({ teacher: req.user._id }).populate("teacher", "name");

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

// Check that the user has given the exam

const hasGivenExam = async (req, res) => {
  console.log(req.user);
  try {
    const exam = await ExamResult.findOne({
      ExamId: req.params.id,
      userId: req.user._id,
    });
    let examCompleted = false;
    if (exam) examCompleted = true;
    res.status(200).json({ examCompleted });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error: error.message, message: "Failed to Live the Exams" });
  }
};

// Get exam by id

const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("teacher", "name");

    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    res.status(200).json({ exam, msg: "exam found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get completed exams

const getCompletedExams = async (userId) => {
  try {
    const completedExams = await ExamResult.find({ userId }).populate({
      path: "ExamId",
      populate: {
        path: "teacher",
        select: "name",
      },
    });

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
    const exam = await Exam.findById(ExamId);
    const user = await ExamResult.findOne({ userId, ExamId });
    console.log(exam);
    console.log(user);
    if (user) {
      user.userAnswers = user.userAnswers.map((answer) => {
        let cleanedAnswer = answer.answer;

        // Only run replace() if the answer is a string (a subjective answer)
        if (typeof cleanedAnswer === "string") {
          cleanedAnswer = cleanedAnswer.replace(/<\/?p>/g, "");
        }

        return {
          ...answer,
          answer: cleanedAnswer, // This will be the number for objective, or cleaned string for subjective
        };
      });
      const allResults = await ExamResult.find({ ExamId });

      // Sort results by total score in descending order
      const sortedResults = allResults.sort((a, b) => b.score - a.score);

      // Get rank of the current user
      const userRank =
        sortedResults.findIndex(
          (result) => result.userId.toString() === userId
        ) + 1;
      return res.json({ msg: "user found", user, exam, rank: userRank });
    }
    if (!exam) return res.status(404).json({ msg: "Exam not found" });

    res.status(200).json({ exam, msg: "exam found" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

// Update an exam
const update = async (req, res) => {
  const { questions } = req.body;
  const examId = req.params.id;
  try {
    // 1. Fetch existing questions, excluding the ones from the exam being updated
    const allExams = await Exam.find({ _id: { $ne: examId } }).select("questions.questionText");
    const existingQuestions = allExams.flatMap((exam) =>
      exam.questions.map((q) => q.questionText)
    );

    // 2. Perform a single, batched AI call
    if (existingQuestions.length > 0 && questions.length > 0) {
      const newQuestions = questions.map((q) => q.questionText);
      const comparisonContent = JSON.stringify({ newQuestions, existingQuestions });
      const duplicateCheckResult = await generateQuizFromContent(comparisonContent);

      if (duplicateCheckResult.duplicateFound) {
        // 3. If a duplicate is found, STOP execution
        return res.status(409).json({
          error: "exist",
          message: "A similar question already exists in another exam.",
          current: duplicateCheckResult.newQuestion,
          exist: duplicateCheckResult.existingQuestion,
        });
      }
    }

    // 4. Handle thumbnail upload
    if (req.body.examThumbnail && req.body.examThumbnail.includes(";base64,")) {
      const base64Data = req.body.examThumbnail.split(";base64,").pop();
      const buffer = Buffer.from(base64Data, "base64");
      const image = await uploadFile(buffer, "placedIn/teacher/exam");
      req.body.examThumbnail = image.url;
    }

    // 5. Update the exam
    const exam = await Exam.findByIdAndUpdate(examId, req.body, {
      new: true,
    });

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json({ message: "Exam updated successfully", exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Make the results live

const liveResults = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        $set: { publishResult: true },
      },
      {
        new: true,
      }
    );

    if (!exam) return res.status(404).json({ message: "Exam data not found" });

    res.status(200).json({ message: "Exam Are lve successfully", exam });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, message: "Failed to Live the Exams" });
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
const calculateResults = async (req, res) => {
  try {
    // We expect the specific submission ID to be passed in the body
    const { submissionId } = req.body;

    // 1. Fetch Specific Submission & Exam Data
    const submission = await ExamResult.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const examData = await Exam.findById(submission.ExamId);
    if (!examData) {
      return res.status(404).json({ message: "Exam data not found" });
    }

    // --- PHASE 1: PREPARATION (Subjective Gathering Only) ---
    // We do NOT calculate objective scores here (Optimization).

    const subjectiveAnswersForAI = [];

    for (const userAnswer of submission.userAnswers) {
      const question = examData.questions.find(
        (q) => q._id.toString() === userAnswer.questionId.toString()
      );
      if (!question) continue;

      // Only gather subjective answers for the AI
      if (question.type === "subjective") {
        subjectiveAnswersForAI.push({
          questionId: userAnswer.questionId,
          questionText: question.questionText,
          answer: userAnswer.answer,
          weightage: question.weightage,
        });
      }
    }

    // --- PHASE 2: AI EVALUATION (If needed) ---

    let evaluatedSubjectiveScores = {}; // Structure: { submissionId: { questionId: score } }

    if (subjectiveAnswersForAI.length > 0) {
      // We wrap the single student in an array to match the EXACT prompt structure you requested
      const payload = [
        {
          submissionId: submission._id,
          answers: subjectiveAnswersForAI,
        },
      ];

      const prompt = `
        You are an AI exam evaluator. You will receive a JSON array of student submissions.
        For each submission, evaluate the list of subjective answers based on their corresponding questions and weightage.
        Your response MUST be a valid JSON object where keys are "submissionId"s and values are objects containing "questionId" and the assigned "score".

        Example Input:
        [{"submissionId":"sub1","answers":[{"questionId":"q1","questionText":"Explain photosynthesis.","answer":"It's how plants make food.","weightage":10}]}]

        Example Response:
        {"sub1":{"q1":6}}

        Input Data:
        ${JSON.stringify(payload)}
      `;

      try {
        const modelResponse = await model.generateContent(prompt);
        const responseText = modelResponse.response
          .text()
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsedScores = JSON.parse(responseText);

        // Store the result (which will look like { "submissionId": { "qId": 5 } })
        evaluatedSubjectiveScores = parsedScores;
      } catch (aiError) {
        console.error("Critical AI Error during evaluation:", aiError);
        // We proceed. Subjective scores will default to 0 in the next phase.
      }
    }

    // --- PHASE 3: FINAL CALCULATION (Loop 2 - The only calculation loop) ---
    // Now we calculate Objective (Locally) + Subjective (From AI) in one pass.

    let finalTotalScore = 0;
    const finalIndividualScores = [];
    const submissionIdStr = submission._id.toString();

    for (const userAnswer of submission.userAnswers) {
      const question = examData.questions.find(
        (q) => q._id.toString() === userAnswer.questionId.toString()
      );
      if (!question) continue;

      let score = 0;

      if (question.type === "objective") {
        // Calculate Objective Score Locally
        const isCorrect =
          Number(userAnswer.answer) === Number(question.correctAnswer);

        console.log(
          `[calculateResult] Q: ${question._id} | User: ${userAnswer.answer} | Correct: ${question.correctAnswer} | IsCorrect: ${isCorrect}`
        );

        if (isCorrect) {
          score = question.weightage || 1;
        }
      } else {
        // Retrieve Subjective Score from AI Result
        score =
          evaluatedSubjectiveScores[submissionIdStr]?.[
            userAnswer.questionId.toString()
          ] || 0;
      }

      finalTotalScore += score;
      finalIndividualScores.push({
        questionId: userAnswer.questionId,
        answer: userAnswer.answer,
        score,
      });
    }

    // --- PHASE 4: UPDATE DATABASE ---

    // We use the same submission object we fetched earlier
    submission.score = finalTotalScore;
    submission.userAnswers = finalIndividualScores;

    await submission.save();

    res.status(200).json({
      message: "Score calculated successfully",
      score: finalTotalScore,
      submissionId: submission._id,
    });
  } catch (error) {
    console.error("Error in calculateResults function:", error);
    res
      .status(500)
      .json({ message: "Failed to calculate scores due to a server error." });
  }
};

const saveScore = async (req, res) => {
  try {
    const { totalScore, individualScores } = req.body;
    const examId = req.params.id;

    await ExamResult.findByIdAndUpdate(examId, { score: totalScore });

    // Update individual question scores
    const submission = await ExamResult.findById(examId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Update individual scores on the correct submission
    for (const { questionId, score } of individualScores) {
      // Find the index of the answer to update
      const answerIndex = submission.userAnswers.findIndex(
        (ans) => ans.questionId.toString() === questionId
      );

      if (answerIndex > -1) {
        // Use the positional $ operator with the _id to guarantee correctness
        await ExamResult.updateOne(
          { _id: examId, "userAnswers.questionId": questionId },
          { $set: { "userAnswers.$.score": score } }
        );
      }
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
  getOngoingExams,
  getTeacherExams,
  getExamSubmissions,
  getExamById,
  getSubmissionById,
  hasGivenExam,
  saveScore,
  enrollUser,
  liveResults,
  calculateResults,
};
