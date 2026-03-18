// frontend/src/pages/Home.jsx
// PWA-optimised · Mobile-first · MNC-grade design
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

/* ════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════ */
const T = {
  g900:'#061812', g800:'#0A2318', g700:'#0F3222',
  g600:'#155C35', g500:'#1D7A48', g400:'#28A362',
  g300:'#4DC885', g200:'#96DFB6', g100:'#D0F0E1', g50:'#EBF9F2',
  n950:'#06090A', n900:'#0E1510', n800:'#1C2B1F',
  n700:'#2E4533', n600:'#456050', n500:'#617D69',
  n400:'#8DA893', n300:'#B5CEBB', n200:'#D5E7D9',
  n100:'#EAF2EC', n50:'#F4FAF6', white:'#FFFFFF',
  amber:'#D97706', blue:'#1A56DB', violet:'#6D28D9', teal:'#0891B2', rose:'#DC2626',
  elev1:'0 1px 4px rgba(6,24,18,0.08)',
  elev2:'0 4px 16px rgba(6,24,18,0.1)',
  elev3:'0 12px 40px rgba(6,24,18,0.14)',
  elev4:'0 24px 64px rgba(6,24,18,0.18)',
};

/* ════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════ */
const roadmaps = [
  { id:1, title:'Software Engineering',  sub:'Full-Stack · Cloud · Systems',   dur:'12 mo', students:'8.4k', rating:4.9, skills:['React','Node.js','AWS'],       color:T.g500,   emoji:'💻', hot:true  },
  { id:2, title:'Data Science & AI',     sub:'ML · Deep Learning · MLOps',     dur:'10 mo', students:'6.2k', rating:4.8, skills:['Python','TensorFlow','SQL'],   color:T.violet, emoji:'🧠', hot:true  },
  { id:3, title:'Cybersecurity',         sub:'Offensive · Defensive · GRC',    dur:'8 mo',  students:'3.8k', rating:4.7, skills:['Pentesting','SIEM','Cloud'],   color:T.rose,   emoji:'🔐', hot:false },
  { id:4, title:'UI/UX Design',          sub:'Research · Systems · Motion',    dur:'6 mo',  students:'5.1k', rating:4.9, skills:['Figma','Research','Systems'],  color:T.g600,   emoji:'🎨', hot:false },
  { id:5, title:'Product Management',    sub:'Strategy · Analytics · GTM',     dur:'7 mo',  students:'4.3k', rating:4.8, skills:['OKRs','Agile','Analytics'],    color:T.amber,  emoji:'📦', hot:false },
  { id:6, title:'Cloud Architecture',    sub:'AWS · GCP · DevOps',             dur:'9 mo',  students:'2.9k', rating:4.7, skills:['Kubernetes','Terraform','IaC'],color:T.teal,   emoji:'☁️', hot:false },
];
const internships = [
  { id:1, title:'Frontend Developer Intern', company:'TechCorp',   loc:'Remote',        pay:'$2,000/mo', skills:['React','TypeScript'], logo:'TC', color:T.g500   },
  { id:2, title:'Data Science Intern',       company:'DataFlow',   loc:'New York',      pay:'$3,000/mo', skills:['Python','ML'],        logo:'DF', color:T.violet },
  { id:3, title:'UX Design Intern',          company:'DesignHub',  loc:'San Francisco', pay:'$2,500/mo', skills:['Figma','Research'],   logo:'DH', color:T.g600   },
  { id:4, title:'Cloud Engineer Intern',     company:'InfraScale', loc:'Austin',        pay:'$2,800/mo', skills:['AWS','Docker'],       logo:'IS', color:T.teal   },
];
const events = [
  { id:1, title:'Tech Career Fair 2025',  date:'Mar 15', loc:'Virtual',       type:'Career Fair', color:T.g500   },
  { id:2, title:'AI/ML Bootcamp',         date:'Mar 20', loc:'Online',        type:'Workshop',    color:T.violet },
  { id:3, title:'Startup Founder Meetup', date:'Mar 25', loc:'Downtown Hub',  type:'Networking',  color:T.g600   },
  { id:4, title:'Open Source Sprint',     date:'Apr 02', loc:'GitHub Remote', type:'Hackathon',   color:T.amber  },
];
const testimonials = [
  { name:'Priya S.',  co:'Google', role:'Software Engineer', q:'From zero to Google in 11 months. The AI roadmap eliminated every guessing game — I just had to execute.', av:'PS', color:T.g500   },
  { name:'Marcus C.', co:'Stripe', role:'Data Scientist',    q:'Wasted 6 months on random YouTube. EduRoute\'s structured path changed everything. Stripe offer in 9 months.',   av:'MC', color:T.violet },
  { name:'Aisha P.',  co:'Figma',  role:'UX Lead',           q:'Finance to UX Lead at Figma in 14 months. The mentors and curriculum are unmatched anywhere online.',            av:'AP', color:T.g600   },
];
const companies = ['Google','Microsoft','Stripe','Figma','Airbnb','Notion','GitHub','Vercel','Atlassian','Adobe','Shopify','Linear'];
const stats = [
  { n:'42K+', l:'Active Learners' },
  { n:'120+', l:'Career Paths'    },
  { n:'94%',  l:'Placement Rate'  },
  { n:'4.9★', l:'Avg Rating'      },
];

/* ════════════════════════════════════════════════
   HOOKS & UTILS
════════════════════════════════════════════════ */
const ease = [0.16, 1, 0.3, 1];

const useMedia = (query) => {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return match;
};

const CountUp = ({ end }) => {
  const ref = useRef();
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState('0');
  useEffect(() => {
    if (!inView) return;
    const num = parseInt(end.replace(/\D/g, ''));
    if (!num) { setVal(end); return; }
    let cur = 0;
    const step = Math.max(1, Math.ceil(num / 50));
    const timer = setInterval(() => {
      cur = Math.min(cur + step, num);
      setVal(end.replace(/\d+/, cur.toLocaleString()));
      if (cur >= num) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{val}</span>;
};

/* ════════════════════════════════════════════════
   ATOMS
════════════════════════════════════════════════ */
const Pill = ({ children, color = T.g500 }) => (
  <span style={{ display:'inline-flex', alignItems:'center', fontSize:11, fontWeight:600,
    padding:'3px 9px', borderRadius:99, background:color+'18', color,
    border:`1px solid ${color}28`, whiteSpace:'nowrap', letterSpacing:'0.01em' }}>
    {children}
  </span>
);

const HotBadge = () => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontSize:10, fontWeight:700,
    padding:'3px 8px', borderRadius:4, background:'#FEF3C7', color:'#92400E',
    border:'1px solid #FDE68A', textTransform:'uppercase', letterSpacing:'0.08em' }}>
    🔥 Hot
  </span>
);

const Eyebrow = ({ children, light }) => (
  <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:10, fontWeight:700,
    letterSpacing:'0.14em', textTransform:'uppercase',
    color: light ? T.g300 : T.g500 }}>
    {children}
  </span>
);

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const Home = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('roadmaps');
  const isMobile = useMedia('(max-width: 640px)');
  const isTablet = useMedia('(max-width: 960px)');
  const ticker = [...companies, ...companies];

  return (
    <div style={{ fontFamily:"'Instrument Sans','DM Sans',system-ui,sans-serif",
      color:T.n900, background:T.white, overflowX:'hidden',
      WebkitFontSmoothing:'antialiased', WebkitTapHighlightColor:'transparent' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { -webkit-text-size-adjust:100%; scroll-behavior:smooth; }
        a { text-decoration:none; color:inherit; }
        button { font-family:inherit; cursor:pointer; -webkit-appearance:none; }
        img { display:block; max-width:100%; }

        /* ── Scrollbar hide ── */
        .noscroll { overflow-x:auto; -ms-overflow-style:none; scrollbar-width:none; }
        .noscroll::-webkit-scrollbar { display:none; }

        /* ── Touch-optimised buttons ── */
        .btn-prim {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          min-height:48px; padding:12px 24px; border-radius:8px;
          font-size:15px; font-weight:600; letter-spacing:-0.01em;
          background:${T.g500}; color:#fff; border:none;
          box-shadow:0 1px 3px rgba(6,24,18,.25),inset 0 1px 0 rgba(255,255,255,.12);
          transition:background 0.18s, transform 0.15s, box-shadow 0.18s;
          -webkit-tap-highlight-color:transparent; touch-action:manipulation;
        }
        .btn-prim:hover  { background:${T.g600}; box-shadow:0 6px 20px rgba(21,92,53,.35),inset 0 1px 0 rgba(255,255,255,.12); transform:translateY(-1px); }
        .btn-prim:active { transform:scale(0.97); }

        .btn-ghost {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          min-height:48px; padding:12px 24px; border-radius:8px;
          font-size:15px; font-weight:600; letter-spacing:-0.01em;
          background:transparent; color:rgba(255,255,255,0.82);
          border:1.5px solid rgba(255,255,255,0.22);
          transition:all 0.18s; touch-action:manipulation;
        }
        .btn-ghost:hover  { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.4); }
        .btn-ghost:active { transform:scale(0.97); }

        .btn-white {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          min-height:48px; padding:12px 24px; border-radius:8px;
          font-size:15px; font-weight:600; letter-spacing:-0.01em;
          background:#fff; color:${T.g700}; border:none;
          box-shadow:0 2px 8px rgba(0,0,0,.12);
          transition:all 0.18s; touch-action:manipulation;
        }
        .btn-white:hover  { box-shadow:0 6px 24px rgba(0,0,0,.18); transform:translateY(-1px); }
        .btn-white:active { transform:scale(0.97); }

        /* ── Cards ── */
        .card {
          background:#fff; border:1px solid ${T.n100}; border-radius:14px;
          box-shadow:${T.elev1};
          transition:box-shadow 0.22s ${ease.join(',')}, transform 0.22s ${ease.join(',')}, border-color 0.18s;
        }
        .card:hover { box-shadow:${T.elev3}; transform:translateY(-2px); border-color:${T.n200}; }

        /* ── Tabs ── */
        .tab {
          min-height:40px; padding:8px 18px; border-radius:6px;
          font-size:13px; font-weight:600; letter-spacing:-0.01em;
          border:none; white-space:nowrap; transition:all 0.15s;
          touch-action:manipulation; -webkit-tap-highlight-color:transparent;
        }
        .tab.on  { background:${T.n900}; color:#fff; }
        .tab.off { background:transparent; color:${T.n500}; }
        .tab.off:hover { background:${T.n50}; color:${T.n800}; }

        /* ── Ticker animation ── */
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ticker-track { display:flex; animation:ticker 38s linear infinite; width:max-content; }
        .ticker-track:hover { animation-play-state:paused; }

        /* ── Pulse dot ── */
        @keyframes pulsedot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.7);opacity:0.4} }

        /* ── Float ── */
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

        /* ── Horizontal scroll snap (mobile cards) ── */
        .hscroll {
          display:flex; gap:14px; overflow-x:auto; padding-bottom:12px;
          scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch;
          -ms-overflow-style:none; scrollbar-width:none;
        }
        .hscroll::-webkit-scrollbar { display:none; }
        .hscroll > * { scroll-snap-align:start; flex-shrink:0; }

        /* ── Progress bar ── */
        .prog-track { height:5px; background:${T.n100}; border-radius:99px; overflow:hidden; }

        /* ── Feature grid border trick ── */
        .feat-grid { display:grid; gap:1px; background:${T.n100}; border-radius:16px; overflow:hidden; border:1px solid ${T.n100}; }

        /* ══ RESPONSIVE BREAKPOINTS ══ */

        /* xs: < 480px */
        @media (max-width:479px) {
          .hero-headline { font-size:2.2rem !important; }
          .sec-h2        { font-size:1.7rem !important; }
          .stats-grid    { grid-template-columns:repeat(2,1fr) !important; }
          .hero-btns     { flex-direction:column !important; }
          .hero-btns > * { width:100% !important; }
          .cta-btns      { flex-direction:column !important; }
          .cta-btns > *  { width:100% !important; }
          .outcomes-grid { grid-template-columns:1fr !important; }
          .testi-grid    { grid-template-columns:1fr !important; }
          .hiw-grid      { grid-template-columns:1fr !important; }
          .feat-grid     { grid-template-columns:1fr !important; }
        }

        /* sm: 480–767px */
        @media (min-width:480px) and (max-width:767px) {
          .hero-headline { font-size:2.6rem !important; }
          .stats-grid    { grid-template-columns:repeat(2,1fr) !important; }
          .hero-btns     { flex-direction:row !important; }
          .outcomes-grid { grid-template-columns:1fr !important; }
          .testi-grid    { grid-template-columns:1fr !important; }
          .hiw-grid      { grid-template-columns:1fr !important; }
          .feat-grid     { grid-template-columns:repeat(2,1fr) !important; }
        }

        /* md: 768–959px */
        @media (min-width:768px) and (max-width:959px) {
          .hero-grid     { grid-template-columns:1fr !important; }
          .hero-visual   { display:none !important; }
          .hiw-grid      { grid-template-columns:1fr !important; }
          .outcomes-grid { grid-template-columns:1fr !important; }
          .testi-grid    { grid-template-columns:repeat(2,1fr) !important; }
          .feat-grid     { grid-template-columns:repeat(2,1fr) !important; }
          .cta-grid      { grid-template-columns:1fr !important; text-align:center !important; }
          .cta-btns      { justify-content:center !important; }
        }

        /* lg: 960–1279px */
        @media (min-width:960px) and (max-width:1279px) {
          .hero-grid { grid-template-columns:1fr 420px !important; }
        }

        /* All mobile: < 960px */
        @media (max-width:959px) {
          .hero-grid     { grid-template-columns:1fr !important; }
          .hero-visual   { display:none !important; }
          .hiw-grid      { grid-template-columns:1fr !important; gap:0 !important; }
          .cta-grid      { grid-template-columns:1fr !important; }
          .cta-btns      { flex-direction:column !important; }
          .cta-btns > *  { width:100% !important; }
        }

        /* Safe area support for notched phones */
        .safe-x { padding-left:max(24px, env(safe-area-inset-left)); padding-right:max(24px, env(safe-area-inset-right)); }
        .safe-b { padding-bottom:max(16px, env(safe-area-inset-bottom)); }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════
          HERO — Dark forest
      ════════════════════════════════════════════ */}
      <section style={{ background:`linear-gradient(155deg,${T.g900} 0%,${T.g800} 50%,${T.g700} 100%)`, position:'relative', overflow:'hidden', paddingTop:'env(safe-area-inset-top,0px)' }}>
        {/* Mesh grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)`, backgroundSize:'56px 56px', pointerEvents:'none' }}/>
        {/* Radial glows */}
        <div style={{ position:'absolute', top:'-15%', right:'-10%', width:'60%', maxWidth:500, paddingBottom:'60%', borderRadius:'50%', background:'radial-gradient(circle,rgba(29,122,72,0.25) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-10%', left:'-5%', width:'40%', maxWidth:350, paddingBottom:'40%', borderRadius:'50%', background:'radial-gradient(circle,rgba(29,122,72,0.15) 0%,transparent 65%)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'72px 24px 0' }} className="safe-x">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 460px', gap:72, alignItems:'center' }} className="hero-grid">

            {/* Left */}
            <div>
              {/* Live badge */}
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.55,ease}}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(29,122,72,0.18)', border:'1px solid rgba(77,200,133,0.3)', padding:'6px 13px', borderRadius:6, marginBottom:24 }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:T.g300, display:'inline-block', animation:'pulsedot 2s ease-in-out infinite' }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:T.g200, letterSpacing:'0.08em', textTransform:'uppercase' }}>2,400 learners online now</span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1 className="hero-headline" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease,delay:0.07}}
                style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(2.4rem,5.5vw,4rem)', fontWeight:400, lineHeight:1.06, letterSpacing:'-0.035em', color:'#fff', marginBottom:20 }}>
                The platform that<br/>
                <em style={{ fontStyle:'italic', color:T.g300 }}>builds careers,</em><br/>
                not just skills
              </motion.h1>

              {/* Sub */}
              <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease,delay:0.13}}
                style={{ fontSize:isMobile?15:16.5, color:'rgba(255,255,255,0.58)', lineHeight:1.78, maxWidth:500, marginBottom:32 }}>
                AI-personalised roadmaps, vetted mentors, and direct hiring pipelines — the complete operating system for your professional growth.
              </motion.p>

              {/* CTAs */}
              <motion.div className="hero-btns" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.55,ease,delay:0.19}}
                style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:44 }}>
                <Link to="/questionnaire" className="btn-prim" style={{ flex:isMobile?'1 1 100%':'0 0 auto' }}>
                  Get your free roadmap
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link to="/roadmap" className="btn-ghost" style={{ flex:isMobile?'1 1 100%':'0 0 auto' }}>
                  Explore paths
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6,delay:0.28}}
                style={{ display:'flex', alignItems:'center', gap:14, paddingBottom:56 }}>
                <div style={{ display:'flex' }}>
                  {[T.g500,T.violet,T.amber,T.teal,T.rose].map((c,i) => (
                    <div key={i} style={{ width:30, height:30, borderRadius:'50%', background:c, border:'2px solid rgba(255,255,255,0.18)', marginLeft:i>0?-9:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {['P','M','A','J','K'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,0.82)' }}>Joined by 42,000+ learners</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:1 }}>90+ countries · 94% placement rate</div>
                </div>
              </motion.div>
            </div>

            {/* Right — Dashboard Preview (desktop only) */}
            <motion.div className="hero-visual" initial={{opacity:0,y:36,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.85,ease,delay:0.22}} style={{ position:'relative', paddingBottom:60 }}>
              {/* Notification top-left */}
              <div style={{ position:'absolute', top:-14, left:-14, zIndex:10, animation:'floatA 5s ease-in-out infinite' }}>
                <div style={{ background:'#fff', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, boxShadow:T.elev3, border:`1px solid ${T.n100}` }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:T.g50, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🎉</div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:T.n900, whiteSpace:'nowrap' }}>Offer received!</div>
                    <div style={{ fontSize:10, color:T.n400, marginTop:1 }}>Software Eng @ Stripe</div>
                  </div>
                </div>
              </div>

              {/* Main card */}
              <div style={{ background:'#fff', borderRadius:18, overflow:'hidden', boxShadow:T.elev4, border:`1px solid ${T.n100}` }}>
                {/* Toolbar */}
                <div style={{ background:T.n50, padding:'11px 16px', display:'flex', alignItems:'center', gap:7, borderBottom:`1px solid ${T.n100}` }}>
                  {['#FF5F57','#FFBD2E','#28C840'].map((c,i) => <div key={i} style={{ width:11, height:11, borderRadius:'50%', background:c }}/>)}
                  <div style={{ marginLeft:8, flex:1, background:T.n100, borderRadius:5, padding:'4px 10px', fontSize:10, color:T.n400, fontFamily:'DM Mono,monospace' }}>eduroute.app/roadmap</div>
                </div>
                {/* Header */}
                <div style={{ background:`linear-gradient(135deg,${T.g800},${T.g600})`, padding:'22px 22px 18px', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', right:-20, top:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:4 }}>Active Roadmap</div>
                      <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:17, color:'#fff' }}>Software Engineering</div>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'4px 10px', fontSize:12, fontWeight:700, color:'#fff' }}>68%</div>
                  </div>
                  <div className="prog-track">
                    <motion.div initial={{width:0}} animate={{width:'68%'}} transition={{duration:1.5,ease:'easeOut',delay:0.8}} style={{ height:'100%', background:`linear-gradient(90deg,${T.g300},rgba(255,255,255,0.9))`, borderRadius:99 }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                    <span style={{ fontSize:9.5, color:'rgba(255,255,255,0.38)' }}>Module 3 of 8</span>
                    <span style={{ fontSize:9.5, color:'rgba(255,255,255,0.38)' }}>Est. May 2025</span>
                  </div>
                </div>
                {/* Steps */}
                {[
                  {n:1, label:'JS Fundamentals',    time:'8h',  state:'done'  },
                  {n:2, label:'React & Patterns',   time:'6h',  state:'done'  },
                  {n:3, label:'Node.js & APIs',     time:'10h', state:'active', pct:50},
                  {n:4, label:'Databases & Cloud',  time:'9h',  state:'next'  },
                  {n:5, label:'System Design',      time:'12h', state:'locked'},
                ].map((s,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 18px', borderBottom:i<4?`1px solid ${T.n50}`:'none', background:s.state==='active'?T.g50:'#fff' }}>
                    <div style={{ width:26, height:26, borderRadius:7, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:s.state==='done'?10:11, fontWeight:700,
                      background:s.state==='done'?T.g500:s.state==='active'?T.g50:T.n50,
                      color:s.state==='done'?'#fff':s.state==='active'?T.g500:T.n300,
                      border:s.state==='active'?`1.5px solid ${T.g400}`:s.state==='next'?`1.5px dashed ${T.n300}`:'none' }}>
                      {s.state==='done' ? <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> : s.state==='locked'?'🔒':s.n}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:s.state==='active'?700:500, color:s.state==='locked'?T.n300:T.n800, letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.label}</div>
                      {s.state==='active' && (
                        <div className="prog-track" style={{ marginTop:4 }}>
                          <motion.div initial={{width:0}} animate={{width:`${s.pct}%`}} transition={{duration:1,ease:'easeOut',delay:1.2}} style={{ height:'100%', background:T.g400, borderRadius:99 }}/>
                        </div>
                      )}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                      <span style={{ fontSize:10, color:T.n400, fontFamily:'DM Mono,monospace' }}>{s.time}</span>
                      {s.state==='active' && <Pill color={T.g500}>50%</Pill>}
                      {s.state==='done'   && <Pill color={T.g500}>✓</Pill>}
                    </div>
                  </div>
                ))}
                <div style={{ padding:'12px 18px 16px' }}>
                  <button className="btn-prim" style={{ width:'100%', borderRadius:9 }}>Continue → Node.js & APIs</button>
                </div>
              </div>

              {/* Badge bottom-right */}
              <div style={{ position:'absolute', bottom:20, right:-12, zIndex:10, animation:'floatB 6s ease-in-out infinite' }}>
                <div style={{ background:'#fff', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10, boxShadow:T.elev3, border:`1px solid ${T.n100}` }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:'#FFF7ED', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>📈</div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:T.n900 }}>Skill score +12</div>
                    <div style={{ fontSize:10, color:T.n400, marginTop:1 }}>This week · Top 8%</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', marginTop:0 }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }} className="safe-x">
            <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
              {stats.map((s,i) => (
                <div key={i} style={{ padding:isMobile?'22px 0':'28px 0', borderRight:i<3?'1px solid rgba(255,255,255,0.07)':'none', paddingLeft:i>0?isMobile?16:36:0, paddingRight:isMobile?8:36 }}>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:isMobile?'1.4rem':'2rem', fontWeight:400, color:'#fff', lineHeight:1, marginBottom:5 }}>
                    <CountUp end={s.n}/>
                  </div>
                  <div style={{ fontSize:isMobile?10:12, color:'rgba(255,255,255,0.4)', fontWeight:500, letterSpacing:'0.02em', lineHeight:1.3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TICKER
      ════════════════════════════════════════════ */}
      <section style={{ background:T.n50, borderBottom:`1px solid ${T.n100}`, padding:'18px 0', overflow:'hidden', position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:80, background:`linear-gradient(to right,${T.n50},transparent)`, zIndex:1, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:80, background:`linear-gradient(to left,${T.n50},transparent)`, zIndex:1, pointerEvents:'none' }}/>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:T.n300, textAlign:'center', marginBottom:14 }}>Our graduates work at</div>
        <div className="ticker-track">
          {ticker.map((c,i) => (
            <span key={i} style={{ padding:'0 36px', fontSize:13, fontWeight:700, color:T.n400, letterSpacing:'-0.01em', whiteSpace:'nowrap' }}>{c}</span>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CONTENT AREA
      ════════════════════════════════════════════ */}
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }} className="safe-x">

        {/* ── HOW IT WORKS ── */}
        <section style={{ padding:'72px 0' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="sec-h2" style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(1.8rem,3.5vw,2.8rem)', fontWeight:400, letterSpacing:'-0.025em', color:T.n900, margin:'14px 0 12px', lineHeight:1.15 }}>
              From day one to<br/>offer letter
            </h2>
            <p style={{ fontSize:15, color:T.n500, lineHeight:1.8, maxWidth:440, margin:'0 auto' }}>
              Three high-leverage steps built around how top engineers, designers, and PMs actually land jobs.
            </p>
          </div>

          <div className="hiw-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { n:'01', icon:'🎯', title:'Personalised Assessment',   desc:'5-minute diagnostic. Our AI maps your skills, goals, and schedule into a custom learning plan — not a generic course list.',   color:T.g500  },
              { n:'02', icon:'🗺️', title:'AI-Curated Roadmap',       desc:'Week-by-week plan with hand-picked resources and milestones. Adapts in real time as you progress.',                           color:T.g600  },
              { n:'03', icon:'🚀', title:'Learn, Build, Get Hired',   desc:'Earn verifiable certificates, build a portfolio, and get matched to 500+ companies that hire directly from EduRoute.',        color:T.g700  },
            ].map((s,i) => (
              <motion.div key={i} className="card" initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-30px'}} transition={{duration:0.5,ease,delay:i*0.1}} style={{ padding:28, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:16, right:18, fontFamily:"'Instrument Serif',serif", fontSize:52, fontWeight:400, color:'rgba(12,28,18,0.04)', lineHeight:1, userSelect:'none' }}>{s.n}</div>
                <div style={{ width:50, height:50, borderRadius:13, background:s.color+'12', border:`1px solid ${s.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:18 }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:17, fontWeight:400, color:T.n900, marginBottom:10, letterSpacing:'-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize:13.5, color:T.n500, lineHeight:1.75 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ paddingBottom:72 }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:16, marginBottom:36 }}>
            <div>
              <Eyebrow>Platform</Eyebrow>
              <h2 className="sec-h2" style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:400, letterSpacing:'-0.025em', color:T.n900, marginTop:12, lineHeight:1.15 }}>
                Everything in one place
              </h2>
            </div>
            <p style={{ fontSize:14, color:T.n500, maxWidth:360, lineHeight:1.8 }}>Assessment, learning, mentorship, and hiring — one platform, zero gaps.</p>
          </div>

          <div className="feat-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
            {[
              { icon:'🎯', title:'AI Roadmaps',          desc:'Custom week-by-week learning plans that adapt to your pace and goals.',                              color:T.g500   },
              { icon:'📊', title:'Progress Analytics',    desc:'Real-time skill tracking with gap analysis and next-best-action prompts.',                           color:T.violet },
              { icon:'🤝', title:'Mentor Matching',       desc:'Matched to industry professionals based on your career target and experience.',                       color:T.g600   },
              { icon:'🏆', title:'Verified Credentials',  desc:'Blockchain-anchored certificates recognised by 500+ hiring partners.',                               color:T.amber  },
              { icon:'💼', title:'Hiring Pipeline',       desc:'Direct introductions to recruiters. No cold applications, no resume black holes.',                   color:T.teal   },
              { icon:'🌐', title:'Peer Community',        desc:'Cohort-based learning with study groups, code reviews, and weekly standups.',                        color:T.rose   },
            ].map((f,i) => (
              <motion.div key={i} initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:0.35,delay:i*0.05}}
                style={{ background:T.white, padding:isMobile?22:30, transition:'background 0.18s', cursor:'default' }}
                onMouseEnter={e=>e.currentTarget.style.background=T.n50}
                onMouseLeave={e=>e.currentTarget.style.background=T.white}>
                <div style={{ width:46, height:46, borderRadius:12, background:f.color+'12', border:`1px solid ${f.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:16 }}>{f.icon}</div>
                <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:16, fontWeight:400, color:T.n900, marginBottom:8, letterSpacing:'-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize:13, color:T.n500, lineHeight:1.72, marginBottom:14 }}>{f.desc}</p>
                <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600, color:f.color }}>
                  Learn more <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── EXPLORE TABS ── */}
        <section style={{ paddingBottom:72 }}>
          {/* Header */}
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:16, marginBottom:24, paddingBottom:18, borderBottom:`1px solid ${T.n100}` }}>
            <div>
              <Eyebrow>Explore</Eyebrow>
              <h2 className="sec-h2" style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(1.7rem,3vw,2.2rem)', fontWeight:400, letterSpacing:'-0.025em', color:T.n900, marginTop:10 }}>Discover opportunities</h2>
            </div>
            {/* Tabs */}
            <div style={{ display:'flex', gap:2, background:T.n50, padding:3, borderRadius:8, border:`1px solid ${T.n100}` }}>
              {[['roadmaps','Roadmaps'],['internships','Internships'],['events','Events']].map(([id,label]) => (
                <button key={id} className={`tab ${activeTab===id?'on':'off'}`} onClick={() => setActiveTab(id)}>{label}</button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Roadmaps */}
            {activeTab==='roadmaps' && (
              <motion.div key="r" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}>
                {/* Mobile: horizontal scroll */}
                {isTablet ? (
                  <div className="hscroll" style={{ paddingBottom:16 }}>
                    {roadmaps.map(item => (
                      <Link key={item.id} to="/roadmap">
                        <div className="card" style={{ padding:20, width:260 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                            <div style={{ width:44, height:44, borderRadius:11, background:item.color+'12', border:`1px solid ${item.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19 }}>{item.emoji}</div>
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                              {item.hot && <HotBadge/>}
                              <span style={{ fontSize:11, color:T.n400, fontWeight:600 }}>★ {item.rating}</span>
                            </div>
                          </div>
                          <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:16, fontWeight:400, color:T.n900, marginBottom:2, letterSpacing:'-0.02em' }}>{item.title}</h3>
                          <div style={{ fontSize:11, color:T.n400, marginBottom:12, fontWeight:500 }}>{item.sub}</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
                            {item.skills.map(sk => <Pill key={sk} color={item.color}>{sk}</Pill>)}
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:`1px solid ${T.n50}` }}>
                            <span style={{ fontSize:11, color:T.n400 }}>⏱ {item.dur} · 👥 {item.students}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:item.color }}>Enrol →</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                    {roadmaps.map(item => (
                      <Link key={item.id} to="/roadmap">
                        <div className="card card-link" style={{ padding:24 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                            <div style={{ width:48, height:48, borderRadius:12, background:item.color+'12', border:`1px solid ${item.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{item.emoji}</div>
                            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                              {item.hot && <HotBadge/>}
                              <span style={{ fontSize:11, color:T.n400, fontWeight:600 }}>★ {item.rating}</span>
                            </div>
                          </div>
                          <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:17, fontWeight:400, color:T.n900, marginBottom:3, letterSpacing:'-0.02em' }}>{item.title}</h3>
                          <div style={{ fontSize:12, color:T.n400, marginBottom:14, fontWeight:500 }}>{item.sub}</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>
                            {item.skills.map(sk => <Pill key={sk} color={item.color}>{sk}</Pill>)}
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:14, borderTop:`1px solid ${T.n50}` }}>
                            <span style={{ fontSize:11, color:T.n400 }}>⏱ {item.dur} · 👥 {item.students}</span>
                            <span style={{ fontSize:13, fontWeight:700, color:item.color }}>Enrol →</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Internships */}
            {activeTab==='internships' && (
              <motion.div key="int" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}>
                {isTablet ? (
                  <div className="hscroll">
                    {internships.map(item => (
                      <div key={item.id} className="card" style={{ padding:20, width:280 }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:40, height:40, borderRadius:10, background:item.color+'12', border:`1px solid ${item.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:item.color, fontFamily:'DM Mono,monospace' }}>{item.logo}</div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600, color:T.n900 }}>{item.company}</div>
                              <div style={{ fontSize:10, color:T.n400 }}>Verified Partner</div>
                            </div>
                          </div>
                          <Pill color={T.g500}>Paid</Pill>
                        </div>
                        <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:15, fontWeight:400, color:T.n900, letterSpacing:'-0.01em', marginBottom:12 }}>{item.title}</h3>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12, padding:10, background:T.n50, borderRadius:8, border:`1px solid ${T.n100}` }}>
                          <div><div style={{ fontSize:9, color:T.n400, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700, marginBottom:2 }}>Location</div><div style={{ fontSize:12, fontWeight:600, color:T.n700 }}>{item.loc}</div></div>
                          <div><div style={{ fontSize:9, color:T.n400, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700, marginBottom:2 }}>Stipend</div><div style={{ fontSize:12, fontWeight:700, color:T.g600 }}>{item.pay}</div></div>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>{item.skills.map(sk=><Pill key={sk} color={item.color}>{sk}</Pill>)}</div>
                        <button className="btn-prim" style={{ width:'100%', borderRadius:8 }}>Apply Now</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
                    {internships.map(item => (
                      <div key={item.id} className="card" style={{ padding:24 }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:44, height:44, borderRadius:11, background:item.color+'12', border:`1px solid ${item.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:item.color, fontFamily:'DM Mono,monospace' }}>{item.logo}</div>
                            <div>
                              <div style={{ fontSize:14, fontWeight:600, color:T.n900 }}>{item.company}</div>
                              <div style={{ fontSize:11, color:T.n400 }}>Verified Partner</div>
                            </div>
                          </div>
                          <Pill color={T.g500}>Paid</Pill>
                        </div>
                        <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:16, fontWeight:400, color:T.n900, letterSpacing:'-0.01em', marginBottom:14 }}>{item.title}</h3>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14, padding:12, background:T.n50, borderRadius:8, border:`1px solid ${T.n100}` }}>
                          <div><div style={{ fontSize:9, color:T.n400, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700, marginBottom:3 }}>Location</div><div style={{ fontSize:12.5, fontWeight:600, color:T.n700 }}>{item.loc}</div></div>
                          <div><div style={{ fontSize:9, color:T.n400, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700, marginBottom:3 }}>Stipend</div><div style={{ fontSize:12.5, fontWeight:700, color:T.g600 }}>{item.pay}</div></div>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:16 }}>{item.skills.map(sk=><Pill key={sk} color={item.color}>{sk}</Pill>)}</div>
                        <button className="btn-prim" style={{ width:'100%', borderRadius:8 }}>Apply Now</button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Events */}
            {activeTab==='events' && (
              <motion.div key="ev" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}>
                {isTablet ? (
                  <div className="hscroll">
                    {events.map(item => (
                      <div key={item.id} className="card" style={{ padding:20, width:280 }}>
                        <div style={{ display:'flex', gap:12, marginBottom:14 }}>
                          <div style={{ background:item.color+'12', border:`1px solid ${item.color}22`, borderRadius:10, padding:'10px 12px', textAlign:'center', flexShrink:0 }}>
                            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:20, color:item.color, lineHeight:1 }}>{item.date.split(' ')[1]}</div>
                            <div style={{ fontSize:9, fontWeight:700, color:item.color, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:2 }}>{item.date.split(' ')[0]}</div>
                          </div>
                          <div>
                            <Pill color={item.color}>{item.type}</Pill>
                            <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:15, fontWeight:400, color:T.n900, marginTop:6, letterSpacing:'-0.01em', lineHeight:1.3 }}>{item.title}</h3>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:T.n400, marginBottom:14 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {item.loc}
                        </div>
                        <button style={{ width:'100%', padding:'11px', background:'transparent', color:item.color, border:`1.5px solid ${item.color}30`, borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.18s', minHeight:44 }}
                          onMouseEnter={e=>{e.currentTarget.style.background=item.color;e.currentTarget.style.color='#fff';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=item.color;}}>
                          Register Free →
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:16 }}>
                    {events.map(item => (
                      <div key={item.id} className="card" style={{ padding:24 }}>
                        <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:16 }}>
                          <div style={{ background:item.color+'12', border:`1px solid ${item.color}22`, borderRadius:12, padding:'10px 14px', textAlign:'center', flexShrink:0 }}>
                            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:22, color:item.color, lineHeight:1 }}>{item.date.split(' ')[1]}</div>
                            <div style={{ fontSize:9, fontWeight:700, color:item.color, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:2 }}>{item.date.split(' ')[0]}</div>
                          </div>
                          <div>
                            <Pill color={item.color}>{item.type}</Pill>
                            <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:16, fontWeight:400, color:T.n900, marginTop:8, letterSpacing:'-0.01em', lineHeight:1.3 }}>{item.title}</h3>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:T.n400, marginBottom:16 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {item.loc}
                        </div>
                        <button style={{ width:'100%', padding:'12px', background:'transparent', color:item.color, border:`1.5px solid ${item.color}30`, borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.18s', minHeight:48 }}
                          onMouseEnter={e=>{e.currentTarget.style.background=item.color;e.currentTarget.style.color='#fff';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=item.color;}}>
                          Register Free →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── OUTCOMES ── */}
        <section style={{ paddingBottom:72 }}>
          <div className="outcomes-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderRadius:20, overflow:'hidden', border:`1px solid ${T.n100}`, boxShadow:T.elev2 }}>
            {/* Dark left */}
            <div style={{ background:`linear-gradient(145deg,${T.g900},${T.g700})`, padding:isMobile?'36px 24px':'52px 44px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-50, right:-50, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }}/>
              <Eyebrow light>Outcomes</Eyebrow>
              <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(1.5rem,2.8vw,2.2rem)', fontWeight:400, color:'#fff', letterSpacing:'-0.025em', margin:'14px 0 22px', lineHeight:1.2 }}>
                What you'll achieve in 6 months
              </h2>
              <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:13, marginBottom:32 }}>
                {['Build 10+ portfolio projects','Complete 200+ skill assessments','Earn 5 industry certificates','Land interviews at top companies'].map(item => (
                  <li key={item} style={{ display:'flex', alignItems:'center', gap:10, fontSize:14, color:'rgba(255,255,255,0.72)' }}>
                    <div style={{ width:18, height:18, minWidth:18, borderRadius:'50%', background:'rgba(34,135,78,0.28)', border:'1px solid rgba(77,200,133,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke={T.g300} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/questionnaire" className="btn-white" style={{ display:'inline-flex' }}>
                Start free today
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            {/* Light right */}
            <div style={{ background:T.white, padding:isMobile?'36px 24px':'52px 44px' }}>
              <Eyebrow>Skill Growth</Eyebrow>
              <h3 style={{ fontFamily:"'Instrument Serif',serif", fontSize:isMobile?17:20, fontWeight:400, color:T.n900, letterSpacing:'-0.02em', margin:'14px 0 28px' }}>Average learner improvement</h3>
              {[
                ['Technical Skills',   85, T.g500  ],
                ['Problem Solving',    78, T.violet ],
                ['System Design',      70, T.g600   ],
                ['Communication',      92, T.amber  ],
                ['Industry Knowledge', 88, T.teal   ],
              ].map(([skill,pct,color],i) => (
                <motion.div key={skill} initial={{opacity:0,x:16}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.09}} style={{ marginBottom:18 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:13, fontWeight:500, color:T.n700 }}>{skill}</span>
                    <span style={{ fontSize:12, fontWeight:700, color, fontFamily:'DM Mono,monospace' }}>{pct}%</span>
                  </div>
                  <div className="prog-track" style={{ border:`1px solid ${T.n100}` }}>
                    <motion.div style={{ height:'100%', background:color, borderRadius:99 }} initial={{width:0}} whileInView={{width:`${pct}%`}} viewport={{once:true}} transition={{duration:1.1,ease:'easeOut',delay:i*0.1+0.2}}/>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ paddingBottom:80 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:16, marginBottom:36 }}>
            <div>
              <Eyebrow>Stories</Eyebrow>
              <h2 className="sec-h2" style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(1.8rem,3vw,2.4rem)', fontWeight:400, letterSpacing:'-0.025em', color:T.n900, marginTop:12 }}>Real people, real results</h2>
            </div>
            <Link to="/stories" style={{ fontSize:13, fontWeight:600, color:T.g500, display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
              All stories <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          {/* Mobile: scroll, Desktop: grid */}
          {isTablet ? (
            <div className="hscroll">
              {testimonials.map((t,i) => (
                <div key={i} className="card" style={{ padding:24, width:300, display:'flex', flexDirection:'column' }}>
                  <div style={{ display:'flex', gap:2, marginBottom:14 }}>{[...Array(5)].map((_,j)=><span key={j} style={{ color:'#F59E0B', fontSize:13 }}>★</span>)}</div>
                  <p style={{ fontSize:13.5, color:T.n600, lineHeight:1.78, flex:1, marginBottom:20, fontStyle:'italic' }}>"{t.q}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:18, borderTop:`1px solid ${T.n50}` }}>
                    <div style={{ width:38, height:38, borderRadius:'50%', background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0, fontFamily:"'Instrument Serif',serif" }}>{t.av}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.n900 }}>{t.name}</div>
                      <div style={{ fontSize:11, color:T.n400, marginTop:1 }}>{t.role} <span style={{ color:t.color, fontWeight:700 }}>@ {t.co}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="testi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {testimonials.map((t,i) => (
                <motion.div key={i} className="card" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-20px'}} transition={{duration:0.5,delay:i*0.1}} style={{ padding:32, display:'flex', flexDirection:'column' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:t.color+'12', border:`1px solid ${t.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:t.color, fontFamily:'DM Mono,monospace' }}>{t.co[0]}</div>
                    <span style={{ fontSize:13, fontWeight:700, color:T.n800 }}>{t.co}</span>
                    <div style={{ marginLeft:'auto', display:'flex', gap:2 }}>{[...Array(5)].map((_,j)=><span key={j} style={{ color:'#F59E0B', fontSize:12 }}>★</span>)}</div>
                  </div>
                  <p style={{ fontSize:14, color:T.n600, lineHeight:1.8, flex:1, marginBottom:22, fontStyle:'italic' }}>"{t.q}"</p>
                  <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:20, borderTop:`1px solid ${T.n50}` }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0, fontFamily:"'Instrument Serif',serif" }}>{t.av}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:T.n900, letterSpacing:'-0.01em' }}>{t.name}</div>
                      <div style={{ fontSize:11, color:T.n400, marginTop:1 }}>{t.role} <span style={{ color:t.color, fontWeight:700 }}>@ {t.co}</span></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ════════════════════════════════════════════
          CTA — Full-width dark band
      ════════════════════════════════════════════ */}
      <section style={{ background:`linear-gradient(135deg,${T.g900} 0%,${T.g800} 55%,${T.g700} 100%)`, position:'relative', overflow:'hidden', paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
        {/* Grid texture */}
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)`, backgroundSize:'48px 48px', pointerEvents:'none' }}/>
        {/* Glow */}
        <div style={{ position:'absolute', top:'-30%', right:'-10%', width:'50%', maxWidth:480, paddingBottom:'50%', borderRadius:'50%', background:'radial-gradient(circle,rgba(29,122,72,0.18) 0%,transparent 65%)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'80px 24px 72px' }} className="safe-x safe-b">
          <motion.div initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.65,ease}}>
            <div className="cta-grid" style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:48, alignItems:'center' }}>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(29,122,72,0.18)', border:'1px solid rgba(77,200,133,0.28)', padding:'5px 13px', borderRadius:5, fontSize:11, fontWeight:700, color:T.g200, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:20 }}>
                  🎓 Free to get started
                </div>
                <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:'clamp(1.9rem,4vw,3.2rem)', fontWeight:400, color:'#fff', lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:14 }}>
                  Ready to build the<br/>
                  <em style={{ fontStyle:'italic', color:T.g300 }}>career you deserve?</em>
                </h2>
                <p style={{ fontSize:15.5, color:'rgba(255,255,255,0.5)', maxWidth:480, lineHeight:1.78 }}>
                  No credit card. No commitment. Just a 5-minute assessment and a roadmap built for you.
                </p>
              </div>
              <div className="cta-btns" style={{ display:'flex', flexDirection:'column', gap:10, minWidth:220, flexShrink:0 }}>
                <Link to="/questionnaire" className="btn-white" style={{ justifyContent:'center', width:'100%' }}>
                  Get started — it's free
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                {user ? (
                  <Link to="/profile" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:48, padding:'12px 24px', borderRadius:8, fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.72)', border:'1.5px solid rgba(255,255,255,0.16)', background:'rgba(255,255,255,0.07)', transition:'all 0.18s', width:'100%' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.13)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
                    Go to my dashboard →
                  </Link>
                ) : (
                  <Link to="/login" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:48, padding:'12px 24px', borderRadius:8, fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.72)', border:'1.5px solid rgba(255,255,255,0.16)', background:'rgba(255,255,255,0.07)', transition:'all 0.18s', width:'100%' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.13)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
                    Sign in to your account
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;