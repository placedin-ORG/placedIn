import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from "./Toast"
const Quiz = ({ selectedQuiz,chapterIndex,openNextChapter }) => {
    const [selectedOptions, setSelectedOptions] = useState({});
    const [condition, setCondition] = useState(false)
    const handleOptionChange = (questionIndex, option) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [questionIndex]: option,
        }));
        console.log(selectedOptions)
    };
    const handleSubmit = () => {
        console.log(selectedOptions[0])
        if (selectedQuiz.length === Object.keys(selectedOptions).length) {
            setCondition(true);

            openNextChapter(chapterIndex)
        }else{
          toast.warn("Complete All the Quiz Question ")
        }
    }
    return (
        <>
<div className="space-y-6 pr-4 pb-5">
  <Toast/>
  {selectedQuiz.map((question, questionIndex) => (
    <div key={questionIndex} className="bg-white shadow-lg rounded-lg p-6">
      {/* Question */}
      <p className="text-lg font-semibold text-gray-800 ">
        {`Q ${question.question}`}
      </p>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, optionIndex) => (
          <div key={optionIndex} className="flex items-center space-x-4">
            {!condition ? (
              <>
                {/* Option Input */}
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={option}
                  checked={selectedOptions[questionIndex] === option}
                  onChange={() => handleOptionChange(questionIndex, option)}
                  className="form-radio h-5 w-5 text-blue-500 border-gray-300 focus:ring-2 focus:ring-blue-500 checked:bg-green-500"
                />
                {/* Option Label */}
                <label className="text-sm text-gray-700">{option}</label>
              </>
            ) : null}
          </div>
        ))}

{condition && (
  <div className="text-sm mt-4">
    {selectedOptions[questionIndex].split(')')[0] === question.correctAnswer ? (
      <p className="text-green-600 font-medium">
        <span className="font-bold">Your Answer:</span>{" "}
        {selectedOptions[questionIndex]} ✔ Correct
      </p>
    ) : (
      <div>
        <p className="text-red-600 font-medium">
          <span className="font-bold">Your Answer:</span>{" "}
          {selectedOptions[questionIndex]} ✘
        </p>
        <p className="text-green-700 font-medium mt-2">
          <span className="font-bold">Correct Answer:</span>{" "}
          {question.options.find(opt => opt.split(')')[0] === question.correctAnswer)}
        </p>
      </div>
    )}
  </div>
)}

      </div>
    </div>
  ))}

  {/* Submit Button */}
  {!condition && (
    <div className="flex justify-end mt-6">
      <button
        onClick={() => handleSubmit()}
        className="px-6 mb-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all"
      >
        Submit Quiz
      </button>
    </div>
  )}
</div>

        </>
    );
}

export default Quiz;
