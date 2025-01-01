const mongoose=require('mongoose');

const studentInternship=new mongoose.Schema({
 student:{
               type: mongoose.Schema.Types.ObjectId,
           ref: "User",
           required: true,
     },
     resume:{
        type:String
     },
     internship:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Internship",
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
const studentIntern=mongoose.model(studentInternship);

module.exports=studentIntern