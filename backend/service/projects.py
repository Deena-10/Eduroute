# projects.py
from db_postgres import Project as PGProject

def get_projects_for_user(domain, completion_percentage):
    rows = PGProject.get_by_domain_and_percentage(domain, completion_percentage)
    return [{"name": r.get("project_name"), "description": r.get("description")} for r in rows]
