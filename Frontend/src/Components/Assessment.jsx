// src/components/AssessmentFlow.jsx
import { useState } from 'react';
import axios from 'axios';
import QuestionScreen from './QuestionScreen';
import ResultScreen from './ResultScreen';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Heart,
  Loader2,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';


const API_BASE = 'http://localhost:5000/api';

export default function AssessmentFlow() {
  const [step, setStep] = useState('context');
  const [assessmentType, setAssessmentType] = useState('PHQ9');
  const [context, setContext] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ START ASSESSMENT
  const handleStartAssessment = async () => {
    setLoading(true);
    setLoadingMessage('Preparing your personalized questions...');
    try {
      const response = await axios.post(`${API_BASE}/assess`, {
        assessment_type: assessmentType,
        context: context.trim()
      });
      setQuestions(response.data);
      setStep('questions');
    } catch (error) {
      console.error(error);
      alert(`Failed to start assessment: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
    setLoadingMessage('');
  };

  // ✅ SELECT ANSWER
  const handleAnswerSelect = (answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  // ✅ NEXT QUESTION
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  // ✅ PREVIOUS QUESTION
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    setLoading(true);
    setLoadingMessage('Processing your responses...');
    try {
      const responses = questions.map((q, idx) => ({
        q_id: q.q_id,
        answer: answers[idx] || 0
      }));

      const response = await axios.post(`${API_BASE}/submit`, {
        int_id: "x9f3k2m8",
        assessment_type: assessmentType,
        responses,
        context
      });

      setResult(response.data);
      setStep('result');
    } catch (error) {
      console.error(error);
      alert(`Failed to submit: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
    setLoadingMessage('');
  };

  // ✅ RESTART
  const handleRestart = () => {
    setStep('context');
    setContext('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  // ✅ LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-16 text-center shadow-2xl"
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-400/30 blur-xl animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Processing Your Assessment
              </h2>
              <p className="text-gray-500 mt-2">{loadingMessage}</p>
            </div>
            <div className="flex gap-1.5">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ✅ MAIN UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">

      {/* Questions & Result — full width */}
      {step === 'questions' && currentQuestion && (
        <div className="p-6 flex justify-center">
          <div className="max-w-4xl w-full">
            <QuestionScreen
              question={currentQuestion}
              selected={answers[currentQuestionIndex]}
              onSelect={handleAnswerSelect}
              onBack={handleBack}
              onSkip={handleNext}
              isFirst={currentQuestionIndex === 0}
              isLast={currentQuestionIndex === questions.length - 1}
              progress={progress}
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
            />
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="p-6 flex justify-center">
          <div className="max-w-4xl w-full">
            <ResultScreen result={result} onRestart={handleRestart} />
          </div>
        </div>
      )}

      {/* CONTEXT STEP — two-column */}
      {step === 'context' && (
        <div className="grid md:grid-cols-2 min-h-screen">

          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12 flex flex-col justify-center bg-white/40 backdrop-blur-xl md:border-r md:border-white/60"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Brain size={24} className="text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
                Mental Health
              </h1>
            </div>
            <p className="text-blue-600 mb-10 text-sm md:text-base leading-relaxed">
              Answer personalized questions to understand your mental wellness. Completely anonymous and confidential.
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
                      <h3 className="font-semibold text-blue-900 text-sm mb-2">How it works</h3>
                      <ul className="text-gray-700 text-sm space-y-1.5">
                        <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span><span>Describe how you're feeling today</span></li>
                        <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span><span>Choose Depression (PHQ-9) or Anxiety (GAD-7)</span></li>
                        <li className="flex items-start gap-2"><span className="text-blue-600 mt-0.5">•</span><span>Answer personalized questions & get insights</span></li>
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
                      <ClipboardList size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm mb-2">Assessment types</h3>
                      <ul className="text-gray-700 text-sm space-y-1.5">
                        <li className="flex items-start gap-2"><span className="text-cyan-600 mt-0.5">•</span><span>PHQ-9 — Depression screening (9 questions)</span></li>
                        <li className="flex items-start gap-2"><span className="text-cyan-600 mt-0.5">•</span><span>GAD-7 — Anxiety screening (7 questions)</span></li>
                        <li className="flex items-start gap-2"><span className="text-cyan-600 mt-0.5">•</span><span>AI-personalized based on your context</span></li>
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
                <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Your responses are completely anonymous and never shared with anyone.</span>
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

              {/* Feeling prompt */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/30"
                >
                  <Heart size={30} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">How are you feeling today?</h2>
                <p className="text-gray-500 text-sm">Share what's on your mind — completely anonymous</p>
              </motion.div>

              {/* Textarea */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative group mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-2xl blur-xl group-focus-within:blur-2xl transition-all"></div>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g., exam stress, family conflict, burnout..."
                  className="relative w-full p-5 bg-white/70 backdrop-blur-xl border-2 border-white/60 rounded-2xl focus:outline-none focus:border-blue-400/60 resize-none text-gray-900 placeholder:text-gray-400 shadow-lg text-sm leading-relaxed"
                  rows={4}
                />
              </motion.div>

              {/* Assessment Type */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAssessmentType('PHQ9')}
                  className={`relative p-4 rounded-2xl text-left transition-all shadow-lg border-2 ${
                    assessmentType === 'PHQ9'
                      ? 'border-blue-500 bg-blue-50/80 backdrop-blur-md shadow-blue-500/20'
                      : 'border-white/60 bg-white/60 backdrop-blur-md hover:shadow-xl'
                  }`}
                >
                  {assessmentType === 'PHQ9' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-2xl"></div>
                  )}
                  <div className="relative flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      assessmentType === 'PHQ9' ? 'bg-blue-600' : 'bg-gray-100'
                    }`}>
                      <TrendingUp size={16} className={assessmentType === 'PHQ9' ? 'text-white' : 'text-gray-500'} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Depression</div>
                      <div className="text-xs text-gray-500">PHQ-9 • 9 questions</div>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setAssessmentType('GAD7')}
                  className={`relative p-4 rounded-2xl text-left transition-all shadow-lg border-2 ${
                    assessmentType === 'GAD7'
                      ? 'border-cyan-500 bg-cyan-50/80 backdrop-blur-md shadow-cyan-500/20'
                      : 'border-white/60 bg-white/60 backdrop-blur-md hover:shadow-xl'
                  }`}
                >
                  {assessmentType === 'GAD7' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-2xl"></div>
                  )}
                  <div className="relative flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      assessmentType === 'GAD7' ? 'bg-cyan-600' : 'bg-gray-100'
                    }`}>
                      <Brain size={16} className={assessmentType === 'GAD7' ? 'text-white' : 'text-gray-500'} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Anxiety</div>
                      <div className="text-xs text-gray-500">GAD-7 • 7 questions</div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>

              {/* Start Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: context.trim() ? 1.02 : 1 }}
                whileTap={{ scale: context.trim() ? 0.98 : 1 }}
                onClick={handleStartAssessment}
                disabled={!context.trim()}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-xl relative overflow-hidden ${
                  context.trim()
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-600/40'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles size={20} />
                  Start Assessment
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}