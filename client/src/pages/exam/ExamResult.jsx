import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaMedal, FaAward } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import API from "../../utils/API";
import Navbar from "../../component/Navbar";
import Footer from "../../component/Layout/Footer";
import parse from "html-react-parser";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <BiLoaderAlt className="w-12 h-12 text-primary animate-spin" />
    <p className="mt-4 text-gray-600">Loading your results...</p>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong</h2>
      <p className="mb-6 text-gray-700">{message || "We couldn't load your exam results. Please try again later."}</p>
      <button 
        onClick={onRetry} 
        className="px-6 py-2 text-white bg-primary rounded-lg hover:bg-primary/80 transition"
      >
        Try Again
      </button>
      <Link to="/" className="block mt-4 text-primary hover:underline">
        Return to Dashboard
      </Link>
    </div>
  </div>
);

// Get rank badge component based on ranking
const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return <FaTrophy className="w-6 h-6 text-yellow-500" title="1st Place" />;
  } else if (rank === 2) {
    return <FaMedal className="w-6 h-6 text-gray-400" title="2nd Place" />;
  } else if (rank === 3) {
    return <FaAward className="w-6 h-6 text-amber-700" title="3rd Place" />;
  }
  return null;
};

const ExamResult = () => {
  const { ExamId } = useParams();
  const { user: currentUser } = useSelector((state) => state.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchResults = async () => {
    if(!currentUser?._id) {
      setError("User not found. Please log in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await API.post("/exam/speceficExam", {
        ExamId,
        userId: currentUser._id,
      });
      
      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      setData(response.data);
    } catch (error) {
      console.error("Error fetching exam data:", error);
      setError(error.message || "Failed to fetch exam results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [ExamId, currentUser]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return <ErrorState message={error} onRetry={fetchResults} />;
  }

  const { user, exam, rank } = data;
  const totalPossibleScore = exam.questions.reduce((acc, q) => acc + q.weightage, 0);
  const scorePercentage = totalPossibleScore > 0 ? (user.score / totalPossibleScore) * 100 : 0;
  
  // Define score feedback based on percentage
  const getScoreFeedback = () => {
    if (scorePercentage >= 90) return "Excellent work!";
    if (scorePercentage >= 80) return "Great job!";
    if (scorePercentage >= 70) return "Good effort!";
    if (scorePercentage >= 60) return "Keep practicing!";
    return "You can improve!";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <AnimatePresence>
        {exam.publishResult ? (
          <motion.div 
            className="px-4 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto overflow-hidden"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold text-center">
                  {exam.examTitle || "Exam Results"}
                </h1>
                <div className="mt-4 text-center text-white/90">
                  {exam.examDescription && <p>{exam.examDescription}</p>}
                </div>
              </div>

              {/* Results Summary */}
              {user && (
                <div className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-8 p-6 bg-gray-50 rounded-lg">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Your Performance</h2>
                      <p className="text-gray-600 mt-1">
                        Completed on {new Date(user.submittedAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center">
                      <div className="flex items-center mr-4">
                        {rank <= 3 && <RankBadge rank={rank} />}
                        <span className="ml-2 font-semibold text-gray-700">
                          Rank #{rank}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {user.score} / {totalPossibleScore}
                        </div>
                        <div className="text-sm text-gray-600">
                          {scorePercentage.toFixed(1)}% - {getScoreFeedback()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Breakdown</h3>

                  {/* Scrollable List of Answers */}
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                      {user.userAnswers.map((answer, index) => {
                        const question = exam.questions[index];
                        const isCorrect = question?.type !== "subjective" && answer.score > 0;
                        const isSubjective = question?.type === "subjective";
                        
                        return (
                          <li key={answer.questionId || index} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-1">
                                {!isSubjective ? (
                                  isCorrect ? (
                                    <FaCheckCircle className="text-green-500 w-5 h-5" />
                                  ) : (
                                    <FaTimesCircle className="text-red-500 w-5 h-5" />
                                  )
                                ) : (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                    S
                                  </span>
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <h4 className="text-base font-medium text-gray-900">
                                  Q{index + 1}: {parse(question?.questionText || "")}
                                </h4>
                                <div className="mt-2 text-sm text-gray-700">
                                  <div className="mb-1"><strong>Your Answer:</strong> {parse(answer?.answer || "")}</div>
                                  {!isCorrect && question?.type !== "subjective" && (
                                    <div className="text-green-700 mb-1">
                                      <strong>Correct Answer:</strong> {parse(question?.correctAnswer || "")}
                                    </div>
                                  )}
                                  <div className="flex items-center mt-2">
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800">
                                      Score: {answer.score} / {question?.weightage || 0}
                                    </span>
                                    {isSubjective && answer.feedback && (
                                      <span className="ml-2 text-xs inline-block">
                                        <strong>Feedback:</strong> {answer.feedback}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Link 
                      to={`/intro/exam/${exam._id}`}
                      className="inline-flex justify-center items-center px-6 py-3 border border-primary text-primary bg-white hover:bg-primary/5 font-medium rounded-lg transition-colors"
                    >
                      View Exam Details
                    </Link>
                    <Link 
                      to="/"
                      className="inline-flex justify-center items-center px-6 py-3 bg-primary text-white hover:bg-primary/90 font-medium rounded-lg transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8 bg-white rounded-lg shadow-md max-w-md">
              <h1 className="text-xl sm:text-2xl font-bold text-primary mb-4">
                Exam Submitted Successfully
              </h1>
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Your exam has been submitted. Results will be published soon.
              </p>
              <p className="text-sm text-gray-500 mb-8">Thank you for your participation!</p>
              <Link
                to={`/intro/exam/${exam._id}`}
                className="inline-block w-full px-6 py-3 text-center bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to Exam Page
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ExamResult;