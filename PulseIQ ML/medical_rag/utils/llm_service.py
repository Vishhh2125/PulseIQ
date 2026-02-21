import google.genai as genai
import os
from dotenv import load_dotenv
from google.genai import errors

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_response(prompt):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except errors.ClientError as e:
        if e.status_code == 429:
            raise Exception("API quota exceeded. Please try again later or upgrade to a paid plan.")
        else:
            raise Exception(f"API Error: {str(e)}")
    except Exception as e:
        raise Exception(f"Error generating response: {str(e)}")