import React, { useState, useEffect, useMemo } from 'react';
import { safeJsonParse } from "../utils/safeJsonParser";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Flame, Lock, CheckCircle2, BookOpen, Trophy, LayoutGrid, FileText, ChevronRight, Clock } from 'lucide-react';

const HOURS_GOAL = 40;

const RoadmapNode = ({ unit, onClick, completedTasks }) => {
  const isLocked = unit.status === 'locked';
  const isCompleted = unit.status === 'completed';
  const word = unit.isChapterLevel ? 'questions' : 'tasks';
  const tasks = unit.tasks || [];
  const mcqs = unit.mcqs || [];

  return (
    <button
      type="button"
      onClick={() => !isLocked && onClick()}
      disabled={isLocked}
      className={`
        w-full text-left rounded-xl p-4 sm:p-5 border transition-all
        ${isLocked
          ? 'bg-slate-50 border-slate-200 opacity-75'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md active:scale-[0.99]'
        }
      `}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full">
          {isLocked ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <Lock className="w-4 h-4 text-slate-500" />
            </div>
          ) : isCompleted ? (
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: unit.color }}
            >
              {unit.unit_number}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm sm:text-base ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
            {unit.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-md ${
              isCompleted ? 'bg-teal-100 text-teal-700' :
              isLocked ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-700'
            }`}>
              {isCompleted ? 'Done' : isLocked ? 'Locked' : 'Next'}
            </span>
            <span className="text-xs text-slate-500">{unit.taskCount} {word}</span>
          </div>
          {unit.isChapterLevel ? (
            <p className="text-xs text-slate-500 mt-2">{mcqs.length} quiz questions</p>
          ) : tasks.length > 0 && (
            <ul className="mt-2 space-y-1">
              {tasks.map((t, i) => {
                const done = completedTasks.includes(t.task_id || t.id);
                return (
                  <li key={t.task_id || t.id || i} className={`text-xs flex items-center gap-2 ${done ? 'text-teal-600' : 'text-slate-500'}`}>
                    {done ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />}
                    <span className={done ? 'line-through' : ''}>{t.task_name || `Task ${i + 1}`}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${unit.unitPct ?? 0}%`,
                backgroundColor: isLocked ? '#94A3B8' : unit.color,
              }}
            />
          </div>
        </div>
        {!isLocked && <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />}
      </div>
    </button>
  );
};

const Roadmap = () => {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [progressPct, setProgressPct] = useState(0);
  const [streak, setStreak] = useState({ current_streak: 0, last_activity_date: null });
  const [completedHours, setCompletedHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('path');
  const [rankList, setRankList] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [resources, setResources] = useState({ domain: '', videos: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ts = Date.now();
        const [roadmapRes, streakRes] = await Promise.all([
          axiosInstance.get(`/user/roadmap?ts=${ts}`),
          axiosInstance.get(`/user/streak?ts=${ts}`)
        ]);

        if (roadmapRes.data?.success && (roadmapRes.data.data || roadmapRes.data.roadmap)) {
          const r = roadmapRes.data.data || roadmapRes.data.roadmap;
          let content = r.roadmap_content;
          if (typeof content === 'string') {
            content = safeJsonParse(content, null, 'Roadmap-content');
          }
          let normalized = {};
          if (content?.roadmap?.units) {
            normalized = content;
          } else if (content?.units) {
            normalized = { roadmap: content, ui_metadata: content.ui_metadata };
          } else {
            normalized = { roadmap: { units: content || [] } };
          }
          setRoadmapData(normalized);
          setCompletedTasks(Array.isArray(r.completed_tasks) ? r.completed_tasks : []);
          setProgressPct(r.progress_percentage ?? 0);
          setCompletedHours(Number(r.completed_hours) || 0);
        }

        if (streakRes.data?.success) {
          const streakPayload = streakRes.data.data ?? streakRes.data;
          setStreak({
            current_streak: streakPayload.current_streak ?? 0,
            last_activity_date: streakPayload.last_activity_date ?? null,
          });
        }
      } catch (e) {
        console.error('Fetch data error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'rank') {
      axiosInstance.get('/user/rank').then(res => {
        if (res.data?.success) setRankList(res.data.data || []);
      }).catch(() => setRankList([]));
    } else if (activeTab === 'achievements') {
      axiosInstance.get('/user/achievements').then(res => {
        if (res.data?.success) setAchievements(res.data.data || []);
      }).catch(() => setAchievements([]));
    } else if (activeTab === 'resources') {
      axiosInstance.get('/user/resources').then(res => {
        if (res.data?.success) setResources(res.data.data || { domain: '', videos: [] });
      }).catch(() => setResources({ domain: '', videos: [] }));
    }
  }, [activeTab]);

  const units = useMemo(() => {
    const unitsArray = roadmapData?.roadmap?.units || roadmapData?.units || [];
    if (unitsArray.length === 0) return [];

    const configMap = new Map();
    const metadata = roadmapData?.ui_metadata || roadmapData?.roadmap?.ui_metadata;
    if (metadata?.node_config) {
      metadata.node_config.forEach(cfg => configMap.set(cfg.unit, cfg));
    }

    const isChapterLevel = unitsArray.length > 0 && Array.isArray(unitsArray[0].mcqs);

    return unitsArray.map((unit, index) => {
      const config = configMap.get(unit.unit_number) || {
        offset: index % 2 === 0 ? 'left' : 'right',
        color: '#4F46E5'
      };

      let allTasksCompleted;
      let isPreviousCompleted;
      let taskCount;
      let completedCount;

      if (isChapterLevel) {
        const unitId = `u${unit.unit_number}`;
        allTasksCompleted = completedTasks.includes(unitId);
        isPreviousCompleted = index === 0 || completedTasks.includes(`u${unitsArray[index - 1].unit_number}`);
        taskCount = (unit.mcqs || []).length;
        completedCount = allTasksCompleted ? taskCount : 0;
      } else {
        const taskList = unit.tasks || [];
        completedCount = taskList.filter(t => completedTasks.includes(t.task_id || t.id)).length;
        allTasksCompleted = taskList.length > 0 && completedCount === taskList.length;
        isPreviousCompleted = index === 0 || (unitsArray[index - 1].tasks || []).every(t => completedTasks.includes(t.task_id || t.id));
        taskCount = taskList.length;
      }

      let status = 'locked';
      if (allTasksCompleted) status = 'completed';
      else if (isPreviousCompleted) status = 'available';

      const unitPct = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : (allTasksCompleted ? 100 : 0);
      return { ...unit, ...config, status, taskCount, completedCount, isChapterLevel, unitPct };
    });
  }, [roadmapData, completedTasks]);

  const handleNodeClick = (unit) => {
    if (unit.status === 'locked') return;
    if (unit.isChapterLevel && (unit.mcqs || []).length > 0) {
      navigate(`/roadmap/chapter/${unit.unit_number}`);
      return;
    }
    const tasks = unit.tasks || [];
    const firstUncompleted = tasks.find(t => !completedTasks.includes(t.task_id || t.id));
    if (firstUncompleted) {
      navigate(`/roadmap/task/${firstUncompleted.task_id || firstUncompleted.id}`);
    } else if (tasks.length > 0) {
      navigate(`/roadmap/task/${tasks[0].task_id || tasks[0].id}`);
    }
  };

  const level = Math.floor(progressPct / 25) + 1;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center px-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent mx-auto" />
        <p className="mt-3 text-slate-600 text-sm">Loading your path...</p>
      </div>
    </div>
  );

  if (!roadmapData || units.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm text-center max-w-sm w-full border border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">No active path</h2>
          <p className="text-slate-500 text-sm sm:text-base mb-6">Start your assessment to generate a personalized roadmap.</p>
          <button
            onClick={() => navigate('/questionnaire')}
            className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            Start Journey
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'path', icon: BookOpen, label: 'Path' },
    { id: 'achievements', icon: Trophy, label: 'Achievements' },
    { id: 'rank', icon: LayoutGrid, label: 'Rank' },
    { id: 'resources', icon: FileText, label: 'Resources' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-6 flex flex-col">
      {/* Sidebar - desktop only */}
      <aside className="hidden sm:flex flex-col w-16 flex-shrink-0 bg-white border-r border-slate-100 fixed left-0 top-0 h-full z-20 pt-16">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg mx-2 transition-colors ${
              activeTab === id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </aside>

      <div className="flex-1 min-w-0 sm:ml-16 flex flex-col min-h-0 overflow-y-auto">
        {/* Sticky stats bar - streak, progress, level */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800">Your Path</h1>
                <span className="text-sm font-medium text-indigo-600">{roadmapData.roadmap?.domain || "Career Path"}</span>
                <p className="text-xs text-slate-500 mt-0.5">AI-generated learning path</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100" title="Consecutive days with at least one task completed">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-bold text-slate-800">{streak.current_streak}</span>
                  <span className="text-[10px] text-rose-600 hidden sm:inline">day streak</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-100">
                  <span className="text-sm font-bold text-slate-800">Lv.{level}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100">
                  <span className="text-sm font-bold text-indigo-600">{progressPct}%</span>
                </div>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {/* 40-hour learning goal */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {completedHours >= HOURS_GOAL ? (
                    <span className="text-teal-600 font-semibold">Goal achieved</span>
                  ) : (
                    <>{(completedHours | 0).toFixed(1)} / {HOURS_GOAL} hours</>
                  )}
                </span>
                {completedHours >= HOURS_GOAL && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium">40h done</span>
                )}
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((completedHours || 0) / HOURS_GOAL) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'path' && (
          <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 pb-24">
            <div className="relative">
              <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-slate-200 -ml-px" />
              <div className="space-y-4">
                {units.map((unit, index) => (
                  <div key={unit.unit_number} className="relative flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 z-10">
                      <div
                        className={`w-3 h-3 rounded-full border-2 ${
                          unit.status === 'completed'
                            ? 'bg-teal-500 border-teal-500'
                            : unit.status === 'locked'
                            ? 'bg-slate-200 border-slate-200'
                            : 'bg-white border-indigo-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <RoadmapNode
                        unit={unit}
                        onClick={() => handleNodeClick(unit)}
                        completedTasks={completedTasks}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 pb-24">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Your Achievements</h2>
            {achievements.length === 0 ? (
              <p className="text-slate-500">Complete tasks to earn achievements. Reach 50% of your roadmap for &quot;Halfway There&quot;!</p>
            ) : (
              <div className="space-y-3">
                {achievements.map((a, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                    <span className="text-3xl">{a.icon || '🏅'}</span>
                    <div>
                      <p className="font-semibold text-slate-800">{a.title || a.achievement_type}</p>
                      <p className="text-sm text-slate-500">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rank' && (
          <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 pb-24">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Leaderboard</h2>
            <p className="text-sm text-slate-500 mb-4">Ranked by quiz score (correct answers).</p>
            {rankList.length === 0 ? (
              <p className="text-slate-500">Complete quizzes to appear on the leaderboard.</p>
            ) : (
              <div className="space-y-2">
                {rankList.map((r, i) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      r.isCurrentUser ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-600 w-8">#{r.rank}</span>
                      <span className="font-medium text-slate-800">{r.name || 'User'}</span>
                      {r.isCurrentUser && <span className="text-xs px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded">You</span>}
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-800">{r.total_correct} pts</span>
                      <span className="text-xs text-slate-500 ml-1">({r.accuracy_pct}% acc)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 pb-24">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Resources</h2>
            <p className="text-sm text-slate-500 mb-4">YouTube videos for your domain: {resources.domain || 'General'}</p>
            <div className="space-y-4">
              {(resources.videos || []).map((v, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <iframe
                    title={v.title}
                    src={v.url}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <p className="p-3 text-sm font-medium text-slate-700">{v.title}</p>
                </div>
              ))}
            </div>
            {(resources.videos || []).length === 0 && (
              <p className="text-slate-500">No resources yet. Complete your path to get personalized videos.</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav - mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 sm:hidden z-20">
        <div className="flex justify-around py-2">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-lg transition-colors ${
                activeTab === id ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Roadmap;
