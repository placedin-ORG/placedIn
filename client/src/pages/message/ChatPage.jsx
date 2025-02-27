import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FaPaperPlane, FaSmile, FaArrowAltCircleLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../utils/API";
import EmojiPicker from "emoji-picker-react";
import moment from "moment";
import Navbar from "../../component/Navbar";
import { useSelector } from "react-redux";

const socket = io("http://localhost:5000");

const ChatPage = () => {
  const user=useSelector((state)=>state.user.user);
  const userId = user._id;
  const userType = "User";
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState("6767cbe41f35f00a9908bc1c");
  const [receiverType, setReceiverType] = useState("Admin");
  const [chatPartners, setChatPartners] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchChatPartners = async () => {
      try {
        const response = await API.get(
          `/chat/getChatPartners?userId=${userId}&userType=${userType}`
        );
        if (response.data.status) {
          setChatPartners(response.data.receivers);
        }
      } catch (error) {
        console.error("Error fetching chat partners:", error);
      }
    };
    fetchChatPartners();

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    if (currentChat) {
      const fetchMessages = async () => {
        try {
          const response = await API.post("/chat/getAllMessages", {
            userId,
            receiverId: currentChat.id,
          });
          if (response.data.status) {
            setMessages(response.data.messages);
          }
        } catch (err) {
          toast.error(err.message);
        }
      };
      fetchMessages();
    }
  }, [currentChat]);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const sendMessage = async() => {
    if (!newMessage && !selectedFile) return;
    const formData = new FormData();
    formData.append("senderType", userType);
    formData.append("senderId", userId);
    formData.append("receiverType", receiverType);
    formData.append("receiverId", receiverId);
    if (newMessage) formData.append("content", newMessage);
    if (selectedFile) formData.append("file", selectedFile);
    // const message = {
    //   senderType: userType,
    //   senderId: userId,
    //   receiverType,
    //   receiverId,
    //   content: newMessage,
    //   timestamp: new Date(),
    // };
    // socket.emit("sendMessage", message);
    // setMessages((prev) => [...prev, message]);
    // setNewMessage("");

    try {
      const response = await API.post("/chat/sendMessage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        socket.emit("sendMessage", response.data.message);
        setMessages((prev) => [...prev, response.data.message]);
        setNewMessage("");
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error("Error sending message");
      console.error(error);
    }
  };

  const handleSelectChat = (partner) => {
    setCurrentChat({ name: partner.name, avatar: partner.avatar, id: partner._id });
    setReceiverId(partner._id);
  };

  const handleEmojiClick = (event, emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + event.emoji);
    setShowEmojiPicker(false);
  };

  const formatDate = (date) => {
    const today = moment().startOf("day");
    const messageDate = moment(date).startOf("day");

    if (moment(date).isSame(today, "day")) {
      return "Today";
    } else if (moment(date).isSame(today.clone().subtract(1, "day"), "day")) {
      return "Yesterday";
    } else {
      return moment(date).format("D MMM YYYY");
    }
  };

  const formatTime = (date) => moment(date).format("h:mm A"); // Example: 4 PM, 2 AM

  let lastDate = null;

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
      <div className="w-1/3 border-r p-4">
        <h3 className="font-bold mb-4">Previous Conversations</h3>
        {chatPartners.map((partner, index) => (
          <div
            key={index}
            className="p-2 border-b flex items-center gap-3 cursor-pointer"
            onClick={() => handleSelectChat(partner.receiver)}
          >
            <img src={partner.receiver.avatar} alt={partner.receiver.name} className="w-10 h-10 rounded-full" />
            <span>{partner.receiver.name}</span>
          </div>
        ))}
      </div>

      <div className="w-2/3 flex flex-col p-4">
        {currentChat ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <img src={currentChat.avatar} alt={currentChat.name} className="w-10 h-10 rounded-full" />
              <p>{currentChat.name}</p>
            </div>
            <div className="flex-1 overflow-y-auto border-b p-4">
  {messages.map((msg, index) => {
    const msgDate = moment(msg.createdAt);
    const formattedDate =
      msgDate.isSame(moment(), "day")
        ? "Today"
        : msgDate.isSame(moment().subtract(1, "day"), "day")
        ? "Yesterday"
        : msgDate.format("D MMM YYYY"); // Example: "2 Feb", "4 Dec 2024"

    const formattedTime = msgDate.format("h:mm A"); // Example: "4 PM", "2 AM"

    const showDateHeader =
      index === 0 ||
      !moment(messages[index - 1]?.createdAt).isSame(msgDate, "day");

    // Check if the message contains a file (image or other types)
    const isImage = msg.file && msg.file.match(/\.(jpeg|jpg|png|gif)$/i);
    console.log(msg.file);
    const isFile = msg.file && !isImage;

    return (
      <div key={index} className={`p-2 ${msg.senderType === "Admin" ? "text-left" : "text-right"}`}>
        {/* Show Date Header if it's a new day */}
        {showDateHeader && (
          <div className="text-center text-gray-500 text-sm my-2">
            {formattedDate}
          </div>
        )}

        {/* Message Content */}
        <div className={`inline-block p-2 rounded-lg max-w-xs ${msg.senderType !== "Admin" ? "bg-blue-100" : "bg-gray-200"}`}>
          {/* Show file preview if it's an image */}
          {isImage && (
            <img src={`http://localhost:5000${msg.file}`} onClick={()=>  window.open(`http://localhost:5000${msg.file}`, '_blank')} alt="Uploaded file" className="w-40 h-40 object-cover rounded-md mb-2" />
          )}

          {/* Show a link for other file types */}
          {isFile && (
            <a href={`http://localhost:5000${msg.file}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline block">
              Download File
            </a>
          )}

          {/* Show message content if available */}
          {msg.content && <p>{msg.content}</p>}

          {/* Message Time */}
          <div className="text-xs text-gray-500 mt-1">{formattedTime}</div>
        </div>
      </div>
    );
  })}
  <div ref={messagesEndRef} />
</div>



            <div className="flex mt-2 relative">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-600">
                <FaSmile />
              </button>
              {showEmojiPicker && <EmojiPicker onEmojiClick={(e) => setNewMessage((prev) => prev + e.emoji)} />}
              <input type="file" onChange={handleFileChange} className="border p-2" />
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border p-2"
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="p-2 bg-blue-500 text-white">
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            Start your professional and respectful conversation
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ChatPage;
