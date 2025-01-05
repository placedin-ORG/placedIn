
const Internship=require("../models/internship");
const Student=require("../models/studentInternship");
const { uploadFile } = require("../utils/cloudinary");
const Countinue=require("../models/continuewInternship")
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const streamifier=require("streamifier");
const Notification=require("../models/notification")
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage(); // Store file in memory before uploading to Cloudinary

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, });

const allInternship=async(req,res)=>{
  try{
   const internships=await Internship.find({});
   if(internship){
    return res.json({status:true,internships});
   }
   return res.json({status:false,message:"cannot get internship"});
  }catch(err){
    console.log(err);
  }
}
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
            internshipId,
            category
          } = req.body;
      
          // Validation
          if (!title || !description || !companyName || !closingTime) {
            return res
              .status(400)
              .json({ message: "Title, description, company name, and closing time are required." });
          }
         console.log(OtherSite)
          if (OtherSite && !/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/
.test(OtherSite)) {
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
         

 
          // Create a new internship document
          if(internshipId!==null){
            await Internship.findByIdAndUpdate({_id:internshipId},{
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
              category
            });
            res.status(201).json({ message: "Internship updated successfully."});
          }else{
               const newInternship = new Internship({
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
            category
          });
          // Save to database
          const internNotification=await newInternship.save();
          await Notification.create({
            type:"internship",
            message:`is Hiring for internship, for the role of ${title} check now...`,
            id:internNotification._id,
            companyName,
            companyLogo:newLogo,
            category:category
          })
          console.log(internNotification)
          res.status(201).json({ message: "Internship created successfully.", internship: newInternship });
          }
       
        
    }catch(err){
        console.log(err.message);
    }
}

const get=async(req,res)=>{
  try{
    const {user}=req.body;
    if(user){
     const studentInternship=await Student.find({student:user._id});
     const data= await Internship.find({});
     if(data){
      return   res.json({status:true,data,studentInternship});
      }
    }
 const data= await Internship.find({});
 if(data){
  return   res.json({status:true,data})
  }

  return res.json({status:false,message:"Cannot find Internships"})
  }catch(err){
    console.log(err.meesage);
  }
}

const apply=async(req,res)=>{
  const { studentId, internshipId, phoneNumber, location, gender } = req.body;
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
      internship: internshipId,
      phoneNumber,
      location,
      Gender:gender,
      resume: resumeUrl, // Store the Cloudinary URL
    });

    await Internship.findByIdAndUpdate(
      internshipId,
      { $inc: { studentApplied: 1 } } // Increment the 'studentApplied' field
    );

    await newApplication.save();

    return res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication,
    })} catch (error) {
    console.error("Error applying for internship:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

const IncreaseView=async(req,res)=>{
  try{
  const {studentId,internshipId}=req.body;
 console.log("sfa")
const found=await Countinue.findOne({studentId,internshipId});

if(found){
  return ;
}
const addInternship=new Countinue({
  studentId,internshipId
})
await addInternship.save();
console.log(internshipId)
await Internship.findByIdAndUpdate({_id:internshipId},{$inc:{view:1}});
return ;
  }catch(err){
    console.log(err.message)
  }}

  const getForHost=async(req,res)=>{
    try{
     const {teacherId}=req.body;
     const hostIntern=await Internship.find({teacherId});
     res.json({status:true,hostIntern})
    }catch(err){
      console.log(err.message);
    }
  }

  const submitions=async(req,res)=>{
    try{
      const { internshipId } = req.body;

      const applications = await Student.find({ internship: internshipId })
        .populate("student", "email avatar name") // Fetch email, profile photo, and name
        .populate("internship");
  
      res.status(200).json(applications);
    }catch(err){
      console.log(err.message);
    }
  }
module.exports={create,get,apply,IncreaseView,getForHost,submitions,allInternship}