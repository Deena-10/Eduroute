// frontend/src/pages/Roadmap.jsx
import React, { useState, useEffect, useContext } from 'react';
import { safeJsonParse } from "../utils/safeJsonParser";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

// Flatten phases/topics/tasks into one ordered list for progressive unlock
function flattenTasks(phases) {
  if (!Array.isArray(phases)) return [];
  const list = [];
  phases
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((phase) => {
      (phase.topics || [])
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .forEach((topic) => {
          (topic.tasks || []).forEach((t) => {
            list.push({
              ...t,
              phaseName: phase.name,
              topicTitle: topic.title,
            });
          });
        });
    });
  return list;
}

// Build topic-grouped sections for optional headers — exactly as stored in DB
function buildTopicGroups(phases) {
  if (!Array.isArray(phases)) return [];
  const groups = [];
  phases
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((phase) => {
      (phase.topics || [])
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .forEach((topic) => {
          const tasks = (topic.tasks || []).map((t) => ({
            ...t,
            phaseName: phase.name,
            topicTitle: topic.title,
          }));
          if (tasks.length > 0) {
            groups.push({
              phaseName: phase.name,
              topicTitle: topic.title,
              tasks,
            });
          }
        });
    });
  return groups;
}

const Roadmap = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [userRoadmap, setUserRoadmap] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0, last_activity_date: null });
  const [roadmapLoading, setRoadmapLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axiosInstance.get('/user/roadmap');
        if (res.data.success && res.data.roadmap) {
          const r = res.data.roadmap;
          let content = r.roadmap_content;
          if (typeof content === 'string') {
            content = safeJsonParse(content, null, 'Roadmap-roadmap_content');
          }
          if (content && content.phases) {
            setUserRoadmap(content);
            setCompletedTasks(Array.isArray(r.completed_tasks) ? r.completed_tasks : []);
          }
        }
      } catch (e) {
        console.error('Fetch roadmap error:', e);
      } finally {
        setRoadmapLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await axiosInstance.get('/user/streak');
        if (res.data.success) {
          setStreak({
            current_streak: res.data.current_streak ?? 0,
            last_activity_date: res.data.last_activity_date ?? null,
          });
        }
      } catch (e) {
        console.error('Fetch streak error:', e);
      }
    };
    fetchStreak();
  }, []);

  const flatTasks = userRoadmap ? flattenTasks(userRoadmap.phases || []) : [];
  const topicGroups = userRoadmap ? buildTopicGroups(userRoadmap.phases || []) : [];
  const weeklyRecaps = userRoadmap?.weeklyRecaps || [];
  const totalTaskCount = flatTasks.length;

  // Map task id -> flat index for unlock logic (previous task in flat order must be completed)
  const taskIdToFlatIndex = React.useMemo(() => {
    const m = new Map();
    flatTasks.forEach((t, i) => m.set(t.id, i));
    return m;
  }, [flatTasks]);


  const handleResetRoadmap = async () => {
    if (!window.confirm('Reset your roadmap? You can create a new one and choose a different domain.')) return;
    try {
      await axiosInstance.delete('/user/roadmap');
      navigate('/', { replace: true });
      window.location.reload();
    } catch (e) {
      console.error('Reset roadmap error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ backgroundColor: '#ffffff' }}>
      <div className="flex flex-col min-h-screen max-w-2xl mx-auto">
        {roadmapLoading && (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-sky-300/80">Loading your skill map...</p>
          </div>
        )}
          {!roadmapLoading && !userRoadmap && (
            <div className="constellation-card rounded-2xl p-8 text-center max-w-sm">
              <p className="text-gray-400 mb-4">You don’t have an active roadmap. Create one to unlock levels.</p>
              <button
                type="button"
                onClick={() => navigate('/questionnaire')}
                className="constellation-btn"
              >
                Create roadmap
              </button>
            </div>
          )}
          {!roadmapLoading && userRoadmap && flatTasks.length > 0 && (
          <>
            <header className="flex-shrink-0 py-4 px-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Learning roadmap</h1>
                <p className="text-gray-600 text-sm">{userRoadmap.domain}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <span className="font-semibold text-amber-600">{streak.current_streak}</span>
                <span>day streak</span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="relative flex flex-col" style={{ paddingLeft: '2rem', borderLeft: '3px solid #cbd5e1' }}>
                {flatTasks.map((task, index) => {
                  const isCompleted = completedTasks.includes(task.id);
                  const isUnlocked = index === 0 || completedTasks.includes(flatTasks[index - 1]?.id);
                  const canStart = isUnlocked && !isCompleted && (task.mcqs && task.mcqs.length > 0);
                  const taskNumber = index + 1;
                  const showTopicHeader = index === 0 || (flatTasks[index - 1] && flatTasks[index - 1].topicTitle !== task.topicTitle);
                  return (
                    <React.Fragment key={task.id}>
                      {showTopicHeader && (
                        <div className="flex items-center gap-3 py-2" style={{ marginLeft: '-1.5rem' }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" style={{ marginLeft: '0.4rem' }} />
                          <div>
                            <h2 className="text-sm font-bold text-gray-800">{task.topicTitle}</h2>
                            <p className="text-xs text-gray-500">{task.phaseName}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 py-2" style={{ marginLeft: '-1.5rem' }}>
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2"
                          style={{
                            borderColor: !isUnlocked ? '#d1d5db' : isCompleted ? '#22c55e' : canStart ? '#2563eb' : '#d1d5db',
                            backgroundColor: !isUnlocked ? '#f3f4f6' : isCompleted ? '#dcfce7' : canStart ? '#eff6ff' : '#f3f4f6',
                          }}
                        >
                          <button
                            type="button"
                            onClick={canStart ? () => navigate(`/roadmap/task/${task.id}`) : undefined}
                            disabled={!canStart}
                            className="w-full h-full rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed"
                            aria-label={canStart ? task.title : 'Locked'}
                          >
                            {!isUnlocked && <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                            {isCompleted && <span className="text-green-600 font-bold">✓</span>}
                            {(isUnlocked && !isCompleted) && <span className="text-sm font-bold text-gray-800">{taskNumber}</span>}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={canStart ? () => navigate(`/roadmap/task/${task.id}`) : undefined}
                          disabled={!canStart}
                          className="flex-1 min-w-0 text-left py-2 rounded-lg transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <span className="font-medium text-gray-900 block truncate" title={task.title}>{task.title}</span>
                          <span className="text-xs text-gray-500">Task {taskNumber}</span>
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              {weeklyRecaps.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Weekly recaps</h3>
                  <div className="space-y-2">
                    {weeklyRecaps.slice(0, 5).map((recap) => (
                      <div key={recap.weekNumber} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 text-sm">Week {recap.weekNumber}</h4>
                        {recap.importantQuestions?.length > 0 && <p className="text-xs text-gray-600 mt-1">{recap.importantQuestions.join(' · ')}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <footer className="flex-shrink-0 py-3 px-4 border-t border-gray-200 text-center">
              <button type="button" onClick={handleResetRoadmap} className="text-xs text-gray-500 hover:text-red-600">Reset roadmap</button>
            </footer>
          </>
          )}
        {!roadmapLoading && userRoadmap && flatTasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-gray-500">No tasks in this roadmap yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmap;
