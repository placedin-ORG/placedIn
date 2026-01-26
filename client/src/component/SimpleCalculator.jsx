import React, { useState } from "react";
import { evaluate } from "mathjs";

const SimpleCalculator = ({ onClose }) => {
  const [input, setInput] = useState("");

  const handleClick = (value) => {
    if (value === "=") {
      try {
        const result = evaluate(input);
        setInput(String(result));
      } catch (error) {
        setInput("Error");
      }
    } else if (value === "C") {
      setInput("");
    } else if (value === "←") {
      setInput(input.slice(0, -1));
    } else {
      setInput(input + value);
    }
  };

  // Enable manual text input
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const buttons = [
    ["C", "←", "(", ")"],
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "=", "+"],
    ["sin(", "cos(", "tan(", "sqrt("],
    ["^", "log(", "ln(", "π"],
  ];

  return (
    <div className="bg-white rounded-lg shadow-2xl p-4 w-80 border-2 border-gray-300">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-700 text-lg">Scientific Calculator</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 text-3xl font-bold leading-none"
        >
          ×
        </button>
      </div>
      
      {/* Changed to allow text input */}
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        className="w-full bg-gray-100 p-3 rounded mb-4 text-right text-xl border-2 border-gray-300 font-mono focus:outline-none focus:border-blue-500"
        placeholder="0"
      />
      
      <div className="grid gap-2">
        {buttons.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-4 gap-2">
            {row.map((btn) => (
              <button
                key={btn}
                onClick={() => handleClick(btn === "π" ? Math.PI.toString() : btn)}
                className={`
                  p-3 rounded font-semibold text-sm transition-all
                  ${btn === "=" 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : btn === "C" || btn === "←"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : ["+", "-", "*", "/", "^"].includes(btn)
                    ? "bg-orange-400 hover:bg-orange-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }
                `}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleCalculator;