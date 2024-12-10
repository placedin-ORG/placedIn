const router = require("express").Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyCLgsSfQhcXZdUj9inr7n6fB0E5DZpHK0w'); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const User=require('../models/userModel');
const generateQuizFromContent = async (content) => {
    const prompt = `
Given the following content, generate 5 multiple-choice questions. Each question should have 4 answer options: one correct answer and three incorrect ones. Clearly label the correct answer.

Content:
${content}

Instructions:
- Do not provide any explanations or additional text.
- Output only the questions and answer options in this format:
- give me the output at any cost and you can leave some topic to fit in five question
1. [Question]
   a) Option 1
   b) Option 2
   c) Option 3
   d) Option 4
   correctAnswer: [Label]
`;

  
  
    try {
      const result = await model.generateContent(prompt);
      const questions = result.response.text();
  
      return { success: true, questions: questions };
    } catch (error) {
      console.error('Error generating quiz from Gemini AI:', error);
      return { success: false, message: error.message };
    }
  };
  function parseQuizToQuestionsArray(quizString) {
    if (typeof quizString !== 'string') {
      throw new TypeError('Expected a string input for parsing questions');
    }
  
    // Split quiz into question blocks by splitting at double newlines
    const questionBlocks = quizString.split(/\n\n+/);
    const questionsArray = [];
  
    questionBlocks.forEach((block) => {
      const lines = block.split('\n').filter((line) => line.trim() !== '');
  
      if (lines.length > 0) {
        const questionText = lines[0].trim();
        const options = lines.slice(1, 5).map((opt) => opt.trim()); // Next 4 lines are options
  
        // More robust check for correct answer line
        const correctAnswerLine = lines.find((line) => line.trim().startsWith('correctAnswer:'));
        const correctAnswer = correctAnswerLine ? correctAnswerLine.split(':').slice(1).join(':').trim() : null;
  
        if (options.length === 4 && correctAnswer) {
          questionsArray.push({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer
          });
        }
      }
    });
  
    return questionsArray;
  }
  
  
router.post("/generate-quiz", async (req, res) => {
   
        const { content } = req.body;
    
    try {
      // Assume `generateQuizContent` generates the quiz in string format
      const generatedContent = await generateQuizFromContent(content);
      console.log(generatedContent);
      
      // Parse the generated content into an array of questions
      // Ensure that `generatedContent.questions` is a string
      if (typeof generatedContent.questions === 'string') {
        const questions = parseQuizToQuestionsArray(generatedContent.questions);
       
        res.json({ success: true, questions });
      } else {
        console.error('Error: The questions property is not a string.');
      }
    
    } catch (err) {
        console.error('Error generating quiz:', err);
        res.status(500).json({ success: false, message: 'Failed to generate quiz' });
    }
  });


  const generateDailyQuizFromContent = async (content,already) => {
    // Randomly select one category
    const randomCategory = content[Math.floor(Math.random() * content.length)];
    
    const prompt = `
    Given the following content, generate 1 multiple-choice question. The question should have 4 answer options: one correct answer and three incorrect ones. Clearly label the correct answer.
    
    Content:
    ${randomCategory}
    
    Already generated questions:
    ${already.join('\n')}
    
    Instructions:
    - Do not repeat any question from the "Already generated questions."
    - Do not provide any explanations or additional text.
    - Output only the questions and answer options in this format:
    1. Question
       a) Option 1
       b) Option 2
       c) Option 3
       d) Option 4
       correctAnswer: [Label]
    `;
    

    try {
        const result = await model.generateContent(prompt);
        const questions = result.response.text();
        console.log(questions); // Assuming `response.text()` returns the question as a string
        return { success: true, questions };
    } catch (error) {
        console.error('Error generating quiz from Gemini AI:', error);
        return { success: false, message: error.message };
    }
};

function parseQuizToQuestionsArrayDaily(quizString) {
  if (typeof quizString !== 'string') {
      throw new TypeError('Expected a string input for parsing questions');
  }

  // Split quiz into question blocks
  const questionBlocks = quizString.split(/\n\n+/);
  const questionsArray = [];

  questionBlocks.forEach((block) => {
      const lines = block.split('\n').filter((line) => line.trim() !== '');

      if (lines.length > 0) {
          const questionText = lines[0].trim();
          const options = lines.slice(1, 5).map((opt) => opt.trim()); // Next 4 lines are options

          // Extract the correct answer
          const correctAnswerLine = lines.find((line) => line.trim().startsWith('correctAnswer:'));
          const correctAnswer = correctAnswerLine ? correctAnswerLine.split(':').slice(1).join(':').trim() : null;

          if (options.length === 4 && correctAnswer) {
              questionsArray.push({
                  question: questionText,
                  options,
                  correctAnswer
              });
          }
      }
  });

  return questionsArray;
}
router.post("/generate",async(req,res)=>{
  try {
    
    const {content,already}=req.body
    // Fetch all users
    const generatedContent =  await generateDailyQuizFromContent(content,already)
    if (typeof generatedContent.questions === 'string') {
      const questions = parseQuizToQuestionsArrayDaily(generatedContent.questions);
     
      res.json({ success: true, questions });
    } else {
      console.error('Error: The questions property is not a string.');
    }
  
  } catch (error) {
    console.error("Error resetting daily login:", error);
  }
})
  
router.post("/submit-daily",async(req,res)=>{
  try{
   const {userId,selectedOption}=req.body;
   const user = await User.findById(userId);
   user.dailyLogin.dailyQAndA.yourAnswer=selectedOption;
   user.dailyLogin.dailyQAndA.completed=true
   await user.save();
   res.json({status:true,daily:user.dailyLogin.dailyQAndA})

  }catch(err){
    console.log(err.message)
  }})

  router.post("/getCategories",async(req,res)=>{
    try{
   const {userId}=req.body;
   const user=await User.findById(userId);
  console.log(user.dailyLogin.dailyQAndA.categories)
   res.json({status:true,daily:user.dailyLogin.dailyQAndA.categories})
    }catch(err){
      console.log(err.message)
    }
  })

  router.post("/putCategories",async(req,res)=>{
    try{
      const {userId,amenities}=req.body;

      const user=await User.findById(userId);
      user.dailyLogin.dailyQAndA.categories=amenities;

      await user.save();
      res.json({status:true});
    }catch(err){
      console.log(err.message)
    }
  })
  module.exports = router