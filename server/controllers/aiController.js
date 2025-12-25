const axios = require("axios");
const Course = require("../models/courseModel");

const aiController = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Messages array is required"
      });
    }

    const userQuestion = messages[messages.length - 1].text;

    function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ");
}

    const stopWords = ["what", "is", "are", "the", "a", "an", "of", "to", "for"];
    const keywords = userQuestion
  .toLowerCase()
  .replace(/[^a-z0-9 ]/g, "")
  .split(" ")
  .filter(word => word.length > 2 && !stopWords.includes(word));

if (keywords.length === 0) {
  keywords.push(userQuestion.toLowerCase());
}

const regex = new RegExp(keywords.join("|"), "i");


    const courses = await Course.find({
      $or: [
        { title: regex },
        { courseCategory: regex }
      ]
    }).select("title courseCategory _id");

   const relevantCourses = courses.filter(course => {
  const courseText = normalize(
    course.title
  );

  let matchCount = 0;

  keywords.forEach(keyword => {
    if (courseText.includes(keyword)) {
      matchCount++;
    }
  });

 
  return matchCount >= 1;
});

    if (relevantCourses.length > 0) {
      const course = relevantCourses[0]; 

      const internalPrompt = `
    You are an AI learning assistant for our platform.

    Use ONLY the following course information to answer the question.

   Course Title:
   ${course.title}

   Course Category:
   ${course.courseCategory}

  User Question:
${userQuestion}

Rules:
- Explain clearly and concisely
- Do NOT mention external websites
- Do NOT say "according to"
- End the response by recommending this course
- Keep the tone educational
`;

      const internalResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: internalPrompt }]
            }
          ]
        }
      );

      const internalText =
        internalResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI";

      return res.status(200).json({
        success: true,
        reply: internalText,
        internalLink: `/intro/course/${course._id}`,
        source: "internal-ai"
      });
    }

const recentMessages = messages.slice(-2);

const contents = recentMessages.map((msg) => ({
  role: msg.role === "user" ? "user" : "model",
  parts: [{ text: msg.text }]
}));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    res.status(200).json({
      success: true,
      reply: text
    });

  } catch (error) {

    if (error.response && error.response.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please wait a moment before trying again.",
        retryAfter: "60 seconds"
      });
    }

    console.error("Gemini API Error:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data?.error?.message || "Internal Server Error",
    });
  }
};

module.exports = { aiController };
