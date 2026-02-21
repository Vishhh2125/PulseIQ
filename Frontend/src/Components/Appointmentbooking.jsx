import { useState ,useEffect} from "react";
import {
  Search,
  Star,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Video,
  Building2,
  Filter,
  CheckCircle2,
  Sparkles,
  Bell,
  X,
  Stethoscope,
  User,
  Phone,
  FileText,
  ArrowRight,
  Shield,
  Loader
} from "lucide-react";

// ─── Static Data ──────────────────────────────────────────────────────────────

const SPECIALTIES = [
  "All", "General Physician", "Cardiologist", "Gynecologist",
  "Dermatologist", "Neurologist", "Pediatrician", "Orthopedic",
];

const DOCTORS = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialty: "Cardiologist",
    hospital: "Apollo Heart Institute",
    location: "Mumbai, MH",
    rating: 4.9,
    reviews: 312,
    experience: "14 yrs",
    fee: 800,
    avatar: "PS",
    avatarBg: "from-rose-400 to-pink-500",
    type: ["video", "clinic"],
    available: true,
    nextSlot: "Today, 3:00 PM",
    tags: ["AI Risk Analysis", "Preventive Care"],
  },
  {
    id: 2,
    name: "Dr. Arjun Mehta",
    specialty: "General Physician",
    hospital: "City Care Hospital",
    location: "Pune, MH",
    rating: 4.7,
    reviews: 198,
    experience: "9 yrs",
    fee: 500,
    avatar: "AM",
    avatarBg: "from-blue-400 to-indigo-500",
    type: ["video", "clinic"],
    available: true,
    nextSlot: "Today, 5:30 PM",
    tags: ["Preventive Care", "Chronic Disease"],
  },
  {
    id: 3,
    name: "Dr. Sneha Kulkarni",
    specialty: "Gynecologist",
    hospital: "Motherhood Clinic",
    location: "Nashik, MH",
    rating: 4.8,
    reviews: 247,
    experience: "11 yrs",
    fee: 700,
    avatar: "SK",
    avatarBg: "from-purple-400 to-violet-500",
    type: ["video", "clinic"],
    available: true,
    nextSlot: "Tomorrow, 10:00 AM",
    tags: ["Pregnancy Care", "Women's Health"],
  },
  {
    id: 4,
    name: "Dr. Rohan Desai",
    specialty: "Neurologist",
    hospital: "BrainCare Neurology Center",
    location: "Mumbai, MH",
    rating: 4.6,
    reviews: 163,
    experience: "16 yrs",
    fee: 1200,
    avatar: "RD",
    avatarBg: "from-amber-400 to-orange-500",
    type: ["clinic"],
    available: false,
    nextSlot: "Mar 3, 11:00 AM",
    tags: ["Neurology", "Brain Health"],
  },
  {
    id: 5,
    name: "Dr. Anita Joshi",
    specialty: "Dermatologist",
    hospital: "SkinFirst Clinic",
    location: "Pune, MH",
    rating: 4.8,
    reviews: 281,
    experience: "8 yrs",
    fee: 600,
    avatar: "AJ",
    avatarBg: "from-emerald-400 to-teal-500",
    type: ["video", "clinic"],
    available: true,
    nextSlot: "Today, 6:00 PM",
    tags: ["Skin Care", "AI Skin Analysis"],
  },
  {
    id: 6,
    name: "Dr. Vikram Patil",
    specialty: "Orthopedic",
    hospital: "BoneCare Ortho Hospital",
    location: "Nashik, MH",
    rating: 4.7,
    reviews: 134,
    experience: "12 yrs",
    fee: 900,
    avatar: "VP",
    avatarBg: "from-cyan-400 to-blue-500",
    type: ["clinic"],
    available: true,
    nextSlot: "Tomorrow, 9:00 AM",
    tags: ["Joint Care", "Sports Medicine"],
  },
];

const TIME_SLOTS = {
  morning: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
  afternoon: ["12:00 PM", "12:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"],
  evening: ["4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"],
};

const UNAVAILABLE = ["9:30 AM", "10:30 AM", "2:00 PM", "5:00 PM"];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      day: WEEK_DAYS[d.getDay()],
      date: d.getDate(),
      full: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      isToday: i === 0,
    };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DoctorCard({ doctor, onBook }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5">
      <div className="flex gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${doctor.avatarBg} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-sm`}>
          {doctor.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-slate-900 font-bold text-sm">{doctor.name}</h3>
              <p className="text-blue-600 text-xs font-semibold mt-0.5">{doctor.specialty}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${doctor.available ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
              {doctor.available ? "● Available" : "○ Busy"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Building2 size={11} />{doctor.hospital}</span>
            <span className="flex items-center gap-1"><MapPin size={11} />{doctor.location}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{doctor.experience}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-slate-700">{doctor.rating}</span>
              <span className="text-xs text-slate-400">({doctor.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              {doctor.type.includes("video") && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Video size={9} /> Video
                </span>
              )}
              {doctor.type.includes("clinic") && (
                <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Building2 size={9} /> Clinic
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {doctor.tags.map((t) => (
              <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Next available</span>
          <p className="text-slate-700 text-xs font-semibold mt-0.5">{doctor.nextSlot}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Consult Fee</p>
            <p className="text-slate-900 font-bold text-sm">₹{doctor.fee}</p>
          </div>
          <button
            onClick={() => onBook(doctor)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:shadow-md hover:shadow-blue-200 flex items-center gap-1.5"
          >
            Book <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

function BookingModal({ doctor, onClose, onConfirm }) {
  const days = getDays();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultType, setConsultType] = useState(doctor.type[0]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "Sarah Mitchell", phone: "", reason: "" });
const [bookingLoading, setBookingLoading] = useState(false);
  const canProceed = selectedSlot !== null;

   const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);

      const bookingDate = new Date(days[selectedDay].full);

      const response = await fetch("http://localhost:5000/api/v1/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          doctorId: doctor.doctorId,
          patientPhoneNumber: form.phone,
          appointmentDate: bookingDate.toISOString(),
          appointmentTime: selectedSlot,
          reason: form.reason,
          mode: consultType === "video" ? "online" : "offline_visit",
        }),
      });

      const data = await response.json();
      console.log("Booking response:", data);

      if (response.ok) {
        alert("✅ Appointment booked! Doctor will see it on their dashboard.");
        onConfirm();
        onClose();
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${doctor.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
              {doctor.avatar}
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm">{doctor.name}</p>
              <p className="text-blue-600 text-xs font-semibold">{doctor.specialty}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            {["Select Slot", "Your Details", "Confirm"].map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {step > i + 1 ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? "text-blue-600" : "text-slate-400"}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${step > i + 1 ? "bg-emerald-400" : "bg-slate-100"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Consultation Type</p>
                <div className="flex gap-2">
                  {doctor.type.map((t) => (
                    <button
                      key={t}
                      onClick={() => setConsultType(t)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${consultType === t ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"}`}
                    >
                      {t === "video" ? <Video size={14} /> : <Building2 size={14} />}
                      {t === "video" ? "Video Call" : "Clinic Visit"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Select Date</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {days.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedDay(i); setSelectedSlot(null); }}
                      className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl flex-shrink-0 border transition-all ${selectedDay === i ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"}`}
                    >
                      <span className="text-[10px] font-semibold uppercase">{d.day}</span>
                      <span className="text-base font-extrabold leading-none">{d.date}</span>
                      {d.isToday && <span className={`text-[9px] font-bold ${selectedDay === i ? "text-blue-200" : "text-blue-500"}`}>Today</span>}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { label: "Morning", slots: TIME_SLOTS.morning },
                { label: "Afternoon", slots: TIME_SLOTS.afternoon },
                { label: "Evening", slots: TIME_SLOTS.evening },
              ].map(({ label, slots }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-slate-400 mb-2">{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => {
                      const unavail = UNAVAILABLE.includes(slot);
                      return (
                        <button
                          key={slot}
                          disabled={unavail}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            unavail
                              ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through"
                              : selectedSlot === slot
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                disabled={!canProceed}
                onClick={() => setStep(2)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${canProceed ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" placeholder="Your full name" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">Reason for Visit</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-3.5 text-slate-400" />
                  <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all resize-none" placeholder="Brief description of your symptoms or concern..." />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 text-xs">
                <p className="font-bold text-slate-700 text-sm mb-1">Booking Summary</p>
                <div className="flex justify-between text-slate-600"><span>Date</span><span className="font-semibold text-slate-800">{days[selectedDay].full}</span></div>
                <div className="flex justify-between text-slate-600"><span>Time</span><span className="font-semibold text-slate-800">{selectedSlot}</span></div>
                <div className="flex justify-between text-slate-600"><span>Type</span><span className="font-semibold text-slate-800 capitalize">{consultType === "video" ? "Video Call" : "Clinic Visit"}</span></div>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-blue-100"><span>Consult Fee</span><span className="font-bold text-blue-700">₹{doctor.fee}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">Review & Pay</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <CalendarCheck size={26} className="text-blue-600" />
                </div>
                <p className="text-slate-900 font-bold text-base">Confirm Your Appointment</p>
                <p className="text-slate-500 text-xs mt-1">Review your booking before confirming payment</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 text-sm">
                {[
                  { label: "Doctor", value: doctor.name },
                  { label: "Specialty", value: doctor.specialty },
                  { label: "Hospital", value: doctor.hospital },
                  { label: "Date", value: days[selectedDay].full },
                  { label: "Time", value: selectedSlot },
                  { label: "Mode", value: consultType === "video" ? "Video Consultation" : "Clinic Visit" },
                  { label: "Patient", value: form.name || "Sarah Mitchell" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">{row.label}</span>
                    <span className="text-slate-800 font-semibold text-xs text-right">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-semibold">Total Amount</span>
                  <span className="text-blue-700 font-extrabold text-base">₹{doctor.fee}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <Shield size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-xs leading-relaxed">Your booking is secured. You'll receive a confirmation on WhatsApp & email after payment.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Back</button>
                <button
  onClick={handleConfirmBooking}
  disabled={bookingLoading}
  className="flex-1 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
>
  {bookingLoading ? "Processing..." : `Pay ₹${doctor.fee}`}
</button>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ doctor, onClose }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-white border border-emerald-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={20} className="text-emerald-500" />
        </div>
        <div className="flex-1">
          <p className="text-slate-900 font-bold text-sm">Appointment Confirmed!</p>
          <p className="text-slate-500 text-xs mt-0.5">
            Your appointment with <span className="font-semibold text-slate-700">{doctor.name}</span> has been booked successfully.
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={14} /></button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppointmentBooking({ patientName = "Sarah", onBack }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [consultFilter, setConsultFilter] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [confirmedDoctor, setConfirmedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/api/v1/doctors');
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        
        const data = await response.json();
        
        // Transform backend data to match component format
        const transformedDoctors = data.data.doctors.map((doc) => ({
          id: doc._id,
          name: doc.userId?.username || 'Dr. Unknown',
          specialty: doc.specialization,
          hospital: doc.clinicAddress?.city || 'Clinic',
          location: `${doc.clinicAddress?.city}, ${doc.clinicAddress?.state}`,
          rating: 4.7, // Backend doesn't have rating, using default
          reviews: 200, // Backend doesn't have review count
          experience: `${doc.experience} yrs`,
          fee: doc.consultationFee || 500,
          avatar: (doc.userId?.username || 'Dr')[0].toUpperCase() + (doc.userId?.username || 'Dr')[1]?.toUpperCase() || 'D',
          avatarBg: getRandomGradient(doc._id),
          type: doc.clinicTiming?.some(t => t.isOpen) ? ["clinic"] : ["video"],
          available: true,
          nextSlot: "Today, 3:00 PM", // Backend doesn't provide this
          tags: [doc.specialization, "Preventive Care"],
          doctorId: doc._id, // Store for booking
        }));
        
        setDoctors(transformedDoctors);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filtered = doctors.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase());
    const matchSpecialty = activeSpecialty === "All" || d.specialty === activeSpecialty;
    const matchType =
      consultFilter === "All" ||
      (consultFilter === "Video" && d.type.includes("video")) ||
      (consultFilter === "Clinic" && d.type.includes("clinic"));
    return matchSearch && matchSpecialty && matchType;
  });

  const handleConfirm = () => {
    setConfirmedDoctor(selectedDoctor);
    setSelectedDoctor(null);
  };
   const specialties = ["All", ...new Set(doctors.map(d => d.specialty))];
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Topbar ── */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        
      </header>

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">

          {/* ── Back button ── */}
          

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck size={18} className="text-blue-600" />
                <h1 className="text-slate-900 font-extrabold text-xl">Book an Appointment</h1>
              </div>
              <p className="text-slate-400 text-sm">Find and book verified doctors matched to your health profile</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
              <Stethoscope size={14} className="text-blue-600" />
               <span className="text-blue-700 text-xs font-semibold">
                {doctors.filter(d => d.available).length} doctors available
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Search + filter row ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name, specialty, hospital..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
          
        </div>

        {/* ── Specialty chips ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSpecialty(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${activeSpecialty === s ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"}`}
            >
              {s}
            </button>
          ))}
        </div>
        {/* ── Loading state ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader size={32} className="text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-600 font-semibold">Loading doctors...</p>
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <X size={17} className="text-red-600" />
            </div>
            <div>
              <p className="text-slate-800 font-semibold text-sm mb-1">Unable to load doctors</p>
              <p className="text-slate-500 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* ── Results count ── */}
        <p className="text-slate-400 text-xs font-medium">
          Showing <span className="text-slate-700 font-bold">{filtered.length}</span> doctor{filtered.length !== 1 ? "s" : ""}
          {activeSpecialty !== "All" ? ` in ${activeSpecialty}` : ""}
        </p>

        {/* ── Doctor cards grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} onBook={setSelectedDoctor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search size={22} className="text-slate-300" />
            </div>
            <p className="text-slate-700 font-semibold">No doctors found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(""); setActiveSpecialty("All"); setConsultFilter("All"); }}
              className="mt-4 text-blue-600 text-sm font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ── Info card ── */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Shield size={17} className="text-blue-600" />
          </div>
          <div>
            <p className="text-slate-800 font-semibold text-sm mb-1">Secure & Verified Booking</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              All doctors on PreventAI Health are verified medical professionals. Your booking is encrypted and protected. You will receive a confirmation via WhatsApp and email upon successful payment.
            </p>
          </div>
        </div>

      </div>

      {/* ── Booking Modal ── */}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* ── Success Toast ── */}
      {confirmedDoctor && (
        <SuccessToast doctor={confirmedDoctor} onClose={() => setConfirmedDoctor(null)} />
      )}
    </div>
  );
}
function getRandomGradient(id) {
  const gradients = [
    "from-rose-400 to-pink-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-violet-500",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-cyan-400 to-blue-500",
  ];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}