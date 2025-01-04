const Course = require("../models/courseModel");
const Internship=require("../models/internship");
const Student=require("../models/studentInternship");
const Job=require("../models/jobs")
const StudentJob=require("../models/studentJob")
const search=async(req,res)=>{
    try{
     const {query}=req.body;
     const courses = await Course.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { courseCategory: { $regex: query, $options: 'i' } },
        ],
      });
  console.log(courses)
      res.json({status:true,courses});
}catch(err){
  console.log(err.message)  
}

}

const internSearch=async(req,res)=>{
  try{
    const {query,user}=req.body;
    if(user){
      const internship = await Internship.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { category: { $elemMatch: { $regex: query, $options: 'i' } } }
        ],
    });
      const studentInternship=await Student.find({student:user._id});
   return   res.json({status:true,internship,studentInternship});
    }
    const internship = await Internship.find({
      $or: [
          { title: { $regex: query, $options: 'i' } },
          { category: { $elemMatch: { $regex: query, $options: 'i' } } }
      ],
  });
 
     res.json({status:true,internship});
}catch(err){
 console.log(err.message)  
}
}

const jobSearch=async(req,res)=>{
  try{
    const {query,user}=req.body;
    if(user){
      const job = await Job.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { category: { $elemMatch: { $regex: query, $options: 'i' } } }
        ],
    });
      const studentJob=await StudentJob.find({student:user._id});
   return   res.json({status:true,job,studentJob});
    }
    const job = await Job.find({
      $or: [
          { title: { $regex: query, $options: 'i' } },
          { category: { $elemMatch: { $regex: query, $options: 'i' } } }
      ],
  });
 
     res.json({status:true,job});
}catch(err){
 console.log(err.message)  
}
}
module.exports={
    search,internSearch,jobSearch
}