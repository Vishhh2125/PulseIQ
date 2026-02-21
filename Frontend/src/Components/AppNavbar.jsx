import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function AppNavbar() {
  const navigate = useNavigate();

  return (
    <header className="bg-white/70 backdrop-blur-lg border-b border-white/60 shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/main")}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md shadow-blue-500/20">
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
