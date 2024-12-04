const Course = require("../models/courseModel");
const { Exam } = require("../models/ExamModel");

const getTeacherProfileStats = async (req, res) => {
  try {
    // Exams
    const teacherExams = await Exam.find({ teacher: req.user._id });
    const totalExams = teacherExams.length;
    const totalEnrolledStudentsExams = teacherExams.reduce(
      (total, exam) => total + (exam.enrolledStudents?.length || 0),
      0
    );

    // Course

    const teacherCourses = await Course.find({ teacher: req.user._id });
    const totalCourses = teacherCourses.length;
    const totalEnrolledStudentsCourses = teacherCourses.reduce(
      (total, course) => total + (course.studentEnrolled || 0),
      0
    );

    return res.status(200).json({
      success: true,
      data: {
        totalEnrolledStudentsExams,
        totalCourses,
        totalExams,
        totalEnrolledStudentsCourses,
      },
      message: "Successfully retrieved teacher profile stats",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve purchase info",
      error: error.message,
    });
  }
};

const getTeacherChartStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Fetch Exams and Courses for the Teacher
    const exams = await Exam.find({ teacher: teacherId });
    const courses = await Course.find({ teacher: teacherId });

    // Helper function to group data by month
    const groupByMonth = (data, dateField) => {
      return data.reduce((acc, item) => {
        const date = new Date(item[dateField]);
        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`; // Format: MM-YYYY
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {});
    };

    // 1. Month-wise data for exams
    const examEnrollments = exams.flatMap(
      (exam) => exam.enrolledStudents || []
    );
    const monthWiseExamData = groupByMonth(examEnrollments, "enrolledAt");

    // 2. Month-wise data for courses
    const courseEnrollments = courses.flatMap(
      (course) => course.enrolledAt || []
    );
    const monthWiseCourseData = groupByMonth(courseEnrollments, "enrolledAt");

    // 3. Exam-wise data
    const examWiseData = exams.map((exam) => ({
      examId: exam._id,
      examTitle: exam.examTitle,
      totalEnrolled: exam.enrolledStudents.length,
    }));

    // 4. Course-wise data
    const courseWiseData = courses.map((course) => ({
      courseId: course._id,
      courseTitle: course.title,
      totalEnrolled: course.studentEnrolled || 0,
    }));

    // Combine and return the response
    return res.status(200).json({
      success: true,
      data: {
        monthWiseExamData,
        monthWiseCourseData,
        examWiseData,
        courseWiseData,
      },
      message: "Successfully retrieved teacher chart stats",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve chart stats",
      error: error.message,
    });
  }
};

module.exports = {
  getTeacherProfileStats,
  getTeacherChartStats,
};
