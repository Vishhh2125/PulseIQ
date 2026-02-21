"""
Digital Twin Analysis - Analyzes user's chat history for health risk assessment
"""
from utils.llm_service import generate_response


def build_digital_twin_prompt(chat_history):
    """
    Build a prompt that analyzes user's entire chat history to generate a single-line health risk assessment.
    
    Args:
        chat_history: List of dicts with 'question' and 'response' keys
    
    Returns:
        Risk assessment string or None if no serious issues detected
    """
    
    if not chat_history:
        return None
    
    # Format chat history for the prompt
    chat_context = "\n\n".join([
        f"Q: {chat['question']}\nA: {chat['response']}"
        for chat in chat_history
    ])
    
    prompt = f"""
You are a medical AI analyzing a patient's health conversation history to identify potential health risks.

Patient's Chat History:
{chat_context}

Based on this chat history, provide:
1. A SINGLE LINE risk assessment (if serious issues are detected)
2. Identified health concerns (if any)

IMPORTANT RULES:
- Only provide a risk assessment if there are SERIOUS health concerns detected
- If conversations show general wellness or minor issues, respond with: "No serious health concerns detected"
- Be concise and medical-accurate
- Do NOT recommend diagnosis
- Focus on observable patterns and trends from the conversations

Format your response as:
Risk Level: [None/Low/Moderate/High/Critical]
Summary: [One line summary of risks or "No serious health concerns detected"]
"""
    
    return prompt


def analyze_digital_twin(chat_history):
    """
    Analyze user's chat history and generate health risk assessment.
    
    Args:
        chat_history: List of user chats with questions and responses
    
    Returns:
        dict with risk_level and summary
    """
    
    if not chat_history:
        return {
            "risk_level": "None",
            "summary": "No chat history to analyze"
        }
    
    prompt = build_digital_twin_prompt(chat_history)
    
    if not prompt:
        return {
            "risk_level": "None",
            "summary": "Insufficient data for analysis"
        }
    
    try:
        response = generate_response(prompt)
        
        # Parse response
        lines = response.split('\n')
        risk_level = "None"
        summary = "No serious health concerns detected"
        
        for line in lines:
            if "Risk Level:" in line:
                risk_level = line.split("Risk Level:")[-1].strip()
            if "Summary:" in line:
                summary = line.split("Summary:")[-1].strip()
        
        # Only return if serious issues detected
        if risk_level in ["Low", "Moderate", "High", "Critical"]:
            return {
                "risk_level": risk_level,
                "summary": summary,
                "show_alert": True
            }
        else:
            return {
                "risk_level": "None",
                "summary": "No serious health concerns detected",
                "show_alert": False
            }
    
    except Exception as e:
        print(f"Error analyzing digital twin: {e}")
        return {
            "risk_level": "None",
            "summary": "Unable to analyze at this time",
            "show_alert": False
        }
