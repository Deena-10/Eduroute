# events.py
from db import SessionLocal, Event

def get_events_for_user(domain, completion_percentage):
    session = SessionLocal()
    events = session.query(Event).filter(
        Event.domain == domain,
        Event.suggested_for_percentage <= completion_percentage
    ).all()
    session.close()
    return [{"name": e.event_name, "date": e.date, "link": e.link} for e in events]
