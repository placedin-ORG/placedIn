const User=require("../models/userModel");
const {ExamResult}=require("../models/ExamModel")
const ranking=async(req,res)=>{
    try{

        const { userId } = req.body;

        // Fetch the current student's data
        const student = await User.findById(userId);
        if (!student) {
          return res.json({ status: false, message: "Student not found" });
        }
    
        // Calculate completed courses for the current student
        const completedCoursesCount = student.ongoingCourses.filter(
          (course) => course.finalExam.isCurrent
        ).length;
    
        // Fetch the current student's exam results
        const results = await ExamResult.find({ userId: userId });
        const resultCount = results.length;
    
        // Compute the current student's score
        const currentStudentScore = completedCoursesCount + resultCount;
    
        // Fetch all users for ranking
        const allStudents = await User.find();
        const allRanks = [];
    
        for (const s of allStudents) {
          const studentCompletedCourses = s.ongoingCourses.filter(
            (course) => course.finalExam.isCurrent
          ).length;
    
          const studentExamResults = await ExamResult.find({ userId: s._id });
          const studentResultCount = studentExamResults.length;
    
          // Compute the score for each student
          const score = studentCompletedCourses + studentResultCount;
    
          allRanks.push({ userId: s._id, score });
        }
    
        // Sort students by score in descending order
        allRanks.sort((a, b) => b.score - a.score);
    
        // Find the rank of the current student
        const rank = allRanks.findIndex((r) => r.userId.toString() === userId) + 1;
    
        res.json({
          status: true,
          completedCoursesCount,
          resultCount,
          rank,
        });
    }catch(err){
        console.log(err.message)
    }
}

module.exports={
    ranking
}