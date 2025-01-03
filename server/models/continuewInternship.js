const mongoose=require("mongoose")
const continueIntern=new mongoose.Schema({
 studentId:{
    type: mongoose.Schema.Types.ObjectId,
             ref: "User",
             required: true,
 },
 internshipId:{
      type:mongoose.Schema.Types.ObjectId,
            ref:"Internship",
            required:true
 }
},{timestamps:true});

const ContinueIntern= mongoose.model("ContinueIntern",continueIntern);
module.exports=ContinueIntern;