import { useState } from "react";
import {
  Sparkles,
  Bell,
  ChevronLeft,
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Info,
  BellRing,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const SAMPLE_MEDICATIONS = [
  {
    id: 1,
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    time: "8:00 AM",
    status: "Pending",
    image: null,
  },
  {
    id: 2,
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    time: "9:00 AM",
    status: "Taken",
    image: null,
  },
  {
    id: 3,
    name: "Aspirin",
    dosage: "81mg",
    frequency: "Once daily",
    time: "7:00 PM",
    status: "Missed",
    image: null,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MedicationCard({ medication, onMarkTaken, onRemoveImage }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "Taken":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 size={10} />
            Taken
          </span>
        );
      case "Missed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100">
            <XCircle size={10} />
            Missed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            <Clock size={10} />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-5">
      <div className="flex items-start justify-between gap-4">
        {/* Medicine Image or Icon */}
        <div className="flex-shrink-0">
          {medication.image ? (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
              <img 
                src={medication.image} 
                alt={medication.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onRemoveImage(medication.id)}
                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Pill size={24} className="text-blue-600" />
            </div>
          )}
        </div>

        {/* Medicine Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-slate-900 font-bold text-sm mb-1">{medication.name}</h3>
              <p className="text-slate-600 text-xs mb-2">{medication.dosage}</p>
            </div>
            {getStatusBadge(medication.status)}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {medication.time}
            </span>
            <span className="text-slate-300">•</span>
            <span>{medication.frequency}</span>
          </div>
        </div>

        {/* Action Button */}
        {medication.status === "Pending" && (
          <button
            onClick={() => onMarkTaken(medication.id)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <CheckCircle2 size={12} />
            Mark as Taken
          </button>
        )}
      </div>
    </div>
  );
}

// Image Upload Preview Component
function ImageUploadPreview({ image, onRemove, medicationName }) {
  if (!image) return null;

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-blue-200 bg-blue-50 mt-2">
      <img 
        src={image} 
        alt={`${medicationName} preview`}
        className="w-full h-full object-cover"
      />
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MedicationAdherenceAssistant({ patientName = "Sarah", onBack }) {
  const [medications, setMedications] = useState(SAMPLE_MEDICATIONS);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "Once daily",
    time: "",
    image: null,
  });
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (formData.name && formData.dosage && formData.time) {
      const newMedication = {
        id: medications.length + 1,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        time: formData.time,
        status: "Pending",
        image: formData.image,
      };
      setMedications([...medications, newMedication]);
      setFormData({
        name: "",
        dosage: "",
        frequency: "Once daily",
        time: "",
        image: null,
      });
      setImagePreview(null);
      setShowCustomTime(false);
    }
  };

  const handleMarkTaken = (id) => {
    setMedications(
      medications.map((med) => (med.id === id ? { ...med, status: "Taken" } : med))
    );
  };

  const handleRemoveMedicationImage = (id) => {
    setMedications(
      medications.map((med) => 
        med.id === id ? { ...med, image: null } : med
      )
    );
  };

  const adherencePercentage = 85; // Static for now

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        
      </header>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
          

          <div>
            <h1 className="text-slate-900 font-extrabold text-2xl mb-2">Medication Adherence Tracker</h1>
            <p className="text-slate-400 text-sm">
              Track your medicine schedule and stay consistent with treatment.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ── Add Medication Section ── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Plus size={18} className="text-blue-600" />
            </div>
            <h2 className="text-slate-900 font-bold text-lg">Add Medication</h2>
          </div>

          <form onSubmit={handleAddMedication} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Medicine Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Metformin"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder="e.g., 500mg"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={(e) => {
                    handleInputChange(e);
                    setShowCustomTime(e.target.value === "Custom");
                  }}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  required
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Thrice daily">Thrice daily</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  required
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1.5">Medicine Image (Optional)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="medicine-image-upload"
                />
                <label
                  htmlFor="medicine-image-upload"
                  className="block w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon size={20} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-[10px] text-slate-400">PNG, JPG, GIF up to 5MB</span>
                  </div>
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <ImageUploadPreview 
                  image={imagePreview} 
                  onRemove={handleRemoveImage}
                  medicationName={formData.name}
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Medication
            </button>
          </form>
        </section>

        {/* ── Today's Medications Section ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-slate-900 font-bold text-lg">Today's Medications</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {medications.length} medication{medications.length !== 1 ? "s" : ""} scheduled
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={14} />
              <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
            </div>
          </div>

          {medications.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {medications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onMarkTaken={handleMarkTaken}
                  onRemoveImage={handleRemoveMedicationImage}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Pill size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-700 font-semibold mb-1">No medications scheduled</p>
              <p className="text-slate-400 text-sm">Add your first medication above to get started</p>
            </div>
          )}
        </section>

        {/* ── Adherence Summary Section ── */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <h2 className="text-slate-900 font-bold text-lg">Adherence Summary</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-sm font-semibold">Weekly Adherence</span>
                <span className="text-blue-600 font-extrabold text-2xl">{adherencePercentage}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${adherencePercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-700 text-sm">
                Great job! Keep maintaining consistency.
              </p>
            </div>
          </div>
        </section>

        {/* ── Reminder Info Box ── */}
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BellRing size={17} className="text-blue-600" />
            </div>
            <div>
              <p className="text-slate-800 font-semibold text-sm mb-1">Reminder Notifications</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                You'll receive push notifications and email reminders 30 minutes before each scheduled medication time.
                Reminders help you stay on track with your treatment plan and improve adherence rates.
                You can manage notification preferences in your account settings.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}