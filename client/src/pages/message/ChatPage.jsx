import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { 
  FaPaperPlane, 
  FaSmile, 
  FaArrowAltCircleLeft, 
  FaReply, 
  FaTimes, 
  FaPaperclip,
  FaChevronLeft
} from "react-icons/fa";
import toast from "react-hot-toast";
import API from "../../utils/API";
import EmojiPicker from "emoji-picker-react";
import moment from "moment";
import Navbar from "../../component/Navbar";
import { useSelector } from "react-redux";

const socket = io(import.meta.env.VITE_APP_BASE_URL);

const ChatPage = () => {
  const user = useSelector((state) => state.user.user);
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
  const [replyTo, setReplyTo] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Automatically hide sidebar on mobile when a chat is selected
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(!currentChat);
      } else {
        setShowSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on initial load
    
    return () => window.removeEventListener('resize', handleResize);
  }, [currentChat]);

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
      // IMPORTANT: Only add messages that are not sent by the current user
      // This prevents duplicates when you send a message yourself
      if (message.senderId !== userId) {
        setMessages((prev) => [...prev, message]);
      }
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

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleReply = (message) => {
    setReplyTo(message);
    // Focus on the input field after setting reply
    document.getElementById("messageInput").focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const goBack = () => {
    setShowSidebar(true);
    // Only reset currentChat on mobile
    if (window.innerWidth < 768) {
      setCurrentChat(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage && !selectedFile) return;
    
    const formData = new FormData();
    formData.append("senderType", userType);
    formData.append("senderId", userId);
    formData.append("receiverType", receiverType);
    formData.append("receiverId", receiverId);
    if (newMessage) formData.append("content", newMessage);
    if (selectedFile) formData.append("file", selectedFile);
    if (replyTo) formData.append("replyTo", replyTo._id);
  
    try {
      const response = await API.post("/chat/sendMessage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.status) {
        // 1. Add the message to your local state first
        setMessages((prev) => [...prev, response.data.message]);
        
        // 2. Then emit to socket ONLY for other clients to receive
        socket.emit("sendMessage", response.data.message);
        
        // 3. Reset the form
        setNewMessage("");
        setSelectedFile(null);
        setReplyTo(null);
      }
    } catch (error) {
      toast.error("Error sending message");
      console.error(error);
    }
  };

  const handleSelectChat = (partner) => {
    setCurrentChat({
      name: partner.name,
      avatar: partner.avatar,
      id: partner._id,
    });
    setReceiverId(partner._id);
    
    // Hide sidebar on mobile when selecting a chat
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const handleEmojiClick = (event) => {
    setNewMessage((prevMessage) => prevMessage + event.emoji);
    setShowEmojiPicker(false);
  };

  const getReplyMessage = (replyId) => {
    return messages.find(msg => msg._id === replyId);
  };

  const formatDate = (date) => {
    const today = moment().startOf("day");
    const messageDate = moment(date).startOf("day");

    if (moment(date).isSame(today, "day")) {
      return "Today";
    } else if (
      moment(date).isSame(today.clone().subtract(1, "day"), "day")
    ) {
      return "Yesterday";
    } else {
      return moment(date).format("D MMM YYYY");
    }
  };

  const formatTime = (date) => moment(date).format("h:mm A");

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] bg-gray-100">
        {/* Chat Sidebar */}
        {showSidebar && (
          <div className="w-full md:w-1/3 lg:w-1/4 border-r bg-white overflow-y-auto">
            <div className="p-4">
              <h3 className="font-bold mb-4 text-lg">Conversations</h3>
              {chatPartners.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No conversations yet</p>
              ) : (
                chatPartners.map((partner, index) => (
                  <div
                    key={index}
                    className={`p-3 mb-2 flex items-center gap-3 cursor-pointer rounded-lg hover:bg-gray-100 transition ${
                      currentChat && currentChat.id === partner.receiver._id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                    onClick={() => handleSelectChat(partner.receiver)}
                  >
                    <img
                      src={partner.receiver.avatar}
                      alt={partner.receiver.name}
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block truncate">{partner.receiver.name}</span>
                      <p className="text-xs text-gray-500 truncate">
                        {partner.lastMessage?.content
                          ? partner.lastMessage.content.slice(0, 25) + (partner.lastMessage.content.length > 25 ? '...' : '')
                          : partner.lastMessage?.file
                          ? "Sent a file"
                          : "Start a conversation"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Main Area */}
        <div className={`flex-1 flex flex-col bg-white ${!showSidebar ? 'w-full' : 'hidden md:flex'}`}>
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b shadow-sm">
                {window.innerWidth < 768 && (
                  <button 
                    onClick={goBack}
                    className="p-1 mr-1 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <FaChevronLeft />
                  </button>
                )}
                <img
                  src={currentChat.avatar}
                  alt={currentChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{currentChat.name}</p>
                  <p className="text-xs text-gray-500">
                    {messages.length > 0
                      ? "Last active " + formatTime(messages[messages.length - 1].createdAt)
                      : "No messages yet"}
                  </p>
                </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Start a conversation with {currentChat.name}
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const msgDate = moment(msg.createdAt);
                    const formattedDate = msgDate.isSame(moment(), "day")
                      ? "Today"
                      : msgDate.isSame(moment().subtract(1, "day"), "day")
                      ? "Yesterday"
                      : msgDate.format("D MMM YYYY");

                    const formattedTime = msgDate.format("h:mm A");
                    const showDateHeader =
                      index === 0 ||
                      !moment(messages[index - 1]?.createdAt).isSame(msgDate, "day");

                    const isImage =
                      msg.file && msg.file.match(/\.(jpeg|jpg|png|gif)$/i);
                    const isFile = msg.file && !isImage;
                    const isFromCurrentUser = msg.senderType !== "Admin";
                    
                    // Get reply message if this message is a reply
                    const replyMessage = msg.replyTo ? 
                    // If replyTo is populated as an object, use it directly
                    (typeof msg.replyTo === 'object' ? msg.replyTo : 
                    // Otherwise, try to find it in the messages array
                    getReplyMessage(msg.replyTo)) 
                    : null;

                    return (
                      <div key={index}>
                        {showDateHeader && (
                          <div className="text-center my-3">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formattedDate}
                            </span>
                          </div>
                        )}
                        
                        <div className={`mb-3 flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] md:max-w-[70%]`}>
                            {/* Reply preview */}
                            {replyMessage && (
            <div className={`text-xs mb-1 rounded px-2 py-1 ${isFromCurrentUser ? "bg-blue-50 mr-2" : "bg-gray-100 ml-2"}`}>
              <p className="text-gray-500 font-medium">
                Replying to {replyMessage.senderType === userType ? "yourself" : currentChat.name}
              </p>
              <p className="truncate">
                {replyMessage.content || (replyMessage.file ? "Sent a file" : "")}
              </p>
            </div>
          )}
                            
                            <div 
                              className={`relative rounded-lg p-2 md:p-3 shadow-sm ${
                                isFromCurrentUser
                                  ? "bg-blue-500 text-white"
                                  : "bg-white border"
                              }`}
                            >
                              {/* Image preview */}
                              {isImage && (
                                <div className="mb-2">
                                  <img
                                    src={`${import.meta.env.VITE_APP_BASE_URL}${msg.file}`}
                                    onClick={() => window.open(`${import.meta.env.VITE_APP_BASE_URL}${msg.file}`, "_blank")}
                                    alt="Uploaded file"
                                    className="w-full max-h-32 md:max-h-40 object-cover rounded cursor-pointer"
                                  />
                                </div>
                              )}

                              {/* File download link */}
                              {isFile && (
                                <a
                                  href={`${import.meta.env.VITE_APP_BASE_URL}${msg.file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center mb-2 ${isFromCurrentUser ? "text-blue-100" : "text-blue-500"}`}
                                >
                                  <FaPaperclip className="mr-1" />
                                  <span className="underline truncate text-sm">
                                    {msg.file.split('/').pop()}
                                  </span>
                                </a>
                              )}

                              {/* Message content */}
                              {msg.content && <p className="break-words">{msg.content}</p>}

                              {/* Message time and reply button */}
                              <div className={`flex items-center justify-between mt-1 text-xs ${isFromCurrentUser ? "text-blue-200" : "text-gray-500"}`}>
                                <span>{formattedTime}</span>
                                <button 
                                  onClick={() => handleReply(msg)}
                                  className={`ml-2 hover:bg-${isFromCurrentUser ? "blue-600" : "gray-200"} p-1 rounded transition-colors`}
                                >
                                  <FaReply /> 
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply preview */}
              {replyTo && (
                <div className="p-2 bg-gray-100 flex items-center justify-between border-t">
                  <div className="flex items-center overflow-hidden">
                    <div className="border-l-4 border-blue-500 pl-2 flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Replying to message</p>
                      <p className="text-sm truncate">
                        {replyTo.content || (replyTo.file ? "Sent a file" : "")}
                      </p>
                    </div>
                  </div>
                  <button onClick={cancelReply} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-2">
                    <FaTimes />
                  </button>
                </div>
              )}

              {/* Input area */}
              <div className="p-2 md:p-3 border-t">
                {/* File preview */}
                {selectedFile && (
                  <div className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                    <div className="flex items-center overflow-hidden">
                      <FaPaperclip className="text-blue-500 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">{selectedFile.name}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedFile(null)} 
                      className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-2"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-1 md:gap-2">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                    className="p-1 md:p-2 text-gray-500 hover:text-yellow-500 hover:bg-gray-100 rounded-full"
                  >
                    <FaSmile />
                  </button>
                  
                  <button 
                    onClick={handleFileClick} 
                    className="p-1 md:p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                  >
                    <FaPaperclip />
                  </button>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  
                  <div className="relative flex-1">
                    <input
                      id="messageInput"
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full border rounded-full py-2 px-3 md:px-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 right-0 md:right-auto z-10">
                        <div className="emoji-picker-container" style={{ transform: 'scale(0.8)', transformOrigin: 'bottom right' }}>
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={sendMessage} 
                    disabled={!newMessage && !selectedFile}
                    className={`p-2 md:p-3 rounded-full ${
                      !newMessage && !selectedFile 
                        ? "bg-gray-300 text-gray-500" 
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 text-center">
              <div className="mb-4 text-blue-500 text-4xl md:text-5xl">
                <FaArrowAltCircleLeft />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Start a Conversation</h3>
              <p className="text-gray-500 max-w-md text-sm md:text-base">
                {window.innerWidth < 768 
                  ? "Select a contact to start your conversation"
                  : "Select a contact from the left sidebar to start your professional and respectful conversation"
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;