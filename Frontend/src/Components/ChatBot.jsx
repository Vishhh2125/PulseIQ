import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mlAPI } from "../utils/api";
import { formatMarkdownText } from "../utils/markdownFormatter.jsx";

export default function ChatBot() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm your AI health assistant. I can help answer questions about your medical reports and provide health guidance. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get user ID from auth state - try multiple paths
  const userId = user?._id || user?.id || user?.userId;

  // Debug: log userId if not found
  useEffect(() => {
    if (!userId) {
      console.warn("❌ userId not found in auth state");
      console.warn("Full user object:", JSON.stringify(user, null, 2));
      console.warn("Available keys:", user ? Object.keys(user) : 'user is null');
      setError("User not authenticated. Please log in first.");
    } else {
      console.log("✅ userId found:", userId);
    }
  }, [userId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (!userId) {
      setError("User ID not found. Please log in first.");
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      // Collect real-time watch data from localStorage
      const watchData = localStorage.getItem('fitnessData') 
        ? JSON.parse(localStorage.getItem('fitnessData')) 
        : null;
      
      console.log("Sending chat request:", { userId, question: userMessage.text, watchData });
      const response = await mlAPI.chat(userId, userMessage.text, watchData);
      console.log("Chat response received:", response);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: response.final_response,
        personalized: response.personalized_mode,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // 💾 Save chat to backend for digital twin analysis
      try {
        await mlAPI.saveChat(userId, userMessage.text, response.final_response, response.personalized_mode);
        console.log("Chat saved to digital twin");
      } catch (saveErr) {
        console.error("Error saving chat:", saveErr);
        // Don't show error to user, just log it
      }
    } catch (err) {
      console.error("Chat error details:", err);
      setError(err.message || "Failed to get response. Please try again.");
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 flex flex-col">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-white/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div
                animate={{ boxShadow: ["0 0 0 0 rgba(59,130,246,0.3)", "0 0 0 12px rgba(59,130,246,0)", "0 0 0 0 rgba(59,130,246,0)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30"
              >
                <Bot size={22} className="text-white" />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-base">
                AI Health Assistant
              </h1>
              <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Online • Ready to help
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "bot" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.isError
                        ? "bg-red-100 shadow-red-200/50"
                        : "bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/30"
                    }`}
                  >
                    {message.isError ? (
                      <AlertCircle size={16} className="text-red-600" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </motion.div>
                )}

                <div
                  className={`max-w-[70%] ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-blue-600/30"
                      : message.isError
                      ? "bg-red-50/80 backdrop-blur-md text-red-900 border border-red-200/50 rounded-2xl rounded-tl-sm shadow-lg"
                      : "bg-white/70 backdrop-blur-xl text-gray-900 border border-white/60 rounded-2xl rounded-tl-sm shadow-lg"
                  } px-5 py-4`}
                >
                  {message.type === "bot" && !message.isError ? (
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                      {formatMarkdownText(message.text)}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                  )}
                  <div
                    className={`flex items-center gap-2 mt-2.5 text-xs ${
                      message.type === "user"
                        ? "justify-end text-blue-200"
                        : "justify-start text-gray-400"
                    }`}
                  >
                    {message.personalized && (
                      <span className="bg-blue-100/80 backdrop-blur-md text-blue-700 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium shadow-sm">
                        <Sparkles size={10} />
                        Personalized
                      </span>
                    )}
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>

                {message.type === "user" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-500/20"
                  >
                    <User size={16} className="text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white/70 backdrop-blur-xl text-gray-900 border border-white/60 rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      className="w-2.5 h-2.5 bg-cyan-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      className="w-2.5 h-2.5 bg-blue-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-6 py-3 bg-red-50/80 backdrop-blur-md border-t border-red-200/50"
          >
            <div className="max-w-5xl mx-auto flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white/70 backdrop-blur-lg border-t border-white/60 px-6 py-5">
        <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto">
          <motion.div 
            className="relative flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-2xl border-2 border-gray-200/60 px-5 py-3.5 shadow-lg hover:shadow-xl transition-shadow duration-300 focus-within:border-blue-400/60 focus-within:shadow-blue-500/10"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none" style={{ margin: '-1px' }}></div>
            <MessageCircle size={20} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your health, symptoms, or medical reports..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              whileHover={inputValue.trim() && !isLoading ? { scale: 1.1 } : {}}
              whileTap={inputValue.trim() && !isLoading ? { scale: 0.9 } : {}}
              className={`p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 ${
                inputValue.trim() && !isLoading
                  ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send size={18} />
            </motion.button>
          </motion.div>
          <p className="text-center text-gray-400 text-xs mt-3">
            AI responses are for informational purposes. Always consult a healthcare professional.
          </p>
        </form>
      </div>
    </div>
  );
}
