import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mlAPI } from "../utils/api";

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
      console.log("Sending chat request:", { userId, question: userMessage.text });
      const response = await mlAPI.chat(userId, userMessage.text);
      console.log("Chat response received:", response);

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: response.final_response,
        personalized: response.personalized_mode,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
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
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/main")}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-slate-800 font-semibold text-sm">
                AI Health Assistant
              </h1>
              <p className="text-slate-500 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Online • Powered by Medical RAG
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "bot" && (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      message.isError
                        ? "bg-red-100"
                        : "bg-gradient-to-br from-blue-500 to-cyan-400"
                    }`}
                  >
                    {message.isError ? (
                      <AlertCircle size={16} className="text-red-500" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[75%] ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl rounded-tr-md"
                      : message.isError
                      ? "bg-red-50 text-red-700 border border-red-100 rounded-2xl rounded-tl-md"
                      : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-2xl rounded-tl-md"
                  } px-4 py-3`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <div
                    className={`flex items-center gap-2 mt-2 ${
                      message.type === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.personalized && (
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={10} />
                        Personalized
                      </span>
                    )}
                    <span
                      className={`text-[10px] ${
                        message.type === "user"
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white text-slate-700 border border-slate-100 shadow-sm rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  <span className="text-sm text-slate-500">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 px-4 py-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all px-4 py-2">
            <MessageCircle size={20} className="text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your health, symptoms, or medical reports..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                inputValue.trim() && !isLoading
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm hover:shadow-md"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-slate-400 text-xs mt-2">
            AI responses are for informational purposes only. Always consult a healthcare professional.
          </p>
        </form>
      </div>
    </div>
  );
}
