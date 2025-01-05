const Notification=require("../models/notification");
const User = require('../models/userModel');
const Student=require("../models/studentInternship");
const Internship=require("../models/internship")
const getNotification=async(req,res)=>{
    try{
        const { userId } = req.body;

        // Find the user by ID and retrieve the category from dailyQAndA
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ status:false,message: "User not found" });
        }

        const userCategories = user.dailyLogin?.dailyQAndA?.categories || [];

        if (userCategories.length === 0) {
            return res.json({status:false, message: "No categories found for this user" });
        }

        // Find notifications with at least one matching element in category
        const notifications = await Notification.find({
            category: { $in: userCategories }
        });

        res.json({status:true, notifications });
    }catch(err){
    console.log(err.message)
    }
}

const viewNotification=async(req,res)=>{
    try{
            const {user,_id}=req.body;
            console.log(_id)
            if(user){
             const studentInternship=await Student.find({student:user._id});
             console.log(studentInternship)
             const data= await Internship.findById({_id});
             if(data){
                const currentTime = new Date();
const closingTime = new Date(data.closingTime);

// Check if the current time has passed the closing time
if (currentTime.getTime() >= closingTime.getTime()) {
   return res.json({status:false,message:"This Portal is Closed"})
    // Perform your action here
} else {
    return   res.json({status:true,data,studentInternship});
}
          
              }
              return res.json({status:false,message:"Cannot find Internships"})
            }
         const data= await Internship.findById({_id});
         if(data){
            const currentTime = new Date();
            const closingTime = new Date(data.closingTime);
            
            // Check if the current time has passed the closing time
            if (currentTime.getTime() >= closingTime.getTime()) {
               return res.json({status:false,message:"This Portal is Closed"})
                // Perform your action here
            } else {
                return   res.json({status:true,data});
            }
          }
        
          return res.json({status:false,message:"Cannot find Internships"})
       
    }catch(err){
        console.log(err.message);
    }}

module.exports={getNotification,viewNotification}