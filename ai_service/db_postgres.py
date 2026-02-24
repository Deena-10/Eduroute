# db_postgres.py - PostgreSQL database connection using psycopg2
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    import psycopg2
    from psycopg2 import Error
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    Error = Exception


class DatabaseConnection:
    def __init__(self):
        self.connection = None
        self.cursor = None
        if psycopg2:
            self.connect()

    def connect(self):
        """Establish PostgreSQL database connection"""
        if not psycopg2:
            print("[ERROR] psycopg2 not installed. Run: pip install psycopg2-binary")
            return
        try:
            config = {
                'host': os.environ.get('DB_HOST', 'localhost'),
                'port': int(os.environ.get('DB_PORT', 5432)),
                'user': os.environ.get('DB_USER', 'postgres'),
                'password': os.environ.get('DB_PASSWORD', ''),
                'dbname': os.environ.get('DB_NAME', 'career_roadmap'),
            }
            self.connection = psycopg2.connect(**config)
            self.cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            self.connection.autocommit = True
            print(f"[SUCCESS] Connected to PostgreSQL database: {config['dbname']}")
        except Error as e:
            print(f"[ERROR] Database connection failed: {e}")
            self.connection = None
            self.cursor = None

    def is_connected(self) -> bool:
        try:
            return self.connection is not None and not self.connection.closed
        except:
            return False

    def reconnect(self):
        if not self.is_connected():
            print("[INFO] Reconnecting to database...")
            self.connect()

    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        try:
            self.reconnect()
            if self.cursor:
                self.cursor.execute(query, params or ())
                return self.cursor.fetchall()
        except Error as e:
            print(f"[ERROR] Query execution failed: {e}")
            return []
        return []

    def execute_insert(self, query: str, params: tuple = None) -> int:
        try:
            self.reconnect()
            if self.cursor:
                self.cursor.execute(query, params or ())
                if 'RETURNING' in query.upper():
                    row = self.cursor.fetchone()
                    return row['id'] if row else 0
                return 0
        except Error as e:
            print(f"[ERROR] Insert execution failed: {e}")
            return 0
        return 0

    def execute_update(self, query: str, params: tuple = None) -> int:
        try:
            self.reconnect()
            if self.cursor:
                self.cursor.execute(query, params or ())
                return self.cursor.rowcount
        except Error as e:
            print(f"[ERROR] Update execution failed: {e}")
            return 0
        return 0

    def close(self):
        try:
            if self.cursor:
                self.cursor.close()
            if self.connection and not self.connection.closed:
                self.connection.close()
                print("[INFO] Database connection closed")
        except Error as e:
            print(f"[ERROR] Error closing connection: {e}")


db = DatabaseConnection() if psycopg2 else None


class User:
    @staticmethod
    def create(uid: str, name: str = None, email: str = None, education: str = None,
               interest: str = None, skills_learned: str = None,
               skills_to_learn: str = None, planning_days: int = None) -> int:
        query = """
        INSERT INTO users (uid, name, email, education, interest, skills_learned, skills_to_learn, planning_days)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
        """
        params = (uid, name, email, education, interest, skills_learned, skills_to_learn, planning_days)
        return db.execute_insert(query, params) if db else 0

    @staticmethod
    def get_by_uid(uid: str) -> Optional[Dict[str, Any]]:
        query = "SELECT * FROM users WHERE uid = %s"
        results = db.execute_query(query, (uid,)) if db else []
        return results[0] if results else None

    @staticmethod
    def update(uid: str, **kwargs) -> int:
        if not db:
            return 0
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
        query = """
        INSERT INTO chat_history (uid, question, answer, engine)
        VALUES (%s, %s, %s, %s) RETURNING id
        """
        params = (uid, question, answer, engine)
        return db.execute_insert(query, params) if db else 0

    @staticmethod
    def get_by_uid(uid: str) -> List[Dict[str, Any]]:
        query = "SELECT * FROM chat_history WHERE uid = %s ORDER BY timestamp ASC"
        return db.execute_query(query, (uid,)) if db else []

    @staticmethod
    def clear_by_uid(uid: str) -> int:
        query = "DELETE FROM chat_history WHERE uid = %s"
        return db.execute_update(query, (uid,)) if db else 0


class RoadmapProgress:
    @staticmethod
    def create(uid: str, roadmap_step: str, completion_percentage: float = 0.0) -> int:
        query = """
        INSERT INTO roadmap_progress (uid, roadmap_step, completion_percentage)
        VALUES (%s, %s, %s) RETURNING id
        """
        params = (uid, roadmap_step, completion_percentage)
        return db.execute_insert(query, params) if db else 0

    @staticmethod
    def get_by_uid(uid: str) -> List[Dict[str, Any]]:
        query = "SELECT * FROM roadmap_progress WHERE uid = %s ORDER BY date_updated DESC"
        return db.execute_query(query, (uid,)) if db else []

    @staticmethod
    def update_progress(uid: str, completion_percentage: float) -> int:
        query = """
        UPDATE roadmap_progress
        SET completion_percentage = %s, date_updated = %s
        WHERE uid = %s
        """
        params = (completion_percentage, datetime.utcnow(), uid)
        return db.execute_update(query, params) if db else 0


class Event:
    @staticmethod
    def get_by_domain_and_percentage(domain: str, percentage: float) -> List[Dict[str, Any]]:
        query = """
        SELECT * FROM events
        WHERE domain = %s AND suggested_for_percentage <= %s
        ORDER BY suggested_for_percentage DESC
        """
        return db.execute_query(query, (domain, percentage)) if db else []


class Project:
    @staticmethod
    def get_by_domain_and_percentage(domain: str, percentage: float) -> List[Dict[str, Any]]:
        query = """
        SELECT * FROM projects
        WHERE domain = %s AND suggested_for_percentage <= %s
        ORDER BY suggested_for_percentage DESC
        """
        return db.execute_query(query, (domain, percentage)) if db else []


class CareerOnboardingState:
    @staticmethod
    def get_by_uid(uid: str) -> Optional[Dict[str, Any]]:
        query = "SELECT * FROM career_onboarding_state WHERE uid = %s"
        results = db.execute_query(query, (uid,)) if db else []
        return results[0] if results else None

    @staticmethod
    def create(uid: str) -> int:
        query = """
        INSERT INTO career_onboarding_state (uid, step)
        VALUES (%s, 'domain')
        ON CONFLICT (uid) DO UPDATE SET step = 'domain', domain = NULL, proficiency_level = NULL, current_status = NULL, updated_at = CURRENT_TIMESTAMP
        RETURNING id
        """
        out = db.execute_insert(query, (uid,)) if db else 0
        return out

    @staticmethod
    def update(uid: str, step: str = None, domain: str = None, proficiency_level: str = None, current_status: str = None) -> int:
        if not db:
            return 0
        updates = ["updated_at = CURRENT_TIMESTAMP"]
        params = []
        if step is not None:
            updates.append("step = %s")
            params.append(step)
        if domain is not None:
            updates.append("domain = %s")
            params.append(domain)
        if proficiency_level is not None:
            updates.append("proficiency_level = %s")
            params.append(proficiency_level)
        if current_status is not None:
            updates.append("current_status = %s")
            params.append(current_status)
        if not params:
            return 0
        params.append(uid)
        query = f"UPDATE career_onboarding_state SET {', '.join(updates)} WHERE uid = %s"
        return db.execute_update(query, tuple(params))


# Database tables are now managed by Prisma migrations in the Node.js backend.
# Do not initialize tables here.
elif db:
    print("[WARNING] Database not connected. Tables will be created when connection is established.")
