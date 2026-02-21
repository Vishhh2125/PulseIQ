import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AppNavbar() {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-blue-100/80 shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/main")}
          className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          aria-label="Back to main"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => navigate("/main")}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="text-slate-800 font-bold text-sm tracking-tight">
            PreventAI Health
          </span>
        </button>
      </div>
    </header>
  );
}
