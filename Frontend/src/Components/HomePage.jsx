import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["Features", "How It Works", "For Doctors", "Security"];

const STEPS = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Enter Symptoms or Upload Reports",
    desc: "Describe your symptoms or upload existing medical reports, lab results, or imaging scans securely.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: "AI Analyzes Health Risks",
    desc: "Our advanced AI models cross-reference your data against thousands of health patterns to detect early risk signals.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    title: "Get Personalized Care Plan",
    desc: "Receive a tailored prevention plan with lifestyle recommendations, monitoring schedules, and health goals.",
  },
  {
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Book Appointment If Needed",
    desc: "If a risk is detected, seamlessly connect with verified specialists and schedule consultations instantly.",
  },
];

const FEATURES = [
  { icon: "🧠", title: "AI Symptom Analyzer", desc: "Input symptoms and get instant probabilistic health assessments powered by clinical-grade AI.", bg: "bg-gradient-to-br from-blue-50 to-indigo-50", accent: "text-blue-600" },
  { icon: "📊", title: "Predictive Risk Scoring", desc: "Dynamic risk scores for cardiovascular, metabolic, and chronic conditions updated in real time.", bg: "bg-gradient-to-br from-cyan-50 to-blue-50", accent: "text-cyan-600" },
  { icon: "🤰", title: "Pregnancy Health Monitor", desc: "Specialized tracking for maternal health with milestone alerts and complication detection.", bg: "bg-gradient-to-br from-rose-50 to-pink-50", accent: "text-rose-500" },
  { icon: "📄", title: "Medical Report Summarizer", desc: "Upload lab reports and get plain-language summaries with flagged abnormalities highlighted.", bg: "bg-gradient-to-br from-violet-50 to-purple-50", accent: "text-violet-600" },
  { icon: "🗺️", title: "Smart Care Plan", desc: "AI-generated, evolving care roadmaps that adapt to your progress and changing health data.", bg: "bg-gradient-to-br from-emerald-50 to-teal-50", accent: "text-emerald-600" },
  { icon: "📅", title: "Appointment Booking", desc: "Real-time specialist availability with smart matching based on your health profile and risk factors.", bg: "bg-gradient-to-br from-amber-50 to-yellow-50", accent: "text-amber-600" },
];



const SECURITY = [
  { icon: "🔒", title: "Secure Medical Records", desc: "End-to-end encrypted storage with zero-knowledge architecture ensures only you control your data." },
  { icon: "🏥", title: "HIPAA-Ready Architecture", desc: "Built on principles aligned with healthcare data protection standards for enterprise trust." },
  { icon: "🔐", title: "Encrypted Data Transfer", desc: "256-bit AES encryption in transit and at rest. Your health data is never exposed or shared." },
];

const PATIENTS = [
  { name: "Priya S.", age: 45, score: 87, cat: "Cardiovascular", risk: "High", barColor: "bg-red-500", badge: "bg-red-100 text-red-700" },
  { name: "Rahul M.", age: 38, score: 64, cat: "Metabolic", risk: "Medium", barColor: "bg-amber-400", badge: "bg-amber-100 text-amber-700" },
  { name: "Anjali K.", age: 29, score: 41, cat: "Pregnancy", risk: "Monitor", barColor: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  { name: "Vikram T.", age: 52, score: 22, cat: "General", risk: "Low", barColor: "bg-green-500", badge: "bg-green-100 text-green-700" },
];

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeUp({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function RiskBar({ pct, colorClass }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: inView ? `${pct}%` : "0%" }}
      />
    </div>
  );
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [floatY, setFloatY] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let frame;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      setFloatY(Math.sin(t * 1.2) * 10);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAV */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md border-b border-blue-50 shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-md">✦</div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">PreventAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l} href="#" className="text-slate-600 text-sm font-medium hover:text-blue-600 transition-colors relative group">
                {l}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full" />
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium text-slate-700 px-4 py-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all">
              Log In
            </button>
            <button className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:-translate-y-0.5 transition-all shadow-md">
              Get Started
            </button>
          </div>
          <button className="md:hidden text-slate-700" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-blue-50 px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => <a key={l} href="#" className="text-slate-700 font-medium">{l}</a>)}
            <div className="flex gap-3 pt-2">
              <button className="flex-1 text-sm border border-slate-200 rounded-lg py-2 text-slate-700">Log In</button>
              <button className="flex-1 text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl py-2 font-semibold">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative pt-28 pb-20 overflow-hidden bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/30">
        <div className="absolute top-16 right-0 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-cyan-100/60 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-blue-700 font-medium mb-6">
              <span className={`w-2 h-2 rounded-full bg-blue-500 inline-block transition-all duration-500 ${pulse ? "scale-125 opacity-100" : "scale-90 opacity-50"}`} />
              Next-Generation Preventive Care
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              AI-Powered{" "}
              <span className="italic bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Preventive
              </span>{" "}
              Healthcare System
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-lg">
              Detect health risks months before symptoms appear. Our AI continuously monitors your health signals to prevent serious illness — not just treat it.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center gap-2 text-sm hover:from-blue-700 hover:to-cyan-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                I am a Patient
              </button>
              <button className="bg-white border-2 border-blue-200 text-blue-700 font-semibold px-7 py-3.5 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                I am a Doctor
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
              {["No credit card required", "HIPAA-ready", "Free to start"].map((t) => (
                <span key={t} className="flex items-center gap-1.5"><span className="text-green-500 font-bold">✓</span> {t}</span>
              ))}
            </div>
          </div>

          {/* Hero Card */}
          <div
            className="hidden lg:block"
            style={{ transform: `translateY(${floatY}px)`, transition: "transform 0.05s linear" }}
          >
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-blue-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Health Dashboard</p>
                    <p className="text-slate-800 font-semibold">Sarah Mitchell, 34</p>
                  </div>
                  <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-100">Low Risk</span>
                </div>
                <div className="mb-5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-3 flex items-center justify-center h-12">
                  <svg viewBox="0 0 300 40" className="w-full h-8 opacity-60" preserveAspectRatio="none">
                    <polyline points="0,20 40,20 55,5 70,35 85,8 100,32 115,20 300,20" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="space-y-3 mb-5">
                  {[
                    { label: "Cardiovascular Risk", pct: 18, color: "bg-emerald-500" },
                    { label: "Metabolic Score", pct: 32, color: "bg-amber-400" },
                    { label: "Immunity Index", pct: 74, color: "bg-blue-500" },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">{r.label}</span>
                        <span className="font-semibold text-slate-700">{r.pct}%</span>
                      </div>
                      <RiskBar pct={r.pct} colorClass={r.color} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">AI Recommendation</p>
                      <p className="text-xs text-slate-500">Increase Vitamin D intake</p>
                    </div>
                  </div>
                  <button className="text-blue-600 text-xs font-semibold hover:underline">View →</button>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white shadow-lg rounded-2xl px-4 py-3 border border-blue-50 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Risk Detected Early</p>
                    <p className="text-xs text-slate-400">3 months ahead</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-6 bg-white shadow-lg rounded-2xl px-4 py-3 border border-blue-50 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Dr</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Dr. Reyes available</p>
                    <p className="text-xs text-slate-400">Today at 3:00 PM</p>
                  </div>
                  <button className="text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 px-2 py-1 rounded-lg font-semibold ml-1">Book</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "94%", label: "Early Detection Rate" },
              { num: "50K+", label: "Active Patients" },
              { num: "1,200+", label: "Partner Doctors" },
              { num: "3x", label: "Faster Diagnoses" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 100} className="text-center">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">{s.num}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px max-w-5xl mx-auto bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Process</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">How It Works</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Four simple steps from symptom input to personalized care — powered by clinical AI.</p>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <FadeUp key={s.num} delay={i * 100}>
                <div className="relative group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 z-10" />
                  )}
                  <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center text-blue-600 group-hover:text-white mb-4 transition-all duration-300">
                    {s.icon}
                  </div>
                  <span className="text-4xl font-black text-blue-50 group-hover:text-blue-100 transition-colors absolute top-4 right-6 select-none">{s.num}</span>
                  <h3 className="font-semibold text-slate-800 mb-2 text-base">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px max-w-5xl mx-auto bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

      {/* FEATURES */}
      <section className="py-24 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Capabilities</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Everything You Need</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">A complete preventive health suite, not just another symptom checker.</p>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={(i % 3) * 80}>
                <div className={`${f.bg} rounded-2xl p-6 border border-white shadow-sm h-full cursor-default hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-2 text-base">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                  <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${f.accent}`}>
                    Learn more
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px max-w-5xl mx-auto bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

      {/* FOR DOCTORS — Management Portal */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">For Clinicians</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Doctor Management Portal</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              A dedicated workspace for clinicians — manage patients, review AI insights, handle appointments, and act on alerts all in one place.
            </p>
          </FadeUp>

          <FadeUp>
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 border-b border-slate-700">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 flex-1 bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">
                  preventai.health/doctor/dashboard
                </div>
              </div>

              <div className="flex min-h-96">
                {/* Sidebar */}
                <div className="w-52 bg-slate-800 border-r border-slate-700 flex-shrink-0 p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-6 px-2 pt-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">✦</div>
                    <span className="text-white font-semibold text-sm">PreventAI</span>
                  </div>
                  {[
                    { icon: "▦", label: "Dashboard", active: true, badge: null },
                    { icon: "👥", label: "Patient Insights", active: false, badge: null },
                    { icon: "📋", label: "AI Reports", active: false, badge: null },
                    { icon: "📅", label: "Appointments", active: false, badge: null },
                    { icon: "🔔", label: "Alerts", active: false, badge: "3" },
                    { icon: "⚙️", label: "Settings", active: false, badge: null },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${item.active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>{item.label}
                      </div>
                      {item.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                    </div>
                  ))}
                  <div className="mt-auto pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 px-2 py-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">DR</div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">Dr. Aryan Mehta</p>
                        <p className="text-slate-500 text-[10px]">Cardiologist</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main */}
                <div className="flex-1 bg-slate-50 p-5 overflow-auto">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: "Total Patients", val: "142", badge: "+4 today", badgeCls: "bg-blue-100 text-blue-600", valCls: "text-blue-600" },
                      { label: "High Risk", val: "18", badge: "↑ 2 new", badgeCls: "bg-red-100 text-red-600", valCls: "text-red-600" },
                      { label: "Reports Pending", val: "7", badge: "AI ready", badgeCls: "bg-amber-100 text-amber-600", valCls: "text-amber-600" },
                      { label: "Today's Appts", val: "9", badge: "2 virtual", badgeCls: "bg-emerald-100 text-emerald-600", valCls: "text-emerald-600" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm">
                        <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-1">{s.label}</p>
                        <p className={`text-2xl font-extrabold ${s.valCls}`}>{s.val}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badgeCls}`}>{s.badge}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <p className="text-slate-800 text-sm font-semibold">Patient Risk Insights</p>
                        <span className="text-blue-600 text-xs font-semibold cursor-pointer hover:underline">View all →</span>
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            {["Patient", "Risk Score", "Category", "Status"].map((h) => (
                              <th key={h} className="text-left px-4 py-2 text-slate-500 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {PATIENTS.map((p) => (
                            <tr key={p.name} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold flex-shrink-0">{p.name[0]}</div>
                                  <span className="text-slate-700 font-medium">{p.name}, {p.age}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${p.barColor}`} style={{ width: `${p.score}%` }} />
                                  </div>
                                  <span className="text-slate-600 font-semibold">{p.score}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-slate-600">{p.cat}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.badge}`}>{p.risk}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-1.5">
                        <p className="text-slate-800 text-sm font-semibold">🔔 Alerts</p>
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
                      </div>
                      <div className="p-3 flex flex-col gap-2">
                        {[
                          { msg: "Priya S. — BP crossed critical threshold", time: "2m ago", cls: "border-l-red-500 bg-red-50" },
                          { msg: "Anjali K. — Missed prenatal check-in", time: "1h ago", cls: "border-l-amber-400 bg-amber-50" },
                          { msg: "Rahul M. — New AI report ready", time: "3h ago", cls: "border-l-blue-400 bg-blue-50" },
                        ].map((a, i) => (
                          <div key={i} className={`border-l-4 rounded-r-lg px-3 py-2 ${a.cls}`}>
                            <p className="text-slate-700 text-[11px] font-medium leading-snug">{a.msg}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">{a.time}</p>
                          </div>
                        ))}
                        <div className="mt-1 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                          <p className="text-slate-500 text-[10px] font-semibold mb-2 uppercase tracking-wide">Today's Appointments</p>
                          {[
                            { name: "Priya S.", time: "10:00 AM", type: "In-person" },
                            { name: "Rahul M.", time: "2:30 PM", type: "Virtual" },
                          ].map((ap) => (
                            <div key={ap.name} className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold">{ap.name[0]}</div>
                                <span className="text-slate-700 text-[11px] font-medium">{ap.name}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-600 text-[10px] font-semibold">{ap.time}</p>
                                <p className="text-slate-400 text-[9px]">{ap.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          
        </div>
      </section>

      <div className="h-px max-w-5xl mx-auto bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

      {/* SECURITY */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Trust & Security</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Your Data, Protected</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Healthcare data demands the highest standards. We built security in from the ground up.</p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-6">
            {SECURITY.map((s, i) => (
              <FadeUp key={s.title} delay={i * 100}>
                <div className="bg-white rounded-2xl p-7 border border-blue-50 shadow-sm text-center h-full hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp className="mt-10">
            <div className="bg-blue-600 rounded-2xl p-6 flex flex-wrap items-center gap-4">
              {["SOC 2 Type II Compliant", "TLS 1.3 Encryption", "Zero-Knowledge Storage", "Audit Logging", "Role-Based Access"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-white/90 text-sm">
                  <svg className="w-4 h-4 text-cyan-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative overflow-hidden bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/30">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <FadeUp>
            <div className="inline-block text-5xl mb-4">🚀</div>
            <h2 className="text-5xl font-extrabold text-slate-900 mb-4">
              Start Your{" "}
              <span className="italic bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Health Journey
              </span>{" "}
              Today
            </h2>
            <p className="text-slate-600 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of patients and doctors using AI to stay one step ahead of illness. Free to start — no commitments.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold px-9 py-4 rounded-xl text-base hover:from-blue-700 hover:to-cyan-600 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-200">
                Sign Up Free
              </button>
              <button className="bg-white border-2 border-blue-200 text-blue-700 font-semibold px-9 py-4 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-base">
                Log In
              </button>
            </div>
            <p className="text-slate-400 text-xs mt-6">No credit card required · Cancel anytime · HIPAA-ready</p>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">✦</div>
                <span className="text-white font-semibold">PreventAI</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-500">AI-powered preventive healthcare for patients and clinicians. Detect risks before they become illness.</p>
            </div>
            {[
              { title: "Platform", links: ["For Patients", "For Doctors", "Enterprise", "API Access"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "HIPAA Statement"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-slate-500 text-sm hover:text-blue-400 transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-600">© 2025 PreventAI Health Technologies. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}