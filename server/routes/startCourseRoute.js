const User = require("../models/userModel");
const Course = require("../models/courseModel");

const router = require("express").Router();

router.post("/fetchCourse", async (req, res) => {
  try {
    const { id, userId } = req.body;

    const course = await Course.findById(id).populate("teacher");

    // 1. Fetch courses from same category (excluding current course)
    let relatedCourses = await Course.find({
        courseCategory: course?.category,
        _id: { $ne: id },
        setLive: true
    })
    .limit(10)
    .select('_id title courseThumbnail price reviews teacher')
    .populate("teacher", "name");

    // 2. If less than 10, fetch more from ANY category
    if (relatedCourses.length < 10) {
        const moreCourses = await Course.find({
            _id: { $nin: [...relatedCourses.map(c => c._id), id] },
            setLive: true
        })
        .limit(10 - relatedCourses.length)
        .select('_id title courseThumbnail price reviews teacher')
        .populate("teacher", "name");

        relatedCourses = [...relatedCourses, ...moreCourses];
    }

    if (userId !== null) {
      const user = await User.findOne({
        _id: userId,
        "ongoingCourses.courseId": id, // Check if courseId exists in the ongoingCourses array of objects
      });
      return res.json({
        status: true,
        course,
        relatedCourses,
        started: !!user,
      });
    }

    res.json({ status: true, course, relatedCourses });
  } catch (err) {
    console.log(err);
  }
});


router.post("/startLearning", async (req, res) => {
  try {
    const { _id, userId } = req.body;

    // Check if user already enrolled in course
    const user = await User.findOne({
      _id: userId,
      "ongoingCourses.courseId": _id,
    });

    if (user) {
      return res.json({ status: true, updatedUse: user });
    }

    // If user not enrolled
    const course = await Course.findById(_id);

    await Course.findByIdAndUpdate(
      _id,
      { $inc: { studentEnrolled: 1 } },
      { new: true }
    );

    // Build user course enrollment object
    const courseData = {
      courseId: course._id,
      examDuration: course.examDuration,  
      courseName: course.title,

      chapters: course.chapters.map((chapter, chapterIndex) => ({
        title: chapter.title,
        isCompleted: false,
        isCurrent: chapterIndex === 0,
        topics: chapter.topics.map((topic, topicIndex) => ({
          name: topic.name,
          content: topic.content,
          videoUrl: topic.videoUrl,
          videoDuration: topic.videoDuration,
          isCompleted: false,
          isCurrent: chapterIndex === 0 && topicIndex === 0,
        })),
        quiz: {
          quizQuestions: chapter.quiz,
          isCompleted: false,
          isCurrent: false,
        },
      })),

      // ⭐ FINAL EXAM FIXED SECTION ⭐
      finalExam: {
        isCurrent: false,
        isCompleted: false,

        questions: course.questions.map((q) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          image: q.image,
          level: q.level,

          // REQUIRED BY GiveExam:
          type: q.type || "objective",
          weightage: q.weightage || 1
        })),

        result: {
          accuracy: null,
          answers: [{}],
        },

        certificate: {
          name: "",
          downloaded: false,
        },
      },
    };

    // Push course into user's ongoingCourses
    const updatedUse = await User.findByIdAndUpdate(
      userId,
      { $push: { ongoingCourses: courseData } },
      { new: true }
    );

    return res.json({ status: true, updatedUse });

  } catch (err) {
    console.log(err);
    res.json({ status: false, msg: "Server error" });
  }
});


router.post("/updateUser", async (req, res) => {
  try {
    const { selectedTopic, courseId, userId } = req.body;
    // console.log(userId);
    // console.log(courseId);
    // console.log(selectedTopic.chapterIndex);
    // console.log(selectedTopic.index);
    const userData = await User.findOne({
      _id: userId,
      "ongoingCourses.courseId": courseId,
    });
    // console.log("User data before update:", JSON.stringify(userData, null, 2));
    await User.updateOne(
      {
        _id: userId,
        "ongoingCourses.courseId": courseId,
      },
      {
        $set: {
          [`ongoingCourses.$[course].chapters.${
            selectedTopic.chapterIndex
          }.topics.${selectedTopic.index + 1}.isCurrent`]: true,
          [`ongoingCourses.$[course].chapters.${
            selectedTopic.chapterIndex
          }.topics.${selectedTopic.index }.isCompleted`]:true
        },
      },
      {
        arrayFilters: [{ "course.courseId": courseId }],
      }
    );
    const userAfterUpdate = await User.findOne({
      _id: userId,
      "ongoingCourses.courseId": courseId,
    });
    // console.log(userAfterUpdate);
    return res.json({ status: true, userAfterUpdate });
  } catch (err) {
    console.log(err);
  }
});

// Replace your existing /fetchuser with this improved version
// Replace /fetchuser with this merged-preserve-progress version
router.post("/fetchuser", async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    // 1) Fetch course and user
    const courseDoc = await Course.findById(courseId);
    if (!courseDoc) {
      return res.status(404).json({ status: false, message: "Course not found" });
    }

    const userDoc = await User.findOne({ _id: userId, "ongoingCourses.courseId": courseId });
    if (!userDoc) {
      return res.status(404).json({ status: false, message: "User not found or course not started" });
    }

    // find user's existing course entry to preserve progress flags
    const existingCourse = userDoc.ongoingCourses.find((c) => c.courseId === courseId);

    // 2) Merge helper: prefer existing flags, otherwise use defaults
    const buildMergedChapters = () => {
      return courseDoc.chapters.map((chapter, i) => {
        const existingChapter = existingCourse?.chapters?.[i];

        const mergedTopics = (chapter.topics || []).map((topic, j) => {
          const existingTopic = existingChapter?.topics?.[j];
          return {
            name: topic.name,
            content: topic.content,
            videoUrl: topic.videoUrl,
            videoDuration: topic.videoDuration || null,
            // preserve existing flags if present, otherwise keep default
            isCompleted: existingTopic?.isCompleted ?? false,
            isCurrent: existingTopic?.isCurrent ?? (i === 0 && j === 0),
          };
        });

        // merge quiz questions content (keep correctAnswer if in course doc)
        const mergedQuizQuestions = (chapter.quiz || []).map((quizItem, qidx) => {
          const existingQuizQ = existingChapter?.quiz?.quizQuestions?.[qidx];
          return {
            question: quizItem.question,
            options: quizItem.options,
            // prefer existing stored correctAnswer only if it exists there,
            // otherwise use the course doc's one (if present)
            correctAnswer: existingQuizQ?.correctAnswer ?? quizItem.correctAnswer ?? null,
          };
        });

        return {
          title: chapter.title,
          isCompleted: existingChapter?.isCompleted ?? false,
          isCurrent: existingChapter?.isCurrent ?? (i === 0),
          topics: mergedTopics,
          quiz: {
            quizQuestions: mergedQuizQuestions,
            isCurrent: existingChapter?.quiz?.isCurrent ?? false,
            isCompleted: existingChapter?.quiz?.isCompleted ?? false,
          },
        };
      });
    };

    // 3) Final exam: preserve result, isCompleted/isCurrent if exist
    const buildMergedFinalExam = () => {
      const existingFinal = existingCourse?.finalExam;
      const mergedFinalQuestions = (courseDoc.questions || []).map((q, idx) => {
        const existingQ = existingFinal?.questions?.[idx];
        return {
          questionText: q.questionText ?? q.question,
          options: q.options ?? [],
          correctAnswer: existingQ?.correctAnswer ?? q.correctAnswer ?? null,
          image: q.image ?? null,
          level: q.level ?? null,
        };
      });

      return {
        isCurrent: existingFinal?.isCurrent ?? false,
        isCompleted: existingFinal?.isCompleted ?? false,
        questions: mergedFinalQuestions,
        // preserve existing result structure if present
        result: existingFinal?.result ?? { answers: [], accuracy: null },
      };
    };

    const newChapters = buildMergedChapters();
    const newFinalExam = buildMergedFinalExam();

    // 4) Update user's ongoingCourses.$ with merged data (chapters + finalExam)
    const userAfterUpdate = await User.findOneAndUpdate(
      { _id: userId, "ongoingCourses.courseId": courseId },
      {
        $set: {
          "ongoingCourses.$.chapters": newChapters,
          "ongoingCourses.$.finalExam": newFinalExam,
        },
      },
      { new: true }
    );

    return res.json({
      status: true,
      message: "Chapters merged and preserved user progress",
      data: userAfterUpdate,
    });
  } catch (err) {
    console.error("Error in /fetchuser:", err);
    return res.status(500).json({ status: false, message: "Server error" });
  }
});




router.post("/openquiz", async (req, res) => {
  try {
    const { userId, courseId, selectedTopic } = req.body;
    await User.updateOne(
      {
        _id: userId,
        "ongoingCourses.courseId": courseId,
      },
      {
        $set: {
          [`ongoingCourses.$[course].chapters.${selectedTopic.chapterIndex}.quiz.isCurrent`]: true,
          [`ongoingCourses.$[course].chapters.${
            selectedTopic.chapterIndex
          }.topics.${selectedTopic.index }.isCompleted`]:true
        },
      },
      {
        arrayFilters: [{ "course.courseId": courseId }],
      }
    );
    const userAfterUpdate = await User.findOne({
      _id: userId,
      "ongoingCourses.courseId": courseId,
    });
    // console.log(userAfterUpdate);
    return res.json({ status: true, userAfterUpdate });
  } catch (err) {
    console.log(err);
  }
});

router.post("/openNextChapter", async (req, res) => {
  try {
    const { chapterIndex, courseId, userId } = req.body;
    await User.updateOne(
      {
        _id: userId,
        "ongoingCourses.courseId": courseId,
      },
      {
        $set: {
          [`ongoingCourses.$[course].chapters.${chapterIndex}.topics.${0}.isCurrent`]: true,
          [`ongoingCourses.$[course].chapters.${chapterIndex-1}.quiz.isCompleted`]: true,
          [`ongoingCourses.$[course].chapters.${chapterIndex-1}.isCompleted`]: true,
        },
      },
      {
        arrayFilters: [{ "course.courseId": courseId }],
      }
    );
    const userAfterUpdate = await User.findOne({
      _id: userId,
      "ongoingCourses.courseId": courseId,
    });
    // console.log(userAfterUpdate);
    return res.json({ status: true, userAfterUpdate });
  } catch (err) {
    console.log(err);
  }
});

router.post("/openFinalExam", async (req, res) => {
  try {
    const { userId, courseId,chapterIndex } = req.body;

    await User.updateOne(
      {
        _id: userId,
        "ongoingCourses.courseId": courseId,
      },
      {
        $set: {
          [`ongoingCourses.$[course].finalExam.isCurrent`]: true,
          [`ongoingCourses.$[course].chapters.${chapterIndex}.quiz.isCompleted`]: true,
          [`ongoingCourses.$[course].chapters.${chapterIndex}.isCompleted`]: true,
        },
      },
      {
        arrayFilters: [{ "course.courseId": courseId }],
      }
    );
    const userAfterUpdate = await User.findOne({
      _id: userId,
      "ongoingCourses.courseId": courseId,
    });
    // console.log(userAfterUpdate);
    return res.json({ status: true, userAfterUpdate });
  } catch (err) {
    console.log(err);
  }
});

router.post("/examData", async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const userAfterUpdate = await User.findOne(
      { _id: userId, "ongoingCourses.courseId": courseId },
      { "ongoingCourses.$": 1 } // Project only the matching element from the array
    );
    const course = userAfterUpdate?.ongoingCourses?.[0]; // Access the specific course
    if (course.finalExam.isCompleted) {
      const answers = Object.fromEntries(course.finalExam.result.answers[0]);
      // console.log(answers);
      const finalExam = course.finalExam;
      const result = finalExam.questions.reduce(
        (acc, question, index) => {
          const userAnswerObj = Object.entries(answers).find(
            ([key, value]) => key === index.toString()
          );
          const userAnswer = userAnswerObj ? userAnswerObj[1] : null; // Get the user's answer (value) or null

          // console.log(userAnswer + "256");
          acc.totalQuestions += 1;

          // Update counters
          if (userAnswer !== null) {
            acc.attempted += 1; // Increment attempted if the question was answered
            if (userAnswer === question.correctAnswer) {
              acc.analyseAnswers.push({
                question: question.questionText,
                yourAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
              });
              acc.correct += 1; // Increment correct count if the answer matches
            } else {
              acc.analyseAnswers.push({
                question: question.questionText,
                yourAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
              });
              acc.wrong += 1; // Increment wrong count otherwise
            }
          } else {
            acc.analyseAnswers.push({
              question: question.text,
              yourAnswer: "Not Attempted",
              correctAnswer: question.correctAnswer,
            });
          }

          return acc;
        },
        {
          totalQuestions: 0,
          correct: 0,
          attempted: 0,
          wrong: 0,
          analyseAnswers: [],
        }
      );

      // console.log(result);
      const {
        totalQuestions,
        correct,
        attempted,
        wrong,
        resultAnswers,
        analyseAnswers,
      } = result;

      // Calculate adjusted accuracy
      const adjustedAccuracy = (correct / totalQuestions) * 100;
      const accuracy = adjustedAccuracy.toFixed(2);
      const accuracies = await User.aggregate([
        { $unwind: "$ongoingCourses" },
        { $match: { "ongoingCourses.courseId": courseId } },
        {
          $project: {
            _id: 0,
            accuracy: "$ongoingCourses.finalExam.result.accuracy",
          },
        },
        { $match: { accuracy: { $ne: null } } }, // Exclude null accuracies
      ]);

      // Sort accuracies to calculate beat percentages
      const sortedAccuracies = accuracies
        .map((a) => a.accuracy)
        .sort((a, b) => a - b);

      const dataPoints = sortedAccuracies.map((accuracy, index) => {
        const lowerAccuracies = index; // Number of students with lower accuracy
        const totalStudents = sortedAccuracies.length;
        const beatPercentage = (lowerAccuracies / totalStudents) * 100;
        return { accuracy, beatPercentage };
      });
      const userAfterUpdate = await User.findOne(
        { _id: userId, "ongoingCourses.courseId": courseId },
        { "ongoingCourses.$": 1 } // Project only the matching element from the array
      );
      // console.log(userAfterUpdate)
      const updatedcourse = userAfterUpdate?.ongoingCourses?.[0]; // Access the specific course
      const updatedData = {
        updatedcourse,
        correct,
        attempted,
        wrong,
        resultAnswers,
        analyseAnswers,
        accuracy,
        totalQuestions,
        dataPoints,
      };
      return res.json({ status: true, updatedData, msg: "found" });
    } else {
      return res.json({ status: true, course, msg: "not found" });
    }
  } catch (err) {
    console.log(err);
  }
});


router.post("/final-exam", async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const userData = await User.findOne(
      { _id: userId, "ongoingCourses.courseId": courseId },
      { "ongoingCourses.$": 1 }
    );

    const course = userData?.ongoingCourses?.[0];

    if (!course) {
      return res.json({ status: false, msg: "course not found" });
    }

    // Prepare GiveExam compatible structure
    const exam = {
      questions: course.finalExam.questions,
      duration: parseInt(course.examDuration ?? 60)
    };

    if (course.finalExam.isCompleted) {
      return res.json({
        status: true,
        msg: "user found",
        exam,
        course,
        result: course.finalExam.result,
        certificate: course.finalExam.certificate
      });
    }

    return res.json({
      status: true,
      msg: "exam found",
      exam
    });

  } catch (err) {
    console.log(err);
    res.json({ status: false, msg: "server error" });
  }
});


router.post("/submit-final-exam", async (req, res) => {
  try {
    const { userId, courseId, userAnswers } = req.body;

    if (!userId || !courseId || !userAnswers) {
      return res.json({ status: false, msg: "Missing required fields" });
    }

    const user = await User.findOne(
      { _id: userId, "ongoingCourses.courseId": courseId },
      { "ongoingCourses.$": 1 }
    );

    if (!user) {
      return res.json({ status: false, msg: "Course not found" });
    }

    const courseData = user.ongoingCourses[0];

    // ❌ If already submitted once
    if (courseData.finalExam.isCompleted) {
      return res.json({
        status: false,
        msg: "Final exam already completed",
        result: courseData.finalExam.result
      });
    }

    const finalExamQuestions = courseData.finalExam.questions;
    const objectiveAnswers = userAnswers.objective || {};
    const subjectiveAnswers = userAnswers.subjective || {};

    let correctCount = 0;
    let attempted = 0;

    // Calculate score only for objective questions
    finalExamQuestions.forEach((question, index) => {
      const qIndex = index.toString();

      if (question.type === "objective") {
        if (objectiveAnswers[qIndex] !== undefined) {
          attempted += 1;
          if (question.options[(objectiveAnswers[qIndex])] === String(question.correctAnswer)) {
            correctCount += 1;
          }
        }
      }
    });

    const totalQuestions = finalExamQuestions.filter(q => q.type === "objective").length;
    const accuracy = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

    // Store results in user document
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, "ongoingCourses.courseId": courseId },
      {
        $set: {
          "ongoingCourses.$.finalExam.isCompleted": true,
          "ongoingCourses.$.finalExam.result.answers": [objectiveAnswers],
          "ongoingCourses.$.finalExam.result.accuracy": accuracy
        }
      },
      { new: true }
    );
    console.log("exam submitted")
    return res.json({
      status: true,
      msg: "Final exam submitted",
      result: {
        accuracy,
        correct: correctCount,
        attempted,
        totalQuestions,
        answers: objectiveAnswers
      },
      updatedCourse: updatedUser.ongoingCourses[0]
    });

  } catch (err) {
    console.log("SUBMIT FINAL EXAM ERROR:", err);
    return res.json({ status: false, msg: "Server error" });
  }
});


router.post("/examresult", async (req, res) => {
  try {
    const { userId, courseId, answers } = req.body;

    const user = await User.findOne(
      { _id: userId, "ongoingCourses.courseId": courseId },
      { "ongoingCourses.$": 1 } // Only retrieve the matching course
    );

    if (!user) {
      throw new Error("User or course not found");
    }

    const course = user.ongoingCourses[0]; // Matching course
    const finalExam = course.finalExam;

    if (!finalExam || !finalExam.questions) {
      throw new Error("Final exam or questions not found");
    }

    // Compare answers and update the result array
    const result = finalExam.questions.reduce(
      (acc, question, index) => {
        const userAnswerObj = Object.entries(answers).find(
          ([key, value]) => key === index.toString()
        );
        const userAnswer = userAnswerObj ? userAnswerObj[1] : null; // Get the user's answer (value) or null

        // console.log(userAnswer + "256");
        acc.totalQuestions += 1;

        // Update counters
        if (userAnswer !== null) {
          acc.attempted += 1; // Increment attempted if the question was answered
          if (userAnswer === question.correctAnswer) {
            acc.analyseAnswers.push({
              question: question.questionText,
              yourAnswer: userAnswer,
              correctAnswer: question.correctAnswer,
            });
            acc.correct += 1; // Increment correct count if the answer matches
          } else {
            acc.analyseAnswers.push({
              question: question.questionText,
              yourAnswer: userAnswer,
              correctAnswer: question.correctAnswer,
            });
            acc.wrong += 1; // Increment wrong count otherwise
          }
        } else {
          acc.analyseAnswers.push({
            question: question.text,
            yourAnswer: "Not Attempted",
            correctAnswer: question.correctAnswer,
          });
        }

        return acc;
      },
      {
        totalQuestions: 0,
        correct: 0,
        attempted: 0,
        wrong: 0,
        analyseAnswers: [],
      }
    );

    // console.log(result);
    const {
      totalQuestions,
      correct,
      attempted,
      wrong,
      resultAnswers,
      analyseAnswers,
    } = result;

    // Calculate adjusted accuracy
    const adjustedAccuracy = (correct / totalQuestions) * 100;
    const accuracy = adjustedAccuracy.toFixed(2);
    const accuracies = await User.aggregate([
      { $unwind: "$ongoingCourses" },
      { $match: { "ongoingCourses.courseId": courseId } },
      {
        $project: {
          _id: 0,
          accuracy: "$ongoingCourses.finalExam.result.accuracy",
        },
      },
      { $match: { accuracy: { $ne: null } } }, // Exclude null accuracies
    ]);

    // Sort accuracies to calculate beat percentages
    const sortedAccuracies = accuracies
      .map((a) => a.accuracy)
      .sort((a, b) => a - b);

    const dataPoints = sortedAccuracies.map((accuracy, index) => {
      const lowerAccuracies = index; // Number of students with lower accuracy
      const totalStudents = sortedAccuracies.length;
      const beatPercentage = (lowerAccuracies / totalStudents) * 100;
      return { accuracy, beatPercentage };
    });
    // Update the result field with the user's answers
    await User.updateOne(
      { _id: userId, "ongoingCourses.courseId": courseId },
      {
        $set: {
          "ongoingCourses.$.finalExam.result.answers": answers,
          "ongoingCourses.$.finalExam.isCompleted": true,
          "ongoingCourses.$.finalExam.result.accuracy": accuracy, // Mark the exam as completed
        },
        $inc: {
          coins: 100, // Increment the coin field by 100
        },
      }
    );

    const userAfterUpdate = await User.findOne(
      { _id: userId, "ongoingCourses.courseId": courseId },
      { "ongoingCourses.$": 1 } // Project only the matching element from the array
    );
    // console.log(userAfterUpdate)
    const updatedcourse = userAfterUpdate?.ongoingCourses?.[0]; // Access the specific course
    const updatedData = {
      updatedcourse,
      correct,
      attempted,
      wrong,
      resultAnswers,
      analyseAnswers,
      accuracy,
      totalQuestions,
      dataPoints,
    };
    return res.json({ status: true, updatedData });
  } catch (err) {
    console.log(err);
  }
});

router.post("/fetchAllComments", async (req, res) => {
  try {
   
    const {user}=req.body;
    const userId=user._id;

    let data = await Course.find({teacher:userId}); 


    if (!data || data.length === 0) {
      return res.json({ status: false, message: "No comments found" });
    }

    return res.json({
      status: true,
      data,
      message: "Comments fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// POST /learn/replyComment
router.post("/replyComment", async (req, res) => {
  try {
    const { courseId, commentIndex, replyText } = req.body;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: false, message: "Course not found" });
    }

    // Find the comment by index
    if (!course.discussion[commentIndex]) {
      return res.status(404).json({ status: false, message: "Comment not found" });
    }

    // Add reply
    course.discussion[commentIndex].reply = {
      text: replyText,
      date: new Date(),
    };

    await course.save();

    res.json({ status: true, message: "Reply added successfully", data: course });
  } catch (err) {
    console.error("Error in replyComment:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});


module.exports = router;
