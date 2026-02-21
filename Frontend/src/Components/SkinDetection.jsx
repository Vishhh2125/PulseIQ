"use client";

import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SkinDetection = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const genAI = new GoogleGenerativeAI(
    import.meta.env.VITE_GEMINI_API_KEY
  );

  const handleChange = (file) => {
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Image must be under 4MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
  };

  const fileToGenerativePart = async (file) => {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return {
      inlineData: {
        data: base64,
        mimeType: file.type,
      },
    };
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const imagePart = await fileToGenerativePart(image);

      const response = await model.generateContent([
        imagePart,
        {
          text: `
Analyze this skin image and respond in the following STRICT format:

Observation:
<One paragraph describing what is visible>

Explanation:
<One paragraph explaining what it might indicate>

Possible Causes:
- cause 1
- cause 2
- cause 3

Use simple, non-medical language.
Do not add extra sections.
`,
        },
      ]);

      const text = response.response.text();

      // 🔹 Parse structured response
      const observation =
        text.split("Observation:")[1]?.split("Explanation:")[0]?.trim() || "";

      const explanation =
        text.split("Explanation:")[1]?.split("Possible Causes:")[0]?.trim() || "";

      const causesText =
        text.split("Possible Causes:")[1]?.trim() || "";

      const causes = causesText
        .split("\n")
        .map((c) => c.replace("-", "").trim())
        .filter(Boolean);

      setAnalysis({ observation, explanation, causes });

    } catch (err) {
      console.error(err);
      alert("Error analyzing image. Check console.");
    }

    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Skin Condition Detection
      </h2>

      {/* Upload */}
      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-full h-full object-contain rounded-xl"
          />
        ) : (
          <p className="text-gray-500">Click to upload skin image</p>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleChange(e.target.files[0])}
        />
      </label>

      {/* Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>

      {/* Results */}
      {analysis && (
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="text-lg font-semibold mb-3">🩺 Skin Analysis</h3>

          <p className="mb-4">{analysis.observation}</p>

          <p className="mb-4">{analysis.explanation}</p>

          {analysis.causes.length > 0 && (
            <>
              <h4 className="font-semibold mb-2">Possible Causes:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.causes.map((cause, i) => (
                  <li key={i}>{cause}</li>
                ))}
              </ul>
            </>
          )}

          <p className="text-xs text-gray-500 mt-4 border-t pt-2">
            This is an AI-generated observation and not a medical diagnosis.
          </p>
        </div>
      )}
    </div>
  );
};

export default SkinDetection;