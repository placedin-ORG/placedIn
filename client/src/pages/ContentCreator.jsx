import React, { useEffect, useState } from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import { BiSave } from 'react-icons/bi';
import { AiOutlinePlusCircle, AiOutlineDelete } from 'react-icons/ai';
import axios from "axios";
import {useLocation} from 'react-router-dom' ;
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from '../component/Toast';
import {useNavigate} from 'react-router-dom'
const CreateCoursePage = () => {
  const navigate=useNavigate();
  const location=useLocation();
  const [courseTitle, setCourseTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState([{ title: '', topics: [{ name: '', videoUrl: '', content: '' }], quiz: [] }]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [paid ,setPaid]=useState(false);
  const [price,setPrice]=useState(0);
  const [thumbnail, setThumbnail] = useState(null);
  const [examDuration, setExamDuration] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });
 
  const [courseCategory, setCourseCategory] = useState("");
  const [id,setId]=useState(null);
  const handleAddChapter = () => {
    setChapters([...chapters, { title: '', topics: [{ name: '', videoUrl: '', content: '' }], quiz: [] }]);
  };

  useEffect(()=>{
  try{
  if(location.state!==null){
     const {
          title: title,
          description: desc,
          chapters: chapterList,
          paid: isPaid,
          price: coursePrice,
          courseCategory: category,
          _id:id,
          examDuration:examDuration,
          courseThumbnail:courseThumbnail,
          questions:questions
        } = location.state;

        // Update state with values from location.state
        if (title) setCourseTitle(title);
        if (desc) setDescription(desc);
        if (chapterList) setChapters(chapterList);
        if (typeof isPaid === "boolean") setPaid(isPaid);
        if (coursePrice) setPrice(coursePrice);
        if (category) setCourseCategory(category);
        if(courseThumbnail!=="") setThumbnail(courseThumbnail);
        if(examDuration>0) setExamDuration(examDuration);
        if(questions.length >0) setQuestions(questions);
        if(id) setId(id);
  }
  }catch(err){
  console.log(err);
  }
  },[])

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
    if(content.length<20){
      toast.warning("The overall content of topics is too short")
    }
      // Call the backend to generate quiz questions
      const response = await fetch('http://localhost:5000/api/v1/generate-quiz', {
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
          console.log(updatedChapters)
          return updatedChapters;
        });
      } else {
        toast.error('Failed to generate quiz.');
      }
    } catch (error) {
      toast.error('Error generating quiz.');
    } finally {
      setIsGenerating(false);
    }
  };
  const validateChapters = (chapters) => {
    for (const chapter of chapters) {
      // Check if chapter title is empty
      if (!chapter.title.trim()) {
        return { isValid: false, message: "Chapter title cannot be empty" };
      }
  
      // Check each topic in the chapter
      for (const topic of chapter.topics) {
        if (!topic.name.trim()) {
          return { isValid: false, message: "Topic name cannot be empty" };
        }
        if (!topic.videoUrl.trim()) {
          return { isValid: false, message: "Topic video URL cannot be empty" };
        }
        if (!topic.content.trim()) {
          return { isValid: false, message: "Topic content cannot be empty" };
        }
      }
  
      // Check if quiz array is empty
      if (!chapter.quiz.length) {
        return { isValid: false, message: "Quiz cannot be empty" };
      }
  
      // Validate each question in the quiz
      for (const questionObj of chapter.quiz) {
        if (!questionObj.question.trim()) {
          return { isValid: false, message: "Quiz question cannot be empty" };
        }
  
        if (questionObj.options.length !== 4) {
          return {
            isValid: false,
            message: "Each quiz question must have exactly 4 options",
          };
        }
  
        // Check if any option is empty
        for (const option of questionObj.options) {
          if (option.trim().length<=2) {
            return { isValid: false, message: "Quiz options cannot be empty" };
          }
        }
  
        // Check if the correct answer is empty
        if (!questionObj.correctAnswer.trim()) {
          return {
            isValid: false,
            message: "Correct answer cannot be empty",
          };
        }
      }
    }
  
    // If all validations pass
    return { isValid: true, message: "Validation successful" };
  };
  const validateQuestions = (questions) => {
    if (!questions.length) {
      return { isValid: false, message: "Questions array cannot be empty." };
    }
  
    for (const question of questions) {
      // Check if questionText is empty
      if (!question.questionText.trim()) {
        return { isValid: false, message: "Question text cannot be empty." };
      }
  
      // Check if options array has exactly 4 options
      if (question.options.length !== 4) {
        return {
          isValid: false,
          message: "Each question must have exactly 4 options.",
        };
      }
  
      // Check if any option is empty
      for (const option of question.options) {
        if (!option.trim()) {
          return { isValid: false, message: "Options cannot be empty." };
        }
      }
  
      // Check if correctAnswer is empty
      if (!question.correctAnswer.trim()) {
        return { isValid: false, message: "Correct answer cannot be empty." };
      }
    }
  
    // All validations passed
    return { isValid: true, message: "Validation successful." };
  };
  const handleSaveCourse = async() => {
    if(courseTitle==="" ){
      toast.warning('Mention The Course Title')
      return ;
    }else if(description === ""){
      toast.warning("Mention the Description of the Course");
      return ;
    }else if(chapters.length===0){
      toast.warning("Atleast Make A Chapter with topics");
      return ;
    }else if(thumbnail===""){
      toast.warning('select the thumbnail for course');
      return ;
    }
    const validationResult = validateChapters(chapters);
if (!validationResult.isValid) {
toast.warning(validationResult.message);
return ;
}

const validateQuestion=validateQuestions(questions);
if (!validateQuestion.isValid) {
  toast.warning(validationResult.message);
  return ;
  }
   const {data}=await axios.post('http://localhost:5000/api/v1/create/createCourse',{
    courseTitle,
    description,
    chapters,
    price,
    questions,
    id,
    setLive:true,
    courseCategory,
    courseThumbnail:thumbnail,
    examDuration,
    
   })
   if(data.status){
    toast.success("added")
   }else{
    toast.error("problem while adding")
   }
  };
  const handlelaterCourse=async()=>{
    if(courseTitle==="" ){
      toast.warning('Mention The Course Title')
      return ;
    }
    const {data}=await axios.post('http://localhost:5000/api/v1/create/createCourse',{
      courseTitle,
      description,
      chapters,
      price,
      questions,
      id,
      courseCategory,
      setLive:false,
      courseThumbnail:thumbnail,
      examDuration
     })
     if(data.status){
      toast.success("added");
      navigate("/teacher-panel")
     }else{
      toast.error("problem while adding")
     }
  }

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
  if (
    currentQuestion.questionText &&
    currentQuestion.correctAnswer &&
    currentQuestion.options.every((opt) => opt)
  ) {
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
  } else {
    toast.error('Please fill out all fields before adding a question.');
  }
};

const deleteQuestion = (index) => {
  const updatedQuestions = questions.filter((_, i) => i !== index);
  setQuestions(updatedQuestions);
};
  return (
    <div className="container mx-auto p-8 max-w-4xl bg-white shadow-lg rounded-lg mb-5 mt-5">
      <Toast/>
    <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Create a New Course</h1>
    <div className="mb-6">
  <label className="block text-gray-700 font-medium mb-2">
    Course Thumbnail
  </label>
  <div className="flex items-center space-x-4">
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setThumbnail(reader.result); // Update the state with base64 string
          };
          reader.readAsDataURL(file);
        }
      }}
      className="w-full px-4 py-2 border border-gray-300 rounded-md cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 focus:outline-none"
    />
  </div>
  {thumbnail && (
    <div className="mt-4">
      <img
        src={thumbnail}
        alt="Course Thumbnail"
        className="w-40 h-40 object-cover rounded-md shadow-md"
      />
    </div>
  )}
</div>
  {/* Course Category */}
  <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Course Category
        </label>
        <select
          value={courseCategory}
          onChange={(e) => setCourseCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Select a category
          </option>
          <option value="doctorate">Doctorate</option>
          <option value="aiml">AI & ML</option>
          <option value="mba">MBA</option>
          <option value="data-science">Data Science</option>
          <option value="marketing-software">Marketing</option>
          <option value="software">Software</option>
          <option value="management">Management</option>
          <option value="law">Law</option>
        </select>
      </div>


      <div className="mb-6">
  <label className="block text-gray-700 font-medium mb-2">Exam Duration (in minutes)</label>
  <input
    type="number"
    value={examDuration}
    onChange={(e) => setExamDuration(e.target.value)}
    placeholder="Enter exam duration"
    min={1}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
    {/* Course Title Input */}
    <div className="mb-6">
      <label className="block text-gray-700 font-medium mb-2">Course Title</label>
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
      <label className="block text-gray-700 font-medium mb-2">Course Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter course description"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></textarea>
    </div>
  
    {/* Chapters Section */}
    {chapters.map((chapter, chapterIndex) => (
      <div key={chapterIndex} className="mb-8 bg-gray-50 p-6 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Chapter {chapterIndex + 1}: {chapter.title || "Untitled"}
        </h2>
  
        {/* Chapter Title Input */}
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">Chapter Title</label>
          <input
            type="text"
            value={chapter.title}
            onChange={(e) => handleChapterChange(chapterIndex, "title", e.target.value)}
            placeholder={`Enter Chapter ${chapterIndex + 1} Title`}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Topics Section */}
        {chapter.topics.map((topic, topicIndex) => (
          <div key={topicIndex} className="mb-4 border-b pb-4 last:border-none">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Topic {topicIndex + 1}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-gray-500 mb-1">Topic Name</label>
                <input
                  type="text"
                  value={topic.name}
                  onChange={(e) => handleTopicChange(chapterIndex, topicIndex, "name", e.target.value)}
                  placeholder="Enter topic name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Video URL</label>
                <input
                  type="text"
                  value={topic.videoUrl}
                  onChange={(e) => handleTopicChange(chapterIndex, topicIndex, "videoUrl", e.target.value)}
                  placeholder="Enter video URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
  
            {/* Video Preview */}
            {topic.videoUrl && (
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="300"
                  src={getEmbedUrl(topic.videoUrl)}
                  title={topic.name}
                  className="rounded-lg shadow-md"
                ></iframe>
              </div>
            )}
  
            <div className="mt-4">
              <label className="block text-gray-500 mb-1">Content / Prompt</label>
              <textarea
                value={topic.content}
                onChange={(e) => handleTopicChange(chapterIndex, topicIndex, "content", e.target.value)}
                placeholder="Enter topic content or prompt"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        ))}
        <button
          onClick={() => handleAddTopic(chapterIndex)}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <FiPlusCircle className="mr-2" /> Add Topic
        </button>
  
        {/* Quiz Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Quiz</h3>
          <button
            onClick={() => generateQuizFromContent(chapterIndex)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Quiz from Content"}
          </button>
          {/* Quiz Questions */}
          {chapter.quiz.map((question, questionIndex) => (
  <div key={questionIndex} className="mt-6 border-t pt-6">
    {/* Quiz Question Label and Input */}
    <label className="block text-gray-700 font-medium mb-2">
      Quiz Question {questionIndex + 1}
    </label>
    <input
      type="text"
      value={question.question}
      onChange={(e) =>
        handleQuizQuestionChange(chapterIndex, questionIndex, 'question', e.target.value)
      }
      placeholder={`Enter question ${questionIndex + 1}`}
      className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {/* Options for the Question */}
    {question.options.map((option, optionIndex) => {
  // Extract the part before the ")" to compare with the correct answer.
  const optionPrefix = option.split(")")[0].trim();
  const isCorrect = optionPrefix === question.correctAnswer;

  return (
    <div
      key={optionIndex}
      className={`mt-4 ${
        isCorrect ? "bg-green-500 text-white" : ""
      } px-4 py-2 rounded-lg`}
    >
      <label className="block text-gray-600 font-medium mb-1">
        Option {optionIndex + 1}
      </label>
      <input
  type="text"
  value={`${option.substring(0, 2)} ${option.slice(2)}`} // Preserve the prefix (a), b), etc.)
  onChange={(e) => {
    const newValue = e.target.value;
    const prefix = newValue.substring(0, 2); // Get the first two characters (prefix like "a)", "b)", etc.)
    
    // Check if the first two characters are a valid prefix (a), b), etc.)
    if (["a)", "b)", "c)", "d)"].includes(prefix.trim())) {
      handleQuizQuestionChange(
        chapterIndex,
        questionIndex,
        `options.${optionIndex}`,
        `${prefix}${newValue.slice(2).trimStart()}` // Remove leading spaces after the prefix
      );
    }
  }}
  placeholder={`Enter option ${optionIndex + 1}`}
  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isCorrect ? "bg-green-500 text-white" : ""
  }`}
/>

    </div>
  );
})}

  </div>
))}

        </div>
      </div>
    ))}
  
    {/* Add Chapter Button */}
    <button
      onClick={handleAddChapter}
      className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
    >
      <FiPlusCircle className="mr-2" /> Add Chapter
    </button>
  <label> Select amount:</label>
    <input type='number' value={price} min={0} onChange={(e)=>setPrice(e.target.value)}  className='p-2 bg-white rounded-md text-orange mt-5 mb-4 border-2 ml-2' placeholder='Change price for paid '/>
    <br/>
    <button onClick={()=>setToggleExam(!toggleExam)} className='p-2 bg-orange-500 rounded-md text-white mt-5 mb-4'>create Exam</button>
{
   toggleExam && (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Exam Creation</h2>

        {/* Question Input Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Add New Question</h3>
          <input
            type="text"
            placeholder="Enter question"
            value={currentQuestion.questionText}
            onChange={handleQuestionChange}
            className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            ))}
          </div>
          <select
            value={currentQuestion.correctAnswer}
            onChange={handleCorrectAnswerChange}
            className="w-full p-2 mt-4 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="">Select correct answer</option>
            {currentQuestion.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            onClick={addQuestion}
            className="flex items-center mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <AiOutlinePlusCircle className="mr-2" /> Add Question
          </button>
        </div>

        {/* Questions List */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">Questions List</h3>
          {questions.length > 0 ? (
            <ul className="space-y-4">
              {questions.map((q, index) => (
                <li key={index} className="border-b pb-4">
                  <p className="text-gray-700 font-medium">Q{index + 1}: {q.questionText}</p>
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, optIndex) => (
                      <li
                        key={optIndex}
                        className={`p-2 rounded-lg ${
                          opt === q.correctAnswer
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {opt} {opt === q.correctAnswer && '(Correct)'}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => deleteQuestion(index)}
                    className="flex items-center mt-2 text-red-500 hover:underline"
                  >
                    <AiOutlineDelete className="mr-2" /> Delete Question
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No questions added yet.</p>
          )}
        </div>
      </div>
    )
}
    {/* Save Course Button */}
<button
      onClick={handleSaveCourse}
      className="w-full mt-6 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center justify-center"
    >
      <BiSave className="mr-2" /> Save Course and live
    </button>
    <button className='w-full mt-6 px-4 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-600 flex items-center justify-center' onClick={()=>handlelaterCourse()}> Save Course Only </button>
  </div>
  
  );
};

export default CreateCoursePage;
