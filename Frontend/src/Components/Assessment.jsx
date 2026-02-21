// src/components/AssessmentFlow.jsx
import { useState } from 'react';
import axios from 'axios';
import QuestionScreen from './QuestionScreen';
import ResultScreen from './ResultScreen';
import {
  Brain,
  Heart,
  ArrowLeft,
  Loader2,
  MessageCircle,
  TrendingUp
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
       
        <div className="p-6 w-full flex justify-center">
          <div className="max-w-4xl w-full">
            <div className="bg-white border rounded-xl p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Processing Your Assessment
                  </h2>
                  <p className="text-gray-500 mt-1">{loadingMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MAIN UI
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
     
      {/* Header */}
      <div className="p-6 w-full flex justify-center">
        <div className="max-w-4xl w-full">

          <div className="flex items-center gap-3 mb-6">
            
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Mental Health Assessment
              </h1>
              <p className="text-gray-500">
                Personalized questions to understand your mental wellness
              </p>
            </div>
          </div>

          {/* CONTEXT STEP */}
          {step === 'context' && (
            <div className="bg-white border rounded-xl p-8 mb-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  How are you feeling today?
                </h2>
                <p className="text-gray-500">
                  Share what's on your mind — completely anonymous
                </p>
              </div>

              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., exam stress, family conflict, burnout..."
                className="w-full p-4 border rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none"
                rows={4}
              />

              {/* Assessment Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <button
                  onClick={() => setAssessmentType('PHQ9')}
                  className={`p-4 border rounded-xl text-left ${
                    assessmentType === 'PHQ9'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Depression (PHQ-9)
                      </div>
                      <div className="text-sm text-gray-500">9 questions</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setAssessmentType('GAD7')}
                  className={`p-4 border rounded-xl text-left ${
                    assessmentType === 'GAD7'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Brain className="text-blue-600" />
                    <div>
                      <div className="font-semibold text-gray-800">
                        Anxiety (GAD-7)
                      </div>
                      <div className="text-sm text-gray-500">7 questions</div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={handleStartAssessment}
                disabled={!context.trim()}
                className="w-full mt-6 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Start Assessment →
              </button>
            </div>
          )}

          {/* QUESTIONS */}
          {step === 'questions' && currentQuestion && (
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
          )}

          {/* RESULT */}
          {step === 'result' && result && (
            <ResultScreen result={result} onRestart={handleRestart} />
          )}
        </div>
      </div>
    </div>
  );
}