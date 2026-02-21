import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice.js";
import {
  Menu,
  X,
  Home,
  CalendarCheck,
  ClipboardListIcon,
  MessageCircle,
  Activity,
  FileUp,
  ShieldAlert,
  Sparkles,
  ListChecks,
  ScanFace,
  Apple,
  LogOut,
  User,
  ChevronDown,
  Heart,
  Brain,
  Stethoscope,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "home", label: "Home", icon: Home, path: "/main" },
      { id: "dailyCheckIn", label: "Daily Check-In", icon: CalendarCheck, path: "/daily-checkin" },
      { id: "digital-twin", label: "Digital Twin", icon: Activity, path: "/digital-twin" },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { id: "chat", label: "AI Health Assistant", icon: MessageCircle, path: "/chat" },
      { id: "care-plan", label: "Smart Care Plan", icon: Sparkles, path: "/care-plan" },
      { id: "assessment", label: "Assessment", icon: Brain, path: "/assessment" },
      { id: "skinDetection", label: "Skin Detection", icon: ScanFace, path: "/skin-detection" },
    ],
  },
  {
    label: "Health",
    items: [
      { id: "fitness", label: "Fitness Dashboard", icon: Heart, path: "/fitness-dashboard" },
      { id: "nutrition", label: "Nutrition Planner", icon: Apple, path: "/nutrition-planner" },
      { id: "medicationAssistant", label: "Medication", icon: ClipboardListIcon, path: "/medication-adherence" },
      { id: "upload", label: "Upload Report", icon: FileUp, path: "/upload-report" },
    ],
  },
  {
    label: "Appointments",
    items: [
      { id: "appointment", label: "Book Appointment", icon: Stethoscope, path: "/appointment-booking" },
    
    ],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 768) setIsOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth?mode=login");
  };

  const userName = user?.username || user?.name || "Patient";
  const userEmail = user?.email || "user@example.com";
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-white shadow-lg border border-gray-100 hover:bg-gray-50 transition-all duration-200 active:scale-95"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-blue-800 text-white shadow-2xl z-40 flex flex-col transition-all duration-300 ease-in-out md:relative sidebar-enter w-64
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center border-b border-blue-600/50 h-16 px-4">
          <button onClick={() => handleNavigate("/main")} className="flex items-center gap-2.5 group min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200 logo-icon flex-shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-none whitespace-nowrap">PulseIQ</p>
              <p className="text-[10px] text-blue-200 mt-0.5 whitespace-nowrap">Health Platform</p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5 px-2 scrollbar-hide">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/60 px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item, localIdx) => {
                  const globalIdx = NAV_GROUPS.slice(0, NAV_GROUPS.indexOf(group)).reduce((acc, g) => acc + g.items.length, 0) + localIdx;
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <div
                      key={item.id}
                      className="relative nav-item"
                      style={{ animationDelay: `${globalIdx * 0.045}s` }}
                    >
                      <button
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group relative nav-btn
                          ${isActive
                            ? "bg-white/20 text-white shadow-lg shadow-blue-900/40 backdrop-blur-sm active-nav"
                            : "text-blue-100 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full" />
                        )}
                        <Icon size={17} className={`flex-shrink-0 transition-transform duration-200 ${!isActive && "group-hover:scale-110"}`} />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-300 pulse-dot flex-shrink-0" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-blue-600/50 p-2">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-200 relative"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-lg">
              {initials}
            </div>
            <div className="flex items-center min-w-0 flex-1 gap-2">
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold text-white truncate leading-none">{userName}</p>
                <p className="text-[11px] text-blue-200 truncate mt-0.5">{userEmail}</p>
              </div>
              <ChevronDown
                size={15}
                className={`flex-shrink-0 text-blue-200 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {/* Dropdown */}
          {isUserMenuOpen && (
            <div className="mt-1 space-y-0.5 overflow-hidden user-dropdown">
              <button
                onClick={() => { navigate("/profile"); setIsUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-blue-100 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm"
              >
                <User size={15} />
                <span>My Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-sm font-medium"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: translateX(-4px) scale(0.95); }
          60%  { transform: translateX(2px) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes activeGlow {
          0%, 100% { box-shadow: 0 0 0px rgba(147,197,253,0); }
          50%       { box-shadow: 0 0 12px rgba(147,197,253,0.35); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes logoBounce {
          0%, 100% { transform: translateY(0); }
          40%       { transform: translateY(-4px); }
          70%       { transform: translateY(2px); }
        }

        .sidebar-enter { animation: fadeInLeft 0.35s ease both; }
        .nav-item      { animation: popIn 0.3s ease both; }
        .active-nav { animation: activeGlow 2.5s ease-in-out infinite; }
        .pulse-dot  { animation: pulse-dot 1.8s ease-in-out infinite; }
        .logo-icon:hover { animation: logoBounce 0.5s ease; }
        .user-dropdown { animation: slideDown 0.2s ease both; }

        .nav-btn { position: relative; overflow: hidden; }
        .nav-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: inherit;
        }
        .nav-btn:active::after { opacity: 1; }
      `}</style>
    </>
  );
}
