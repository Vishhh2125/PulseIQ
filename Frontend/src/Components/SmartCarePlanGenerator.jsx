"use client";

import React, { useState } from 'react';
import { 
  Heart, User, Calendar, Pill, Dumbbell, UtensilsCrossed, 
  AlertTriangle, CheckCircle, Clock, Activity, Stethoscope,
  Brain, Shield, Target, FileText, Loader, Download, 
  TrendingUp, Bell, Info
} from 'lucide-react';

const SmartCarePlanGenerator = () => {
  const [patientData, setPatientData] = useState({
    // Basic Info
    age: '',
    gender: '',
    weight: '',
    height: '',
    
    // Medical History
    primaryDiagnosis: '',
    secondaryConditions: '',
    currentMedications: '',
    allergies: '',
    surgicalHistory: '',
    
    // Lifestyle
    activityLevel: 'moderate',
    smokingStatus: 'never',
    alcoholConsumption: 'none',
    dietaryRestrictions: '',
    sleepHours: '',
    stressLevel: 'moderate',
    
    // Preferences
    preferredExerciseType: '',
    dietaryPreferences: '',
    medicationPreferences: ''
  });

  const [carePlan, setCarePlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const GEMINI_API_KEY = 'AIzaSyBYREgrU-RxJR4dfPqh36o2jk6Bf5dL05A'; // Replace with your actual API key

  const generateCarePlan = async () => {
    if (!patientData.primaryDiagnosis || !patientData.age) {
      setError('Please fill in at least the primary diagnosis and age');
      return;
    }

    // Check if API key is placeholder
    if (GEMINI_API_KEY === 'YOUR_ACTUAL_GEMINI_API_KEY_HERE') {
      setError('Please replace the GEMINI_API_KEY with your actual API key from Google AI Studio');
      return;
    }

    setIsGenerating(true);
    setError('');

    const prompt = `You are a medical AI assistant. Based on the following patient information, generate a comprehensive, evidence-based care plan.

Patient Information:
- Age: ${patientData.age}
- Gender: ${patientData.gender}
- Weight: ${patientData.weight} kg
- Height: ${patientData.height} cm
- Primary Diagnosis: ${patientData.primaryDiagnosis}
- Secondary Conditions: ${patientData.secondaryConditions}
- Current Medications: ${patientData.currentMedications}
- Allergies: ${patientData.allergies}
- Activity Level: ${patientData.activityLevel}
- Smoking Status: ${patientData.smokingStatus}
- Alcohol Consumption: ${patientData.alcoholConsumption}
- Sleep Hours: ${patientData.sleepHours}
- Stress Level: ${patientData.stressLevel}
- Dietary Restrictions: ${patientData.dietaryRestrictions}

Please provide a JSON response with this exact structure:
{
  "medications": [
    {
      "name": "medication name",
      "dosage": "dosage amount",
      "frequency": "frequency",
      "duration": "treatment duration",
      "instructions": "special instructions",
      "priority": "high"
    }
  ],
  "exercises": [
    {
      "type": "exercise type",
      "description": "detailed description",
      "duration": "time duration",
      "frequency": "how often",
      "intensity": "moderate",
      "precautions": "safety notes"
    }
  ],
  "diet": [
    {
      "category": "category name",
      "recommendation": "specific recommendation",
      "foods_to_include": ["food1", "food2"],
      "foods_to_avoid": ["food1", "food2"],
      "reasoning": "medical reasoning"
    }
  ],
  "lifestyle": [
    {
      "area": "lifestyle area",
      "recommendation": "specific recommendation",
      "importance": "high",
      "timeline": "when to implement"
    }
  ],
  "monitoring": [
    {
      "parameter": "what to monitor",
      "frequency": "how often",
      "target_range": "normal range",
      "method": "how to measure"
    }
  ],
  "followUp": [
    {
      "specialist": "type of doctor",
      "timeframe": "when to schedule",
      "purpose": "reason for visit"
    }
  ],
  "warnings": [
    {
      "type": "warning type",
      "description": "detailed warning",
      "severity": "medium"
    }
  ],
  "summary": "Brief overview of the care plan and key priorities"
}

Base your recommendations on current clinical guidelines and evidence-based medicine. Consider drug interactions, contraindications, and patient preferences.`;

    try {
      const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    })
  }
);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response structure from Gemini API');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('Generated text:', generatedText);
      
      // Extract JSON from the response - more robust parsing
      let jsonString = generatedText;
      
      // Remove markdown code blocks if present
      jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON object
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const carePlanData = JSON.parse(jsonMatch[0]);
          setCarePlan(carePlanData);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          throw new Error('Unable to parse JSON response from AI');
        }
      } else {
        console.error('No JSON found in response:', generatedText);
        throw new Error('No valid JSON found in AI response');
      }
    } catch (err) {
      console.error('Error generating care plan:', err);
      if (err.message.includes('404')) {
        setError('API endpoint not found. Please check your API key and ensure it\'s valid for Gemini API access.');
      } else if (err.message.includes('403')) {
        setError('Access forbidden. Please check your API key permissions and billing status.');
      } else if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('quota')) {
        setError('Rate limit reached (free tier). Please wait about 1 minute and try again. You can also check usage at https://ai.dev/rate-limit');
      } else {
        setError(`Failed to generate care plan: ${err.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCarePlan = () => {
    if (!carePlan) return;
    
    const exportData = {
      patientInfo: patientData,
      carePlan: carePlan,
      generatedDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `care-plan-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[severity] || colors.medium;
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      high: 'text-red-600',
      moderate: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[intensity] || colors.moderate;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-600 font-heading">
            Smart Care-Plan Generator
          </h1>
        </div>
        <p className="text-gray-700 max-w-2xl mx-auto font-body">
          AI-powered personalized care plan generation based on diagnosis, lifestyle data, and clinical guidelines
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Patient Data Input */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
              <User className="w-5 h-5 text-teal-500" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Age"
                  value={patientData.age}
                  onChange={(e) => setPatientData({...patientData, age: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <select
                  value={patientData.gender}
                  onChange={(e) => setPatientData({...patientData, gender: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={patientData.weight}
                  onChange={(e) => setPatientData({...patientData, weight: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={patientData.height}
                  onChange={(e) => setPatientData({...patientData, height: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
              <Heart className="w-5 h-5 text-teal-500" />
              Medical History
            </h2>
            <div className="space-y-4">
              <textarea
                placeholder="Primary Diagnosis (Required)"
                value={patientData.primaryDiagnosis}
                onChange={(e) => setPatientData({...patientData, primaryDiagnosis: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent h-20 resize-none"
              />
              <textarea
                placeholder="Secondary Conditions"
                value={patientData.secondaryConditions}
                onChange={(e) => setPatientData({...patientData, secondaryConditions: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent h-16 resize-none"
              />
              <textarea
                placeholder="Current Medications"
                value={patientData.currentMedications}
                onChange={(e) => setPatientData({...patientData, currentMedications: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent h-16 resize-none"
              />
              <input
                type="text"
                placeholder="Allergies"
                value={patientData.allergies}
                onChange={(e) => setPatientData({...patientData, allergies: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Lifestyle Factors */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
              <Activity className="w-5 h-5 text-teal-500" />
              Lifestyle
            </h2>
            <div className="space-y-4">
              <select
                value={patientData.activityLevel}
                onChange={(e) => setPatientData({...patientData, activityLevel: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">Very Active</option>
              </select>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={patientData.smokingStatus}
                  onChange={(e) => setPatientData({...patientData, smokingStatus: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="never">Never Smoked</option>
                  <option value="former">Former Smoker</option>
                  <option value="current">Current Smoker</option>
                </select>
                
                <select
                  value={patientData.alcoholConsumption}
                  onChange={(e) => setPatientData({...patientData, alcoholConsumption: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="none">No Alcohol</option>
                  <option value="light">Light Drinking</option>
                  <option value="moderate">Moderate Drinking</option>
                  <option value="heavy">Heavy Drinking</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Sleep Hours"
                  value={patientData.sleepHours}
                  onChange={(e) => setPatientData({...patientData, sleepHours: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <select
                  value={patientData.stressLevel}
                  onChange={(e) => setPatientData({...patientData, stressLevel: e.target.value})}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="low">Low Stress</option>
                  <option value="moderate">Moderate Stress</option>
                  <option value="high">High Stress</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Dietary Restrictions"
                value={patientData.dietaryRestrictions}
                onChange={(e) => setPatientData({...patientData, dietaryRestrictions: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateCarePlan}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating Care Plan...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Generate Care Plan
              </>
            )}
          </button>

          {error && (
            <div className="bg-blue-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-teal-500 mt-0.5" />
              <p className="text-gray-700 text-sm font-body">{error}</p>
            </div>
          )}
        </div>

        {/* Generated Care Plan */}
        <div className="lg:col-span-2">
          {!carePlan ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2 font-heading">No Care Plan Generated</h3>
              <p className="text-gray-400 font-body">Fill in the patient information and click "Generate Care Plan" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Care Plan Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 font-heading">
                    <Shield className="w-6 h-6 text-blue-600" />
                    Generated Care Plan
                  </h2>
                  <button
                    onClick={exportCarePlan}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700 font-body">{carePlan.summary}</p>
                </div>
              </div>

              {/* Medications */}
              {carePlan.medications && carePlan.medications.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
                    <Pill className="w-5 h-5 text-teal-500" />
                    Medications
                  </h3>
                  <div className="space-y-4">
                    {carePlan.medications.map((med, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 font-heading">{med.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(med.priority)} font-body`}>
                            {med.priority} priority
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 font-body">
                          <div>
                            <span className="font-medium">Dosage:</span> {med.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {med.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {med.duration}
                          </div>
                        </div>
                        {med.instructions && (
                          <div className="mt-2 text-sm text-gray-600 font-body">
                            <span className="font-medium">Instructions:</span> {med.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise Plan */}
              {carePlan.exercises && carePlan.exercises.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
                    <Dumbbell className="w-5 h-5 text-teal-500" />
                    Exercise Plan
                  </h3>
                  <div className="space-y-4">
                    {carePlan.exercises.map((exercise, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 font-heading">{exercise.type}</h4>
                          <span className={`text-sm font-medium ${getIntensityColor(exercise.intensity)} font-body`}>
                            {exercise.intensity} intensity
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 font-body">{exercise.description}</p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 font-body">
                          <div>
                            <span className="font-medium">Duration:</span> {exercise.duration}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {exercise.frequency}
                          </div>
                        </div>
                        {exercise.precautions && (
                          <div className="mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded font-body">
                            <span className="font-medium">Precautions:</span> {exercise.precautions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet Plan */}
              {carePlan.diet && carePlan.diet.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
                    <UtensilsCrossed className="w-5 h-5 text-teal-500" />
                    Diet Plan
                  </h3>
                  <div className="space-y-4">
                    {carePlan.diet.map((dietItem, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2 font-heading">{dietItem.category}</h4>
                        <p className="text-gray-600 mb-3 font-body">{dietItem.recommendation}</p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm font-body">
                          <div>
                            <span className="font-medium text-green-700">Include:</span>
                            <ul className="list-disc list-inside text-gray-600 ml-2">
                              {dietItem.foods_to_include?.map((food, i) => (
                                <li key={i}>{food}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-red-700">Avoid:</span>
                            <ul className="list-disc list-inside text-gray-600 ml-2">
                              {dietItem.foods_to_avoid?.map((food, i) => (
                                <li key={i}>{food}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {dietItem.reasoning && (
                          <div className="mt-2 text-sm text-gray-600 font-body">
                            <span className="font-medium">Reasoning:</span> {dietItem.reasoning}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {carePlan.warnings && carePlan.warnings.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Important Warnings
                  </h3>
                  <div className="space-y-3">
                    {carePlan.warnings.map((warning, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(warning.severity)}`}>
                        <div className="flex items-start gap-3">
                          <Bell className="w-5 h-5 mt-0.5" />
                          <div>
                            <h4 className="font-semibold mb-1 font-heading">{warning.type}</h4>
                            <p className="text-sm font-body">{warning.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up & Monitoring */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Monitoring */}
                {carePlan.monitoring && carePlan.monitoring.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
                      <TrendingUp className="w-5 h-5 text-teal-500" />
                      Monitoring
                    </h3>
                    <div className="space-y-3">
                      {carePlan.monitoring.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded p-3">
                          <h4 className="font-medium text-gray-800 font-heading">{item.parameter}</h4>
                          <div className="text-sm text-gray-600 mt-1 font-body">
                            <div>Frequency: {item.frequency}</div>
                            <div>Target: {item.target_range}</div>
                            <div>Method: {item.method}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up */}
                {carePlan.followUp && carePlan.followUp.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 font-heading">
                      <Calendar className="w-5 h-5 text-teal-500" />
                      Follow-up
                    </h3>
                    <div className="space-y-3">
                      {carePlan.followUp.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded p-3">
                          <h4 className="font-medium text-gray-800 font-heading">{item.specialist}</h4>
                          <div className="text-sm text-gray-600 mt-1 font-body">
                            <div>Timeframe: {item.timeframe}</div>
                            <div>Purpose: {item.purpose}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="bg-blue-50 border border-teal-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-teal-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2 font-heading">Medical Disclaimer</h4>
                    <p className="text-gray-700 text-sm font-body">
                      This AI-generated care plan is for informational purposes only and should not replace professional medical advice. 
                      Always consult with qualified healthcare providers before making any changes to treatment plans. 
                      This tool is designed to assist healthcare professionals and should be used in conjunction with clinical judgment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartCarePlanGenerator;