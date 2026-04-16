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
  webinar:    { label: 'Webinar',    color: G.blue,      bg: G.blueLight,   icon: '🎙️' },
  event:      { label: 'Event',      color: G.greenMid,  bg: G.sageDim,     icon: '📅' },
  job:        { label: 'Job',        color: G.violet,    bg: G.violetLight, icon: '💼' },
  conference: { label: 'Conference', color: G.amber,     bg: G.amberLight,  icon: '🎟️' },
  hackathon:  { label: 'Hackathon',  color: G.rose,      bg: '#FFF1F2',     icon: '🏆' },
};

const globalEvents = [
  // Conferences
  { id: 'global-c1', type: 'conference', title: 'KubeCon + CloudNativeCon Europe 2026', description: 'CNCF’s flagship cloud-native conference; brings together developers and operators of Kubernetes and related tech.', event_date: '2026-03-23', url: 'https://events.linuxfoundation.org/kubecon-cloudnativecon-europe', domain: 'Cloud-native / Kubernetes', location: 'Amsterdam, Netherlands' },
  { id: 'global-c2', type: 'conference', title: 'NVIDIA GTC 2026', description: 'Annual GPU Technology Conference; AI/deep learning focus.', event_date: '2026-03-16', url: 'https://www.nvidia.com/gtc/', domain: 'AI, GPU Computing', location: 'San Jose, CA, USA & Virtual' },
  { id: 'global-c3', type: 'conference', title: 'Red Hat Summit 2026', description: 'Four-day open-source tech event with labs, keynotes on AI, cloud, virtualization.', event_date: '2026-05-11', url: 'https://reg.experiences.redhat.com', domain: 'Open source, cloud', location: 'Atlanta, GA, USA' },
  { id: 'global-c4', type: 'conference', title: 'SANS AI Cybersecurity Summit 2026', description: 'Summit on AI in cybersecurity; covers AI for defense and threat detection.', event_date: '2026-04-20', url: 'https://www.sans.org/cyber-security-training-events/ai-summit-2026', domain: 'Cybersecurity, AI', location: 'Arlington, VA, USA' },
  { id: 'global-c5', type: 'conference', title: 'Agentic AI Security Summit 2026', description: 'Virtual event on designing and scaling secure autonomous AI systems.', event_date: '2026-04-29', url: 'https://csaurl.org', domain: 'AI Security', location: 'Virtual' },
  { id: 'global-c6', type: 'conference', title: 'KubeCon + CloudNativeCon India 2026', description: 'CNCF’s flagship cloud-native conference in India.', event_date: '2026-06-18', url: 'https://events.linuxfoundation.org/kubecon-cloudnativecon-india/', domain: 'Cloud-native / Kubernetes', location: 'Mumbai, India' },
  { id: 'global-c7', type: 'conference', title: 'Google I/O 2026', description: 'Google’s flagship developer conference (Android, web, AI).', event_date: '2026-05-19', url: 'https://io.google/', domain: 'Android, web, AI', location: 'Mountain View, USA' },

  // Hackathons
  { id: 'global-h1', type: 'hackathon', title: 'HSIL Hackathon 2026', description: 'Global public health hackathon; theme “Building High-Value Health Systems: Leveraging AI.”', event_date: '2026-04-10', url: 'https://hsph.harvard.edu/research/health-systems-innovation-lab/work/hsil-hackathon-2026-building-high-value-health-systems-leveraging-ai/', domain: 'Health Systems, AI', location: 'Patna & Bhubaneswar, India' },
  { id: 'global-h2', type: 'hackathon', title: 'KIEFER AI Open Hackathon 2026', description: 'AI innovation lab with NVIDIA DGX™ hardware; teams optimize AI apps on GPUs.', event_date: '2026-04-27', url: 'http://bit.ly/4u6UC06', domain: 'AI / GPU Computing', location: 'Athens, Greece' },
  { id: 'global-h3', type: 'hackathon', title: 'NMIT Hacks 2026', description: '48-hour national-level student hackathon with mentorship and judged tracks.', event_date: '2026-05-08', url: 'https://www.nmithacks.com/', domain: 'Web, AI & ML, IoT, Blockchain', location: 'Bangalore, India' },
  { id: 'global-h4', type: 'hackathon', title: 'HackPSU Spring 2026', description: 'Biannual collegiate hackathon at Penn State with workshops and speakers.', event_date: '2026-03-28', url: 'https://hackpsu.org/', domain: 'General Building', location: 'State College, PA, USA' },

  // Webinars
  { id: 'global-w1', type: 'webinar', title: 'Snowflake Connect: AI Data Cloud', description: 'Webinar on aligning enterprise data strategy with AI; covers governance, security.', event_date: '2026-04-07', url: 'https://www.snowflake.com/en/webinars/thought-leadership/snowflake-connect-ai-data-cloud-2026-04-07/', domain: 'Data Science, AI', location: 'Online' },
  { id: 'global-w2', type: 'webinar', title: 'The New Era of Connection', description: 'Salesforce webinar with Harmony Public Schools on using AI to personalize constituent experiences.', event_date: '2026-04-30', url: 'https://www.salesforce.com/events/webinars/', domain: 'EdTech, AI Marketing', location: 'Online' },

  // Workshops & Meetups (Mapped to 'event')
  { id: 'global-e1', type: 'event', title: 'Workshop on Blockchain and DLT', description: 'Public NIST workshop on technical architectures, interoperability, and security in real-world deployments.', event_date: '2026-04-16', url: 'https://www.nist.gov/events/workshop-blockchain-and-distributed-ledger-technologies', domain: 'Blockchain, Cybersecurity', location: 'Rockville, MD, USA' },
  { id: 'global-e2', type: 'event', title: 'OpenID Foundation Hybrid Workshop', description: 'In-person/virtual workshop on OpenID standards and identity management updates.', event_date: '2026-04-27', url: 'https://oidf_workshop_iiw_spring26.eventbrite.co.uk', domain: 'Digital Identity', location: 'San Jose, CA, USA' },
  { id: 'global-e3', type: 'event', title: 'AIDataTech Connect', description: 'Monthly virtual meetup for AI/ML professionals worldwide; networking platform.', event_date: '2026-04-23', url: 'https://events.tao.ai/pod/analytics.club/q4j5imq9qjs9', domain: 'AI, ML, Data Science', location: 'Online' },

  // Jobs & Internships
  { id: 'global-j1', type: 'job', title: 'Senior Eng. Manager, ML Infrastructure (Ads)', description: 'Oversees the ML infrastructure for Google Ads safety. Drives technical strategy for ML systems and leads engineers.', url: 'https://careers.google.com/', domain: 'Google', location: 'Pittsburgh, PA (On-site)' },
  { id: 'global-j2', type: 'job', title: 'Software Engineer Intern, Summer 2026', description: 'Develop core Google services with AI and data projects. (Apply by May 8, 2026)', event_date: '2026-05-08', url: 'https://careers.google.com/', domain: 'Google', location: 'Sydney, NSW, Australia' },
  { id: 'global-j3', type: 'job', title: 'Software Development Engineer Intern, Summer 2026', description: 'Interns work on real customer-facing services and collaborate on large-scale distributed systems.', url: 'https://amazon.jobs/', domain: 'Amazon', location: 'Seattle, WA (On-site)' },
  { id: 'global-j4', type: 'job', title: 'Sr. HR Service Advisor (Payroll, P&O)', description: 'Part of the Pay Centralization team, managing payroll operations across Europe/Americas.', event_date: '2026-04-15', url: 'https://careers.microsoft.com/', domain: 'Microsoft', location: 'Hyderabad, India (Hybrid)' },
  { id: 'global-j5', type: 'job', title: 'Principal Software Engineer (AI/Ads, MAI)', description: 'Building the AI-driven advertising platform (Copilot, Bing, etc.) and optimizing large-scale ML inference.', event_date: '2026-04-15', url: 'https://careers.microsoft.com/', domain: 'Microsoft', location: 'Redmond, WA (On-site)' },
  { id: 'global-j6', type: 'job', title: 'Software Engineer Intern, Summer 2026', description: 'Contribute to Salesforce CRM platform: design, implement, and test cloud features (often with AI).', event_date: '2026-03-10', url: 'https://careers.salesforce.com/', domain: 'Salesforce', location: 'CA / WA / NY' },
  { id: 'global-j7', type: 'job', title: 'Go-to-Market Strategy Intern', description: 'Intern tasks include project coordination, metric tracking, and analytics to support strategy initiatives.', url: 'https://openai.com/careers', domain: 'OpenAI', location: 'San Francisco, CA (Hybrid)' },
  { id: 'global-j8', type: 'job', title: 'Asset Management Summer Analyst', description: 'Analyzes investment strategies and supports portfolio managers in Asset & Wealth Management.', url: 'https://careers.jpmorgan.com/', domain: 'JPMorgan Chase & Co.', location: 'Various (Global)' },
  { id: 'global-j9', type: 'job', title: '2026 Summer Analyst Programme', description: 'Summer internship across various divisions. Undergraduates participate and are assigned to real projects.', url: 'https://www.goldmansachs.com/careers/', domain: 'Goldman Sachs', location: 'EMEA' },
  { id: 'global-j10', type: 'job', title: 'Quality Engineering Co-op (Fall 2026)', description: 'Analyze test data, manage specifications, and propose process improvements.', event_date: '2026-04-06', url: 'https://careers.jnj.com/', domain: 'Johnson & Johnson', location: 'Cornelia, GA (On-site)' },
  { id: 'global-j11', type: 'job', title: 'ML Engineering Intern (PhD) – Search Team', description: 'Apply AI/LLM techniques to Airbnb search. Own end-to-end projects.', url: 'https://careers.airbnb.com/', domain: 'Airbnb', location: 'USA (Remote-eligible)' },
  { id: 'global-j12', type: 'job', title: 'Software Engineer Intern (Summer)', description: 'Tackle meaningful engineering projects and improve payment systems.', url: 'https://stripe.com/jobs', domain: 'Stripe', location: 'USA (SF, Seattle, NYC)' }
];

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
            <span style={{ fontSize: 11, color: G.text4, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {new Date(event.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 600, color: G.text1, lineHeight: 1.35, marginBottom: 5 }}>
          {event.title}
        </h3>

        {event.location && (
          <p style={{ fontSize: 11, color: G.text4, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {event.location}
          </p>
        )}

        {event.description && (
          <p style={{ fontSize: 13, color: G.text3, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 12 }}>
            {event.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '7px 14px', background: G.green, color: '#fff',
                fontSize: 12, fontWeight: 700, borderRadius: 9, textDecoration: 'none',
                boxShadow: G.shadowGreen, transition: 'all 0.15s',
                fontFamily: "'Plus Jakarta Sans',sans-serif"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = G.greenMid; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = G.green; e.currentTarget.style.transform = ''; }}
            >
              View →
            </a>
          )}
          <button
            onClick={() => {
              if (navigator.share && event.url) {
                navigator.share({ title: event.title, url: event.url }).catch(console.error);
              } else if (event.url) {
                navigator.clipboard.writeText(`${event.title} - ${event.url}`);
                alert('Link copied to clipboard!');
              }
            }}
            style={{
              padding: '7px 14px', background: G.bg, color: G.text2, border: `1px solid ${G.border}`,
              fontSize: 12, fontWeight: 700, borderRadius: 9, cursor: 'pointer', transition: 'all 0.15s',
              fontFamily: "'Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6
            }}
            onMouseEnter={e => { e.currentTarget.style.background = G.borderSoft; e.currentTarget.style.borderColor = G.greenLine; }}
            onMouseLeave={e => { e.currentTarget.style.background = G.bg; e.currentTarget.style.borderColor = G.border; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>
      </div>
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
        setEvents(d.events ? [...d.events, ...globalEvents] : globalEvents);
        setUserContext(d.user_context || {});
      } else {
        setEvents(globalEvents);
      }
    }).catch(e => { console.error(e); setEvents(globalEvents); }).finally(() => setLoading(false));
  }, []);

  const filters = [
    { id: 'all',        label: 'All' },
    { id: 'conference', label: 'Conferences' },
    { id: 'hackathon',  label: 'Hackathons' },
    { id: 'webinar',    label: 'Webinars' },
    { id: 'event',      label: 'Other Events' },
    { id: 'job',        label: 'Jobs' },
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