const mongoose=require("mongosse");

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
}
},{timestamp:true})

const Notification=mongoose.model('Notification',NotificationSchema);

module.exports=Notification;