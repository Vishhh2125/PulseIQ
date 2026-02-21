import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  Loader2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { mlAPI } from "../utils/api";
import { formatMarkdownText } from "../utils/markdownFormatter.jsx";

export default function DigitalTwinDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user ID
  const userId = user?._id || user?.id || user?.userId;

  // Fetch digital twin analysis and chat history
  useEffect(() => {
    if (!userId) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get digital twin analysis
        const twinData = await mlAPI.getDigitalTwin(userId);
        setDigitalTwin(twinData);

        // Get chat history
        const historyData = await mlAPI.getChatHistory(userId, 20);
        setChatHistory(historyData.chats || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load digital twin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "Critical":
        return "border-red-500 bg-red-50";
      case "High":
        return "border-orange-500 bg-orange-50";
      case "Moderate":
        return "border-yellow-500 bg-yellow-50";
      case "Low":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-green-500 bg-green-50";
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Moderate":
        return "bg-yellow-500 text-white";
      case "Low":
        return "bg-blue-500 text-white";
      default:
        return "bg-green-500 text-white";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/main")}
            className="p-2 hover:bg-slate-200 rounded-lg transition"
            title="Go back"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Digital Twin</h1>
            <p className="text-sm text-slate-600">
              AI-powered health analysis from your conversations
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-slate-600">Analyzing your health data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Risk Assessment Card - Only Show if There's a Risk */}
          {digitalTwin && (
            <>
              {digitalTwin.show_alert ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-2 rounded-lg p-6 ${getRiskColor(
                    digitalTwin.risk_level
                  )}`}
                >
                  <div className="flex items-start gap-4">
                    <AlertTriangle
                      className={`w-8 h-8 flex-shrink-0 ${
                        digitalTwin.risk_level === "Critical" ||
                        digitalTwin.risk_level === "High"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    />
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Health Alert
                      </h2>
                      <div className="mb-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRiskBadgeColor(
                            digitalTwin.risk_level
                          )} mb-3`}
                        >
                          {digitalTwin.risk_level} Risk
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium text-lg">
                        {digitalTwin.summary}
                      </p>
                      <p className="text-slate-600 text-sm mt-3">
                        ⚕️ Please consult with a healthcare professional for
                        proper diagnosis and treatment.
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-green-500 bg-green-50 rounded-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <Activity className="w-8 h-8 text-green-500 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">
                        Health Status
                      </h2>
                      <p className="text-slate-800 font-medium text-lg">
                        {digitalTwin.summary}
                      </p>
                      <p className="text-slate-600 text-sm mt-3">
                        ✅ Continue with your current health practices and
                        regular check-ups.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">
                        Total Chats
                      </p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">
                        {digitalTwin.total_chats}
                      </p>
                    </div>
                    <MessageSquare className="w-10 h-10 text-blue-500 opacity-50" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">
                        Risk Level
                      </p>
                      <p
                        className={`text-3xl font-bold mt-2 ${
                          digitalTwin.risk_level === "None"
                            ? "text-green-600"
                            : digitalTwin.risk_level === "Critical"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {digitalTwin.risk_level}
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-slate-400 opacity-50" />
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">
                        Last Updated
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mt-2">
                        {digitalTwin.last_chat
                          ? formatDate(digitalTwin.last_chat)
                          : "N/A"}
                      </p>
                    </div>
                    <Clock className="w-10 h-10 text-purple-500 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Recent Conversations */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Recent Conversations
                  </h3>
                </div>

                {chatHistory.length > 0 ? (
                  <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
                    {chatHistory.map((chat, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 hover:bg-slate-50 transition"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">
                              Q
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-medium text-sm mb-1 font-semibold">
                              Q: {chat.question}
                            </p>
                            <div className="text-slate-600 text-sm mb-2 space-y-1">
                              {formatMarkdownText(chat.response)}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              {formatDate(chat.created_at)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-600">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No conversations yet. Start chatting with the AI!</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/chat")}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Continue Chatting
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold rounded-lg transition flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Refresh
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
