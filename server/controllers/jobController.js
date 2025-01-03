
const Job=require("../models/jobs");
const Student=require("../models/studentJob");
const { uploadFile } = require("../utils/cloudinary");
const Countinue=require("../models/continuewJob")
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const streamifier=require("streamifier")
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage(); // Store file in memory before uploading to Cloudinary

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, });
const create=async(req,res)=>{
    try{
        const {
            live,
            title,
            description,
            OtherSite,
            whoEligible,
            thumbnail,
            studentDescription,
            companyName,
            companyLogo,
            maximumApplicant,
            closingTime,
            teacherId,
           jobId
          } = req.body;
      
          // Validation
          if (!title || !description || !companyName || !closingTime) {
            return res
              .status(400)
              .json({ message: "Title, description, company name, and closing time are required." });
          }
      
          if (OtherSite && !/^https?:\/\/[\w.-]+$/.test(OtherSite)) {
            return res.status(400).json({ message: "Invalid external application link." });
          }
          let newThumbnail="";
          let newLogo ="";
          if(thumbnail!==null){
             const base64Data1 = thumbnail.split(";base64,").pop(); // Remove metadata
    const buffer1 = Buffer.from(base64Data1, "base64");

    const image = await uploadFile(buffer1, "placedIn/teacher/exam");
     newThumbnail = image.url;
          }
          if(companyLogo!==null){
               const base64Data2 = companyLogo.split(";base64,").pop(); // Remove metadata
    const buffer2 = Buffer.from(base64Data2, "base64");

    const image2 = await uploadFile(buffer2, "placedIn/teacher/exam");
     newLogo = image2.url;
          }
         

 
          // Create a new job document
          if(jobId!==null){
            await Job.findByIdAndUpdate({_id:jobId},{
              live:live || false,
              title,
              description,
              OtherSite,
              whoEligible,
              thumbnail:teacherId!==null?thumbnail:newThumbnail,
              studentDescription:studentDescription || true,
              companyName,
              companyLogo:teacherId!==null?companyLogo:newLogo,
              maximumApplicant:maximumApplicant || 0,
              closingTime,
              teacherId,
            });
            res.status(201).json({ message: "Job updated successfully."});
          }else{
               const newJob = new Job({
            teacherId, 
            live: live || false,
            title,
            description,
            OtherSite,
            whoEligible,
            thumbnail:newThumbnail,
            studentDescription: studentDescription || true,
            companyName,
            companyLogo:newLogo,
            maximumApplicant: maximumApplicant || 0,
            closingTime,
          });
      
          // Save to database
          await newJob.save();
          res.status(201).json({ message: "Job created successfully.", job: newJob });
          }
       
        
    }catch(err){
        console.log(err.message);
    }
}

const get=async(req,res)=>{
  try{
    const {user}=req.body;
    if(user){
     const studentJob=await Student.find({student:user._id});
     const data= await Job.find({});
     if(data){
      return   res.json({status:true,data,studentJob});
      }
    }
 const data= await Job.find({});
 if(data){
  return   res.json({status:true,data})
  }
 if(data){
 return   res.json({status:true,data})
 }
  return res.json({status:false,message:"Cannot find Job"})
  }catch(err){
    console.log(err.meesage);
  }
}

const apply=async(req,res)=>{
  const { studentId, jobId, phoneNumber, location, gender } = req.body;
  const resumeFile = req.file;

  if (!resumeFile) {
    console.log('resumen not foun')
    return res.status(400).json({ message: "Resume is required and must be a PDF or Word document." });
  }

  try {
    // Upload the file to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Pipe the file buffer to Cloudinary
      streamifier.createReadStream(resumeFile.buffer).pipe(uploadStream);
    });

    const resumeUrl = uploadResult.secure_url; // URL of the uploaded file

    // Save application data to the database
    const newApplication = new Student({
      student: studentId,
      job: jobId,
      phoneNumber,
      location,
      Gender:gender,
      resume: resumeUrl, // Store the Cloudinary URL
    });

    await Job.findByIdAndUpdate(
     jobId,
      { $inc: { studentApplied: 1 } } // Increment the 'studentApplied' field
    );

    await newApplication.save();

    return res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication,
    })} catch (error) {
    console.error("Error applying for job:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

const IncreaseView=async(req,res)=>{
  try{
  const {studentId,jobId}=req.body;
 console.log("sfa")
const found=await Countinue.findOne({studentId,jobId});

if(found){
  return ;
}
const addJob=new Countinue({
  studentId,jobId
})
await addJob.save();
console.log(jobId)
await Job.findByIdAndUpdate({_id:jobId},{$inc:{view:1}});
return ;
  }catch(err){
    console.log(err.message)
  }}

  const getForHost=async(req,res)=>{
    try{
     const {teacherId}=req.body;
     const hostJob=await Job.find({teacherId});
     res.json({status:true,hostJob})
    }catch(err){
      console.log(err.message);
    }
  }

  const submitions=async(req,res)=>{
    try{
      const { jobId } = req.body;

      const applications = await Student.find({ job: jobId })
        .populate("student", "email avatar name") // Fetch email, profile photo, and name
        .populate("job");
  
      res.status(200).json(applications);
    }catch(err){
      console.log(err.message);
    }
  }
module.exports={create,get,apply,IncreaseView,getForHost,submitions}