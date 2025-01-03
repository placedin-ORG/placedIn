

const mongoose=require("mongoose");

const jobSchema=new mongoose.Schema({
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
    category:{
        type:Array,
        default:[]
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

const job=mongoose.model("Job",jobSchema);
module.exports=job