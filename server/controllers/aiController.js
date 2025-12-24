const axios = require("axios");

const aiController = async (req, res) => {
  try {
    const { messages } = req.body;
    console.log("MY MESSAGE",messages);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Messages array is required"
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
