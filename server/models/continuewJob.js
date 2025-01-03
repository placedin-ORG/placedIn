const mongoose=require("mongoose")
const continueJob=new mongoose.Schema({
 studentId:{
    type: mongoose.Schema.Types.ObjectId,
             ref: "User",
             required: true,
 },
 jobId:{
      type:mongoose.Schema.Types.ObjectId,
            ref:"Job",
            required:true
 }
},{timestamps:true});

const ContinueJob= mongoose.model("ContinueJob",continueJob);
module.exports=ContinueJob;