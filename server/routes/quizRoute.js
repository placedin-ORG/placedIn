const router = require("express").Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyBBBaZ58MqJjDdPNhwCGKqlDyFepGRit8g'); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
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
        console.log(questions);
        res.json({ success: true, questions });
      } else {
        console.error('Error: The questions property is not a string.');
      }
    
    } catch (err) {
        console.error('Error generating quiz:', err);
        res.status(500).json({ success: false, message: 'Failed to generate quiz' });
    }
  });

  module.exports = router