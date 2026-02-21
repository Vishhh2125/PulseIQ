import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const generateCarePlan = asyncHandler(async (req, res) => {
  const { patientData } = req.body;

  if (!patientData || !patientData.primaryDiagnosis || !patientData.age) {
    throw new ApiError(400, "Primary diagnosis and age are required");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = `
You are an AI healthcare assistant. Generate a comprehensive care plan for the following patient:

Patient Age: ${patientData.age}
Gender: ${patientData.gender || "Not specified"}
Primary Diagnosis: ${patientData.primaryDiagnosis}
Comorbidities: ${patientData.comorbidities || "None"}
Current Medications: ${patientData.currentMedications || "None"}
Allergies: ${patientData.allergies || "None"}
Lifestyle: ${patientData.lifestyle || "Not specified"}

Please provide a detailed care plan in the following JSON format:
{
  "diagnosis": "confirmed diagnosis",
  "overview": "brief assessment",
  "goals": [
    {
      "timeframe": "immediate/short-term/long-term",
      "goal": "specific goal"
    }
  ],
  "lifestyle": [
    {
      "category": "diet/exercise/sleep/stress",
      "recommendation": "detailed recommendation"
    }
  ],
  "medications": [
    {
      "name": "medication name",
      "dosage": "dosage",
      "frequency": "frequency",
      "purpose": "reason for this medication",
      "sideEffects": ["side effect 1", "side effect 2"]
    }
  ],
  "monitoring": [
    {
      "metric": "what to monitor",
      "frequency": "how often",
      "target": "target value or range",
      "purpose": "reason for monitoring"
    }
  ],
  "appointments": [
    {
      "specialization": "doctor type",
      "frequency": "how often",
      "purpose": "reason for visit"
    }
  ],
  "warnings": [
    {
      "type": "warning type",
      "description": "detailed warning",
      "severity": "low/medium/high"
    }
  ],
  "summary": "Brief overview of the care plan and key priorities"
}

Base your recommendations on current clinical guidelines and evidence-based medicine. Consider drug interactions, contraindications, and patient preferences.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const response = await model.generateContent(prompt);
    const generatedText = response.response.text();

    // Extract JSON from the response
    let jsonString = generatedText;
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    const carePlan = JSON.parse(jsonString);

    return res.status(200).json(
      new ApiResponse(200, carePlan, "Care plan generated successfully")
    );
  } catch (error) {
    if (error.status === 429 || error.message?.includes("quota")) {
      throw new ApiError(429, "API quota exceeded. Please try again later.");
    }
    if (error instanceof SyntaxError) {
      throw new ApiError(500, "Failed to parse care plan response");
    }
    throw new ApiError(500, `Failed to generate care plan: ${error.message}`);
  }
});
