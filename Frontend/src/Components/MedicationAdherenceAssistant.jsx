"use client";
import React, { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle, XCircle, Plus, Loader2, Search, X } from "lucide-react";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Prefer 2.0 Flash for broader availability; 2.5 may require allowlist/billing
const GEMINI_MODELS = ["gemini-2.0-flash"];
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const MedicationAdherenceAssistant = () => {
  // ✅ Local State instead of Redux
  const [medications, setMedications] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [activeMedication, setActiveMedication] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [apiError, setApiError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 📊 Derived state
  const takenCount = medications.filter((m) => m.taken).length;
  const adherencePercentage =
    medications.length === 0 ? 0 : (takenCount / medications.length) * 100;

  const upcomingMedication = medications.find((m) => !m.taken);

  // 🎥 Camera setup — handle permission denied/dismissed
  useEffect(() => {
    let stream;
    const startCamera = async () => {
      if (!showVerifyModal || capturedImage) {
        setCameraError(null);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraError(null);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        const message =
          err?.name === "NotAllowedError" || err?.message?.includes("Permission")
            ? "Camera access denied or dismissed. You can still mark medication as taken below."
            : "Camera unavailable.";
        setCameraError(message);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [showVerifyModal, capturedImage]);

  // ➕ Add medication
  const addMedication = (med) => {
    setMedications((prev) => [
      ...prev,
      { ...med, id: Date.now(), taken: false },
    ]);
  };

  // ❌ Delete
  const deleteMedication = (id) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // ✅ Mark taken
  const markAsTaken = (id) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, taken: true } : m))
    );
  };

  // 📸 Capture image
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/png"));
  };

  // 🔍 Call Gemini (tries multiple models on 400/403)
  const callGemini = async (payload) => {
    if (!GEMINI_API_KEY) {
      setApiError("Gemini API key not set. Add VITE_GEMINI_API_KEY in .env");
      return null;
    }
    setApiError(null);
    let lastError = null;
    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          lastError = data?.error?.message || `HTTP ${res.status}`;
          continue;
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text != null) return text;
      } catch (e) {
        lastError = e.message;
      }
    }
    setApiError(lastError || "AI service unavailable. Check API key and quota.");
    return null;
  };

  // 🔍 Verify pill using Gemini
  const verifyPillIntake = async () => {
    if (!capturedImage || !activeMedication) return;
    setIsLoading(true);
    setVerificationStatus("idle");
    setApiError(null);

    const base64 = capturedImage.split(",")[1];
    const payload = {
      contents: [
        {
          parts: [
            { text: "Does the image show a pill? Reply YES or NO." },
            { inlineData: { mimeType: "image/png", data: base64 } },
          ],
        },
      ],
    };

    const text = await callGemini(payload);
    if (text?.toUpperCase().includes("YES")) {
      setVerificationStatus("success");
      markAsTaken(activeMedication.id);
    } else if (text != null) {
      setVerificationStatus("failure");
    } else {
      setVerificationStatus("failure");
    }

    setIsLoading(false);
  };

  // 🔎 Search meds via Gemini
  const searchMedications = async () => {
    if (!searchQuery) return;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Return 3 medications related to "${searchQuery}" in JSON format with name and dosage.`,
            },
          ],
        },
      ],
    };

    const text = await callGemini(payload);
    if (text) {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          setSearchResults(JSON.parse(match[0]));
        } catch {
          setSearchResults([]);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Medication Assistant</h1>

      {apiError && (
        <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-lg text-sm text-amber-800">
          {apiError}
        </div>
      )}

      {/* Progress */}
      <div className="mb-6">
        <p className="font-semibold">Adherence: {adherencePercentage.toFixed(0)}%</p>
      </div>

      {/* Upcoming */}
      {upcomingMedication && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="font-bold text-lg">Up Next</h2>
          <p>{upcomingMedication.name}</p>
          <button
            onClick={() => {
              setActiveMedication(upcomingMedication);
              setShowVerifyModal(true);
            }}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Verify Intake
          </button>
        </div>
      )}

      {/* Medication List */}
      <div className="grid gap-4">
        {medications.map((med) => (
          <div key={med.id} className="bg-white p-4 rounded-xl shadow flex justify-between">
            <div>
              <p className={med.taken ? "line-through" : ""}>{med.name}</p>
              <p className="text-sm text-gray-500">{med.dose}</p>
            </div>
            <button onClick={() => deleteMedication(med.id)}>
              <X />
            </button>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        <Plus />
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMedication({
                name: e.target.name.value,
                dose: e.target.dose.value,
              });
              setShowAddModal(false);
            }}
            className="bg-white p-6 rounded-xl"
          >
            <input name="name" placeholder="Name" className="border p-2 mb-2 w-full" />
            <input name="dose" placeholder="Dose" className="border p-2 mb-2 w-full" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Add
            </button>
          </form>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center max-w-md">
            {cameraError ? (
              <div className="mb-4">
                <p className="text-sm text-amber-700 mb-4">{cameraError}</p>
                <button
                  onClick={() => {
                    setCameraError(null);
                    setVerificationStatus("success");
                    markAsTaken(activeMedication?.id);
                    setShowVerifyModal(false);
                    setCapturedImage(null);
                    setActiveMedication(null);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Mark as taken without camera
                </button>
              </div>
            ) : !capturedImage ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="mb-4 w-full rounded" />
                <button onClick={captureImage} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Capture
                </button>
              </>
            ) : (
              <>
                <img src={capturedImage} className="mb-4" />
                <button
                  onClick={verifyPillIntake}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Verify
                </button>
              </>
            )}

            {isLoading && <Loader2 className="animate-spin mx-auto mt-4" />}
            {verificationStatus === "success" && <CheckCircle className="text-green-500 mx-auto" />}
            {verificationStatus === "failure" && <XCircle className="text-red-500 mx-auto" />}
            <button
              type="button"
              onClick={() => {
                setShowVerifyModal(false);
                setCapturedImage(null);
                setActiveMedication(null);
                setCameraError(null);
                setVerificationStatus("idle");
              }}
              className="mt-4 text-gray-500 text-sm underline"
            >
              Close
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
      )}
    </div>
  );
};

export default MedicationAdherenceAssistant;