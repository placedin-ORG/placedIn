import React, { useState } from "react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How can I change my profile name?",
      answer:
        "To change your profile name, go to the 'Edit Profile' page and navigate to the Accounts section. Click on the Edit button, enter your new profile name, and click 'Update' to save the changes.",
    },
    {
      question:
        "Why am I seeing a yellow warning and unable to fetch my profile handle?",
      answer:
        "The yellow warning indicates a connectivity issue. Please check your internet connection or try refreshing the page.",
    },
    {
      question: "Which coding platforms are supported?",
      answer:
        "We support Codeforces, LeetCode, CodeChef, and HackerRank for coding challenges and competitions.",
    },
    {
      question: "What types of tests are available?",
      answer:
        "We provide mock tests, topic-wise tests, and previous year papers for various competitive exams.",
    },
    {
      question: "What is the refund policy?",
      answer:
        "You can request a refund within 7 days of purchase if you are not satisfied with the course or service.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="px-4 py-16 sm:px-8 md:px-16 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="pb-4 border-b border-gray-300">
            {/* Question */}
            <div
              className="flex items-center justify-between p-2 font-medium cursor-pointer sm:text-lg"
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-[500] text-lg">{faq.question}</span>
              <span
                className={`text-gray-900 dark:text-darkText-500 transform transition-transform ${
                  activeIndex === index ? "rotate-90" : "rotate-0"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path
                    d={
                      activeIndex === index
                        ? "M128 224a8 8 0 0 1-8-8V40a8 8 0 0 1 16 0v176A8 8 0 0 1 128 224z"
                        : "M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"
                    }
                  ></path>
                </svg>
              </span>
            </div>

            {/* Answer */}
            <div
              className={`px-2 overflow-hidden dark:text-darkText-500 transition-all duration-300 ${
                activeIndex === index
                  ? "opacity-100 max-h-screen"
                  : "opacity-0 max-h-0"
              }`}
              style={{
                willChange: "opacity, transform",
              }}
            >
              <p className="p-2 text-gray-700 text-base">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
