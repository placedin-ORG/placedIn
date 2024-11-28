const User = require("../models/userModel");
const Course = require("../models/courseModel");

const router = require("express").Router();
router.post("/fetchCourse", async (req, res) => {
  try {
    const { id,userId } = req.body;
    const course = await Course.findOne({
      _id: id,

    });
    if(userId!==null){
 const user = await User.findOne({
      _id: userId,
      'ongoingCourses.courseId': id, // Check if courseId exists in the ongoingCourses array of objects
    });
   return  res.json({ status: true, course,relatedCourses,started:!!user });
    }
   
    
   
    const relatedCourses = await Course.find({
      category: course.category,
      _id: { $ne: id }, // Exclude the course itself
    });
    res.json({ status: true, course,relatedCourses });
  } catch (err) {
    console.log(err);
  }
});
router.post("/startLearning", async (req, res) => {
  try {
    const { _id, userId } = req.body;
    console.log(userId);
    const user = await User.findOne({
      _id: userId,
      "ongoingCourses.courseId": _id,
    });

    if (user) {
      console.log("Course found in user data");
      console.log(user);
      return res.json({ status: true, updatedUse: user }); // Course is present
    } else {
      const course = await Course.findById(_id);
       await Course.findByIdAndUpdate(
        _id,
        { $inc: { studentEnrolled: 1 } }, // MongoDB $inc operator
        { new: true } // Return the updated document
      );
      const courseData = {
        courseId: course._id,
        examDuration:course.examDuration,
        courseName: course.title,
        chapters: course.chapters.map((chapter, chapterIndex) => ({
          title: chapter.title,
          isCompleted: false, // Set default
          isCurrent: chapterIndex === 0, // First chapter is set to isCurrent: true
          topics: chapter.topics.map((topic, topicIndex) => ({
            name: topic.name,
            content: topic.content,
            videoUrl: topic.videoUrl,
            isCompleted: false, // Set default
            isCurrent: chapterIndex === 0 && topicIndex === 0, // First topic of the first chapter is set to isCurrent: true
          })),
          quiz: {
            quizQuestions: chapter.quiz.map((quizItem) => ({
              question: quizItem.question,
              options: quizItem.options,
              correctAnswer: quizItem.correctAnswer,
              // Set default
            })),
            isCompleted: false,
            isCurrent: false,
          },
        })),
        finalExam: {
          isCurrent: false,
          isCompleted: false,
          questions: course.questions.map((question) => ({
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.correctAnswer,
            image: question.image,
          })),
        },
      };
      const updatedUse = await User.findByIdAndUpdate(
        userId,
        {
          $push: { ongoingCourses: courseData },
        },
        { new: true }
      );
      console.log(updatedUse);

      return res.json({ status: true, updatedUse }); // Course is not present
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/updateUser", async (req, res) => {
  try {
    const { selectedTopic, courseId, userId } = req.body;
    console.log(userId);
    console.log(courseId);
    console.log(selectedTopic.chapterIndex);
    console.log(selectedTopic.index);
    const userData = await User.findOne({
      _id: userId,
      "ongoingCourses.courseId": courseId,
    });
    console.log("User data before update:", JSON.stringify(userData, null, 2));
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
    console.log(userAfterUpdate);
    return res.json({ status: true, userAfterUpdate });
  } catch (err) {
    console.log(err);
  }
});

router.post("/fetchuser", async (req, res) => {
  const { userId, courseId } = req.body;
  const data = await User.findOne({
    _id: userId,
    "ongoingCourses.courseId": courseId,
  });
  res.json({ status: true, data });
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
    console.log(userAfterUpdate);
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
    console.log(userAfterUpdate);
    return res.json({ status: true, userAfterUpdate });
  } catch (err) {
    console.log(err);
  }
});

router.post("/openFinalExam", async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    await User.updateOne(
      {
        _id: userId,
        "ongoingCourses.courseId": courseId,
      },
      {
        $set: {
          [`ongoingCourses.$[course].finalExam.isCurrent`]: true,
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
    console.log(userAfterUpdate);
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
      console.log(answers);
      const finalExam = course.finalExam;
      const result = finalExam.questions.reduce(
        (acc, question, index) => {
          const userAnswerObj = Object.entries(answers).find(
            ([key, value]) => key === index.toString()
          );
          const userAnswer = userAnswerObj ? userAnswerObj[1] : null; // Get the user's answer (value) or null

          console.log(userAnswer + "256");
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

      console.log(result);
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
        dataPoints
      };
      return res.json({ status: true, updatedData, msg: "found" });
    } else {
      return res.json({ status: true, course, msg: "not found" });
    }
  } catch (err) {
    console.log(err);
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

        console.log(userAnswer + "256");
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

    console.log(result);
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
module.exports = router;
