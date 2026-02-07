# db_sqlite.py - Alternative database solution using built-in sqlite3
import sqlite3
import os
from datetime import datetime

# Database file path
DB_FILE = "career_roadmap.db"

def get_connection():
    """Get SQLite database connection"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Enable column access by name
    return conn

def init_database():
    """Initialize database tables"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT UNIQUE,
            name TEXT,
            email TEXT,
            education TEXT,
            interest TEXT,
            skills_learned TEXT,
            skills_to_learn TEXT,
            planning_days INTEGER
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT,
            question TEXT,
            answer TEXT,
            engine TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS roadmap_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT,
            roadmap_step TEXT,
            completion_percentage REAL,
            date_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT,
            domain TEXT,
            date TEXT,
            link TEXT,
            suggested_for_percentage REAL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT,
            domain TEXT,
            description TEXT,
            suggested_for_percentage REAL
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on import
init_database()


