from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

# ✅ PostgreSQL connection
DATABASE_URL = "postgresql://postgres:paras%4010@localhost:5432/medical_rag"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


# 🔹 GLOBAL DOCUMENTS TABLE
class GlobalDocument(Base):
    __tablename__ = "global_documents"

    id = Column(Integer, primary_key=True, index=True)
    disease_name = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("GlobalChunk", back_populates="document", cascade="all, delete")


# 🔹 GLOBAL CHUNKS TABLE
class GlobalChunk(Base):
    __tablename__ = "global_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("global_documents.id"))
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer)

    document = relationship("GlobalDocument", back_populates="chunks")


# 🔹 USER DOCUMENTS TABLE (One user → many documents)
class UserDocument(Base):
    __tablename__ = "user_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    file_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("UserChunk", back_populates="document", cascade="all, delete")


# 🔹 USER CHUNKS TABLE
class UserChunk(Base):
    __tablename__ = "user_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("user_documents.id"))
    user_id = Column(String, index=True, nullable=False)
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer)

    document = relationship("UserDocument", back_populates="chunks")


# 🔹 USER CHAT TABLE (Digital Twin - stores all user conversations)
class UserChat(Base):
    __tablename__ = "user_chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    personalized_mode = Column(String, default="false")  # Was personalized or general
    created_at = Column(DateTime, default=datetime.utcnow)


# ✅ Create all tables
Base.metadata.create_all(bind=engine)