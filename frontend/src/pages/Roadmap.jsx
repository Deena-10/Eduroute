// frontend/src/pages/Roadmap.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeJsonParse } from "../utils/safeJsonParser";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const HOURS_GOAL = 40;

/* ─── Forest Sage palette ─── */
const G = {
  green:       '#2D6A4F',
  greenMid:    '#40916C',
  greenLight:  '#52B788',
  greenSoft:   '#D8F3DC',
  greenMist:   '#F0FAF3',
  greenLine:   '#B7E4C7',
  sageDim:     'rgba(82,183,136,0.12)',
  sagGlow:     'rgba(45,106,79,0.08)',
  text1:       '#1A2E1A',
  text2:       '#3D5A3E',
  text3:       '#6B8F71',
  text4:       '#9AB89D',
  surface:     '#FFFFFF',
  bg:          '#F4F9F5',
  bgDeep:      '#EBF5EE',
  border:      '#D4E8D7',
  borderSoft:  '#E8F4EA',
  shadowXs:    '0 1px 4px rgba(26,46,26,0.05)',
  shadowSm:    '0 2px 10px rgba(26,46,26,0.06)',
  shadowMd:    '0 6px 24px rgba(26,46,26,0.09)',
  shadowLg:    '0 12px 40px rgba(26,46,26,0.12)',
  shadowGreen: '0 6px 24px rgba(45,106,79,0.18)',
  /* accents */
  amber:       '#D97706', amberLight: '#FFFBEB',
  violet:      '#7C3AED', violetLight:'#F5F3FF',
  sidebarW:    '240px',
};

/* ── Icons ── */
const IcoPath   = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>;
const IcoTrophy = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const IcoChart  = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
const IcoBook   = ({ size=16, color='currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;

/* ── StepRow ── */
const StepRow = ({ unit, onClick, completedTasks, index, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const isLocked    = unit.status === 'locked';
  const isCompleted = unit.status === 'completed';
  const isAvailable = unit.status === 'available';
  const tasks = unit.tasks || [];
  const mcqs  = unit.mcqs  || [];
  const word  = unit.isChapterLevel ? 'questions' : 'tasks';

  const statusColor = isCompleted ? G.green    : isAvailable ? G.greenMid : G.text4;
  const statusBg    = isCompleted ? G.greenSoft : isAvailable ? G.sageDim  : G.bgDeep;
  const statusLabel = isCompleted ? 'Completed' : isAvailable ? 'In Progress' : 'Locked';

  return (
    <motion.div
      style={{ display: 'flex', alignItems: 'stretch' }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: index * 0.05 }}
    >
      {/* Timeline spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 50, flexShrink: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0, zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isCompleted ? G.green : isAvailable ? G.greenSoft : G.bgDeep,
          border: isAvailable ? `2.5px solid ${G.green}` : isCompleted ? 'none' : `1.5px solid ${G.border}`,
          boxShadow: isCompleted
            ? '0 4px 14px rgba(45,106,79,0.35)'
            : isAvailable
            ? `0 0 0 5px rgba(45,106,79,0.1), 0 3px 14px rgba(45,106,79,0.2)`
            : 'none',
        }}>
          {isCompleted
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : isLocked
            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G.text4} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            : <span style={{ fontSize: 12, fontWeight: 800, color: G.green, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{unit.unit_number}</span>
          }
        </div>
        {!isLast && (
          <div style={{
            width: 2, flex: 1, minHeight: 16, borderRadius: 2, marginTop: 2,
            background: isCompleted ? G.green : G.borderSoft,
          }} />
        )}
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '0 0 16px 12px' }}>
        <div
          style={{
            borderRadius: 16, overflow: 'hidden',
            border: `1.5px solid ${isAvailable ? 'rgba(45,106,79,0.28)' : isCompleted ? G.greenLine : G.borderSoft}`,
            background: G.surface,
            boxShadow: isAvailable ? '0 5px 20px rgba(45,106,79,0.1)' : G.shadowXs,
            opacity: isLocked ? 0.6 : 1,
            cursor: isLocked ? 'default' : 'pointer',
            transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
          }}
          onClick={() => { if (!isLocked) setExpanded(v => !v); }}
          onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.boxShadow = G.shadowMd; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = isCompleted ? G.greenLine : G.greenLine; } }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = isAvailable ? '0 5px 20px rgba(45,106,79,0.1)' : G.shadowXs; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = isAvailable ? 'rgba(45,106,79,0.28)' : isCompleted ? G.greenLine : G.borderSoft; }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px 10px' }}>
            {/* Icon */}
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: statusBg }}>
              {isCompleted
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                : isAvailable
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={G.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.text4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{
                display: 'inline-block', fontSize: 8, fontWeight: 800, letterSpacing: '0.12em',
                textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20,
                background: statusBg, color: statusColor, marginBottom: 5,
              }}>{statusLabel}</span>
              <p style={{ fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: isLocked ? G.text4 : G.text1 }}>{unit.title}</p>
              <p style={{ fontSize: 11, color: G.text4, marginTop: 3 }}>{unit.taskCount} {word}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, paddingTop: 2 }}>
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 700, color: isLocked ? G.text4 : statusColor }}>{unit.unitPct ?? 0}%</span>
              {!isLocked && (
                <span style={{ display: 'flex', transition: 'transform 0.22s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.text4} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              )}
            </div>
          </div>

          {/* Mini progress bar */}
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{ height: 4, background: G.bgDeep, borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 99, background: isCompleted ? G.green : isAvailable ? `linear-gradient(90deg,${G.green},${G.greenLight})` : G.border }}
                initial={{ width: 0 }}
                animate={{ width: `${unit.unitPct ?? 0}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.05 + 0.2 }}
              />
            </div>
          </div>

          {/* Expanded tasks */}
          <AnimatePresence initial={false}>
            {expanded && !isLocked && (
              <motion.div key="exp" style={{ overflow: 'hidden' }} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                <div style={{ padding: '0 12px 12px' }}>
                  <div style={{ background: G.bg, borderRadius: 12, padding: '14px 16px', border: `1px solid ${G.borderSoft}` }}>
                    {unit.isChapterLevel
                      ? <p style={{ fontSize: 12, color: G.text3 }}>{mcqs.length} quiz questions in this chapter</p>
                      : tasks.length > 0 ? (
                        <>
                          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: G.text4, marginBottom: 10 }}>Tasks</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                            {tasks.map((t, i) => {
                              const done = completedTasks.includes(t.task_id || t.id);
                              return (
                                <div key={t.task_id || t.id || i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                  <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? G.green : G.surface, border: done ? 'none' : `1.5px solid ${G.border}` }}>
                                    {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 500, color: done ? G.text4 : G.text2, textDecoration: done ? 'line-through' : 'none' }}>{t.task_name || `Task ${i + 1}`}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : null
                    }
                    <button
                      style={{ width: '100%', padding: '11px 0', borderRadius: 11, background: G.green, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.15s', boxShadow: G.shadowGreen }}
                      onClick={e => { e.stopPropagation(); onClick(); }}
                      onMouseEnter={e => { e.currentTarget.style.background = G.greenMid; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = G.green; e.currentTarget.style.transform = ''; }}
                    >{isCompleted ? '← Review Unit' : 'Continue →'}</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Main Roadmap ── */
const Roadmap = () => {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData]       = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [progressPct, setProgressPct]       = useState(0);
  const [streak, setStreak]                 = useState({ current_streak: 0 });
  const [completedHours, setCompletedHours] = useState(0);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState('path');
  const [rankList, setRankList]             = useState([]);
  const [achievements, setAchievements]     = useState([]);
  const [resources, setResources]           = useState({ domain: '', videos: [] });

  useEffect(() => {
    (async () => {
      try {
        const ts = Date.now();
        const [rmRes, stRes] = await Promise.all([
          axiosInstance.get(`/user/roadmap?ts=${ts}`),
          axiosInstance.get(`/user/streak?ts=${ts}`),
        ]);
        if (rmRes.data?.success && (rmRes.data.data || rmRes.data.roadmap)) {
          const r = rmRes.data.data || rmRes.data.roadmap;
          let content = r.roadmap_content;
          if (typeof content === 'string') content = safeJsonParse(content, null, 'Roadmap-content');
          let normalized = {};
          if (content?.roadmap?.units)  normalized = content;
          else if (content?.units)      normalized = { roadmap: content, ui_metadata: content.ui_metadata };
          else                          normalized = { roadmap: { units: content || [] } };
          setRoadmapData(normalized);
          setCompletedTasks(Array.isArray(r.completed_tasks) ? r.completed_tasks : []);
          setProgressPct(r.progress_percentage ?? 0);
          setCompletedHours(Number(r.completed_hours) || 0);
        }
        if (stRes.data?.success) {
          const sp = stRes.data.data ?? stRes.data;
          setStreak({ current_streak: sp.current_streak ?? 0 });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (activeTab === 'rank')
      axiosInstance.get('/user/leaderboard').then(r => { if (r.data?.success) setRankList(r.data.data || []); }).catch(() => setRankList([]));
    else if (activeTab === 'achievements')
      axiosInstance.get('/user/achievements').then(r => { if (r.data?.success) setAchievements(r.data.data || []); }).catch(() => setAchievements([]));
    else if (activeTab === 'resources')
      axiosInstance.get('/user/resources').then(r => { if (r.data?.success) setResources(r.data.data || { domain: '', videos: [] }); }).catch(() => setResources({ domain: '', videos: [] }));
  }, [activeTab]);

  const units = useMemo(() => {
    const arr = roadmapData?.roadmap?.units || roadmapData?.units || [];
    if (!arr.length) return [];
    const configMap = new Map();
    const meta = roadmapData?.ui_metadata || roadmapData?.roadmap?.ui_metadata;
    if (meta?.node_config) meta.node_config.forEach(c => configMap.set(c.unit, c));
    const isChapterLevel = Array.isArray(arr[0]?.mcqs);
    return arr.map((unit, i) => {
      const config = configMap.get(unit.unit_number) || {};
      let allDone, prevDone, taskCount, doneCount;
      if (isChapterLevel) {
        const uid = `u${unit.unit_number}`;
        allDone   = completedTasks.includes(uid);
        prevDone  = i === 0 || completedTasks.includes(`u${arr[i - 1].unit_number}`);
        taskCount = (unit.mcqs || []).length;
        doneCount = allDone ? taskCount : 0;
      } else {
        const tl  = unit.tasks || [];
        doneCount = tl.filter(t => completedTasks.includes(t.task_id || t.id)).length;
        allDone   = tl.length > 0 && doneCount === tl.length;
        prevDone  = i === 0 || (arr[i - 1].tasks || []).every(t => completedTasks.includes(t.task_id || t.id));
        taskCount = tl.length;
      }
      let status = 'locked';
      if (allDone) status = 'completed';
      else if (prevDone) status = 'available';
      const unitPct = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : (allDone ? 100 : 0);
      return { ...unit, ...config, status, taskCount, doneCount, isChapterLevel, unitPct };
    });
  }, [roadmapData, completedTasks]);

  const handleNodeClick = (unit) => {
    if (unit.status === 'locked') return;
    if (unit.isChapterLevel && (unit.mcqs || []).length > 0) { navigate(`/roadmap/chapter/${unit.unit_number}`); return; }
    const tasks = unit.tasks || [];
    const first = tasks.find(t => !completedTasks.includes(t.task_id || t.id));
    if (first) navigate(`/roadmap/task/${first.task_id || first.id}`);
    else if (tasks.length) navigate(`/roadmap/task/${tasks[0].task_id || tasks[0].id}`);
  };

  const level    = Math.floor(progressPct / 25) + 1;
  const circ     = 2 * Math.PI * 20;
  const circB    = 2 * Math.PI * 24;

  const tabs = [
    { id: 'path',         label: 'Path',      Icon: IcoPath   },
    { id: 'achievements', label: 'Achieve',   Icon: IcoTrophy },
    { id: 'rank',         label: 'Rank',      Icon: IcoChart  },
    { id: 'resources',    label: 'Resources', Icon: IcoBook   },
  ];

  const card = {
    background: G.surface, border: `1px solid ${G.border}`,
    borderRadius: 16, boxShadow: G.shadowXs,
  };

  const SectionHdr = ({ dot, label, title, sub }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: dot + '18', border: `1px solid ${dot}28`, padding: '5px 12px', borderRadius: 99, marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'inline-block' }} />
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: dot }}>{label}</span>
      </div>
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: G.text1, margin: '0 0 4px', letterSpacing: '-0.02em' }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: G.text4 }}>{sub}</p>}
    </div>
  );

  const Empty = ({ icon, msg }) => (
    <div style={{ ...card, padding: '52px 24px', textAlign: 'center', border: `1.5px dashed ${G.border}` }}>
      <div style={{ width: 48, height: 48, background: G.bgDeep, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{icon}</div>
      <p style={{ fontSize: 13, color: G.text4, maxWidth: 280, margin: '0 auto', lineHeight: 1.75 }}>{msg}</p>
    </div>
  );

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${G.greenSoft}`, borderTopColor: G.green, animation: 'spin .7s linear infinite' }} />
      <p style={{ fontSize: 13, color: G.text4, fontWeight: 500 }}>Loading your journey…</p>
    </div>
  );

  /* ── Empty state ── */
  if (!roadmapData || units.length === 0) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&display=swap')`}</style>
      <div style={{ ...card, borderRadius: 24, padding: '52px 36px', textAlign: 'center', maxWidth: 380, width: '100%', boxShadow: G.shadowMd }}>
        <div style={{ width: 60, height: 60, background: G.greenMist, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', border: `1px solid ${G.greenLine}` }}>
          <IcoPath size={24} color={G.green} />
        </div>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: G.text1, margin: '0 0 12px', letterSpacing: '-0.02em' }}>No active path yet</h2>
        <p style={{ fontSize: 14, color: G.text3, margin: '0 0 28px', lineHeight: 1.75 }}>Complete your assessment to generate a personalised roadmap tailored to your goals and timeline.</p>
        <button
          style={{ width: '100%', padding: '13px', borderRadius: 13, background: G.green, color: '#fff', fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: G.shadowGreen, transition: 'all 0.15s' }}
          onClick={() => navigate('/questionnaire')}
          onMouseEnter={e => { e.currentTarget.style.background = G.greenMid; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = G.green; e.currentTarget.style.transform = ''; }}
        >Start Assessment →</button>
      </div>
    </div>
  );

  /* ── Main render ── */
  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text1, fontFamily: "'Plus Jakarta Sans',sans-serif", WebkitFontSmoothing: 'antialiased', paddingBottom: 'calc(env(safe-area-inset-bottom)+80px)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @media(max-width:640px) {
          .rm-sb { display: none !important; }
          .rm-ct { margin-left: 0 !important; }
          .rm-mt { display: flex !important; }
          .rm-bn { display: flex !important; }
        }
        @media(min-width:641px) {
          .rm-mt { display: none !important; }
          .rm-bn { display: none !important; }
        }
        .rm-nav-btn:hover { background: ${G.greenMist} !important; color: ${G.green} !important; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Sidebar ── */}
        <aside className="rm-sb" style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: G.sidebarW,
          background: G.surface, borderRight: `1px solid ${G.border}`,
          display: 'flex', flexDirection: 'column',
          paddingTop: 'calc(env(safe-area-inset-top) + 76px)',
          zIndex: 40,
        }}>
          {/* Domain header */}
          <div style={{ padding: '0 18px 18px', borderBottom: `1px solid ${G.borderSoft}`, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: G.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: G.text4, marginBottom: 2 }}>Active Roadmap</p>
                <p style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 600, color: G.text1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {roadmapData.roadmap?.domain || 'Career Path'}
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} className="rm-nav-btn" style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13,
                fontWeight: activeTab === id ? 700 : 600,
                color: activeTab === id ? G.green : G.text3,
                background: activeTab === id ? G.sageDim : 'transparent',
                transition: 'all 0.15s', textAlign: 'left',
              }}>
                <Icon size={14} color={activeTab === id ? G.green : G.text4} />
                {label}
                {activeTab === id && <span style={{ width: 5, height: 5, borderRadius: '50%', background: G.green, marginLeft: 'auto' }} />}
              </button>
            ))}
          </nav>

          {/* Progress widget */}
          <div style={{ margin: 'auto 12px 24px', background: G.bg, border: `1px solid ${G.border}`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ position: 'relative', width: 46, height: 46, flexShrink: 0 }}>
                <svg width="46" height="46" viewBox="0 0 46 46" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="23" cy="23" r="20" fill="none" stroke={G.borderSoft} strokeWidth="4" />
                  <motion.circle cx="23" cy="23" r="20" fill="none" stroke={G.green} strokeWidth="4" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - progressPct / 100) }} transition={{ duration: 1.3, ease: 'easeOut' }} />
                </svg>
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontSize: 10, fontWeight: 700, color: G.green }}>{progressPct}%</span>
              </div>
              <div>
                <p style={{ fontFamily: "'Fraunces',serif", fontSize: 12, fontWeight: 600, color: G.text1 }}>Progress</p>
                <p style={{ fontSize: 11, color: G.text4, marginTop: 2 }}>{Number(completedHours).toFixed(1)}h / {HOURS_GOAL}h</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[['Streak', `${streak.current_streak}d`, G.amber], ['Level', `Lv.${level}`, G.violet], ['Done', units.filter(u => u.status === 'completed').length, G.green], ['Total', units.length, G.text3]].map(([k, v, c]) => (
                <div key={k} style={{ background: G.surface, border: `1px solid ${G.borderSoft}`, borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: c || G.text1 }}>{v}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: G.text4, marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="rm-ct" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: G.sidebarW, minWidth: 0 }}>

          {/* Sticky header */}
          <header style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'rgba(244,249,245,0.92)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${G.border}`,
          }}>
            <div style={{ maxWidth: 740, margin: '0 auto', padding: '14px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: G.text1, lineHeight: 1.2, letterSpacing: '-0.02em' }}>Learning Path</p>
                  <p style={{ fontSize: 11, color: G.text4, marginTop: 2 }}>{roadmapData.roadmap?.domain || 'Career Path'}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { label: `🔥 ${streak.current_streak}d`,  bg: G.amberLight,   color: G.amber  },
                    { label: `${progressPct}% done`,           bg: G.sageDim,      color: G.green  },
                    { label: `Lv.${level}`,                    bg: G.violetLight,  color: G.violet },
                  ].map(({ label, bg, color }) => (
                    <span key={label} style={{ padding: '5px 11px', borderRadius: 99, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', background: bg, color }}>{label}</span>
                  ))}
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                <div style={{ flex: 1, height: 5, background: G.bgDeep, borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: `linear-gradient(90deg,${G.green},${G.greenLight})`, borderRadius: 99 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                  />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: G.text4, whiteSpace: 'nowrap' }}>{Number(completedHours).toFixed(1)}h / {HOURS_GOAL}h</span>
              </div>
            </div>

          </header>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ maxWidth: 740, margin: '0 auto', padding: '28px 24px 100px' }}>

              {/* ── PATH TAB ── */}
              {activeTab === 'path' && (
                <>
                  {/* Summary banner */}
                  <div style={{ background: G.green, borderRadius: 20, padding: '22px 24px', marginBottom: 24, color: '#fff', display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 28px rgba(45,106,79,0.28)' }}>
                    <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', right: -40, top: -50, pointerEvents: 'none' }} />
                    {/* Ring */}
                    <div style={{ position: 'relative', flexShrink: 0, zIndex: 1 }}>
                      <svg width="58" height="58" viewBox="0 0 58 58" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="29" cy="29" r="24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="5" />
                        <motion.circle cx="29" cy="29" r="24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray={circB} initial={{ strokeDashoffset: circB }} animate={{ strokeDashoffset: circB * (1 - progressPct / 100) }} transition={{ duration: 1.4, ease: 'easeOut' }} />
                      </svg>
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces',serif", fontSize: 11, fontWeight: 700, color: '#fff' }}>{progressPct}%</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                      <p style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.01em', color: '#fff' }}>
                        {units.filter(u => u.status === 'completed').length} of {units.length} steps completed
                      </p>
                      <p style={{ fontSize: 12, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: '#fff' }}>
                        {units.find(u => u.status === 'available')?.title
                          ? `Up next: ${units.find(u => u.status === 'available').title}`
                          : '🎉 All steps completed!'}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '7px 16px', fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 700, position: 'relative', zIndex: 1, border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                      Lv.{level}
                    </div>
                  </div>

                  {/* Step list */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {units.map((unit, i) => (
                      <StepRow key={unit.unit_number} unit={unit} onClick={() => handleNodeClick(unit)} completedTasks={completedTasks} index={i} isLast={i === units.length - 1} />
                    ))}
                  </div>
                </>
              )}

              {/* ── ACHIEVEMENTS TAB ── */}
              {activeTab === 'achievements' && (
                <div>
                  <SectionHdr dot={G.amber} label="Progress" title="Achievements" sub="Complete milestones to unlock badges" />
                  {achievements.length === 0
                    ? <Empty icon={<IcoTrophy size={20} color={G.text4} />} msg="Complete tasks to earn achievements. Reach 50% progress for 'Halfway There'!" />
                    : (
                      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
                        {achievements.map((a, i) => (
                          <motion.div key={i} style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 13, background: G.amberLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: G.amber }}>
                              {(a.title || a.achievement_type || 'A').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 600, color: G.text1 }}>{a.title || a.achievement_type}</p>
                              <p style={{ fontSize: 11, color: G.text4, marginTop: 2 }}>{a.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  }
                </div>
              )}

              {activeTab === 'rank' && (
                <div>
                  <SectionHdr dot={G.violet} label="Community" title="Leaderboard" sub="Ranked by learning streak" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rankList.map((r, i) => (
                      <motion.div key={r.id} style={{
                        ...card, padding: '14px 18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        borderColor: r.isCurrentUser ? 'rgba(45,106,79,0.3)' : G.border,
                        background: r.isCurrentUser ? G.greenMist : G.surface,
                        boxShadow: r.isCurrentUser ? '0 4px 18px rgba(45,106,79,0.14)' : G.shadowXs,
                      }} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                            background: r.rank <= 3 ? G.green : G.bgDeep,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'Fraunces',serif", fontSize: 13, fontWeight: 700,
                            color: r.rank <= 3 ? '#fff' : G.text4,
                          }}>
                            {r.rank <= 3 ? ['🥇','🥈','🥉'][r.rank - 1] : `#${r.rank}`}
                          </div>
                          <div>
                            <p style={{ fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 600, color: G.text1 }}>{r.name || 'User'}</p>
                            {r.isCurrentUser && <span style={{ fontSize: 9, padding: '2px 8px', background: G.greenSoft, color: G.green, borderRadius: 20, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>You</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: "'Fraunces',serif", fontSize: 15, fontWeight: 700, color: G.text1 }}>🔥 {r.streak || 0}</p>
                          <p style={{ fontSize: 11, color: G.text4, marginTop: 2 }}>Lv.{r.level || 1} • {r.completedSteps || 0} done</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── RESOURCES TAB ── */}
              {activeTab === 'resources' && (
                <div>
                  <SectionHdr dot={G.green} label="Learning" title="Resources" sub={`${resources.domain || 'General'} learning videos`} />
                  {(resources.videos || []).length === 0
                    ? <Empty icon={<IcoBook size={20} color={G.text4} />} msg="Complete your learning path to unlock personalised videos and resources." />
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {(resources.videos || []).map((v, i) => (
                          <motion.div key={i} style={{ ...card, borderRadius: 16, overflow: 'hidden' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.09 }}>
                            <div style={{ aspectRatio: '16/9', background: G.bgDeep }}>
                              <iframe title={v.title} src={v.url} style={{ width: '100%', height: '100%', display: 'block', border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                            </div>
                            <p style={{ padding: '14px 18px', fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 600, color: G.text1 }}>{v.title}</p>
                          </motion.div>
                        ))}
                      </div>
                    )
                  }
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="rm-bn" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: G.surface,
        borderTop: `1px solid ${G.border}`,
        boxShadow: G.shadowLg,
        zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'none',
      }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '10px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 9, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: activeTab === id ? G.green : G.text4,
            transition: 'color .15s', touchAction: 'manipulation',
          }}>
            <Icon size={16} color={activeTab === id ? G.green : G.text4} />
            {label}
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: G.green, marginTop: 1, opacity: activeTab === id ? 1 : 0, transition: 'opacity .15s' }} />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Roadmap;