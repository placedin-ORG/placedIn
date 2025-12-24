import AiAssistance from "../pages/AiAssistance";
import { FaTimes } from "react-icons/fa";

const AiDrawer = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />   
      <div className="relative w-full sm:w-[420px] h-full bg-white shadow-xl animate-slideIn">     
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FaTimes size={18} />
        </button>

        <AiAssistance />
      </div>
    </div>
  );
};

export default AiDrawer;
