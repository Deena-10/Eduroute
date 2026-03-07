import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeJsonParse } from "../utils/safeJsonParser";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const HOURS_GOAL = 40;

/* ══════════════════════════════════════════
   STEP ROW  — the main unit card
══════════════════════════════════════════ */
const StepRow = ({ unit, onClick, completedTasks, index }) => {
  const [expanded, setExpanded] = useState(false);
  const isLocked    = unit.status === 'locked';
  const isCompleted = unit.status === 'completed';
  const isAvailable = unit.status === 'available';
  const word        = unit.isChapterLevel ? 'questions' : 'tasks';
  const tasks       = unit.tasks || [];
  const mcqs        = unit.mcqs  || [];

  const handleClick = () => {
    if (isLocked) return;
    // On mobile tap expands; clicking "Start" navigates
    setExpanded(v => !v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.055 }}
    >
      <div
        className="rounded-2xl overflow-hidden border transition-all duration-300"
        style={{
          borderColor: isAvailable ? '#1C74D9' : isCompleted ? '#dbeafe' : '#e8edf2',
          boxShadow: isAvailable
            ? '0 4px 20px rgba(28,116,217,0.13)'
            : isCompleted
            ? '0 2px 8px rgba(28,116,217,0.07)'
            : 'none',
          background: '#fff',
        }}
      >
        {/* ── MAIN ROW ── */}
        <button
          type="button"
          onClick={handleClick}
          disabled={isLocked}
          className="w-full text-left flex items-stretch focus:outline-none"
          style={{ cursor: isLocked ? 'default' : 'pointer' }}
        >
          {/* Left panel — big step number */}
          <div
            className="flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              width: 72,
              background: isCompleted
                ? '#1C74D9'
                : isAvailable
                ? 'rgba(28,116,217,0.07)'
                : '#f8fafc',
              borderRight: `1px solid ${isCompleted ? '#1557b0' : isAvailable ? 'rgba(28,116,217,0.15)' : '#f1f5f9'}`,
            }}
          >
            {isCompleted ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : isLocked ? (
              <svg className="w-5 h-5" style={{ color: '#cbd5e1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <span
                className="text-2xl font-black"
                style={{ color: isAvailable ? '#1C74D9' : '#94a3b8' }}
              >
                {unit.unit_number}
              </span>
            )}
            <span
              className="text-[9px] font-bold uppercase tracking-wider mt-1"
              style={{ color: isCompleted ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}
            >
              Step
            </span>
          </div>

          {/* Middle — title + meta */}
          <div className="flex-1 px-4 py-4 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {/* Status badge */}
                <span
                  className="inline-block text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-full mb-1.5"
                  style={{
                    background: isCompleted
                      ? '#dbeafe'
                      : isAvailable
                      ? 'rgba(28,116,217,0.1)'
                      : '#f1f5f9',
                    color: isCompleted
                      ? '#1C74D9'
                      : isAvailable
                      ? '#1C74D9'
                      : '#94a3b8',
                  }}
                >
                  {isCompleted ? 'Completed' : isAvailable ? 'Active' : 'Locked'}
                </span>
                <h3
                  className="font-bold text-sm leading-snug"
                  style={{ color: isLocked ? '#94a3b8' : '#0f172a' }}
                >
                  {unit.title}
                </h3>
                <p className="text-[11px] mt-1" style={{ color: '#94a3b8' }}>
                  {unit.taskCount} {word}
                </p>
              </div>

              {/* Chevron expand indicator (non-locked) */}
              {!isLocked && (
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 mt-1"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              )}
            </div>

            {/* Compact progress bar */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${unit.unitPct ?? 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.055 + 0.3 }}
                  style={{
                    background: isLocked ? '#e2e8f0' : 'linear-gradient(90deg,#1C74D9,#4fa3f7)',
                  }}
                />
              </div>
              <span
                className="text-[10px] font-bold flex-shrink-0 tabular-nums"
                style={{ color: isLocked ? '#cbd5e1' : '#1C74D9' }}
              >
                {unit.unitPct ?? 0}%
              </span>
            </div>
          </div>
        </button>

        {/* ── EXPANDED DETAILS ── */}
        <AnimatePresence initial={false}>
          {expanded && !isLocked && (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="mx-4 mb-4 rounded-xl p-4"
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
              >
                {/* Tasks list */}
                {unit.isChapterLevel ? (
                  <p className="text-xs text-slate-500">{mcqs.length} quiz questions in this chapter</p>
                ) : tasks.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tasks</p>
                    {tasks.map((t, i) => {
                      const done = completedTasks.includes(t.task_id || t.id);
                      return (
                        <div key={t.task_id || t.id || i} className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-sm flex-shrink-0 flex items-center justify-center"
                            style={{
                              background: done ? '#1C74D9' : '#fff',
                              border: done ? 'none' : '1.5px solid #cbd5e1',
                            }}
                          >
                            {done && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span
                            className="text-xs"
                            style={{
                              color: done ? '#94a3b8' : '#475569',
                              textDecoration: done ? 'line-through' : 'none',
                            }}
                          >
                            {t.task_name || `Task ${i + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => onClick()}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-98"
                  style={{ background: 'linear-gradient(90deg, #1C74D9, #0A3FAE)' }}
                >
                  {isCompleted ? 'Review' : 'Continue'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   CONNECTOR between steps
══════════════════════════════════════════ */
const StepConnector = ({ isCompleted }) => (
  <div className="flex justify-start pl-9 py-0.5">
    <div
      className="w-0.5 h-5"
      style={{
        background: isCompleted
          ? '#1C74D9'
          : '#e2e8f0',
      }}
    />
  </div>
);

/* ══════════════════════════════════════════
   MAIN ROADMAP
══════════════════════════════════════════ */
const Roadmap = () => {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData]       = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [progressPct, setProgressPct]       = useState(0);
  const [streak, setStreak]                 = useState({ current_streak: 0, last_activity_date: null });
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
          axiosInstance.get(`/user/streak?ts=${ts}`)
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
          setStreak({ current_streak: sp.current_streak ?? 0, last_activity_date: sp.last_activity_date ?? null });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (activeTab === 'rank') {
      axiosInstance.get('/user/rank').then(r => { if (r.data?.success) setRankList(r.data.data || []); }).catch(() => setRankList([]));
    } else if (activeTab === 'achievements') {
      axiosInstance.get('/user/achievements').then(r => { if (r.data?.success) setAchievements(r.data.data || []); }).catch(() => setAchievements([]));
    } else if (activeTab === 'resources') {
      axiosInstance.get('/user/resources').then(r => { if (r.data?.success) setResources(r.data.data || { domain: '', videos: [] }); }).catch(() => setResources({ domain: '', videos: [] }));
    }
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
      if (allDone)       status = 'completed';
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

  const level = Math.floor(progressPct / 25) + 1;

  const tabs = [
    { id: 'path',         label: 'Path',        Icon: PathIcon },
    { id: 'achievements', label: 'Achievements', Icon: TrophyIcon },
    { id: 'rank',         label: 'Leaderboard',  Icon: ChartIcon },
    { id: 'resources',    label: 'Resources',    Icon: BookIcon },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#1C74D9]/20 border-t-[#1C74D9] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading your journey</p>
      </div>
    </div>
  );

  if (!roadmapData || units.length === 0) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
         style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center max-w-sm w-full">
        <div className="w-14 h-14 rounded-xl bg-[#1C74D9]/8 mx-auto mb-6 flex items-center justify-center">
          <PathIcon active />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">No active path</h2>
        <p className="text-slate-500 text-sm mb-8">Start your assessment to generate a personalized roadmap.</p>
        <button onClick={() => navigate('/questionnaire')}
          className="w-full py-3 rounded-xl bg-[#1C74D9] text-white font-semibold text-sm hover:bg-[#0A3FAE] transition-colors">
          Start Journey
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F6F6F6]"
         style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }}>

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex flex-col w-60 flex-shrink-0 fixed left-0 top-0 h-full z-20 bg-white border-r border-slate-100"
             style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2rem)' }}>
        <div className="px-6 mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1C74D9] mb-1">EduRoute</p>
          <p className="text-sm font-bold text-slate-800 truncate">{roadmapData.roadmap?.domain || 'Career Path'}</p>
        </div>
        <nav className="flex flex-col gap-0.5 px-3">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === id ? 'rgba(28,116,217,0.07)' : 'transparent',
                color: activeTab === id ? '#1C74D9' : '#64748b',
              }}>
              <Icon active={activeTab === id} />
              {label}
            </button>
          ))}
        </nav>

        {/* Sidebar stats card */}
        <div className="mt-auto px-4 pb-8">
          <div className="rounded-2xl p-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
            {/* Progress ring-style display */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <motion.circle
                    cx="24" cy="24" r="20" fill="none"
                    stroke="#1C74D9" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progressPct / 100) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[#1C74D9]">
                  {progressPct}%
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Progress</p>
                <p className="text-xs text-slate-400">{(completedHours | 0).toFixed(1)}h / {HOURS_GOAL}h</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Streak', value: `${streak.current_streak}d` },
                { label: 'Level',  value: `${level}` },
                { label: 'Done',   value: `${units.filter(u => u.status === 'completed').length}` },
                { label: 'Total',  value: `${units.length}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl p-2.5 text-center border border-slate-100">
                  <p className="text-sm font-black text-slate-800">{value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 sm:ml-60">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-lg font-bold text-slate-800">Your Learning Path</h1>
                <p className="text-xs text-slate-400 mt-0.5">{roadmapData.roadmap?.domain || 'Career Path'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Chip label={`${streak.current_streak}d streak`} />
                <Chip label={`${progressPct}%`} highlight />
                <Chip label={`Lv.${level}`} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ background: 'linear-gradient(90deg,#1C74D9,#4fa3f7)' }} />
              </div>
              <span className="text-xs text-slate-400 font-medium flex-shrink-0">
                {(completedHours | 0).toFixed(1)}h / {HOURS_GOAL}h
              </span>
            </div>
          </div>
          <div className="sm:hidden flex border-t border-slate-100">
            {tabs.map(({ id, label, Icon }) => (
              <button key={id} type="button" onClick={() => setActiveTab(id)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors"
                style={{
                  color: activeTab === id ? '#1C74D9' : '#94a3b8',
                  borderTop: activeTab === id ? '2px solid #1C74D9' : '2px solid transparent',
                  marginTop: -1,
                }}>
                <Icon active={activeTab === id} />
                {label}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">

          {/* ══════════ STEP LADDER PATH ══════════ */}
          {activeTab === 'path' && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8 pb-28">

              {/* Summary strip */}
              <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-800">
                    {units.filter(u => u.status === 'completed').length} of {units.length} steps completed
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {units.find(u => u.status === 'available')?.title
                      ? `Up next: ${units.find(u => u.status === 'available').title}`
                      : 'All steps done!'}
                  </p>
                </div>
                <div
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                  style={{ background: '#1C74D9' }}
                >
                  {progressPct}%
                </div>
              </div>

              {/* Steps */}
              <div>
                {units.map((unit, i) => (
                  <div key={unit.unit_number}>
                    <StepRow
                      unit={unit}
                      onClick={() => handleNodeClick(unit)}
                      completedTasks={completedTasks}
                      index={i}
                    />
                    {i < units.length - 1 && (
                      <StepConnector isCompleted={unit.status === 'completed'} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ ACHIEVEMENTS ══ */}
          {activeTab === 'achievements' && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
              <SectionHeader title="Achievements" subtitle="Track your progress and earn badges" />
              {achievements.length === 0 ? (
                <EmptyState message='Complete tasks to earn achievements. Reach 50% for "Halfway There"!' />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {achievements.map((a, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1C74D9]/8 flex items-center justify-center">
                          <span className="font-black text-[#1C74D9]">
                            {(a.title || a.achievement_type || 'A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{a.title || a.achievement_type}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{a.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ RANK ══ */}
          {activeTab === 'rank' && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
              <SectionHeader title="Leaderboard" subtitle="Ranked by quiz score" />
              {rankList.length === 0 ? (
                <EmptyState message="Complete quizzes to appear on the leaderboard." />
              ) : (
                <div className="space-y-2">
                  {rankList.map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between px-5 py-4 rounded-2xl border bg-white transition-all"
                      style={{ borderColor: r.isCurrentUser ? '#1C74D9' : '#f1f5f9' }}>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-sm w-8 text-center tabular-nums"
                              style={{ color: r.rank <= 3 ? '#1C74D9' : '#cbd5e1' }}>
                          #{r.rank}
                        </span>
                        <span className="font-semibold text-slate-800 text-sm">{r.name || 'User'}</span>
                        {r.isCurrentUser && (
                          <span className="text-[10px] px-2 py-0.5 bg-[#1C74D9] text-white rounded-full font-bold">You</span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{r.total_correct} pts</span>
                        <span className="text-xs text-slate-400 ml-1.5">({r.accuracy_pct}%)</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ RESOURCES ══ */}
          {activeTab === 'resources' && (
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
              <SectionHeader title="Resources" subtitle={`${resources.domain || 'General'} learning videos`} />
              {(resources.videos || []).length === 0 ? (
                <EmptyState message="Complete your path to unlock personalized videos." />
              ) : (
                <div className="space-y-5">
                  {(resources.videos || []).map((v, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow">
                      <div className="aspect-video bg-slate-100">
                        <iframe title={v.title} src={v.url} className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                      <div className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">{v.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-3 left-3 right-3 bg-white rounded-2xl border border-slate-100 shadow-xl sm:hidden z-30"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-all touch-manipulation"
              style={{ color: activeTab === id ? '#1C74D9' : '#94a3b8' }}>
              <Icon active={activeTab === id} />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

/* ── HELPERS ── */
const Chip = ({ label, highlight }) => (
  <span className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
        style={{
          background: highlight ? 'rgba(28,116,217,0.09)' : '#f1f5f9',
          color: highlight ? '#1C74D9' : '#64748b',
        }}>
    {label}
  </span>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-50 mx-auto mb-4 flex items-center justify-center">
      <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p className="text-slate-400 text-sm max-w-xs mx-auto">{message}</p>
  </div>
);

const PathIcon = ({ active }) => (
  <svg className="w-4 h-4" style={{ color: active ? '#1C74D9' : 'currentColor' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4" />
  </svg>
);
const TrophyIcon = ({ active }) => (
  <svg className="w-4 h-4" style={{ color: active ? '#1C74D9' : 'currentColor' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15l-3 6h6l-3-6zm0 0V9m-4.5-3H5a2 2 0 000 4h1.5M16.5 6H19a2 2 0 010 4h-1.5M7.5 6h9" />
  </svg>
);
const ChartIcon = ({ active }) => (
  <svg className="w-4 h-4" style={{ color: active ? '#1C74D9' : 'currentColor' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const BookIcon = ({ active }) => (
  <svg className="w-4 h-4" style={{ color: active ? '#1C74D9' : 'currentColor' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

export default Roadmap;