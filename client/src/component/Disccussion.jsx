import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // For getting courseId and userId from URL
import API from "../utils/API";

const Disccussion = ({ courseId, userId, username }) => {
  //   const { courseId, userId, username } = useParams(); // Get courseId and userId from URL
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // Fetch comments for this course
    API.get(`/discussion/${courseId}/comments`)
      .then((response) => {
        setComments(response.data);
        console.log(response.data);
      })
      .catch((error) => console.error("Error fetching comments:", error));
  }, [courseId]);

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return; // Prevent empty comments

    const commentData = {
      username: username,
      comment: newComment,
      userId: userId,
    };

    API.post(`/discussion/${courseId}/comments`, commentData)
      .then((response) => {
        setComments([...comments, response.data]); // Update comments state with new comment
        setNewComment(""); // Clear the input field
      })
      .catch((error) => console.error("Error posting comment:", error));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Course Discussion
        </h1>

        {/* Comments Section */}
        {Array.isArray(comments) &&
          comments.map((comment, index) => {
            const isUserComment = comment.userId === userId;

            return (
              <div
                key={index}
                className={`p-4 mb-4 rounded-lg flex items-center space-x-4 ${
                  isUserComment
                    ? "bg-blue-100 border border-blue-400"
                    : "bg-gray-100"
                }`}
              >
                {/* Placeholder Profile Picture */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white font-bold text-lg"
                  title={comment.username}
                >
                  {comment.username.charAt(0).toUpperCase()}
                </div>

                {/* Comment Content */}
                <div>
                  <p
                    className={`font-bold ${
                      isUserComment ? "text-blue-700" : "text-gray-800"
                    }`}
                  >
                    {comment.username}
                  </p>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              </div>
            );
          })}

        {/* Add New Comment */}
        <div className="mt-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Add a comment..."
          />
          <button
            onClick={handleCommentSubmit}
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-200"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disccussion;
