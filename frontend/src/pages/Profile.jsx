// frontend/src/pages/Profile.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { safeJsonParse } from "../utils/safeJsonParser";

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
  violet: '#7C3AED', violetLight: '#F5F3FF',
  rose: '#E11D48', roseLight: '#FFF1F2',
};

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [streak, setStreak] = useState({ current_streak: 0, last_activity_date: null });
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [profile, setProfile] = useState(null);
  const [streakSnapshots, setStreakSnapshots] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    axiosInstance.get('/user/streak').then(res => {
      const d = res.data?.data ?? res.data;
      if (res.data?.success) setStreak({ current_streak: d.current_streak ?? 0, last_activity_date: d.last_activity_date ?? null });
    }).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    axiosInstance.get('/user/profile').then(res => {
      const p = res.data?.data ?? res.data;
      if (p) { setProfile(p); setStreakSnapshots(Array.isArray(p.streak_snapshots) ? p.streak_snapshots : []); }
    }).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    axiosInstance.get('/user/roadmap').then(res => {
      const r = res.data?.data ?? res.data?.roadmap;
      setCurrentRoadmap(res.data?.success && r ? r : null);
    }).catch(() => setCurrentRoadmap(null));
  }, []);

  useEffect(() => {
    axiosInstance.get('/user/profile/dashboard').then(res => {
      const d = res.data?.data ?? res.data;
      if (res.data?.success && d) {
        setDashboard(d);
        if (d.profile?.streak_snapshots?.length) setStreakSnapshots(Array.isArray(d.profile.streak_snapshots) ? d.profile.streak_snapshots : []);
      }
    }).catch(e => console.error(e));
  }, []);

  const lessonsCompleted = currentRoadmap?.completed_tasks?.length ?? 0;
  const totalLessons     = currentRoadmap?.total_task_count ?? 0;
  const totalHours       = Number(currentRoadmap?.completed_hours) ?? 0;
  const completionRatePct = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  const interestsList = (() => {
    const raw = profile?.interests ?? user?.interests;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') { try { const a = JSON.parse(raw); return Array.isArray(a) ? a : []; } catch { return []; } }
    return [];
  })();

  const domainName = (() => {
    if (currentRoadmap?.domain) return currentRoadmap.domain;
    const content = currentRoadmap?.roadmap_content ?? currentRoadmap?.roadmap;
    const c = typeof content === 'string' ? safeJsonParse(content, null, 'Profile-domain') : content;
    return c?.roadmap?.domain || c?.domain || null;
  })();

  const ov = dashboard?.overview;
  const skillsList        = dashboard?.skills ?? [];
  const achievementsList  = dashboard?.achievements ?? [];
  const recentActivityList = dashboard?.recentActivity ?? [];

  const userData = {
    username: dashboard?.profile?.name ?? profile?.name ?? profile?.user_name ?? user?.name ?? 'User',
    email:    dashboard?.profile?.email ?? profile?.email ?? profile?.user_email ?? user?.email ?? '',
    domain:   domainName,
    interests: dashboard?.profile?.interests ?? interestsList,
    lessonsCompleted: ov?.lessonsCompleted ?? lessonsCompleted,
    totalLessons:     ov?.totalLessons ?? totalLessons,
    totalHours:       ov?.totalHours ?? totalHours,
    completionRatePct: ov?.completionRatePct ?? completionRatePct,
    skillsCount:  ov?.skillsCount ?? skillsList.length,
    quizAccuracy: ov?.quizAccuracy ?? 0,
    skills:        skillsList,
    achievements:  achievementsList,
    recentActivity: recentActivityList,
  };

  const tabs = [
    { id: 'overview',      label: 'Overview'         },
    { id: 'skills',        label: 'Skills Analytics' },
    { id: 'achievements',  label: 'Achievements'     },
    { id: 'activity',      label: 'Recent Activity'  },
  ];

  const Card = ({ children, style = {} }) => (
    <div style={{ background: G.surface, borderRadius: 18, border: `1px solid ${G.border}`, boxShadow: G.shadowSm, padding: 24, ...style }}>
      {children}
    </div>
  );

  const StatTile = ({ value, label, color = G.green }) => (
    <div style={{ textAlign: 'center', padding: '16px 12px', background: G.bg, borderRadius: 14, border: `1px solid ${G.borderSoft}` }}>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: G.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>{label}</div>
    </div>
  );

  const skillBarColor = (cat) => {
    const map = { Programming: G.green, Frontend: G.greenMid, Backend: G.violet, Database: G.greenLight, Tools: G.amber, DevOps: G.greenMid, Learned: G.green, Learning: G.greenMid, Domain: G.violet };
    return map[cat] || G.green;
  };

  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Plus Jakarta Sans',sans-serif", color: G.text1, WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');
        @keyframes fadein { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flamePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        .pf-tab { padding: 8px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; border: 1px solid ${G.border}; cursor: pointer; transition: all 0.16s; font-family: 'Plus Jakarta Sans',sans-serif; background: ${G.surface}; color: ${G.text3}; }
        .pf-tab:hover { background: ${G.greenMist}; color: ${G.green}; border-color: ${G.greenLine}; }
        .pf-tab.active { background: ${G.green}; color: #fff; border-color: ${G.green}; box-shadow: ${G.shadowGreen}; }
        .pf-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid ${G.borderSoft}; }
        .pf-stat-row:last-child { border-bottom: none; }
        .pf-skill-card { border: 1px solid ${G.borderSoft}; border-radius: 12px; padding: 16px; background: ${G.bg}; transition: border-color 0.15s; }
        .pf-skill-card:hover { border-color: ${G.greenLine}; }
        .pf-achieve-card { border: 1px solid ${G.borderSoft}; border-radius: 14px; padding: 20px; text-align: center; background: ${G.bg}; transition: all 0.18s; }
        .pf-achieve-card:hover { border-color: ${G.greenLine}; background: ${G.greenMist}; box-shadow: ${G.shadowSm}; }
        .pf-activity-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid ${G.borderSoft}; border-radius: 12px; background: ${G.bg}; transition: border-color 0.15s; }
        .pf-activity-row:hover { border-color: ${G.greenLine}; }
        .pf-danger-btn { padding: 11px 20px; background: ${G.roseLight}; color: ${G.rose}; border: 1px solid #FECDD3; border-radius: 11px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: 'Plus Jakarta Sans',sans-serif; }
        .pf-danger-btn:hover { background: #FFE4E6; }
        .streak-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${G.amberLight}; border: 1.5px solid rgba(217,119,6,0.22); border-radius: 16px; padding: 14px 20px; min-width: 90px; flex-shrink: 0; }
        .streak-flame { font-size: 26px; line-height: 1; animation: flamePulse 2s ease-in-out infinite; display: block; }
        .streak-count { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: ${G.amber}; line-height: 1.1; }
        .streak-label { font-size: 10px; font-weight: 700; color: ${G.amber}; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 3px; opacity: 0.8; }
        @media (max-width: 600px) {
          .pf-hero-inner { flex-direction: column !important; }
          .streak-badge { flex-direction: row !important; gap: 10px; min-width: unset; width: 100%; justify-content: center; padding: 10px 16px; border-radius: 12px; }
          .streak-count { font-size: 22px !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '88px 24px 80px' }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: G.greenMid, background: G.sageDim, padding: '5px 13px', borderRadius: 99, border: `1px solid rgba(64,145,108,0.2)`, marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: G.greenLight, display: 'inline-block' }} />
            My Account
          </div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 700, letterSpacing: '-0.02em', color: G.text1, marginBottom: 6 }}>Profile</h1>
          <p style={{ fontSize: 14, color: G.text3 }}>Track your learning progress and achievements</p>
        </div>

        {/* ── Profile hero card — streak badge is now inside, top-right ── */}
        <Card style={{ marginBottom: 24 }}>
          {/* Top row: avatar+info on left, streak badge on right */}
          <div className="pf-hero-inner" style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>

            {/* Left: avatar + info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 0 }}>
              <div style={{ width: 72, height: 72, background: G.green, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: G.shadowGreen }}>
                <span style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 700, color: '#fff' }}>
                  {userData.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: G.text1, marginBottom: 3, letterSpacing: '-0.02em' }}>{userData.username}</h2>
                <p style={{ fontSize: 13, color: G.text3, marginBottom: 4 }}>{userData.email}</p>
                {userData.domain && (
                  <p style={{ fontSize: 12, color: G.green, fontWeight: 700, marginBottom: 10 }}>Domain: {userData.domain}</p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {userData.interests.map((interest, i) => (
                    <span key={i} style={{ padding: '4px 12px', background: G.sageDim, color: G.green, fontSize: 12, fontWeight: 700, borderRadius: 99, border: `1px solid ${G.greenLine}` }}>{interest}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: streak badge */}
            <div className="streak-badge">
              <span className="streak-flame">🔥</span>
              <span className="streak-count">{streak.current_streak}</span>
              <span className="streak-label">Day Streak</span>
            </div>

          </div>
        </Card>

        {/* ── Learning Domains card ── */}
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: G.text1, marginBottom: 6, letterSpacing: '-0.01em' }}>Learning Domains</h3>
          <p style={{ fontSize: 13, color: G.text3, marginBottom: 16, lineHeight: 1.65 }}>
            You learn one domain at a time. To start another domain, add it here. Your current roadmap stays until you reset it.
          </p>
          {currentRoadmap && (() => {
            let content = currentRoadmap.roadmap_content ?? currentRoadmap.roadmap;
            if (typeof content === 'string') content = safeJsonParse(content, null, 'Profile-roadmap_content');
            const dn = content?.roadmap?.domain || content?.domain || 'Your current domain';
            return (
              <div style={{ marginBottom: 16, padding: '14px 16px', background: G.greenMist, borderRadius: 12, border: `1px solid ${G.greenLine}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: G.text4, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Current active roadmap</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: G.text1, marginBottom: 6 }}>{dn}</p>
                <button onClick={() => navigate('/roadmap')} style={{ fontSize: 12, fontWeight: 700, color: G.green, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  Open roadmap →
                </button>
              </div>
            );
          })()}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              onClick={() => navigate('/questionnaire')}
              style={{ padding: '11px 20px', background: G.green, color: '#fff', borderRadius: 11, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: G.shadowGreen, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = G.greenMid; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = G.green; e.currentTarget.style.transform = ''; }}
            >Add new domain</button>
            {currentRoadmap && (
              <button
                className="pf-danger-btn"
                onClick={async () => {
                  if (!window.confirm('Reset your progress and generate a new journey?')) return;
                  try { await axiosInstance.delete('/user/roadmap'); setCurrentRoadmap(null); navigate('/questionnaire', { replace: true }); }
                  catch (e) { console.error('Reset error:', e); }
                }}
              >Reset journey</button>
            )}
          </div>
          <p style={{ fontSize: 11, color: G.text4, marginTop: 10, lineHeight: 1.6 }}>
            Reset journey clears your current roadmap and progress. Add new domain creates a fresh roadmap.
          </p>
        </Card>

        {/* ── Tab navigation ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {tabs.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`pf-tab${activeTab === id ? ' active' : ''}`}>{label}</button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ animation: 'fadein 0.3s ease both' }}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
              {/* Progress */}
              <div style={{ gridColumn: 'span 2' }}>
                <Card>
                  <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: G.text1, marginBottom: 20, letterSpacing: '-0.01em' }}>Learning Progress</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14 }}>
                    <StatTile value={userData.lessonsCompleted} label="Lessons Done" color={G.green} />
                    <StatTile value={`${userData.completionRatePct}%`} label="Completion" color={G.greenMid} />
                    <StatTile value={userData.totalHours} label="Hours Learned" color={G.violet} />
                    <StatTile value={userData.skillsCount} label="Skills Tracked" color={G.amber} />
                  </div>
                  {/* Overall progress bar */}
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: G.text3, marginBottom: 7 }}>
                      <span>Overall roadmap progress</span>
                      <span style={{ color: G.green }}>{userData.completionRatePct}%</span>
                    </div>
                    <div style={{ height: 8, background: G.bgDeep, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${userData.completionRatePct}%`, background: `linear-gradient(90deg,${G.green},${G.greenLight})`, borderRadius: 99, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick stats */}
              <Card>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: G.text1, marginBottom: 16, letterSpacing: '-0.01em' }}>Quick Stats</h3>
                <div>
                  {[
                    ['Current Streak',    `${streak.current_streak} days`],
                    ['Completion Rate',   `${userData.completionRatePct}%`],
                    ['Quiz Accuracy',     `${userData.quizAccuracy}%`],
                    ['Skills Mastered',   userData.skills.filter(s => s.level >= 80).length],
                  ].map(([label, val]) => (
                    <div key={label} className="pf-stat-row">
                      <span style={{ fontSize: 13, color: G.text3, fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: G.text1, fontFamily: "'Fraunces',serif" }}>{val}</span>
                    </div>
                  ))}
                  {streak.current_streak === 0 && (
                    <p style={{ fontSize: 11, color: G.text4, marginTop: 8 }}>Complete a task today to start your streak.</p>
                  )}
                  {streakSnapshots.length > 0 && (
                    <div style={{ marginTop: 14, padding: '12px 14px', background: G.greenMist, borderRadius: 11, border: `1px solid ${G.greenLine}` }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: G.green, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Streak History</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {streakSnapshots.slice(0, 7).map((s, i) => (
                          <span key={i} style={{ padding: '3px 9px', background: G.surface, border: `1px solid ${G.greenLine}`, borderRadius: 8, fontSize: 11, color: G.text2, fontWeight: 600 }}>
                            {s.date}: {s.streak}d
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* SKILLS */}
          {activeTab === 'skills' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Card>
                  <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: G.text1, marginBottom: 20, letterSpacing: '-0.01em' }}>Skills Analytics</h3>
                  {userData.skills.length === 0 ? (
                    <p style={{ fontSize: 14, color: G.text3, lineHeight: 1.75 }}>Complete the questionnaire and your roadmap to see skills tracked from your profile and domain.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                      {userData.skills.map((skill, i) => (
                        <div key={i} className="pf-skill-card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: G.text1 }}>{skill.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: G.text4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{skill.category}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                            <span style={{ color: G.text3, fontWeight: 600 }}>Progress</span>
                            <span style={{ fontWeight: 800, color: skillBarColor(skill.category), fontFamily: "'Fraunces',serif" }}>{skill.level}%</span>
                          </div>
                          <div style={{ height: 6, background: G.bgDeep, borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${skill.level}%`, background: skillBarColor(skill.category), borderRadius: 99, transition: 'width 1s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
              <Card>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: G.text1, marginBottom: 16, letterSpacing: '-0.01em' }}>Skills Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Mastered Skills',  userData.skills.filter(s => (s.level||0) >= 80).length,  G.green,    'score ≥ 80%'],
                    ['Advanced Skills',  userData.skills.filter(s => (s.level||0) >= 60 && (s.level||0) < 80).length, G.greenMid, '60–79%'],
                    ['Learning Skills',  userData.skills.filter(s => (s.level||0) < 60).length,   G.amber,    'score < 60%'],
                  ].map(([label, val, color, sub]) => (
                    <div key={label} style={{ padding: '14px 16px', background: G.bg, borderRadius: 12, border: `1px solid ${G.borderSoft}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, color, lineHeight: 1, flexShrink: 0, width: 40, textAlign: 'center' }}>{val}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: G.text1 }}>{label}</div>
                        <div style={{ fontSize: 11, color: G.text4 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <Card>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: G.text1, marginBottom: 20, letterSpacing: '-0.01em' }}>Achievements</h3>
              {userData.achievements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 24px', border: `1.5px dashed ${G.border}`, borderRadius: 14 }}>
                  <div style={{ width: 48, height: 48, background: G.bgDeep, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G.text4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  </div>
                  <p style={{ fontSize: 13, color: G.text4, maxWidth: 300, margin: '0 auto', lineHeight: 1.75 }}>Complete tasks to earn achievements. First task, 50% roadmap, and full roadmap completion unlock badges.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                  {userData.achievements.map((a, i) => (
                    <div key={i} className="pf-achieve-card">
                      <div style={{ width: 46, height: 46, borderRadius: 13, background: G.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: G.green }}>
                        {(a.title || a.achievement_type || 'A').charAt(0).toUpperCase()}
                      </div>
                      <h4 style={{ fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 700, color: G.text1, marginBottom: 5 }}>{a.title || a.achievement_type}</h4>
                      <p style={{ fontSize: 12, color: G.text3, lineHeight: 1.6, marginBottom: 6 }}>{a.desc}</p>
                      {a.achieved_at && <p style={{ fontSize: 10, color: G.text4 }}>{new Date(a.achieved_at).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ACTIVITY */}
          {activeTab === 'activity' && (
            <Card>
              <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: G.text1, marginBottom: 20, letterSpacing: '-0.01em' }}>Recent Activity</h3>
              {userData.recentActivity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 24px', border: `1.5px dashed ${G.border}`, borderRadius: 14 }}>
                  <p style={{ fontSize: 13, color: G.text4 }}>Complete tasks and earn achievements to see your activity here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {userData.recentActivity.map((activity, i) => (
                    <div key={i} className="pf-activity-row">
                      <div style={{ width: 38, height: 38, background: G.greenSoft, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 700, color: G.green }}>
                        {(activity.action || 'A').charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: G.text1 }}>{activity.action}</div>
                        <div style={{ fontSize: 12, color: G.text3, marginTop: 1 }}>{activity.title}</div>
                      </div>
                      <div style={{ fontSize: 11, color: G.text4, fontWeight: 600, flexShrink: 0 }}>{activity.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;