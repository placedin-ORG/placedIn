const router = require("express").Router();
const Course=require("../schems/courseSchema")
router.post("/createCourse",async(req,res)=>{
    try{
     const { courseTitle,
        description,
        chapters,
        paid,
        price,
        questions}=req.body;

        const newCourse=new Course({
          paid,
          price,
          title:courseTitle,
          description,
          chapters,
          questions
        })
        await newCourse.save();
        return res.json({status:true})

    }catch(err){
        console.log(err);
    }
})
router.get("/getCourses",async(req,res)=>{
    try{
       const courses=await Course.find();
       res.json({courses})
    }catch(err){
        console.log(err);
    }
})

module.exports = router