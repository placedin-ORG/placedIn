import { useNavigate } from "react-router-dom";
import { FaRobot } from "react-icons/fa";

const FloatingAIButton = ({onClick}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={onClick}
      className="fixed size-3 bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center animate-float justify-center shadow-lg hover:bg-blue-700 transition"
      aria-label="AI Assistant"
    >
      <FaRobot size= {26}/>
    </button>
  );
};

export default FloatingAIButton;
