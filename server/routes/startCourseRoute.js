const User=require("../schems/userSchema");
const Course=require("../schems/courseSchema");

const router=require("express").Router();

router.post("/startLearning",async(req,res)=>{
    try{
        const {_id,userId}=req.body;
        console.log(userId)
        const user = await User.findOne({
            _id: userId,
            'ongoingCourses.courseId': _id
          });
      
          if (user) {
            console.log('Course found in user data');
            console.log(user)
            return res.json({status :true,updatedUse:user}); // Course is present
          } else {
            const course = await Course.findById(_id);
            const courseData = {
                courseId: course._id,
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
                    isCurrent: chapterIndex === 0 && topicIndex === 0 // First topic of the first chapter is set to isCurrent: true
                  })),
                  quiz: {
                    quizQuestions:chapter.quiz.map(quizItem => ({
                    question: quizItem.question,
                    options: quizItem.options,
                    correctAnswer: quizItem.correctAnswer,
                 // Set default
                  })),
                  isCompleted:false,
                  isCurrent:false
                  },
                })),
                questions: course.questions.map(question => ({
                  questionText: question.questionText,
                  options: question.options,
                  correctAnswer: question.correctAnswer,
                  image: question.image
                }))
              };
              const updatedUse=await User.findByIdAndUpdate(
                userId,
                {
                  $push: { 'ongoingCourses': courseData }
                },
                { new: true }
              );
              console.log(updatedUse)
          
            return res.json({status:true,updatedUse}); // Course is not present
          }
        
    }catch(err){
        console.log(err);
    }
})


module.exports=router;