# db.py
import os
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database URL (MySQL example)
DB_URL = os.environ.get("DATABASE_URL", "sqlite:///career_roadmap.db")  # fallback to SQLite

engine = create_engine(DB_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(100), unique=True)
    name = Column(String(100))
    email = Column(String(100))
    education = Column(String(100))
    interest = Column(String(100))
    skills_learned = Column(Text)
    skills_to_learn = Column(Text)
    planning_days = Column(Integer)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(100))
    question = Column(Text)
    answer = Column(Text)
    engine = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)

class RoadmapProgress(Base):
    __tablename__ = "roadmap_progress"
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(100))
    roadmap_step = Column(Text)
    completion_percentage = Column(Float)
    date_updated = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    event_name = Column(String(200))
    domain = Column(String(100))
    date = Column(String(50))
    link = Column(String(200))
    suggested_for_percentage = Column(Float)

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    project_name = Column(String(200))
    domain = Column(String(100))
    description = Column(Text)
    suggested_for_percentage = Column(Float)

# Create tables
Base.metadata.create_all(bind=engine)
