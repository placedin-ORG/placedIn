import React, { useState } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { BiSave } from 'react-icons/bi';
import axios from "axios";
const CreateCoursePage = () => {
  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState([{ title: '', topics: [{ name: '', videoUrl: '', content: '' }], quiz: [] }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTopicOpen, setIsTopicOpen] = useState(true);
  const [isQuizOpen, setIsQuizOpen] = useState(true);
  const [paid ,setPaid]=useState(false);
  const [price,setPrice]=useState(0);
  const handleAddChapter = () => {
    setChapters([...chapters, { title: '', topics: [{ name: '', videoUrl: '', content: '' }], quiz: [] }]);
  };

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[index][field] = value;
    setChapters(updatedChapters);
  };

  const handleTopicChange = (chapterIndex, topicIndex, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].topics[topicIndex][field] = value;
    setChapters(updatedChapters);
  };

  const handleAddTopic = (chapterIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].topics.push({ name: '', videoUrl: '', content: '' });
    setChapters(updatedChapters);
  };

  const handleAddQuizQuestion = (chapterIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].quiz.push({ question: '', options: ['', '', '', ''], correctAnswer: '' });
    setChapters(updatedChapters);
  };

  const handleQuizQuestionChange = (chapterIndex, questionIndex, field, value) => {
    const updatedChapters = [...chapters];
    
    // Create a copy of the quiz array and the specific question object
    const updatedQuiz = [...updatedChapters[chapterIndex].quiz];
    const updatedQuestion = { ...updatedQuiz[questionIndex] };
  
    // If the field is part of the options array, we need to update it correctly
    if (field.startsWith('options')) {
      const optionIndex = parseInt(field.split('.')[1], 10);  // Extract the option index
      const updatedOptions = [...updatedQuestion.options];
      updatedOptions[optionIndex] = value;  // Update the specific option
      updatedQuestion.options = updatedOptions;  // Set updated options back
    } else {
      updatedQuestion[field] = value;  // For other fields (e.g., question or correctAnswer)
    }
  
    // Update the quiz and chapters state
    updatedQuiz[questionIndex] = updatedQuestion;
    updatedChapters[chapterIndex].quiz = updatedQuiz;
  
    setChapters(updatedChapters);
  };
  
  const transformData = (data) => {
    return data.map(item => ({
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer
    }));
  };

  const generateQuizFromContent = async (chapterIndex) => {
    setIsGenerating(true);
    try {
      const content = chapters[chapterIndex].topics.map((topic) => topic.content).join(' ');

      // Call the backend to generate quiz questions
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (data.success) {
        setChapters((prevChapters) => {
          const updatedChapters = [...prevChapters];
          // Update the quiz for the correct chapter index
          updatedChapters[chapterIndex].quiz = transformData(data.questions);
          return updatedChapters;
        });
      } else {
        alert('Failed to generate quiz.');
      }
    } catch (error) {
      alert('Error generating quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCourse = async() => {
    // Create the course data object
    const courseData = {
      courseTitle,
      description,
      chapters
    };
   const {data}=await axios.post('http://localhost:5000/create/createCourse',{
    courseTitle,
    description,
    chapters,
    paid,
    price,
    questions
   })
   if(data.status){
    alert("added")
   }
    // Save the course data to localStorage
    localStorage.setItem('courseData', JSON.stringify(courseData));

    // Optionally alert the user that the course has been saved
    alert('Course has been saved to localStorage!');
  };

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Extract the video ID from a regular YouTube URL
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('drive.google.com')) {
      const fileId = url.split('d/')[1].split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url; // Return the URL as-is for other video platforms (if compatible with iframe)
  };
 const handlePaid=()=>{
   if(paid) {
    setPaid(false);
    setPrice(0);
return ;
   }
   setPaid(true)
 }
const [toggleExam,setToggleExam]=useState(false);
 const handleToggleExam=()=>{
   if (toggleExam) setToggleExam(false);
   else setToggleExam(true);
 }
 const [questions, setQuestions] = useState([]);
 const [currentQuestion, setCurrentQuestion] = useState({
   questionText: '',
   options: ['', '', '', ''],
   correctAnswer: '',
 });

 const handleQuestionChange = (e) => {
   setCurrentQuestion({ ...currentQuestion, questionText: e.target.value });
 };

 const handleOptionChange = (index, value) => {
   const updatedOptions = [...currentQuestion.options];
   updatedOptions[index] = value;
   setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
 };

 const handleCorrectAnswerChange = (e) => {
   setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value });
 };

 const addQuestion = () => {
   setQuestions([...questions, currentQuestion]);
   setCurrentQuestion({
     questionText: '',
     options: ['', '', '', ''],
     correctAnswer: '',
   });
 };
  return (
    <div className="container mx-auto p-8 max-w-4xl bg-white shadow-md rounded-md">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Create a New Course</h1>

      {/* Course Title Input */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Course Title</label>
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
          placeholder="Enter course title"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description Input */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">Course Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter course description"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      {/* Chapters */}
      {chapters.map((chapter, chapterIndex) => (
        <div key={chapterIndex} className="mb-6 border rounded-md p-4 bg-gray-50">
          <label className="block text-gray-700 font-semibold mb-2">Chapter {chapterIndex + 1} Title</label>
          <input
            type="text"
            value={chapter.title}
            onChange={(e) => handleChapterChange(chapterIndex, 'title', e.target.value)}
            placeholder={`Chapter ${chapterIndex + 1} title`}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Topics */}
          {chapter.topics.map((topic, topicIndex) => (
            <div key={topicIndex} className="mb-4">
              <label className="block text-gray-600 mb-1">Topic {topicIndex + 1} Name</label>
              <input
                type="text"
                value={topic.name}
                onChange={(e) => handleTopicChange(chapterIndex, topicIndex, 'name', e.target.value)}
                placeholder={`Topic ${topicIndex + 1} name`}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-gray-600 mb-1">Video URL</label>
              <input
                type="text"
                value={topic.videoUrl}
                onChange={(e) => handleTopicChange(chapterIndex, topicIndex, 'videoUrl', e.target.value)}
                placeholder="Video URL"
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {
                topic.videoUrl!==""?  <div className="mb-6">
                    <iframe
                      width="100%"
                      height="400"
                      src={getEmbedUrl(topic.videoUrl)}
                      title={topic.name}
                      className="rounded-lg shadow-lg"
                    ></iframe>
                  </div>:null
              }
             
              <label className="block text-gray-600 mb-1">Promt for generating question</label>
              <textarea
                value={topic.content}
                onChange={(e) => handleTopicChange(chapterIndex, topicIndex, 'content', e.target.value)}
                placeholder="Enter topic content"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          ))}
          <button
            onClick={() => handleAddTopic(chapterIndex)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
          >
            <FiPlusCircle className="mr-2" /> Add Topic
          </button>

          {/* Quiz Section */}
          <div className="mt-4">
            <button
              onClick={() => generateQuizFromContent(chapterIndex)}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Quiz from Content'}
            </button>
            {chapter.quiz.map((question, questionIndex) => (
  <div key={questionIndex} className="mt-4 border-t pt-4">
    <label className="block text-gray-600 mb-1">Quiz Question {questionIndex + 1}</label>
    <input
      type="text"
      value={question.question}
      onChange={(e) => handleQuizQuestionChange(chapterIndex, questionIndex, 'question', e.target.value)}
      placeholder={`Enter question ${questionIndex + 1}`}
      className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {/* Display input fields for each option */}
    {question.options.map((option, optionIndex) => (
      <div key={optionIndex} className="mt-2">
        <label className="block text-gray-500 mb-1">Option {optionIndex + 1}</label>
        <input
          type="text"
          value={option}
          onChange={(e) =>
            handleQuizQuestionChange(chapterIndex, questionIndex, `options.${optionIndex}`, e.target.value)
          }
          placeholder={`Enter option ${optionIndex + 1}`}
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    ))}

    {/* Optionally, a field for the correct answer */}
    <label className="block text-gray-500 mt-2">Correct Answer</label>
    <input
      type="text"
      value={question.correctAnswer}
      onChange={(e) => handleQuizQuestionChange(chapterIndex, questionIndex, 'correctAnswer', e.target.value)}
      placeholder="Enter the correct answer"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
))}

            <button
              onClick={() => handleAddQuizQuestion(chapterIndex)}
              className="mt-2 flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600"
            >
              <FiPlusCircle className="mr-2" /> Add Quiz Question
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={handleAddChapter}
        className="mb-6 flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600"
      >
        <FiPlusCircle className="mr-2" /> Add Chapter
      </button>

      {
        paid ?
         <div>
          <input type='number' min={1} value={price} onChange={(e)=>setPrice(e.target.value)}/>
          </div>: null
      }
      <button className='border' onClick={()=>handlePaid()}>{
        paid?"remove paid":"make paid"
        }</button>

      <button
        onClick={handleSaveCourse}
        className="w-full px-4 py-2 bg-purple-500 text-white rounded-md shadow hover:bg-purple-600"
      >
        <BiSave className="inline-block mr-2" /> Save Course
      </button>

      <button className='border  border-red-700' onClick={()=>handleToggleExam()}>
        Create Final Exam 
      </button>
      {
      toggleExam ?<div>
           <div>
        <input
          type="text"
          placeholder="Enter question"
          value={currentQuestion.questionText}
          onChange={handleQuestionChange}
        />
        {currentQuestion.options.map((option, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          </div>
        ))}
        <select
          value={currentQuestion.correctAnswer}
          onChange={handleCorrectAnswerChange}
        >
          <option value="">Select correct answer</option>
          {currentQuestion.options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button onClick={addQuestion}>Add Question</button>
      </div>

      <h3>Questions</h3>
      <ul>
        {questions.map((q, index) => (
          <li key={index}>
            <p>Q: {q.questionText}</p>
            <ul>
              {q.options.map((opt, optIndex) => (
                <li key={optIndex}>
                  {opt} {opt === q.correctAnswer && '(Correct Answer)'}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      </div>:null
      }
    </div>
  );
};

export default CreateCoursePage;
