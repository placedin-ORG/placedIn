const Course = require("../models/courseModel");

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
module.exports={
    search
}