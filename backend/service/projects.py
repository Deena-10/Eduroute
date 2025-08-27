# projects.py
from db import SessionLocal, Project

def get_projects_for_user(domain, completion_percentage):
    session = SessionLocal()
    projects = session.query(Project).filter(
        Project.domain == domain,
        Project.suggested_for_percentage <= completion_percentage
    ).all()
    session.close()
    return [{"name": p.project_name, "description": p.description} for p in projects]
