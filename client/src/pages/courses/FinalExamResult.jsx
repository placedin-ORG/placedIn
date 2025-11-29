import React, { useEffect, useState } from "react";
import API from "../../utils/API";
import parse from "html-react-parser";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";
import { useParams, Link } from "react-router-dom";

const FinalExamResult = () => {
  const { userId, courseId } = useParams();
  const [course, setCourse] = useState(null);
  // 🟣 Uploading Indicator State
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const check = () => {
      const isUploading = localStorage.getItem("uploadingVideo") === "true";
      setUploading(isUploading);
    };

    check();
    const interval = setInterval(check, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      const res = await API.post("/learn/final-exam", {
        userId,
        courseId,
      });
      setCourse(res.data.course);
    };
    load();
  }, []);

  if (!course) return <div className="p-10 text-center">Loading...</div>;

  const questions = course.finalExam.questions;
  const answers = course.finalExam.result.answers[0] || {};
  const accuracy = course.finalExam.result.accuracy;

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">

      {/* 🟣 Uploading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/70 z-[2000] flex flex-col items-center justify-center text-white text-center p-6 backdrop-blur-sm">
          <div className="bg-gray-900/80 px-6 py-8 rounded-xl shadow-lg max-w-sm w-full">
            <BiLoaderAlt className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
            <h2 className="text-xl font-semibold mb-2">Uploading Proctor Video...</h2>
            <p className="text-sm mb-4">
              Please do not close this tab until the upload completes.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Final Exam Results</h1>

        <div className="text-center text-4xl font-bold text-primary my-4">
          {accuracy}% Accuracy
        </div>

        <h2 className="font-semibold text-xl my-4">Answer Breakdown</h2>

        <div className="space-y-4">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const correct = q.correctAnswer;
            const isCorrect = q.options[userAns] == correct;

            return (
              <div key={i} className="border p-4 rounded-lg">
                <div className="flex gap-3">
                  {isCorrect ? (
                    <FaCheckCircle className="text-green-500 mt-1" />
                  ) : (
                    <FaTimesCircle className="text-red-500 mt-1" />
                  )}
                  <div>
                    <p className="font-semibold">
                      Q{i + 1}: {parse(q.questionText)}
                    </p>

                    <p className="mt-1">
                      <strong>Your Answer:</strong>{" "}
                      {q.options[userAns] || "Not Answered"}
                    </p>

                    
                    <p className="text-green-700">
                    <strong>Correct Answer:</strong> {correct}
                    </p>
                  
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="px-6 py-3 bg-primary text-white rounded-lg">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinalExamResult;
