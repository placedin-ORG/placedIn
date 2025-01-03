const mongoose=require('mongoose');

const studentJob=new mongoose.Schema({
 student:{
               type: mongoose.Schema.Types.ObjectId,
           ref: "User",
           required: true,
     },
     resume:{
        type:String
     },
     job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true
     },
     phoneNumber:{
      type:Number
     },
     location:{
      type:String
     },
     Gender:{
      type:String
     }
},{timestamps:true})
const studentJobs=mongoose.model("StudentJob",studentJob);

module.exports=studentJobs