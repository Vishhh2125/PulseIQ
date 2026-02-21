"use client";

import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, Upload, CheckCircle2, AlertCircle, ScanFace } from "lucide-react";

const SkinDetection = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY
  );

  const handleChange = (file) => {
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Image must be under 4MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
  };

  const fileToGenerativePart = async (file) => {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return {
      inlineData: {
        data: base64,
        mimeType: file.type,
      },
    };
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const imagePart = await fileToGenerativePart(image);

      const response = await model.generateContent([
        imagePart,
        {
          text: `
Analyze this skin image and respond in the following STRICT format:

Observation:
<One paragraph describing what is visible>

Explanation:
<One paragraph explaining what it might indicate>

Possible Causes:
- cause 1
- cause 2
- cause 3

Use simple, non-medical language.
Do not add extra sections.
`,
        },
      ]);

      const text = response.response.text();

      const observation =
        text.split("Observation:")[1]?.split("Explanation:")[0]?.trim() || "";

      const explanation =
        text.split("Explanation:")[1]?.split("Possible Causes:")[0]?.trim() || "";

      const causesText =
        text.split("Possible Causes:")[1]?.trim() || "";

      const causes = causesText
        .split("\n")
        .map((c) => c.replace("-", "").trim())
        .filter(Boolean);

      setAnalysis({ observation, explanation, causes });

    } catch (err) {
      console.error(err);
      alert("Error analyzing image. Check console.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <ScanFace size={22} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-base">
                AI Skin Analyzer
              </h1>
              <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                AI-Powered Insights
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 min-h-[calc(100vh-60px)]">
        {/* LEFT PANEL */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 flex flex-col justify-center bg-white/40 backdrop-blur-xl md:border-r md:border-white/60"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
              AI Skin Analyzer
            </h1>
          </div>
          <p className="text-blue-600 mb-10 text-sm md:text-base leading-relaxed">
            Upload a skin image to get simple, AI-powered insights about possible conditions.
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
                    <h3 className="font-semibold text-blue-900 text-sm mb-2">How to use</h3>
                    <ul className="text-gray-700 text-sm space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Upload a clear photo of the affected skin area</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Click &quot;Analyze Image&quot;</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Review the AI-generated insights</span>
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
                    <Camera size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-2">Tips for best results</h3>
                    <ul className="text-gray-700 text-sm space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>Use good lighting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>Keep the camera focused</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>Avoid filters or heavy editing</span>
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
              className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-md border border-amber-200/50 p-4 rounded-xl text-sm text-amber-900 shadow-lg flex items-start gap-3"
            >
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <span>This tool provides informational insights only and is not a medical diagnosis.</span>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-bl from-white/20 via-blue-50/20 to-cyan-50/20 backdrop-blur-md"
        >
          <div className="max-w-xl mx-auto w-full">
            <motion.label 
              whileHover={{ scale: preview ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 overflow-hidden ${
                preview 
                  ? "border-blue-300 bg-white/80 backdrop-blur-xl shadow-2xl" 
                  : "border-gray-300 hover:border-blue-500 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl"
              }`}
            >
              {!preview && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-cyan-400/0 to-blue-400/0 group-hover:from-blue-400/5 group-hover:via-cyan-400/5 group-hover:to-blue-400/5 transition-all duration-500"></div>
              )}
              
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full h-full p-4"
                  >
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setImage(null);
                        setPreview(null);
                        setAnalysis(null);
                      }}
                      className="absolute top-6 right-6 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      ✕
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
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
                      <Camera size={36} className="text-white" />
                    </motion.div>
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      Click to upload skin image
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      PNG, JPG, JPEG • Max 4MB
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Upload size={14} />
                      <span>Drag & drop supported</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleChange(e.target.files[0])}
              />
            </motion.label>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={loading || !image}
              className={`mt-6 w-full py-4 rounded-xl font-bold text-white transition-all shadow-xl relative overflow-hidden ${
                loading || !image
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-600/40"
              }`}
            >
              {loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-shimmer"></div>
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analyze Image
                  </>
                )}
              </span>
            </motion.button>

            <AnimatePresence>
              {analysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <CheckCircle2 size={24} className="text-green-600" />
                    <h3 className="text-lg font-bold text-blue-900">Skin Analysis Results</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Observation</h4>
                      <p className="text-gray-700 leading-relaxed">{analysis.observation}</p>
                    </div>
                    
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Explanation</h4>
                      <p className="text-gray-700 leading-relaxed">{analysis.explanation}</p>
                    </div>
                    
                    {analysis.causes.length > 0 && (
                      <>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Possible Causes</h4>
                          <ul className="space-y-2">
                            {analysis.causes.map((cause, i) => (
                              <motion.li 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-3 text-gray-700"
                              >
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                <span>{cause}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkinDetection;