const router = require("express").Router();
const Course=require("../schems/courseSchema")
const cloudinary=require("cloudinary")
router.post("/createCourse",async(req,res)=>{
    try{

        const {
            courseTitle,
            description,
            chapters,
            price,
            questions,
            courseCategory,
            id,
            setLive,
            courseThumbnail
          } = req.body;
          const myCloud = await cloudinary.v2.uploader.upload(courseThumbnail, {
            folder: "avatars",
            width: 150,
            crop: "scale",
          });
          if (id) {
            // Update existing course if `id` is provided
           await Course.findByIdAndUpdate(
              id,
              {
                title: courseTitle,
                description,
                chapters,
                price,
                questions,
                courseCategory,
                setLive,
                courseThumbnail:myCloud.url
              },
              { new: true } // Return the updated document
            );
      
      
            return res.json({ status: true });
          } else {
            // Create a new course if `id` is not provided
            const newCourse = new Course({
              title: courseTitle,
              description,
              chapters,
              price,
              questions,
              courseCategory,
              setLive,
              courseThumbnail:myCloud.url
            });
      
            await newCourse.save();
            return res.json({ status: true, message: "Course created successfully", course: newCourse });
          }
    }catch(err){
        console.log(err);
    }
})

router.post ("/laterCourse",async(req,res)=>{
  try{
    try{
      const {
          courseTitle,
          description,
          chapters,
          price,
          questions,
          courseCategory,
          id,
          setLive,
          courseThumbnail
        } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(courseThumbnail, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
        if (id) {
          // Update existing course if `id` is provided
         await Course.findByIdAndUpdate(
            id,
            {
              title: courseTitle,
              description,
              chapters,
              price,
              questions,
              courseCategory,
              setLive,
              courseThumbnail:myCloud.url
            },
            { new: true } // Return the updated document
          );
    
    
          return res.json({ status: true });
        } else {
          // Create a new course if `id` is not provided
          const newCourse = new Course({
            title: courseTitle,
            description,
            chapters,
            price,
            questions,
            courseCategory,
            courseThumbnail:myCloud.url
          });
    
          await newCourse.save();
          return res.json({ status: true, message: "Course created successfully", course: newCourse });
        }
  }catch(err){
      console.log(err);
  }
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