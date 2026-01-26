const axios = require("axios");
const Course = require("../models/courseModel");
const Internship=require("../models/internship");
const {Exam} = require("../models/ExamModel");

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

    // ---------- KEYWORD EXTRACTION ----------
    const stopWords = ["what", "is", "are", "the", "a", "an", "of", "to", "for"];

    const keywords = userQuestion
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(word => word.length > 2 && !stopWords.includes(word));

    if (keywords.length === 0) {
      return res.status(200).json({
        success: true,
        reply: "Sorry, we don’t have content related to this topic on our platform yet.",
        source: "not-available"
      });
    }

    const regex = new RegExp(keywords.join("|"), "i");

 // ---------- SEARCH INTERNAL CONTENT ----------
    const [courses, internships, exams] = await Promise.all([
      Course.find({
        $or: [{ title: regex }, { courseCategory: regex }]
      }).select("title courseCategory  _id"),

      Internship.find({
        $or: [{ title: regex },{category:regex}]
      }).select("title category _id"),

      Exam.find({
        $or: [{ title: regex }, { category: regex }]
      }).select("title category  _id")
    ]);

    // ---------- PICK BEST MATCHES ----------
    const course = courses[0] || null;
    const internship = internships[0] || null;
    const exam = exams[0] || null;

    // ---------- IF NOTHING FOUND ----------
    if (!course && !internship && !exam) {
      return res.status(200).json({
        success: true,
        reply: "Sorry, we don’t have content related to this topic on our platform yet.",
        source: "not-available"
      });
    }

    // ---------- GEMINI PROMPT ----------
    const geminiPrompt = `
You are an AI learning assistant for our platform.

First, explain the user's question in simple and beginner-friendly terms.

Then, relate the explanation to the internal resources available on our platform.

${course ? `
Course Available:
Title: ${course.title}
Category: ${course.courseCategory}
` : ""}

${internship ? `
Internship Available:
Title: ${internship.title}
Category:${internship.category}
` : ""}

${exam ? `
Exam Available:
Title: ${exam.title}
Category: ${exam.category}
` : ""}

User Question:
${userQuestion}

Rules:
- Start with a clear explanation of the concept
- Then connect it to the available resources
- Do NOT mention external websites
- End by recommending the relevant resources
- Keep the tone educational
`;

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: geminiPrompt }] }]
      }
    );

    const reply =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "We have relevant content available on our platform.";

    return res.status(200).json({
      success: true,
      reply,
      courseLink: course ? `/intro/course/${course._id}` : null,
      internshipLink: internship ? `/internshipDetail/${internship._id}` : null,
      examLink: exam ? `/intro/exam/${exam._id}` : null,
      source: "internal-ai"
    });

  } catch (error) {
    console.error("AI Assistant Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};


module.exports = { aiController };
