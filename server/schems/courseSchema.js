const mongoose=require("mongoose")
const courseSchema = new mongoose.Schema({
  paid:{
    type:Boolean,
    default:false
  },
  price:{
    type:Number,
    default:0
  },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'live'], default: 'pending' },
    chapters: [
      {
        title: { type: String, required: true },
        topics: [{ name:{type:String},videoUrl:{type:String},content:{type:String} }],
        quiz:[{
          question:{type:String},
          options:[String],
          correctAnswer:{type:String}
        }]
      }
    ],

      questions: [
        {
          questionText: { type: String, required: true },
          options: [{ type: String, required: true }],
          correctAnswer: { type: String, required: true },
          image: { type: String } // Optional for image-based questions
        }
      ]
 ,
    sponsoredBy: { type: String }, // e.g., 'Google', 'Facebook'
    isSponsored: { type: Boolean, default: false }
  });

  const Course = mongoose.model("courseSchema", courseSchema )
  module.exports = Course