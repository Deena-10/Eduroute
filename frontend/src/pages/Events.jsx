// Events / Webinars / Job Openings – reflects roadmap progress
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const EventCard = ({ event }) => {
  const typeColors = {
    webinar: "bg-purple-100 text-purple-800",
    event: "bg-blue-100 text-blue-800",
    job: "bg-green-100 text-green-800",
  };
  const typeLabel = { webinar: "Webinar", event: "Event", job: "Job" };
  const color = typeColors[event.type] || "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
            {typeLabel[event.type] || event.type}
          </span>
          {event.domain && (
            <span className="ml-2 text-xs text-gray-500">{event.domain}</span>
          )}
          <h3 className="mt-2 font-bold text-gray-900">{event.title}</h3>
          {event.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{event.description}</p>
          )}
          {event.event_date && (
            <p className="mt-2 text-xs text-gray-500">
              {new Date(event.event_date).toLocaleDateString()}
            </p>
          )}
        </div>
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View
          </a>
        )}
      </div>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [userContext, setUserContext] = useState({ domain: null, progress_percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get("/events?ts=" + Date.now());
        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          setEvents(d.events || []);
          setUserContext(d.user_context || {});
        }
      } catch (e) {
        console.error("Fetch events error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] pb-24">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Career Events</h1>
          <p className="mt-1 text-gray-600">
            Webinars, events, and job openings tailored to your path
            {userContext.domain && (
              <span className="ml-1 font-medium text-blue-600">({userContext.domain})</span>
            )}
          </p>
          {userContext.progress_percentage > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Roadmap progress: {userContext.progress_percentage}%
            </p>
          )}
        </header>

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              <p>No events available right now. Check back later!</p>
            </div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
