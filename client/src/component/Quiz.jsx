import React, { useState } from 'react';

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
        }
    }
    return (
        <>

            {
                !condition ?
                    <div>
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
                    : <div>

                        {selectedQuiz.map((question, questionIndex) => (
                            <div key={questionIndex} className="bg-white shadow-lg rounded-lg p-6 mb-4">
                                <p className="text-lg text-gray-800 font-medium mb-4">{question.question}</p>
                                <div className="space-y-4">
                                    your Answer : {
                                        selectedOptions[questionIndex].split(' ')[0] === question.correctAnswer ? <div>{selectedOptions[questionIndex]} correct </div> : <div>
                                            {selectedOptions[questionIndex]}<br />
                                            correct Answer: {
                                                question.options.map((option) => {
                                                    return <>
                                                        {option.split(' ')[0] === question.correctAnswer ? <p>{option}</p> : null}
                                                    </>
                                                })
                                            }
                                        </div>
                                    }
                                    {/* {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                           
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={option}
                            checked={selectedOptions[questionIndex] === option}
                            className="form-radio h-5 w-5 text-blue-500 border-gray-300 focus:ring-2 focus:ring-blue-300"
                          />
                          <label className="text-sm text-gray-700">{option}</label>
                        </div>
                      ))} */}
                                </div>
                            </div>
                        ))}
                    </div>
            }

            <button onClick={() => handleSubmit()}>Submit Quiz</button>
        </>
    );
}

export default Quiz;
