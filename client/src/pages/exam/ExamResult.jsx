import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import API from "../../utils/API";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Layout/Footer";
import parse from "html-react-parser";
import { Link } from "react-router-dom";
const ExamResult = ({ ExamId, userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.post("/exam/speceficExam", {
          ExamId,
          userId,
        });
        setData(response.data);
        console.log(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam data:", error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [ExamId, userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        No data found.
      </div>
    );
  }

  const { user, exam, rank } = data;

  return (
    <div className="min-h-screen grainy-light">
      <Navbar />

      {exam.publishResult ? (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-100 p-6 flex items-center justify-center">
          <motion.div
            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-7xl"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-xl md:text-3xl font-extrabold text-center mb-2 text-green-700">
              {exam ? exam.examTitle : "Exam Results"}
            </h1>

            {user ? (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                  Your Answers{" "}
                  <span
                    className={
                      rank === 1 || 2 || 3 ? "text-yellow-500" : "text-red-500"
                    }
                  >
                    # {rank}
                  </span>
                </h2>

                {/* Scrollable List of Answers */}
                <ul className="space-y-6 overflow-y-auto max-h-96 pr-4">
                  {user.userAnswers.map((answer, index) => (
                    <li
                      key={answer.questionId}
                      className="p-6 bg-green-50 rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-bold text-lg text-gray-900 mb-3">
                        Q{index + 1}:{" "}
                        <span className="text-gray-700">
                          {parse(exam.questions[index]?.questionText || "")}
                        </span>
                      </h3>
                      <p className="mb-2 text-base text-gray-700">
                        <strong>Your Answer:</strong>{" "}
                        {parse(answer?.answer || "")}
                      </p>
                      <p className="text-gray-700">
                        <strong>Score:</strong> {answer.score} /{" "}
                        {exam.questions[index]?.weightage}
                      </p>
                      <div className="flex items-center mt-3">
                        {exam.questions[index]?.type !== "subjective" &&
                          (answer.score > 0 ? (
                            <>
                              <FaCheckCircle className="text-green-500 mr-2" />
                              <span className="text-sm text-green-600 font-medium">
                                Correct
                              </span>
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="text-red-500 mr-2" />
                              <span className="text-sm text-red-600 font-medium">
                                Incorrect
                              </span>
                            </>
                          ))}
                      </div>
                    </li>
                  ))}
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mt-8 text-center">
                  Total Score:{" "}
                  <span className="text-green-600">
                    {user.score} /{" "}
                    {exam.questions.reduce((acc, q) => acc + q.weightage, 0)}
                  </span>
                </h2>
              </div>
            ) : (
              <p className="text-center text-gray-700">
                No user data found. Please try again later.
              </p>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="h-full text-base min-h-screen  flex flex-col gap-5 justify-center items-center">
          <h1 className="text-xl sm:text-2xl text-primary">
            Your Exam has Submitted, Please wait for the result declaration
          </h1>
          <p>Thank You!</p>
          <Link
            to={`/intro/exam/${exam._id}`}
            className="underline text-primary"
          >
            Go Back
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ExamResult;
