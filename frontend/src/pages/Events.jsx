// frontend/src/pages/Events.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const G = {
  green:      '#2D6A4F', greenMid: '#40916C', greenLight: '#52B788',
  greenSoft:  '#D8F3DC', greenMist: '#F0FAF3', greenLine: '#B7E4C7',
  sageDim:    'rgba(82,183,136,0.12)',
  text1: '#1A2E1A', text2: '#3D5A3E', text3: '#6B8F71', text4: '#9AB89D',
  surface: '#FFFFFF', bg: '#F4F9F5', bgDeep: '#EBF5EE',
  border: '#D4E8D7', borderSoft: '#E8F4EA',
  shadowXs: '0 1px 4px rgba(26,46,26,0.05)',
  shadowSm: '0 2px 10px rgba(26,46,26,0.06)',
  shadowMd: '0 6px 24px rgba(26,46,26,0.09)',
  shadowGreen: '0 6px 24px rgba(45,106,79,0.18)',
  amber: '#D97706', amberLight: '#FFFBEB',
  blue:  '#2563EB', blueLight: '#EFF6FF',
  violet:'#7C3AED', violetLight:'#F5F3FF',
};

const typeConfig = {
  webinar: { label: 'Webinar', color: G.blue,     bg: G.blueLight,   icon: '🎙️' },
  event:   { label: 'Event',   color: G.greenMid,  bg: G.sageDim,     icon: '📅' },
  job:     { label: 'Job',     color: G.violet,    bg: G.violetLight, icon: '💼' },
};

const EventCard = ({ event }) => {
  const cfg = typeConfig[event.type] || { label: event.type, color: G.green, bg: G.greenMist, icon: '🔖' };

  return (
    <div style={{
      background: G.surface, borderRadius: 16, border: `1px solid ${G.border}`,
      boxShadow: G.shadowXs, padding: '18px 20px',
      transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
      display: 'flex', alignItems: 'flex-start', gap: 16,
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = G.shadowMd; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = G.greenLine; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = G.shadowXs; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = G.border; }}
    >
      {/* Icon badge */}
      <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {cfg.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}22` }}>
            {cfg.label}
          </span>
          {event.domain && (
            <span style={{ fontSize: 11, color: G.text4, fontWeight: 600 }}>{event.domain}</span>
          )}
          {event.event_date && (
            <span style={{ fontSize: 11, color: G.text4, marginLeft: 'auto' }}>
              {new Date(event.event_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 600, color: G.text1, lineHeight: 1.35, marginBottom: 5 }}>
          {event.title}
        </h3>

        {event.description && (
          <p style={{ fontSize: 13, color: G.text3, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
          </p>
        )}
      </div>

      {event.url && (
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flexShrink: 0, padding: '8px 16px', background: G.green, color: '#fff',
            fontSize: 12, fontWeight: 700, borderRadius: 9, textDecoration: 'none',
            boxShadow: G.shadowGreen, transition: 'all 0.15s',
            fontFamily: "'Plus Jakarta Sans',sans-serif", alignSelf: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = G.greenMid; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = G.green; e.currentTarget.style.transform = ''; }}
        >
          View →
        </a>
      )}
    </div>
  );
};

const Events = () => {
  const [events, setEvents]           = useState([]);
  const [userContext, setUserContext] = useState({ domain: null, progress_percentage: 0 });
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');

  useEffect(() => {
    axiosInstance.get("/events?ts=" + Date.now()).then(res => {
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setEvents(d.events || []);
        setUserContext(d.user_context || {});
      }
    }).catch(e => console.error(e)).finally(() => setLoading(false));
  }, []);

  const filters = [
    { id: 'all',    label: 'All' },
    { id: 'webinar',label: 'Webinars' },
    { id: 'event',  label: 'Events' },
    { id: 'job',    label: 'Jobs' },
  ];
  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${G.greenSoft}`, borderTopColor: G.green, animation: 'spin .7s linear infinite' }} />
      <p style={{ fontSize: 13, color: G.text4, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }}>Loading events…</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Plus Jakarta Sans',sans-serif", color: G.text1, WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');
        @keyframes fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ev-filter { padding: 7px 18px; border-radius: 9px; font-size: 12px; font-weight: 700; border: 1px solid ${G.border}; cursor: pointer; transition: all 0.15s; font-family: 'Plus Jakarta Sans',sans-serif; background: ${G.surface}; color: ${G.text3}; }
        .ev-filter:hover { background: ${G.greenMist}; color: ${G.green}; border-color: ${G.greenLine}; }
        .ev-filter.active { background: ${G.green}; color: #fff; border-color: ${G.green}; box-shadow: ${G.shadowGreen}; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '88px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: G.greenMid, background: G.sageDim, padding: '5px 13px', borderRadius: 99, border: `1px solid rgba(64,145,108,0.2)`, marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: G.greenLight, display: 'inline-block' }} />
            Opportunities
          </div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', color: G.text1, marginBottom: 8 }}>
            Career Events
          </h1>
          <p style={{ fontSize: 14, color: G.text3, lineHeight: 1.65 }}>
            Webinars, events, and job openings tailored to your path
            {userContext.domain && (
              <strong style={{ color: G.green, fontWeight: 700 }}> · {userContext.domain}</strong>
            )}
          </p>
          {userContext.progress_percentage > 0 && (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: G.text3, fontWeight: 600 }}>Roadmap progress</span>
              <div style={{ flex: 1, maxWidth: 200, height: 5, background: G.bgDeep, borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${userContext.progress_percentage}%`, background: `linear-gradient(90deg,${G.green},${G.greenLight})`, borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: G.green, fontFamily: "'Fraunces',serif" }}>{userContext.progress_percentage}%</span>
            </div>
          )}
        </div>

        {/* Filter bar */}
        {events.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
            {filters.map(({ id, label }) => (
              <button key={id} onClick={() => setFilter(id)} className={`ev-filter${filter === id ? ' active' : ''}`}>{label}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 12, color: G.text4, fontWeight: 600, alignSelf: 'center' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Events list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadein 0.3s ease both' }}>
          {filtered.length === 0 ? (
            <div style={{ background: G.surface, border: `1.5px dashed ${G.border}`, borderRadius: 16, padding: '52px 24px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, background: G.bgDeep, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 20 }}>📭</div>
              <p style={{ fontSize: 14, color: G.text4, lineHeight: 1.7 }}>
                {filter === 'all' ? 'No events available right now. Check back later!' : `No ${filter}s available right now.`}
              </p>
            </div>
          ) : (
            filtered.map(event => <EventCard key={event.id} event={event} />)
          )}
        </div>

      </div>
    </div>
  );
};

export default Events;