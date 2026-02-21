import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Smile,
  Meh,
  Frown,
  ArrowLeft,
  CheckCircle2,
  Tag,
  Calendar,
  Clock,
  Moon,
  Coffee,
  Brain,
  Briefcase,
  TrendingUp,
  Award,
  BarChart3,
  Heart,
  MessageCircle,
  Users,
  Bell,
  Sparkles,
  Loader,
  X,
  ArrowRight
} from 'lucide-react';


const API_KEY = 'AIzaSyByjtUySKpjRTPuyoHjt0OQNYz4xgGgTvY';

const DailyCheckIn = ({ onBack }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({
    mood: null,
    sleep: null,
    hunger: null,
    anxiety: null,
    workMood: null,
    energy: null,
    social: null,
    focus: null,
    freeText: '',
    notes: '',
    tags: []
  });
  const [history, setHistory] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisError, setAnalysisError] = useState('');

  const availableTags = useMemo(() => [
    'study', 'friends', 'sleep', 'exercise', 'family', 'anxiety', 'focus', 'gratitude', 'work', 'health'
  ], []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('pulseiqDailyCheckins') || '[]');
      setHistory(saved);
    } catch {}
  }, []);

  const assessmentSteps = [
    {
      id: 'mood',
      title: 'How are you feeling right now?',
      icon: Heart,
      options: [
        { id: 5, label: 'Great', icon: Smile, color: '#2dc8ca', description: 'Feeling wonderful and energetic' },
        { id: 4, label: 'Good', icon: Smile, color: '#52c97a', description: 'Generally positive and content' },
        { id: 3, label: 'Okay', icon: Meh, color: '#eac163', description: 'Neutral, neither good nor bad' },
        { id: 2, label: 'Not Good', icon: Frown, color: '#f99c5b', description: 'Feeling a bit down' },
        { id: 1, label: 'Very Low', icon: Frown, color: '#f38788', description: 'Struggling today' },
      ]
    },
    {
      id: 'sleep',
      title: 'How was your sleep last night?',
      icon: Moon,
      options: [
        { id: 5, label: 'Excellent', color: '#2dc8ca', description: 'Slept 7-9 hours, woke up refreshed' },
        { id: 4, label: 'Good', color: '#52c97a', description: 'Decent sleep, mostly rested' },
        { id: 3, label: 'Average', color: '#eac163', description: 'Some tossing and turning' },
        { id: 2, label: 'Poor', color: '#f99c5b', description: 'Restless sleep, tired' },
        { id: 1, label: 'Very Poor', color: '#f38788', description: 'Barely slept or very disrupted' },
      ]
    },
    {
      id: 'hunger',
      title: 'How are your eating patterns today?',
      icon: Coffee,
      options: [
        { id: 5, label: 'Very Good', color: '#2dc8ca', description: 'Regular, healthy meals' },
        { id: 4, label: 'Good', color: '#52c97a', description: 'Mostly regular eating' },
        { id: 3, label: 'Average', color: '#eac163', description: 'Some meals skipped' },
        { id: 2, label: 'Poor', color: '#f99c5b', description: 'Irregular eating, low appetite' },
        { id: 1, label: 'Very Poor', color: '#f38788', description: 'Hardly eating or overeating' },
      ]
    },
    {
      id: 'anxiety',
      title: 'How anxious or stressed do you feel?',
      icon: Brain,
      options: [
        { id: 5, label: 'Very Calm', color: '#2dc8ca', description: 'Relaxed and at peace' },
        { id: 4, label: 'Calm', color: '#52c97a', description: 'Generally relaxed' },
        { id: 3, label: 'Moderate', color: '#eac163', description: 'Some stress but manageable' },
        { id: 2, label: 'Anxious', color: '#f99c5b', description: 'Feeling quite stressed' },
        { id: 1, label: 'Very Anxious', color: '#f38788', description: 'Overwhelming stress/anxiety' },
      ]
    },
    {
      id: 'workMood',
      title: 'How do you feel about work/studies today?',
      icon: Briefcase,
      options: [
        { id: 5, label: 'Very Motivated', color: '#2dc8ca', description: 'Excited and productive' },
        { id: 4, label: 'Motivated', color: '#52c97a', description: 'Ready to tackle tasks' },
        { id: 3, label: 'Neutral', color: '#eac163', description: 'Neither motivated nor demotivated' },
        { id: 2, label: 'Unmotivated', color: '#f99c5b', description: 'Struggling to focus' },
        { id: 1, label: 'Very Unmotivated', color: '#f38788', description: 'Hard to get anything done' },
      ]
    },
    {
      id: 'energy',
      title: 'How is your energy level today?',
      icon: TrendingUp,
      options: [
        { id: 5, label: 'Very High', color: '#2dc8ca', description: 'Energetic and lively' },
        { id: 4, label: 'High', color: '#52c97a', description: 'Feeling upbeat' },
        { id: 3, label: 'Average', color: '#eac163', description: 'Moderate energy' },
        { id: 2, label: 'Low', color: '#f99c5b', description: 'A bit drained' },
        { id: 1, label: 'Very Low', color: '#f38788', description: 'Exhausted' },
      ]
    },
    {
      id: 'social',
      title: 'How connected do you feel to others today?',
      icon: Users,
      options: [
        { id: 5, label: 'Very Connected', color: '#2dc8ca', description: 'Strong social support' },
        { id: 4, label: 'Connected', color: '#52c97a', description: 'Generally connected' },
        { id: 3, label: 'Neutral', color: '#eac163', description: 'Neither connected nor isolated' },
        { id: 2, label: 'Isolated', color: '#f99c5b', description: 'Limited interactions' },
        { id: 1, label: 'Very Isolated', color: '#f38788', description: 'Feeling alone' },
      ]
    },
    {
      id: 'focus',
      title: 'How is your focus and concentration?',
      icon: BarChart3,
      options: [
        { id: 5, label: 'Excellent', color: '#2dc8ca', description: 'Laser focused' },
        { id: 4, label: 'Good', color: '#52c97a', description: 'Mostly focused' },
        { id: 3, label: 'Average', color: '#eac163', description: 'On and off' },
        { id: 2, label: 'Poor', color: '#f99c5b', description: 'Hard to concentrate' },
        { id: 1, label: 'Very Poor', color: '#f38788', description: 'Cannot focus at all' },
      ]
    },
    {
      id: 'freeText',
      title: "Anything you'd like to share today?",
      icon: MessageCircle,
      type: 'text',
      placeholder: "Write a few sentences about your day, feelings, or concerns..."
    }
  ];

  const calculateWellnessScore = () => {
    const scores = [
      responses.mood?.id || 0,
      responses.sleep?.id || 0,
      responses.hunger?.id || 0,
      responses.anxiety?.id || 0,
      responses.workMood?.id || 0,
      responses.energy?.id || 0,
      responses.social?.id || 0,
      responses.focus?.id || 0
    ];

    const total = scores.reduce((sum, score) => sum + score, 0);
    const maxTotal = 5 * scores.length;
    const percentage = Math.round((total / maxTotal) * 100);

    return {
      total,
      percentage,
      level: percentage >= 80 ? 'Excellent' :
        percentage >= 60 ? 'Good' :
          percentage >= 40 ? 'Fair' : 'Needs Attention'
    };
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#2dc8ca';
    if (percentage >= 60) return '#52c97a';
    if (percentage >= 40) return '#eac163';
    return '#f38788';
  };

  const handleResponse = (step, response) => {
    setResponses(prev => ({
      ...prev,
      [step]: response
    }));

    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowScore(true);
    }
  };

  const handleTextNext = () => {
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowScore(true);
    }
  };

  const buildAnalysisPrompt = () => {
    const chosen = [
      { key: 'mood', label: 'Mood' },
      { key: 'sleep', label: 'Sleep' },
      { key: 'hunger', label: 'Eating' },
      { key: 'anxiety', label: 'Anxiety/Stress' },
      { key: 'workMood', label: 'Work/Studies' },
      { key: 'energy', label: 'Energy' },
      { key: 'social', label: 'Social Connectedness' },
      { key: 'focus', label: 'Focus' },
    ].map(({ key, label }) => `${label}: ${responses[key]?.label || 'N/A'}`).join('\n');

    const notes = responses.notes?.trim() ? `Notes: ${responses.notes.trim()}` : '';
    const freeText = responses.freeText?.trim() ? `User Share: ${responses.freeText.trim()}` : '';
    const tags = responses.tags?.length ? `Tags: ${responses.tags.join(', ')}` : '';
    const score = calculateWellnessScore();

    return `You are a supportive mental health assistant. Analyze the user's daily check-in and provide:
1) Overall sentiment (very positive/positive/neutral/negative/very negative)
2) Key themes observed
3) Areas of concern (if any) and severity
4) Strengths to reinforce
5) 3 personalized, practical suggestions for today (short, actionable)
6) When to seek professional help (one line if applicable)

Wellness Score: ${score.percentage}% (${score.level})
${chosen}
${notes}
${freeText}
${tags}

Keep tone empathetic, concise, and non-judgmental. Use bullet points.`;
  };

  const analyzeWithAI = async () => {
    setAnalysisError('');
    setAnalysisResult('');
    setAnalysisLoading(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: buildAnalysisPrompt() }] }
          ]
        })
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setAnalysisResult(text || 'No analysis returned.');
    } catch (e) {
      setAnalysisError(e?.message || 'Something went wrong.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const toggleTag = (tag) => {
    setResponses(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleSubmit = () => {
    const score = calculateWellnessScore();
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      responses,
      score,
    };

    const newHistory = [entry, ...history];
    setHistory(newHistory);

    try {
      window.localStorage.setItem('pulseiqDailyCheckins', JSON.stringify(newHistory));
    } catch { }

    setCurrentStep(0);
    setResponses({
      mood: null,
      sleep: null,
      hunger: null,
      anxiety: null,
      workMood: null,
      energy: null,
      social: null,
      focus: null,
      freeText: '',
      notes: '',
      tags: []
    });
    setShowScore(false);
    alert('✅ Thanks for checking in! Your wellness data has been saved.');
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setShowScore(false);
    setResponses({
      mood: null,
      sleep: null,
      hunger: null,
      anxiety: null,
      workMood: null,
      energy: null,
      social: null,
      focus: null,
      freeText: '',
      notes: '',
      tags: []
    });
  };

  const currentStepData = assessmentSteps[currentStep];
  const userInitials = (user?.username || 'U')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Topbar ── */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        
      </header>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
         

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart size={20} className="text-blue-600" />
              <h1 className="text-slate-900 font-extrabold text-2xl">Daily Wellness Check-in</h1>
            </div>
            <p className="text-slate-400 text-sm">Comprehensive wellness assessment in just a few minutes</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!showScore ? (
          /* Assessment Steps */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-slate-500 font-medium mb-3">
                <span>Question {currentStep + 1} of {assessmentSteps.length}</span>
                <span>{Math.round(((currentStep + 1) / assessmentSteps.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / assessmentSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Title */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <currentStepData.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{currentStepData.title}</h2>
            </div>

            {/* Options */}
            {currentStepData.type === 'text' ? (
              <div className="space-y-4">
                <textarea
                  value={responses.freeText}
                  onChange={(e) => setResponses(prev => ({ ...prev, freeText: e.target.value }))}
                  rows={4}
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none"
                  placeholder={currentStepData.placeholder}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleTextNext}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {currentStepData.options.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleResponse(currentStepData.id, option)}
                    className="p-4 border border-slate-200 rounded-xl text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600">{option.label}</span>
                    </div>
                    <p className="text-sm text-slate-500">{option.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
              >
                ← Previous
              </button>
              <span className="text-xs text-slate-500">
                {currentStep === assessmentSteps.length - 1 ? '✓ Last question!' : 'Continue to next →'}
              </span>
            </div>
          </div>
        ) : (
          /* Score Display */
          <div className="space-y-6">
            {/* Wellness Score Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Your Wellness Score</h2>
                </div>

                {(() => {
                  const score = calculateWellnessScore();
                  return (
                    <>
                      <div
                        className="text-6xl font-bold mb-2"
                        style={{ color: getScoreColor(score.percentage) }}
                      >
                        {score.percentage}%
                      </div>
                      <div
                        className="text-xl font-semibold mb-4"
                        style={{ color: getScoreColor(score.percentage) }}
                      >
                        {score.level}
                      </div>
                      <p className="text-slate-500 max-w-md mx-auto text-sm">
                        {score.percentage >= 80 ? "You're doing great! Keep up the excellent self-care habits." :
                          score.percentage >= 60 ? "Good overall wellness. Consider focusing on areas that need improvement." :
                            score.percentage >= 40 ? "Your wellness needs some attention. Consider reaching out for support." :
                              "Your wellness score suggests you may benefit from additional support."}
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8 pb-8 border-b border-slate-100">
                {assessmentSteps.filter(step => step.options).map(step => {
                  const response = responses[step.id];
                  return (
                    <div key={step.id} className="text-center p-3 rounded-xl bg-slate-50">
                      <step.icon className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                      <div className="text-xs font-medium text-slate-600 mb-1">
                        {step.title.split(' ').slice(0, 2).join(' ')}
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: response ? response.color : '#ccc' }}
                      >
                        {response ? response.label : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes & Tags */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Additional Notes (optional)</label>
                  <textarea
                    value={responses.notes}
                    onChange={(e) => setResponses(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none"
                    placeholder="Anything else about your day you'd like to note..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Tags (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          responses.tags.includes(tag)
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Tag size={12} />
                          {tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">AI Sentiment & Guidance</span>
                  </div>
                  <button
                    onClick={analyzeWithAI}
                    disabled={analysisLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {analysisLoading ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze with AI'
                    )}
                  </button>
                </div>

                {analysisError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-2">{analysisError}</div>
                )}

                {analysisResult && (
                  <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {analysisResult}
                  </div>
                )}

                {!analysisResult && !analysisError && !analysisLoading && (
                  <p className="text-sm text-slate-500">Click "Analyze with AI" for personalized insights and suggestions.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                >
                  <CheckCircle2 size={18} />
                  Save Check-in
                </button>
                <button
                  onClick={resetAssessment}
                  className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-all"
                >
                  Retake Assessment
                </button>
              </div>
            </div>

            {/* Recent Check-ins */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Recent Check-ins
                </h2>
                <div className="space-y-3">
                  {history.slice(0, 5).map(entry => (
                    <div key={entry.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: getScoreColor(entry.score.percentage) }}
                          >
                            {entry.score.percentage}%
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{entry.score.level}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <Calendar size={12} />
                              {new Date(entry.date).toLocaleDateString()} at{' '}
                              {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      {entry.responses.notes && (
                        <p className="text-sm text-slate-600 mt-2">{entry.responses.notes}</p>
                      )}
                      {entry.responses.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {entry.responses.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyCheckIn;