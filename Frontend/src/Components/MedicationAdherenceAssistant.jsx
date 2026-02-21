import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  TrendingUp,
  BellRing,
  X,
  Image as ImageIcon,
  ShieldCheck,
  Trash2,
} from "lucide-react";

// ─── localStorage helpers ─────────────────────────────────────────────────────

const getStorageKey = (userId) => `medications_${userId || "guest"}`;

const loadMedications = (userId) => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMedications = (userId, meds) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(meds));
  } catch (e) {
    console.error("Failed to save medications:", e);
  }
};

// ─── MedicationCard ────────────────────────────────────────────────────────────

function MedicationCard({ medication, onMarkTaken, onDelete }) {
  const statusConfig = {
    Taken: {
      badge: (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 size={10} /> Taken
        </span>
      ),
      border: "border-emerald-200/50",
    },
    Missed: {
      badge: (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200">
          <XCircle size={10} /> Missed
        </span>
      ),
      border: "border-red-200/50",
    },
    Pending: {
      badge: (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
          <Clock size={10} /> Pending
        </span>
      ),
      border: "border-white/60",
    },
  };

  const { badge, border } = statusConfig[medication.status] || statusConfig.Pending;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2 }}
      className={`bg-white/60 backdrop-blur-xl rounded-2xl border-2 ${border} shadow-lg hover:shadow-xl transition-all duration-200 p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {medication.image ? (
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/60 flex-shrink-0 shadow-md">
              <img src={medication.image} alt={medication.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border-2 border-blue-200/50 flex items-center justify-center flex-shrink-0 shadow-md">
              <Pill size={22} className="text-blue-600" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-gray-900 font-bold text-sm">{medication.name}</h3>
              {badge}
            </div>
            <p className="text-gray-500 text-xs mb-2">{medication.dosage}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Clock size={11} />{medication.time}</span>
              <span className="text-gray-300">•</span>
              <span>{medication.frequency}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {medication.status === "Pending" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMarkTaken(medication.id)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <CheckCircle2 size={12} />
              Mark Taken
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(medication.id)}
            className="px-3 py-1.5 bg-red-50 text-red-500 border border-red-200/50 text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-red-100 transition-colors"
          >
            <Trash2 size={12} />
            Remove
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MedicationAdherenceAssistant() {
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.id || user?.userId;

  const [medications, setMedications] = useState(() => loadMedications(userId));
  const [formData, setFormData] = useState({ name: "", dosage: "", frequency: "Once daily", time: "", image: null });
  const [imagePreview, setImagePreview] = useState(null);

  // Persist whenever medications change
  useEffect(() => {
    saveMedications(userId, medications);
  }, [medications, userId]);

  // Reload when userId changes (different user logs in)
  useEffect(() => {
    setMedications(loadMedications(userId));
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload a valid image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image size must be less than 5MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (formData.name && formData.dosage && formData.time) {
      const newMed = {
        id: Date.now(),
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        time: formData.time,
        status: "Pending",
        image: formData.image,
        addedAt: new Date().toISOString(),
      };
      setMedications((prev) => [...prev, newMed]);
      setFormData({ name: "", dosage: "", frequency: "Once daily", time: "", image: null });
      setImagePreview(null);
    }
  };

  const handleMarkTaken = (id) => {
    setMedications((prev) => prev.map((med) => (med.id === id ? { ...med, status: "Taken" } : med)));
  };

  const handleDelete = (id) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const taken = medications.filter((m) => m.status === "Taken").length;
  const adherence = medications.length > 0 ? Math.round((taken / medications.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
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
              <Pill size={24} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Medication Tracker</h1>
          </div>
          <p className="text-blue-600 mb-10 text-sm md:text-base leading-relaxed">
            Stay consistent with your treatment plan. Add medications, track doses, and monitor adherence.
          </p>

          <div className="space-y-4">
            {/* Adherence Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/60 backdrop-blur-md rounded-xl p-5 border border-white/60 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 text-sm">Today's Adherence</h3>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">{taken} of {medications.length} taken</span>
                  <span className="text-blue-600 font-extrabold text-2xl">{adherence}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${adherence}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: medications.length, color: "text-blue-600" },
                { label: "Taken", value: taken, color: "text-emerald-600" },
                { label: "Pending", value: medications.filter((m) => m.status === "Pending").length, color: "text-amber-600" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/60 shadow-lg text-center">
                  <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Reminder tips */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/60 backdrop-blur-md rounded-xl p-5 border border-white/60 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center flex-shrink-0">
                    <BellRing size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">Reminder Tips</h3>
                    <ul className="text-gray-700 text-sm space-y-1.5">
                      <li className="flex items-start gap-2"><span className="text-cyan-600 mt-0.5">•</span><span>Add medications with exact times for best tracking</span></li>
                      <li className="flex items-start gap-2"><span className="text-cyan-600 mt-0.5">•</span><span>Mark doses taken as soon as you take them</span></li>
                      <li className="flex items-start gap-2"><span className="text-cyan-600 mt-0.5">•</span><span>Your data is saved per account automatically</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-md border border-emerald-200/50 p-4 rounded-xl text-sm text-emerald-900 shadow-lg flex items-start gap-3"
            >
              <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Your medication data is stored securely and linked to your account.</span>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8 md:p-10 flex flex-col bg-gradient-to-bl from-white/20 via-blue-50/20 to-cyan-50/20 backdrop-blur-md overflow-y-auto"
        >
          {/* Add Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-xl mb-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Plus size={18} className="text-white" />
              </div>
              <h2 className="text-gray-900 font-bold text-lg">Add Medication</h2>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-xs font-semibold mb-1.5">Medicine Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    placeholder="e.g., Metformin"
                    className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md border-2 border-white/60 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400/60 transition-all shadow-sm"
                    required />
                </div>
                <div>
                  <label className="block text-gray-700 text-xs font-semibold mb-1.5">Dosage</label>
                  <input type="text" name="dosage" value={formData.dosage} onChange={handleInputChange}
                    placeholder="e.g., 500mg"
                    className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md border-2 border-white/60 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400/60 transition-all shadow-sm"
                    required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-xs font-semibold mb-1.5">Frequency</label>
                  <select name="frequency" value={formData.frequency} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md border-2 border-white/60 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-400/60 transition-all shadow-sm">
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Thrice daily">Thrice daily</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-xs font-semibold mb-1.5">Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white/70 backdrop-blur-md border-2 border-white/60 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-400/60 transition-all shadow-sm"
                    required />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 text-xs font-semibold mb-1.5">Medicine Image (Optional)</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="med-img-upload" />
                <label htmlFor="med-img-upload"
                  className="flex flex-col items-center gap-2 w-full px-4 py-4 border-2 border-dashed border-gray-300/60 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                  <ImageIcon size={20} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Click to upload image</span>
                  <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                </label>
                <AnimatePresence>
                  {imagePreview && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="relative mt-3 h-40 rounded-xl overflow-hidden border-2 border-blue-200/50 shadow-lg">
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setImagePreview(null); setFormData((p) => ({ ...p, image: null })); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg">
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all">
                <Sparkles size={18} />
                Add Medication
              </motion.button>
            </form>
          </motion.div>

          {/* Medication List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-gray-900 font-bold text-base">Today's Schedule</h2>
                <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              <span className="text-xs text-gray-500 bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 shadow-sm">
                {medications.length} medication{medications.length !== 1 ? "s" : ""}
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {medications.length > 0 ? (
                <div className="space-y-3">
                  {medications.map((med) => (
                    <MedicationCard key={med.id} medication={med} onMarkTaken={handleMarkTaken} onDelete={handleDelete} />
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-2xl p-12 text-center shadow-lg">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border-2 border-blue-200/50 flex items-center justify-center mx-auto mb-4">
                    <Pill size={28} className="text-blue-400" />
                  </motion.div>
                  <p className="text-gray-700 font-semibold mb-1">No medications yet</p>
                  <p className="text-gray-400 text-sm">Add your first medication using the form above</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}