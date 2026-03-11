// frontend/src/pages/Home.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

/* ─── Forest Sage palette ─── */
const G = {
  green:      '#2D6A4F',
  greenMid:   '#40916C',
  greenLight: '#52B788',
  greenSoft:  '#D8F3DC',
  greenMist:  '#F0FAF3',
  greenLine:  '#B7E4C7',
  sageDim:    'rgba(82,183,136,0.12)',
  text1:      '#1A2E1A',
  text2:      '#3D5A3E',
  text3:      '#6B8F71',
  text4:      '#9AB89D',
  surface:    '#FFFFFF',
  bg:         '#F4F9F5',
  bgDeep:     '#EBF5EE',
  border:     '#D4E8D7',
  borderSoft: '#E8F4EA',
  shadowSm:   '0 2px 10px rgba(26,46,26,0.06)',
  shadowMd:   '0 6px 24px rgba(26,46,26,0.09)',
  shadowLg:   '0 12px 40px rgba(26,46,26,0.12)',
  shadowGreen:'0 6px 24px rgba(45,106,79,0.18)',
  /* accent colours kept for variety */
  amber:      '#D97706', amberLight: '#FFFBEB',
  blue:       '#2563EB', blueLight:  '#EFF6FF',
  violet:     '#7C3AED', violetLight:'#F5F3FF',
  cyan:       '#0891B2', cyanLight:  '#ECFEFF',
  rose:       '#E11D48', roseLight:  '#FFF1F2',
};

const roadmaps = [
  { id:1, title:'Software Engineering',    description:'From fundamentals to full-stack mastery with modern frameworks and cloud', duration:'12 months', students:'8.4k', rating:4.9, skills:['JavaScript','React','Node.js','AWS'],    color:G.green,    light:G.greenMist, emoji:'💻' },
  { id:2, title:'Data Science & AI',       description:'Statistics, machine learning, deep learning and real-world data engineering', duration:'10 months', students:'6.2k', rating:4.8, skills:['Python','TensorFlow','SQL','Spark'],  color:G.violet,   light:G.violetLight, emoji:'🧠' },
  { id:3, title:'Cybersecurity',           description:'Ethical hacking, threat analysis, and enterprise security architecture',     duration:'8 months',  students:'3.8k', rating:4.7, skills:['Pentesting','Crypto','SIEM','Cloud'], color:G.rose,     light:G.roseLight, emoji:'🔐' },
  { id:4, title:'UI/UX Design',            description:'Research, wireframing, prototyping and design systems for digital products',  duration:'6 months',  students:'5.1k', rating:4.9, skills:['Figma','Research','Systems','Motion'],color:G.greenMid, light:G.greenSoft, emoji:'🎨' },
  { id:5, title:'Product Management',      description:'Strategy, roadmapping, and cross-functional leadership for tech products',    duration:'7 months',  students:'4.3k', rating:4.8, skills:['Strategy','Analytics','Agile','GTM'], color:G.amber,    light:G.amberLight, emoji:'📦' },
  { id:6, title:'Cloud Architecture',      description:'AWS, GCP, Azure — infrastructure, DevOps, and platform engineering',          duration:'9 months',  students:'2.9k', rating:4.7, skills:['AWS','Kubernetes','Terraform','CI/CD'],color:G.cyan,    light:G.cyanLight, emoji:'☁️' },
];
const internships = [
  { id:1, title:'Frontend Developer Intern', company:'TechCorp',    location:'Remote',        stipend:'$2,000/mo', skills:['React','TypeScript','CSS'],  logo:'T', color:G.green },
  { id:2, title:'Data Science Intern',       company:'DataFlow Inc', location:'New York',      stipend:'$3,000/mo', skills:['Python','ML','SQL'],         logo:'D', color:G.violet },
  { id:3, title:'UX Design Intern',          company:'DesignHub',    location:'San Francisco', stipend:'$2,500/mo', skills:['Figma','Research','Proto'],   logo:'H', color:G.greenMid },
  { id:4, title:'Cloud Engineer Intern',     company:'InfraScale',   location:'Austin',        stipend:'$2,800/mo', skills:['AWS','Docker','Go'],          logo:'I', color:G.cyan },
];
const events = [
  { id:1, title:'Tech Career Fair 2025',    dateNum:'15', month:'MAR', location:'Virtual Event',  description:'Connect with 200+ top tech companies. Live Q&A, resume review, and on-spot offers.',          type:'Career Fair', color:G.green },
  { id:2, title:'AI/ML Bootcamp',           dateNum:'20', month:'MAR', location:'Online',         description:'3-day hands-on workshop on modern ML. Build and deploy real production models.',               type:'Workshop',    color:G.violet },
  { id:3, title:'Startup Founder Meetup',   dateNum:'25', month:'MAR', location:'Downtown Hub',   description:'Network with founders, angels, and VCs. Pitch your ideas in a warm setting.',                  type:'Networking',  color:G.greenMid },
  { id:4, title:'Open Source Sprint',       dateNum:'02', month:'APR', location:'GitHub Remote',  description:'48-hour collaborative hackathon contributing to impactful open-source projects.',               type:'Hackathon',   color:G.amber },
];
const testimonials = [
  { name:'Priya Sharma',  role:'Software Engineer @ Google', quote:"EduRoute's structured roadmap helped me go from zero to landing my dream job in 11 months. The AI guidance was like having a personal mentor.", avatar:'P', color:G.green },
  { name:'Marcus Chen',   role:'Data Scientist @ Stripe',    quote:'The curated learning paths saved me hundreds of hours of research. I knew exactly what to learn and in what order — no guesswork.',            avatar:'M', color:G.violet },
  { name:'Aisha Patel',   role:'UX Lead @ Figma',            quote:'From a non-design background to leading a team at Figma in 14 months. The structured approach and community made all the difference.',         avatar:'A', color:G.greenMid },
];
const features = [
  { icon:'🎯', title:'Personalised AI Roadmaps',  desc:'Answer a few questions and receive a custom learning path built around your goals, timeline, and existing skills.', color:G.green,    light:G.greenMist  },
  { icon:'📊', title:'Progress Intelligence',     desc:'Smart tracking that adapts as you learn — see exactly where you stand and what to prioritise next.',                color:G.violet,   light:G.violetLight },
  { icon:'🤝', title:'Mentor Network',            desc:'Get matched with industry mentors who have walked the same path. Weekly check-ins and honest career guidance.',      color:G.greenMid, light:G.greenSoft  },
  { icon:'🏆', title:'Achievement System',        desc:'Earn certificates, badges, and rankings as you progress. Build a portfolio that tells your story.',                  color:G.amber,    light:G.amberLight },
  { icon:'💼', title:'Internship Pipeline',       desc:'Access exclusive opportunities from 500+ partner companies actively recruiting from our platform.',                  color:G.cyan,     light:G.cyanLight  },
  { icon:'🌐', title:'Community Learning',        desc:'Study groups, peer reviews, and live sessions. Absorb knowledge faster with driven peers.',                         color:G.rose,     light:G.roseLight  },
];
const stats = [['42K+','Active Learners'],['120+','Career Paths'],['94%','Placement Rate'],['4.9★','Avg Rating']];

const fadeUp = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, transition:{duration:0.5,ease:[0.22,1,0.36,1]} };
const stagger = { animate:{ transition:{ staggerChildren:0.09 } } };

const Tag = ({ children, color }) => (
  <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:6, background:color+'20', color, letterSpacing:'0.06em', textTransform:'uppercase' }}>{children}</span>
);
const Chip = ({ label }) => (
  <span style={{ display:'inline-flex', alignItems:'center', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:99, background:'rgba(26,46,26,0.06)', color:G.text3 }}>{label}</span>
);

const Home = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('roadmaps');

  return (
    <div style={{ minHeight:'100vh', color:G.text1, fontFamily:"'Plus Jakarta Sans',sans-serif", WebkitFontSmoothing:'antialiased', overflowX:'hidden', background:G.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');

        :root {
          --green: #2D6A4F; --green-mid: #40916C; --green-light: #52B788;
          --green-soft: #D8F3DC; --green-mist: #F0FAF3; --green-line: #B7E4C7;
          --sage-dim: rgba(82,183,136,0.12);
          --text-1: #1A2E1A; --text-2: #3D5A3E; --text-3: #6B8F71; --text-4: #9AB89D;
          --surface: #FFFFFF; --bg: #F4F9F5; --bg-deep: #EBF5EE;
          --border: #D4E8D7; --border-soft: #E8F4EA;
          --shadow-sm: 0 2px 10px rgba(26,46,26,0.06);
          --shadow-md: 0 6px 24px rgba(26,46,26,0.09);
          --shadow-lg: 0 12px 40px rgba(26,46,26,0.12);
          --shadow-green: 0 6px 24px rgba(45,106,79,0.18);
        }

        .hm-card {
          background: #FFFFFF;
          border: 1px solid #D4E8D7;
          box-shadow: 0 2px 10px rgba(26,46,26,0.06);
          border-radius: 18px;
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .hm-card:hover {
          box-shadow: 0 8px 28px rgba(26,46,26,0.1);
          transform: translateY(-2px);
          border-color: #B7E4C7;
        }

        .tab-btn {
          padding: 7px 20px; border-radius: 9px;
          font-size: 13px; font-weight: 700;
          border: none; cursor: pointer;
          transition: all 0.18s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        .tab-btn.active { background: #2D6A4F; color: #fff; box-shadow: 0 4px 14px rgba(45,106,79,0.25); }
        .tab-btn:not(.active) { background: #FFFFFF; color: #6B8F71; border: 1px solid #D4E8D7; }
        .tab-btn:not(.active):hover { background: #F0FAF3; color: #2D6A4F; border-color: #B7E4C7; }

        .btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 24px; border-radius: 11px; font-size: 13px; font-weight: 700;
          background: #2D6A4F; color: #fff; text-decoration: none; border: none;
          cursor: pointer; transition: all 0.2s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          box-shadow: 0 6px 24px rgba(45,106,79,0.22);
        }
        .btn-primary:hover { background: #40916C; transform: translateY(-1px); box-shadow: 0 10px 32px rgba(45,106,79,0.32); }

        .btn-outline {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 24px; border-radius: 11px; font-size: 13px; font-weight: 700;
          background: transparent; color: #2D6A4F; text-decoration: none;
          border: 1.5px solid #D4E8D7; cursor: pointer; transition: all 0.18s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-outline:hover { border-color: #B7E4C7; background: rgba(82,183,136,0.08); }

        .sec-lbl {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.18em; color: #40916C;
          background: rgba(64,145,108,0.1); padding: 5px 13px;
          border-radius: 99px; border: 1px solid rgba(64,145,108,0.2);
        }

        @media(max-width:768px) {
          .hero-g { grid-template-columns: 1fr !important; }
          .hero-prev { display: none !important; }
          .stats-s { grid-template-columns: repeat(2,auto) !important; }
          .cta-g { grid-template-columns: 1fr !important; }
        }

        @keyframes sway { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4);opacity:.6} }
        @keyframes flt1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes flt2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'104px 24px 80px' }}>

        {/* ── HERO ── */}
        <section style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:56, alignItems:'center', marginBottom:96 }} className="hero-g">
          <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.7,ease:[0.22,1,0.36,1]}}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, flexWrap:'wrap' }}>
              <span className="sec-lbl">✦ AI-Powered Education Platform</span>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,251,235,0.95)', border:'1px solid rgba(217,119,6,0.25)', padding:'5px 13px', borderRadius:99 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#D97706', display:'inline-block', animation:'sway 2s ease-in-out infinite' }}/>
                <span style={{ fontSize:11, fontWeight:700, color:'#92400E' }}>2,400 learners active today</span>
              </div>
            </div>

            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(2.4rem,5vw,3.6rem)',
              fontWeight: 700, lineHeight: 1.08,
              letterSpacing: '-0.03em', color: G.text1, marginBottom: 18,
            }}>
              Build the Career<br/>
              <em style={{ fontStyle:'italic', color:G.green }}>You Deserve</em><br/>
              with AI Guidance
            </h1>

            <p style={{ fontSize:15, color:G.text3, lineHeight:1.8, maxWidth:460, marginBottom:28 }}>
              Personalised learning roadmaps, curated resources, and real career opportunities — one intelligent platform for ambitious learners.
            </p>

            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:36 }}>
              <Link to="/questionnaire" className="btn-primary">
                Start Your Journey
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/roadmap" className="btn-outline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Explore Paths
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,auto)', gap:0, justifyContent:'start', paddingTop:24, borderTop:`1px solid ${G.borderSoft}` }} className="stats-s">
              {stats.map(([n,l],i) => (
                <React.Fragment key={l}>
                  {i > 0 && <div style={{ width:1, background:G.borderSoft, margin:'0 20px', alignSelf:'stretch' }}/>}
                  <div>
                    <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:G.text1, letterSpacing:'-0.02em' }}>{n}</div>
                    <div style={{ fontSize:11, color:G.text4, marginTop:2, fontWeight:600, whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Hero card preview */}
          <motion.div className="hero-prev" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} transition={{duration:0.7,delay:0.18,ease:[0.22,1,0.36,1]}} style={{ position:'relative' }}>
            {/* Float badge top */}
            <motion.div initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} transition={{delay:0.6}} style={{ position:'absolute', top:-18, right:8, zIndex:20, animation:'flt2 5s ease-in-out infinite' }}>
              <div style={{ background:'#fff', border:`1px solid ${G.border}`, borderRadius:14, padding:'10px 14px', display:'flex', alignItems:'center', gap:9, boxShadow:'0 6px 20px rgba(26,46,26,0.1)' }}>
                <div style={{ width:30, height:30, borderRadius:9, background:G.greenMist, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🎯</div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:G.text1, lineHeight:1 }}>Milestone reached!</div>
                  <div style={{ fontSize:10, color:G.text4, marginTop:2 }}>React Fundamentals</div>
                </div>
              </div>
            </motion.div>

            <div className="hm-card" style={{ overflow:'hidden', borderRadius:22, boxShadow:'0 12px 40px rgba(26,46,26,0.12)' }}>
              <div style={{ background:G.green, padding:'22px 22px 20px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.06)', right:-40, top:-50 }}/>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', marginBottom:4 }}>Active Roadmap</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:700, color:'#fff', marginBottom:16 }}>Software Engineering</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.75)' }}>Overall progress</span>
                  <span style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:700, color:'#fff', lineHeight:1 }}>68%</span>
                </div>
                <div style={{ height:6, background:'rgba(255,255,255,0.2)', borderRadius:99, overflow:'hidden' }}>
                  <motion.div initial={{width:0}} animate={{width:'68%'}} transition={{duration:1.4,ease:'easeOut',delay:0.5}} style={{ height:'100%', background:'rgba(255,255,255,0.9)', borderRadius:99 }}/>
                </div>
              </div>
              {[
                {n:'✓',title:'JavaScript Fundamentals',time:'8h',status:'done'},
                {n:'2', title:'React & Modern Patterns',time:'6h', status:'active'},
                {n:'3', title:'Node.js & REST APIs',   time:'10h',status:'locked'},
                {n:'4', title:'Databases & Cloud',     time:'9h', status:'locked'},
              ].map((s,i) => {
                const isDone=s.status==='done', isActive=s.status==='active';
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 20px', borderBottom:i<3?`1px solid ${G.borderSoft}`:'none' }}>
                    <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, background:isDone?G.greenSoft:isActive?G.sageDim:G.bgDeep, color:isDone?G.green:isActive?G.green:G.text4, border:isActive?`2px solid ${G.green}`:'none' }}>
                      {s.status==='locked'?'🔒':s.n}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:s.status==='locked'?G.text4:G.text1 }}>{s.title}</div>
                      <div style={{ fontSize:11, color:G.text4, marginTop:1 }}>{s.time} · {isDone?'Done':isActive?'In Progress':'Locked'}</div>
                    </div>
                    {isDone&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {isActive&&<span style={{ fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:6, background:G.greenSoft, color:G.green }}>50%</span>}
                  </div>
                );
              })}
              <div style={{ padding:'12px 20px 18px' }}>
                <button style={{ width:'100%', padding:'12px', background:G.green, color:'#fff', border:'none', borderRadius:11, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:`0 4px 16px rgba(45,106,79,0.25)` }}>
                  Continue Learning →
                </button>
              </div>
            </div>

            {/* Float badge bottom */}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.8}} style={{ position:'absolute', bottom:-16, left:8, zIndex:20, animation:'flt1 6s ease-in-out infinite' }}>
              <div style={{ background:'#fff', border:`1px solid ${G.border}`, borderRadius:13, padding:'9px 14px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 4px 16px rgba(26,46,26,0.08)' }}>
                <div style={{ display:'flex' }}>
                  {[G.green, G.violet, G.greenMid].map((c,i) => <div key={i} style={{ width:22, height:22, borderRadius:'50%', background:c, border:'2px solid #fff', marginLeft:i>0?-7:0 }}/>)}
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:G.text3 }}>+84 joined this week</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── TRUSTED BY ── */}
        <section style={{ marginBottom:80 }}>
          <p style={{ textAlign:'center', fontSize:10, fontWeight:700, color:G.text4, textTransform:'uppercase', letterSpacing:'0.16em', marginBottom:16 }}>Learners hired at</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flexWrap:'wrap', padding:'14px 0', borderTop:`1px solid ${G.borderSoft}`, borderBottom:`1px solid ${G.borderSoft}` }}>
            {['Google','Stripe','Figma','Airbnb','Notion','GitHub','Vercel','Linear'].map((c,i) => (
              <React.Fragment key={c}>
                {i>0&&<div style={{ width:1, height:16, background:G.borderSoft }}/>}
                <span style={{ padding:'0 24px', fontSize:14, fontWeight:700, color:G.text4, letterSpacing:'-0.02em', opacity:0.7 }}>{c}</span>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{ marginBottom:88 }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <span className="sec-lbl" style={{ marginBottom:16, display:'inline-flex' }}>⚡ How It Works</span>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,3.2vw,2.4rem)', fontWeight:700, color:G.text1, letterSpacing:'-0.02em', marginBottom:10, marginTop:16 }}>
              From Assessment to Offer Letter
            </h2>
            <p style={{ fontSize:14, color:G.text3, maxWidth:460, margin:'0 auto', lineHeight:1.75 }}>Three steps to unlock a fully personalised career journey</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
            {[
              {step:'01',icon:'🎯',title:'Take the Assessment',   desc:'Answer a 5-minute questionnaire about your skills, goals, and learning style. Our AI builds your profile.',                          color:G.green,    light:G.greenMist  },
              {step:'02',icon:'🗺️',title:'Get Your Roadmap',     desc:'Receive a step-by-step learning plan with curated resources, timelines, and milestones tailored to you.',                           color:G.greenMid, light:G.greenSoft  },
              {step:'03',icon:'🚀',title:'Learn & Get Hired',     desc:'Follow your roadmap, earn certificates, and access exclusive internship and job opportunities.',                                      color:G.violet,   light:G.violetLight},
            ].map((s,i) => (
              <motion.div key={i} className="hm-card" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-20px'}} transition={{duration:0.5,delay:i*0.1}} style={{ padding:28, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:18, right:20, fontFamily:"'Fraunces',serif", fontSize:48, fontWeight:700, color:'rgba(26,46,26,0.04)', lineHeight:1, userSelect:'none' }}>{s.step}</div>
                <div style={{ width:48, height:48, borderRadius:13, background:s.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:18, position:'relative', zIndex:1 }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:16, fontWeight:600, color:G.text1, marginBottom:8, position:'relative', zIndex:1 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:G.text3, lineHeight:1.72, position:'relative', zIndex:1 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ marginBottom:88 }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:20, marginBottom:36 }}>
            <div>
              <span className="sec-lbl" style={{ marginBottom:12, display:'inline-flex' }}>✦ Platform Features</span>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:700, color:G.text1, letterSpacing:'-0.02em', marginTop:12 }}>Everything to Succeed</h2>
            </div>
            <p style={{ fontSize:14, color:G.text3, maxWidth:340, lineHeight:1.75 }}>A complete ecosystem for your professional development journey</p>
          </div>
          <motion.div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }} variants={stagger} initial="initial" whileInView="animate" viewport={{once:true,margin:'-20px'}}>
            {features.map((f,i) => (
              <motion.div key={i} variants={fadeUp} className="hm-card" style={{ padding:26, cursor:'default', display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:13, background:f.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:`1px solid ${G.borderSoft}` }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:15, fontWeight:600, color:G.text1, marginBottom:7 }}>{f.title}</h3>
                  <p style={{ fontSize:13, color:G.text3, lineHeight:1.72 }}>{f.desc}</p>
                </div>
                <div style={{ marginTop:'auto', display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:700, color:f.color }}>
                  Learn more <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── EXPLORE TABS ── */}
        <section style={{ marginBottom:88 }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:20, marginBottom:24 }}>
            <div>
              <span className="sec-lbl" style={{ marginBottom:12, display:'inline-flex' }}>📚 Explore</span>
              <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,2.8vw,2rem)', fontWeight:700, color:G.text1, letterSpacing:'-0.02em', marginTop:12 }}>Discover Opportunities</h2>
            </div>
            <div className="scrollbar-hide" style={{ display:'flex', gap:6, overflowX:'auto' }}>
              {[['roadmaps','Roadmaps'],['internships','Internships'],['events','Events']].map(([id,label]) => (
                <button key={id} className={`tab-btn${activeTab===id?' active':''}`} onClick={()=>setActiveTab(id)}>{label}</button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab==='roadmaps' && (
              <motion.div key="roadmaps" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(256px,1fr))', gap:16 }}>
                {roadmaps.map(item => (
                  <Link key={item.id} to="/roadmap" style={{ textDecoration:'none' }}>
                    <div className="hm-card" style={{ padding:22, display:'flex', flexDirection:'column', gap:14, height:'100%', cursor:'pointer' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:item.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, border:`1px solid ${G.borderSoft}` }}>{item.emoji}</div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                          <Tag color={item.color}>{item.duration}</Tag>
                          <span style={{ fontSize:11, color:G.text4 }}>★ {item.rating}</span>
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:600, color:G.text1, marginBottom:5, lineHeight:1.3 }}>{item.title}</h3>
                        <p style={{ fontSize:12, color:G.text3, lineHeight:1.65 }}>{item.description}</p>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{item.skills.map(sk=><Chip key={sk} label={sk}/>)}</div>
                      <div style={{ marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:`1px solid ${G.borderSoft}` }}>
                        <span style={{ fontSize:11, color:G.text4, fontWeight:500 }}>👥 {item.students} enrolled</span>
                        <span style={{ fontSize:13, fontWeight:700, color:item.color }}>Start →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
            {activeTab==='internships' && (
              <motion.div key="internships" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {internships.map(item => (
                  <div key={item.id} className="hm-card" style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ width:42, height:42, borderRadius:11, background:item.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:item.color, fontFamily:"'Fraunces',serif" }}>{item.logo}</div>
                      <Tag color={G.green}>Paid</Tag>
                    </div>
                    <div>
                      <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:600, color:G.text1, marginBottom:2 }}>{item.title}</h3>
                      <p style={{ fontSize:13, fontWeight:700, color:item.color }}>{item.company}</p>
                    </div>
                    <div style={{ background:G.bgDeep, borderRadius:10, padding:'10px 14px', display:'flex', flexDirection:'column', gap:6, border:`1px solid ${G.borderSoft}` }}>
                      {[['📍',item.location],['💰',item.stipend]].map(([ic,v]) => (
                        <div key={v} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:G.text3 }}><span>{ic}</span><span style={{ fontWeight:600, color:G.text2 }}>{v}</span></div>
                      ))}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{item.skills.map(sk=><Chip key={sk} label={sk}/>)}</div>
                    <button style={{ width:'100%', padding:'11px', background:G.green, color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'all 0.2s', boxShadow:`0 4px 14px rgba(45,106,79,0.22)` }}
                      onMouseEnter={e=>{e.currentTarget.style.background=G.greenMid;e.currentTarget.style.transform='translateY(-1px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background=G.green;e.currentTarget.style.transform='';}}>
                      Apply Now
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
            {activeTab==='events' && (
              <motion.div key="events" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {events.map(item => (
                  <div key={item.id} className="hm-card" style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                      <div style={{ background:item.color+'14', border:`1px solid ${item.color}25`, borderRadius:12, padding:'8px 14px', textAlign:'center', flexShrink:0 }}>
                        <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:item.color, lineHeight:1 }}>{item.dateNum}</div>
                        <div style={{ fontSize:9, fontWeight:700, color:item.color, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:2 }}>{item.month}</div>
                      </div>
                      <div style={{ flex:1 }}>
                        <Tag color={item.color}>{item.type}</Tag>
                        <h3 style={{ fontFamily:"'Fraunces',serif", fontSize:13, fontWeight:600, color:G.text1, marginTop:6, lineHeight:1.35 }}>{item.title}</h3>
                      </div>
                    </div>
                    <p style={{ fontSize:12, color:G.text3, lineHeight:1.65 }}>{item.description}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:G.text4 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {item.location}
                    </div>
                    <button style={{ width:'100%', padding:'11px', background:'transparent', color:item.color, border:`1.5px solid ${item.color}30`, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'all 0.2s' }}
                      onMouseEnter={e=>{e.currentTarget.style.background=item.color;e.currentTarget.style.color='#fff';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=item.color;}}>
                      Register Free
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section style={{ marginBottom:88 }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <span className="sec-lbl" style={{ marginBottom:14, display:'inline-flex' }}>💬 Success Stories</span>
            <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:700, color:G.text1, letterSpacing:'-0.02em', marginTop:16 }}>Real People, Real Results</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
            {testimonials.map((t,i) => (
              <motion.div key={i} className="hm-card" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-20px'}} transition={{duration:0.5,delay:i*0.1}} style={{ padding:26 }}>
                <div style={{ display:'flex', gap:3, marginBottom:14 }}>{[...Array(5)].map((_,j)=><span key={j} style={{ color:'#F59E0B', fontSize:13 }}>★</span>)}</div>
                <p style={{ fontSize:13, color:G.text2, lineHeight:1.8, marginBottom:20, fontStyle:'italic' }}>"{t.quote}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:18, borderTop:`1px solid ${G.borderSoft}` }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:G.green, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:G.text1 }}>{t.name}</div>
                    <div style={{ fontSize:11, color:G.text4, marginTop:1 }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── OUTCOMES ── */}
        <section style={{ marginBottom:88 }}>
          <div className="hm-card" style={{ padding:'40px 40px 0', overflow:'hidden', position:'relative', borderRadius:22 }}>
            <div style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', background:'radial-gradient(ellipse at 70% 30%, rgba(208,237,214,0.35) 0%, transparent 70%)', pointerEvents:'none' }}/>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }} className="hero-g">
              <div style={{ position:'relative', zIndex:1 }}>
                <span className="sec-lbl" style={{ marginBottom:14, display:'inline-flex' }}>📈 Outcomes</span>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,2.8vw,2rem)', fontWeight:700, color:G.text1, letterSpacing:'-0.02em', marginTop:14, marginBottom:20 }}>What You'll Achieve in 6 Months</h2>
                <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
                  {[['Build 10+ portfolio projects',G.green],['Complete 200+ skill assessments',G.violet],['Earn 5 industry certificates',G.greenMid],['Land interviews at top companies',G.amber]].map(([item,color]) => (
                    <div key={item} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:22, height:22, borderRadius:7, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{ fontSize:13, fontWeight:500, color:G.text2 }}>{item}</span>
                    </div>
                  ))}
                </div>
                <Link to="/questionnaire" className="btn-primary">
                  Start for Free <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
              <div style={{ position:'relative', zIndex:1, paddingBottom:40 }}>
                {[['Technical Skills',85,G.green],['Problem Solving',78,G.violet],['System Design',70,G.greenMid],['Communication',92,G.amber],['Industry Knowledge',88,G.cyan]].map(([skill,pct,color],i) => (
                  <motion.div key={skill} initial={{opacity:0,x:18}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.1}} style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12, fontWeight:700 }}>
                      <span style={{ color:G.text2 }}>{skill}</span>
                      <span style={{ color }}>{pct}%</span>
                    </div>
                    <div style={{ height:6, background:G.bgDeep, borderRadius:99, overflow:'hidden' }}>
                      <motion.div style={{ height:'100%', background:`linear-gradient(90deg,${color},${color}88)`, borderRadius:99 }} initial={{width:0}} whileInView={{width:`${pct}%`}} viewport={{once:true}} transition={{duration:1.1,ease:'easeOut',delay:i*0.1+0.2}}/>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section>
          <motion.div initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}}>
            <div style={{ background:G.green, borderRadius:24, padding:'52px 48px', display:'grid', gridTemplateColumns:'1fr auto', gap:36, alignItems:'center', position:'relative', overflow:'hidden', boxShadow:'0 16px 56px rgba(45,106,79,0.28)' }} className="cta-g">
              <div style={{ position:'absolute', width:340, height:340, borderRadius:'50%', background:'rgba(255,255,255,0.05)', right:-80, top:-110, pointerEvents:'none' }}/>
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.14)', padding:'5px 13px', borderRadius:99, fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.9)', marginBottom:16, border:'1px solid rgba(255,255,255,0.22)' }}>
                  🎓 Join 42,000+ learners
                </div>
                <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,3.2vw,2.2rem)', fontWeight:700, color:'#fff', marginBottom:12, lineHeight:1.2, letterSpacing:'-0.02em' }}>
                  Ready to Transform Your Career?
                </h2>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.75, maxWidth:440 }}>Get your personalised roadmap in 5 minutes. No credit card required.</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, flexShrink:0, position:'relative', zIndex:1, minWidth:190 }}>
                <Link to="/questionnaire" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 24px', borderRadius:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:700, background:'#fff', color:G.green, textDecoration:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.14)', transition:'all 0.2s', whiteSpace:'nowrap' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 30px rgba(0,0,0,0.2)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.14)';}}>
                  Get Started Free →
                </Link>
                {user ? (
                  <Link to="/profile" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'13px 24px', borderRadius:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, background:'rgba(255,255,255,0.12)', color:'#fff', textDecoration:'none', border:'1.5px solid rgba(255,255,255,0.25)', transition:'all 0.2s', whiteSpace:'nowrap' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}>
                    View My Profile
                  </Link>
                ) : (
                  <Link to="/login" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'13px 24px', borderRadius:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, background:'rgba(255,255,255,0.12)', color:'#fff', textDecoration:'none', border:'1.5px solid rgba(255,255,255,0.25)', transition:'all 0.2s', whiteSpace:'nowrap' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}>
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

export default Home;