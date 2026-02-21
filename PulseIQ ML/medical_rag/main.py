print("🔥 THIS MAIN.PY IS RUNNING 🔥")

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from typing import Optional
from pydantic import BaseModel
from database import SessionLocal, UserDocument, UserChunk, GlobalDocument, GlobalChunk, UserChat
from utils.global_vector_store import append_to_global_index
from utils.vector_store import retrieve_user_chunks, create_vector_store
from utils.global_vector_store import retrieve_global_chunks
from utils.pdf_extractor import extract_text_from_pdf
from utils.chunker import chunk_text
from utils.prompt_builder import build_medical_prompt
from utils.llm_service import generate_response
from utils.digital_twin import analyze_digital_twin


app = FastAPI()

# ✅ CORS Configuration - MUST be FIRST before routes
origins = [
    "http://localhost:5173",  # React Vite frontend
    "http://localhost:5174",  # Alternative frontend port
    "http://localhost:3000",  # Alternative dev port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ChatRequest(BaseModel):
    user_id: str
    question: str
    watch_data: Optional[dict] = None  # Real-time watch/fitness data


class SaveChatRequest(BaseModel):
    user_id: str
    question: str
    response: str
    personalized_mode: bool = False


# ✅ Health Check Endpoint
@app.get("/health/")
async def health_check():
    return {"status": "ok", "message": "Medical RAG API is running - UPDATED VERSION WITH CORS"}


# ✅ DEBUG: OPTIONS handler for /chat/
@app.options("/chat/")
async def options_chat():
    return {"status": "options working"}


# ✅ Dual Retrieval Chat Endpoint
@app.post("/chat/")
async def chat_with_medical_history(request: ChatRequest):

    user_context = retrieve_user_chunks(
        query=request.question,
        user_id=request.user_id,
        k=3
    )

    global_context = retrieve_global_chunks(
        query=request.question,
        k=3
    )

    personalized = True if user_context else False

    prompt = build_medical_prompt(
        user_question=request.question,
        user_context=user_context,
        global_context=global_context,
        watch_data=request.watch_data
    )

    ai_response = generate_response(prompt)

    return {
        "user_id": request.user_id,
        "personalized_mode": personalized,
        "final_response": ai_response
    }

# ✅ Upload User Medical Record (Updated DB Logic)
@app.post("/upload-medical-record/")
async def upload_medical_record(user_id: str, file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text_from_pdf(file_path)

    if not extracted_text.strip():
        return {"error": "No text could be extracted"}

    chunks = chunk_text(extracted_text)

    # 🔹 Save in FAISS
    total_chunks = create_vector_store(chunks, user_id=user_id)

    # 🔹 Save document metadata in DB
    db = SessionLocal()

    new_document = UserDocument(
        user_id=user_id,
        file_name=file.filename
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    # 🔹 Save each chunk in DB
    for idx, chunk in enumerate(chunks):
        new_chunk = UserChunk(
            document_id=new_document.id,
            user_id=user_id,
            chunk_text=chunk,
            chunk_index=idx
        )
        db.add(new_chunk)

    db.commit()
    db.close()

    return {
        "message": "Medical record processed successfully",
        "user_id": user_id,
        "total_chunks_created": total_chunks
    }


@app.post("/upload-global-medical-doc/")
async def upload_global_medical_doc(
    disease_name: str,
    file: UploadFile = File(...)
):

    os.makedirs("global_docs", exist_ok=True)

    file_path = os.path.join("global_docs", file.filename)

    # Save file locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract + chunk
    extracted_text = extract_text_from_pdf(file_path)

    if not extracted_text.strip():
        return {"error": "No text could be extracted"}

    chunks = chunk_text(extracted_text)

    # 🔹 Save embeddings into FAISS
    total_chunks = append_to_global_index(file_path)

    # 🔹 Save document metadata in DB
    db = SessionLocal()

    new_document = GlobalDocument(
        disease_name=disease_name,
        file_name=file.filename
    )

    db.add(new_document)
    db.commit()
    db.refresh(new_document)

    # 🔹 Save each chunk into DB
    for idx, chunk in enumerate(chunks):
        new_chunk = GlobalChunk(
            document_id=new_document.id,
            chunk_text=chunk,
            chunk_index=idx
        )
        db.add(new_chunk)

    db.commit()
    db.close()

    return {
        "message": "Global medical document processed successfully",
        "disease_name": disease_name,
        "chunks_added": total_chunks
    }


# 🔹 DIGITAL TWIN ENDPOINTS
# ✅ Save Chat to Database (Digital Twin)
@app.post("/save-chat/")
async def save_chat(request: SaveChatRequest):
    """Save user's chat conversation for digital twin analysis"""
    
    db = SessionLocal()
    
    try:
        new_chat = UserChat(
            user_id=request.user_id,
            question=request.question,
            response=request.response,
            personalized_mode=str(request.personalized_mode)
        )
        
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        
        return {
            "message": "Chat saved successfully",
            "chat_id": new_chat.id,
            "user_id": request.user_id
        }
    except Exception as e:
        db.rollback()
        return {"error": f"Failed to save chat: {str(e)}"}
    finally:
        db.close()


# ✅ Get Digital Twin Analysis (Analyzes all user chats for health risks)
@app.get("/digital-twin/{user_id}")
async def get_digital_twin(user_id: str):
    """Get digital twin analysis for a user based on their chat history"""
    
    db = SessionLocal()
    
    try:
        # Get all user's chats
        user_chats = db.query(UserChat).filter(UserChat.user_id == user_id).order_by(UserChat.created_at).all()
        
        if not user_chats:
            return {
                "user_id": user_id,
                "risk_level": "None",
                "summary": "No chat history found",
                "show_alert": False,
                "total_chats": 0
            }
        
        # Convert to dict format for analysis
        chat_history = [
            {
                "question": chat.question,
                "response": chat.response,
                "personalized_mode": chat.personalized_mode,
                "created_at": chat.created_at.isoformat()
            }
            for chat in user_chats
        ]
        
        # Analyze digital twin
        analysis = analyze_digital_twin(chat_history)
        
        return {
            "user_id": user_id,
            "risk_level": analysis.get("risk_level", "None"),
            "summary": analysis.get("summary", "No serious health concerns detected"),
            "show_alert": analysis.get("show_alert", False),
            "total_chats": len(user_chats),
            "last_chat": user_chats[-1].created_at.isoformat() if user_chats else None
        }
    
    except Exception as e:
        return {
            "error": f"Failed to get digital twin: {str(e)}",
            "user_id": user_id
        }
    finally:
        db.close()


# ✅ Get User's Chat History
@app.get("/chat-history/{user_id}")
async def get_chat_history(user_id: str, limit: int = 50):
    """Get user's chat history for the dashboard"""
    
    db = SessionLocal()
    
    try:
        user_chats = db.query(UserChat).filter(
            UserChat.user_id == user_id
        ).order_by(UserChat.created_at.desc()).limit(limit).all()
        
        chats = [
            {
                "id": chat.id,
                "question": chat.question,
                "response": chat.response,
                "personalized_mode": chat.personalized_mode,
                "created_at": chat.created_at.isoformat()
            }
            for chat in user_chats
        ]
        
        return {
            "user_id": user_id,
            "total_chats": len(chats),
            "chats": chats
        }
    
    except Exception as e:
        return {"error": f"Failed to get chat history: {str(e)}"}
    finally:
        db.close()