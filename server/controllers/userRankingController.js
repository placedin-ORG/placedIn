const User=require("../models/userModel");
const {ExamResult}=require("../models/ExamModel");


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

const leaderboard = async (req, res) => {
  try {
    const { userId } = req.query; // Assume current user's ID is passed in query
    if (!userId) return res.status(400).json({ status: false, message: "User ID is required" });

    // Fetch all users
    const allStudents = await User.find();
    const allRanks = [];

    for (const s of allStudents) {
      // Calculate completed courses
      const completedCoursesCount = s.ongoingCourses.filter(
        (course) => course.finalExam.isCurrent
      ).length;

      // Fetch the exam results for each student
      const studentExamResults = await ExamResult.find({ userId: s._id });
      const resultCount = studentExamResults.length;

      // Compute total score
      const totalScore = completedCoursesCount + resultCount;

      // Determine shield based on total score
      let shield = "Bronze";
      if (totalScore > 30 && totalScore <= 70) {
        shield = "Silver";
      } else if (totalScore > 70 && totalScore <= 100) {
        shield = "Gold";
      }

      // Push student data with score and shield
      allRanks.push({
        userId: s._id,
        username: s.name, // Assuming 'username' is a field in User schema
        totalScore,
        shield,
      });
    }

    // Sort the leaderboard by total score in descending order
    allRanks.sort((a, b) => b.totalScore - a.totalScore);

    // Add rank positions
    const leaderboardData = allRanks.map((student, index) => ({
      position: index + 1,
      userId: student.userId,
      username: student.username,
      shield: student.shield,
      totalScore: student.totalScore,
    }));

    // Find current user's rank
    const currentUserRank = leaderboardData.find((student) => student.userId.toString() === userId);

    res.json({
      status: true,
      leaderboard: leaderboardData,
      currentUserRank: currentUserRank || null, // Return null if the user is not found
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ status: false, message: "Server error" });
  }
};


module.exports={
    ranking,
    leaderboard
}