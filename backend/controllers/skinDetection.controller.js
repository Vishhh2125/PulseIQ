import { GoogleGenerativeAI } from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Analyze skin condition from base64 image
export const analyzeSkinCondition = asyncHandler(async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64 || !mimeType) {
    throw new ApiError(400, "Image data and MIME type are required");
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const response = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
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

Recommendations:
- recommendation 1
- recommendation 2
- recommendation 3

Use simple, non-medical language.
Do not add extra sections.
Do not provide medical diagnosis.
Always recommend consulting a healthcare provider.
`,
      },
    ]);

    const text = response.response.text();

    const observation =
      text.split("Observation:")[1]?.split("Explanation:")[0]?.trim() || "";

    const explanation =
      text.split("Explanation:")[1]?.split("Possible Causes:")[0]?.trim() || "";

    const causesText = text.split("Possible Causes:")[1]?.split("Recommendations:")[0]?.trim() || "";

    const recommendations =
      text.split("Recommendations:")[1]?.trim() || "";

    const causes = causesText
      .split("\n")
      .map((c) => c.replace("-", "").trim())
      .filter(Boolean);

    const recommendationsList = recommendations
      .split("\n")
      .map((r) => r.replace("-", "").trim())
      .filter(Boolean);

    return res.status(200).json(
      new ApiResponse(200, {
        observation,
        explanation,
        causes,
        recommendations: recommendationsList,
      }, "Skin analysis completed successfully")
    );
  } catch (error) {
    if (error.status === 429 || error.message?.includes("quota")) {
      throw new ApiError(429, "API quota exceeded. Please try again later.");
    }
    if (error.message?.includes("API key was reported as leaked")) {
      throw new ApiError(403, "API key is invalid or compromised. Please contact support.");
    }
    throw new ApiError(500, `Failed to analyze image: ${error.message}`);
  }
});
