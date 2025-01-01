

const mongoose=require("mongoose");

const internshipSchema=new mongoose.Schema({
   teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    live:{
        type:Boolean,
        default:false
    },
    title:{
        type:String,
    },
    description:{
        type:String
    },
    OtherSite:{
        type:String,
    },
    whoEligible:{
        type:String
    },
    thumbnail:{
        type:String
    },
    studentDescription:{
        type:Boolean,
        default:true
    },
    companyName:{
        type:String
    },
    companyLogo:{
        type:String
    },
    maximumApplicant:{
        type:Number
    },
     closingTime:{
        type:Date
     },
     studentApplied:{
        type:Number,
        default:0
     },
     view:{
        type:Number,
        default:0
     }
},{timestamps:true})

const internship=mongoose.model("Internship",internshipSchema);
module.exports=internship