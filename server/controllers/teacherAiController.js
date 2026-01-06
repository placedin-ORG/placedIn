const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const generateQuestions = async (req, res) => {
    try {
        const { topic, count, difficulty, type } = req.body;

        if (!topic) {
            return res.status(400).json({ success: false, error: "Topic is required" });
        }

        const numQuestions = Math.min(count || 5, 40);
        const diff = difficulty || "Medium";
        const qType = type || "objective"; // "objective" or "subjective"

        const prompt = `
      You are an expert exam creator. Generate ${numQuestions} ${diff} level ${qType} questions about "${topic}".
      
      Output MUST be a valid JSON array of objects with this exact structure:
      [
        {
          "questionText": "Question string",
          "weightage": 1,
          "level": "${diff}",
          "type": "${qType}",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"], (Required for objective, empty array for subjective)
          "correctAnswer": 0 (Index 0-3 for objective. For subjective, use null or empty string)
        }
      ]

      Rules:
      1. For "objective" type, "options" must have exactly 4 strings. "correctAnswer" must be the integer index (0-3).
      2. For "subjective" type, "options" must be an empty array []. "correctAnswer" must be an empty string "".
      3. Return ONLY valid JSON. No markdown formatting.
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        let questions;
        try {
            questions = JSON.parse(responseText);
        } catch (parseError) {
            console.error("AI JSON Parse Error:", parseError, responseText);
            return res.status(500).json({ success: false, error: "Failed to parse AI response" });
        }

        return res.status(200).json({
            success: true,
            questions
        });

    } catch (error) {
        console.error("Generate Questions Error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

const teacherChat = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, error: "Invalid messages format" });
        }

        const userLastMsg = messages[messages.length - 1].text;

        const systemPrompt = `
            You are an expert educational consultant and assistant for teachers.
            Your goal is to help teachers design curriculums, understand student performance, and create engaging learning content.
            Keep responses professional, encouraging, and focused on pedagogical best practices.
            
            Current conversation history:
            ${messages.map(m => `${m.role}: ${m.text}`).join("\n")}
            
            User: ${userLastMsg}
            
            Provide a helpful response.
        `;

        const result = await model.generateContent(systemPrompt);
        const reply = result.response.text();

        return res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {
        console.error("Teacher Chat Error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = { generateQuestions, teacherChat };
