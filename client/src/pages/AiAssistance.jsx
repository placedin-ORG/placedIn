import React, { useState, useEffect, useRef } from "react";
import API from "../utils/API";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";



const AiAssistance = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || cooldown) return;
   
  setCooldown(true);
  setTimeout(() => setCooldown(false), 5000); 

    setMessages((prev) => [
      ...prev,
      { role: "user", text: input }
    ]);

    setLoading(true);
    setInput("");

    try {
      const response = await API.post("/ai", {
  messages: [
    ...messages,
    { role: "user", text: input }
  ]
});

     setMessages((prev) => [
  ...prev,
  {
    role: "ai",
    text: response.data.reply,
    courseLink: response.data.courseLink || null,
    internshipLink:response.data.internshipLink || null,
    examLink:response.data.examLink||null,
    source: response.data.source || "gemini"
  }
]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ AI is temporarily unavailable. Please try again later."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-full max-w-4xl mx-auto bg-white shadow-md">

        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-semibold">🤖 AI Learning Assistant</h1>
          <p className="text-sm text-gray-500">
            Ask questions to understand concepts better
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <p className="text-gray-400 text-center mt-10">
              Start by asking a question...
            </p>
          )}

         {messages.map((msg, index) => (
  <div
    key={index}
    className={`flex ${
      msg.role === "user" ? "justify-end" : "justify-start"
    }`}
  >
    {msg.role === "ai" ? (
      msg.source === "not-available" ? (
        <div className="max-w-[75%] px-5 py-4 rounded-xl bg-gray-100 text-gray-600 text-sm">
          ❌ Sorry, we don’t have content related to this topic on our platform yet.
        </div>
      ) : (
        <div className="max-w-[75%] px-5 py-4 rounded-xl bg-gray-100 text-gray-800">
          <div
            className="
              prose prose-sm max-w-none
              prose-headings:font-semibold
              break-words
            "
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
              {msg.text}
            </ReactMarkdown>

           {msg.courseLink && (
  <Link to={msg.courseLink} className="block text-blue-600 text-sm mt-2">
    📘 View related course
  </Link>
)}

{msg.internshipLink && (
  <Link to={msg.internshipLink} className="block text-green-600 text-sm mt-1">
    💼 View related internship
  </Link>
)}

{msg.examLink && (
  <Link to={msg.examLink} className="block text-purple-600 text-sm mt-1">
    📝 View related exam
  </Link>
)}
          </div>
        </div>
      )
    ) : (
      <div className="max-w-[75%] px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
        {msg.text}
      </div>
    )}
  </div>
))}


          {loading && (
            <div className="text-sm text-gray-400">
              🤖 AI is thinking...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Box */}
        <div className="border-t px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything to learn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={handleSend}
               disabled={loading || cooldown}
              className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            >
              Ask
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-center">
            AI responses may be incorrect. Always verify important information.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AiAssistance;
