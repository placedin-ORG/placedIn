const mongoose=require("mongoose");

const NotificationSchema=new mongoose.Schema({
Ntype:{
type:String
},
message:{
    type:String
},
id:{
    type:String
},
category:{
    type:Array,
    default:[]
},
companyName:{
    type:String
},
companyLogo:{
    type:String
}
},{timestamps:true})

const Notification=mongoose.model('Notification',NotificationSchema);

module.exports=Notification;