import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FileUp,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  X,
  Sparkles,
  MessageCircle,
  Shield,
  FileSearch,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mlAPI } from "../utils/api";

export default function UserReportUpload() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'success' | 'error'
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Get user ID from auth state - try multiple paths
  const userId = user?._id || user?.id || user?.userId;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    setUploadStatus(null);
    setUploadResult(null);

    if (!selectedFile) return;

    // Check file type
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file only.");
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;

    if (!userId) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log("Uploading file for userId:", userId);
      const result = await mlAPI.uploadMedicalRecord(userId, file);
      console.log("Upload result:", result);
      setUploadStatus("success");
      setUploadResult(result);
    } catch (err) {
      console.error("Upload error details:", err);
      setUploadStatus("error");
      setError(err.message || "Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      <div className="grid md:grid-cols-2 min-h-screen">
        {/* LEFT PANEL - Instructions */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 flex flex-col justify-center bg-white/40 backdrop-blur-xl md:border-r md:border-white/60"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FileUp size={24} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900">
              Upload Reports
            </h2>
          </div>
          <p className="text-blue-600 mb-10 text-sm md:text-base leading-relaxed">
            Upload your medical reports to save them to your health history. Your records are securely stored and accessible anytime.
          </p>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/60 backdrop-blur-md rounded-xl p-5 border border-white/60 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-2">How to upload</h3>
                    <ul className="text-gray-700 text-sm space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Drag & drop or click to select your PDF file</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Click &quot;Upload Report&quot; to save it</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Your report is saved to your health history</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/60 backdrop-blur-md rounded-xl p-5 border border-white/60 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center flex-shrink-0">
                    <FileSearch size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-2">Supported reports</h3>
                    <ul className="text-gray-700 text-sm space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>Blood tests & lab results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>Imaging reports (X-ray, MRI, CT)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>Prescriptions & discharge summaries</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-md border border-emerald-200/50 p-4 rounded-xl text-sm text-emerald-900 shadow-lg flex items-start gap-3"
            >
              <Shield size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Your reports are securely processed and encrypted. PDF format only, max 10MB.</span>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT PANEL - Upload Area */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-bl from-white/20 via-blue-50/20 to-cyan-50/20 backdrop-blur-md"
        >
          <div className="max-w-xl mx-auto w-full">
            {/* Upload Drop Zone */}
            <motion.div
              whileHover={{ scale: file ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !file && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50 backdrop-blur-xl shadow-2xl shadow-blue-500/20 scale-[1.02]"
                  : file
                  ? "border-blue-300 bg-white/80 backdrop-blur-xl shadow-2xl cursor-default"
                  : "border-gray-300 hover:border-blue-500 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl cursor-pointer"
              }`}
            >
              {!file && !isDragging && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-blue-400/5 group-hover:via-cyan-400/5 group-hover:to-blue-400/5 transition-all duration-500"></div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="upload-prompt"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative text-center z-10"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30"
                    >
                      <Upload size={36} className="text-white" />
                    </motion.div>
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      Drop your PDF file here
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      or click to browse from your device
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <FileText size={14} />
                      <span>PDF format • Max 10MB</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file-preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative flex flex-col items-center text-center z-10 px-6"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-5 border border-red-100 shadow-lg">
                      <FileText size={36} className="text-red-500" />
                    </div>
                    <p className="text-gray-900 font-bold text-base truncate max-w-full">
                      {file.name}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatFileSize(file.size)}
                    </p>
                    {!isUploading && uploadStatus !== "success" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 bg-red-50/80 backdrop-blur-md border border-red-200/50 rounded-xl p-4 flex items-center gap-3 shadow-lg"
                >
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {uploadStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={24} className="text-green-600" />
                    <h3 className="text-lg font-bold text-blue-900">Upload Successful!</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Your medical report has been saved to your health history successfully.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Button */}
            {file && uploadStatus !== "success" && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={isUploading}
                className={`mt-6 w-full py-4 rounded-xl font-bold text-white transition-all shadow-xl relative overflow-hidden ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-600/40"
                }`}
              >
                {isUploading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-shimmer"></div>
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isUploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Processing your report...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Upload Report
                    </>
                  )}
                </span>
              </motion.button>
            )}

            {/* Chat CTA after success */}
            {uploadStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 space-y-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/chat")}
                  className="w-full py-4 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30"
                >
                  <MessageCircle size={18} />
                  Go to Chat
                </motion.button>
                <button
                  onClick={handleRemoveFile}
                  className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-white/60 backdrop-blur-md border-2 border-gray-300 text-gray-700 hover:bg-white transition-colors"
                >
                  Upload Another Report
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
