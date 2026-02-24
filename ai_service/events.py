# events.py
from db_postgres import Event as PGEvent

def get_events_for_user(domain, completion_percentage):
    rows = PGEvent.get_by_domain_and_percentage(domain, completion_percentage)
    return [{"name": r.get("event_name"), "date": r.get("date"), "link": r.get("link")} for r in rows]
