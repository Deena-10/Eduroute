# db_mysql.py - MySQL database connection using mysql-connector-python
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

class DatabaseConnection:
    def __init__(self):
        self.connection = None
        self.cursor = None
        self.connect()
    
    def connect(self):
        """Establish MySQL database connection"""
        try:
            # Get database configuration from environment variables
            config = {
                'host': os.environ.get('DB_HOST', 'localhost'),
                'user': os.environ.get('DB_USER', 'root'),
                'password': os.environ.get('DB_PASSWORD', ''),
                'database': os.environ.get('DB_NAME', 'career_roadmap'),
                'port': int(os.environ.get('DB_PORT', 3306)),
                'charset': 'utf8mb4',
                'collation': 'utf8mb4_unicode_ci',
                'autocommit': True,
                'raise_on_warnings': True
            }
            
            try:
                # First attempt: connect directly to the target database
                self.connection = mysql.connector.connect(**config)
            except Error as e:
                # If database is missing (Error 1049), create it then reconnect
                if getattr(e, 'errno', None) == 1049:
                    temp_config = dict(config)
                    temp_config.pop('database', None)
                    admin_conn = mysql.connector.connect(**temp_config)
                    admin_cursor = admin_conn.cursor()
                    db_name = config['database']
                    print(f"[INFO] Database '{db_name}' not found. Creating it...")
                    admin_cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                    admin_cursor.close()
                    admin_conn.close()
                    # Retry connecting to the newly created database
                    self.connection = mysql.connector.connect(**config)
                else:
                    raise

            self.cursor = self.connection.cursor(dictionary=True)
            print(f"[SUCCESS] Connected to MySQL database: {config['database']}")
            
        except Error as e:
            print(f"[ERROR] Database connection failed: {e}")
            self.connection = None
            self.cursor = None
    
    def is_connected(self) -> bool:
        """Check if database connection is active"""
        try:
            if self.connection and self.connection.is_connected():
                return True
        except:
            pass
        return False
    
    def reconnect(self):
        """Reconnect to database if connection is lost"""
        if not self.is_connected():
            print("[INFO] Reconnecting to database...")
            self.connect()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        try:
            self.reconnect()
            if self.cursor:
                self.cursor.execute(query, params or ())
                return self.cursor.fetchall()
        except Error as e:
            print(f"[ERROR] Query execution failed: {e}")
            return []
    
    def execute_insert(self, query: str, params: tuple = None) -> int:
        """Execute INSERT query and return last insert ID"""
        try:
            self.reconnect()
            if self.cursor:
                self.cursor.execute(query, params or ())
                self.connection.commit()
                return self.cursor.lastrowid
        except Error as e:
            print(f"[ERROR] Insert execution failed: {e}")
            return 0
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute UPDATE/DELETE query and return affected rows"""
        try:
            self.reconnect()
            if self.cursor:
                self.cursor.execute(query, params or ())
                self.connection.commit()
                return self.cursor.rowcount
        except Error as e:
            print(f"[ERROR] Update execution failed: {e}")
            return 0
    
    def close(self):
        """Close database connection"""
        try:
            if self.cursor:
                self.cursor.close()
            if self.connection and self.connection.is_connected():
                self.connection.close()
                print("[INFO] Database connection closed")
        except Error as e:
            print(f"[ERROR] Error closing connection: {e}")

# Global database connection instance
db = DatabaseConnection()

# Database Models and Operations
class User:
    @staticmethod
    def create(uid: str, name: str = None, email: str = None, education: str = None, 
               interest: str = None, skills_learned: str = None, 
               skills_to_learn: str = None, planning_days: int = None) -> int:
        """Create a new user"""
        query = """
        INSERT INTO users (uid, name, email, education, interest, skills_learned, skills_to_learn, planning_days)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (uid, name, email, education, interest, skills_learned, skills_to_learn, planning_days)
        return db.execute_insert(query, params)
    
    @staticmethod
    def get_by_uid(uid: str) -> Optional[Dict[str, Any]]:
        """Get user by UID"""
        query = "SELECT * FROM users WHERE uid = %s"
        results = db.execute_query(query, (uid,))
        return results[0] if results else None
    
    @staticmethod
    def update(uid: str, **kwargs) -> int:
        """Update user information"""
        set_clauses = []
        params = []
        for key, value in kwargs.items():
            if value is not None:
                set_clauses.append(f"{key} = %s")
                params.append(value)
        
        if not set_clauses:
            return 0
        
        params.append(uid)
        query = f"UPDATE users SET {', '.join(set_clauses)} WHERE uid = %s"
        return db.execute_update(query, tuple(params))

class ChatHistory:
    @staticmethod
    def create(uid: str, question: str, answer: str, engine: str = 'gemini') -> int:
        """Create new chat history entry"""
        query = """
        INSERT INTO chat_history (uid, question, answer, engine)
        VALUES (%s, %s, %s, %s)
        """
        params = (uid, question, answer, engine)
        return db.execute_insert(query, params)
    
    @staticmethod
    def get_by_uid(uid: str) -> List[Dict[str, Any]]:
        """Get chat history for user"""
        query = """
        SELECT * FROM chat_history 
        WHERE uid = %s 
        ORDER BY timestamp ASC
        """
        return db.execute_query(query, (uid,))
    
    @staticmethod
    def clear_by_uid(uid: str) -> int:
        """Clear chat history for user"""
        query = "DELETE FROM chat_history WHERE uid = %s"
        return db.execute_update(query, (uid,))

class RoadmapProgress:
    @staticmethod
    def create(uid: str, roadmap_step: str, completion_percentage: float = 0.0) -> int:
        """Create roadmap progress entry"""
        query = """
        INSERT INTO roadmap_progress (uid, roadmap_step, completion_percentage)
        VALUES (%s, %s, %s)
        """
        params = (uid, roadmap_step, completion_percentage)
        return db.execute_insert(query, params)
    
    @staticmethod
    def get_by_uid(uid: str) -> List[Dict[str, Any]]:
        """Get roadmap progress for user"""
        query = """
        SELECT * FROM roadmap_progress 
        WHERE uid = %s 
        ORDER BY date_updated DESC
        """
        return db.execute_query(query, (uid,))
    
    @staticmethod
    def update_progress(uid: str, completion_percentage: float) -> int:
        """Update progress percentage"""
        query = """
        UPDATE roadmap_progress 
        SET completion_percentage = %s, date_updated = %s
        WHERE uid = %s
        """
        params = (completion_percentage, datetime.utcnow(), uid)
        return db.execute_update(query, params)

class Event:
    @staticmethod
    def get_by_domain_and_percentage(domain: str, percentage: float) -> List[Dict[str, Any]]:
        """Get events for specific domain and progress percentage"""
        query = """
        SELECT * FROM events 
        WHERE domain = %s AND suggested_for_percentage <= %s
        ORDER BY suggested_for_percentage DESC
        """
        return db.execute_query(query, (domain, percentage))

class Project:
    @staticmethod
    def get_by_domain_and_percentage(domain: str, percentage: float) -> List[Dict[str, Any]]:
        """Get projects for specific domain and progress percentage"""
        query = """
        SELECT * FROM projects 
        WHERE domain = %s AND suggested_for_percentage <= %s
        ORDER BY suggested_for_percentage DESC
        """
        return db.execute_query(query, (domain, percentage))

# Initialize database tables
def init_database():
    """Initialize database tables if they don't exist"""
    try:
        # Create users table
        users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uid VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(255),
            email VARCHAR(255),
            education VARCHAR(100),
            interest VARCHAR(100),
            skills_learned TEXT,
            skills_to_learn TEXT,
            planning_days INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """
        
        # Create chat_history table
        chat_history_table = """
        CREATE TABLE IF NOT EXISTS chat_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uid VARCHAR(100) NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            engine VARCHAR(50) DEFAULT 'gemini',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        
        # Create roadmap_progress table
        roadmap_progress_table = """
        CREATE TABLE IF NOT EXISTS roadmap_progress (
            id INT AUTO_INCREMENT PRIMARY KEY,
            uid VARCHAR(100) NOT NULL,
            roadmap_step TEXT,
            completion_percentage DECIMAL(5,2) DEFAULT 0.00,
            date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """
        
        # Create events table
        events_table = """
        CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_name VARCHAR(200),
            domain VARCHAR(100),
            date VARCHAR(50),
            link VARCHAR(200),
            suggested_for_percentage DECIMAL(5,2)
        )
        """
        
        # Create projects table
        projects_table = """
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            project_name VARCHAR(200),
            domain VARCHAR(100),
            description TEXT,
            suggested_for_percentage DECIMAL(5,2)
        )
        """
        
        # Execute table creation
        tables = [users_table, chat_history_table, roadmap_progress_table, events_table, projects_table]
        
        for table_sql in tables:
            try:
                db.execute_update(table_sql)
            except Error as e:
                # Ignore "table already exists" errors (1050)
                if e.errno != 1050:
                    print(f"[ERROR] Table creation failed: {e}")
                    raise
        
        print("[SUCCESS] Database tables initialized successfully")
        
    except Error as e:
        print(f"[ERROR] Database initialization failed: {e}")

# Initialize database on import
if db.is_connected():
    init_database()
else:
    print("[WARNING] Database not connected. Tables will be created when connection is established.")

