import React, { useEffect, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

const CourseDetail = () => {
  const [courseData, setCourseData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const savedCourseData = localStorage.getItem('courseData');
    if (savedCourseData) {
      const parsedData = JSON.parse(savedCourseData);
      setCourseData(parsedData);
    }
  }, []);

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    setSelectedQuiz(null); // Clear quiz when a topic is selected
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedTopic(null); // Clear topic when a quiz is selected
  };

  const toggleChapter = (index) => {
    setExpandedChapter(expandedChapter === index ? null : index);
  };

  const toggleDescription = () => {
    setExpandedDescription(!expandedDescription);
  };

  const toggleTopicContent = (index) => {
    setExpandedTopic(expandedTopic === index ? null : index);
  };

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('drive.google.com')) {
      const fileId = url.split('d/')[1].split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url; // Return the URL as-is for other video platforms
  };

  const handleOptionChange = (questionIndex, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  return (
    <>
      {courseData && (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Top Section - Course Title and Description */}
          <div className="text-center mb-12 pt-12 px-8 bg-white shadow-md">
            <h1 className="text-4xl font-bold text-gray-800">{courseData.courseTitle}</h1>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
              {expandedDescription ? courseData.description : `${courseData.description.substring(0, 200)}...`}
              <button onClick={toggleDescription} className="text-blue-600 ml-2">
                {expandedDescription ? 'Read Less' : 'Read More'}
              </button>
            </p>
          </div>

          <div className="flex relative">
            {/* Left Section (Sticky) */}
            <div className="w-1/4 bg-white p-6 shadow-lg rounded-lg sticky top-20 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300">
              <h2 className="text-xl font-semibold mb-4">Course Content</h2>
              {courseData.chapters.map((chapter, chapterIndex) => (
                <div key={chapterIndex} className="mb-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">{chapter.title}</h3>
                    <button
                      onClick={() => toggleChapter(chapterIndex)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedChapter === chapterIndex ? <FaAngleUp /> : <FaAngleDown />}
                    </button>
                  </div>

                  {expandedChapter === chapterIndex && (
                    <div className="pl-4 mt-2">
                      {chapter.topics.map((topic, topicIndex) => (
                        <div
                          key={topicIndex}
                          className="cursor-pointer mb-2 text-sm text-gray-700 hover:text-blue-600"
                          onClick={() => handleTopicClick(topic)}
                        >
                          <div className="flex justify-between items-center">
                            <span>{topic.name}</span>
                            <button
                              onClick={() => toggleTopicContent(topicIndex)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {expandedTopic === topicIndex ? <FaAngleUp /> : <FaAngleDown />}
                            </button>
                          </div>

                          {expandedTopic === topicIndex && (
                            <p className="text-sm text-gray-600 mt-2">
                              {topic.content.length > 150
                                ? `${topic.content.substring(0, 150)}...`
                                : topic.content}
                              {topic.content.length > 150 && (
                                <button
                                  onClick={() => toggleTopicContent(topicIndex)}
                                  className="text-blue-600 ml-2"
                                >
                                  {expandedTopic === topicIndex ? 'Read Less' : 'Read More'}
                                </button>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                      <div className="mt-4">
                        <button
                          onClick={() => handleQuizClick(chapter.quiz)}
                          className="text-blue-600"
                        >
                          View Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section (Selected Topic Video & Content) */}
            <div className="w-3/4 pl-6 mt-20">
              {selectedTopic ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4">{selectedTopic.name}</h3>
                  <div className="mb-6">
                    <iframe
                      width="100%"
                      height="400"
                      src={getEmbedUrl(selectedTopic.videoUrl)}
                      title={selectedTopic.name}
                      className="rounded-lg shadow-lg"
                    ></iframe>
                  </div>
                  
                </div>
              ) : selectedQuiz ? (
                <div className="mt-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Quiz</h3>
                {selectedQuiz.map((question, questionIndex) => (
                  <div key={questionIndex} className="bg-white shadow-lg rounded-lg p-6 mb-4">
                    <p className="text-lg text-gray-800 font-medium mb-4">{question.question}</p>
                    <div className="space-y-4">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={option}
                            checked={selectedOptions[questionIndex] === option}
                            onChange={() => handleOptionChange(questionIndex, option)}
                            className="form-radio h-5 w-5 text-blue-500 border-gray-300 focus:ring-2 focus:ring-blue-300"
                          />
                          <label className="text-sm text-gray-700">{option}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              ) : (
                <p className="text-gray-600">Select a topic to view its content and video or view the quiz.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseDetail;
