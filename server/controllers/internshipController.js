
const Internship=require("../models/internship");
const Student=require("../models/studentInternship");

const { uploadFile } = require("../utils/cloudinary");
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
            teacherId
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
          const base64Data1 = thumbnail.split(";base64,").pop(); // Remove metadata
    const buffer1 = Buffer.from(base64Data1, "base64");

    const image = await uploadFile(buffer1, "placedIn/teacher/exam");
    const newThumbnail = image.url;

    const base64Data2 = companyLogo.split(";base64,").pop(); // Remove metadata
    const buffer2 = Buffer.from(base64Data2, "base64");

    const image2 = await uploadFile(buffer2, "placedIn/teacher/exam");
    const newLogo = image2.url;
          // Create a new internship document
          const newInternship = new Internship({
            teacherId, // Assuming teacher ID is from authenticated user
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
          await newInternship.save();
          res.status(201).json({ message: "Internship created successfully.", internship: newInternship });
    }catch(err){
        console.log(err.message);
    }
}

const get=async(req,res)=>{
  try{
    const {user}=req.body;
    if(user){
     const studentInternship=await Student.find({internship:user._id});
     const data= await Internship.find({});
     if(data){
      return   res.json({status:true,data,studentInternship});
      }
    }
 const data= await Internship.find({});
 if(data){
  return   res.json({status:true,data})
  }
 if(data){
 return   res.json({status:true,data})
 }
  return res.json({status:false,message:"Cannot find Internships"})
  }catch(err){
    console.log(err.meesage);
  }
}

module.exports={create,get}