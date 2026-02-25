import React, { useState, useEffect, useMemo } from 'react';
import { safeJsonParse } from "../utils/safeJsonParser";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const RoadmapNode = ({ unit, title, offset, color, status, onClick, taskCount, completedCount, isChapterLevel, unitPct }) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const word = isChapterLevel ? 'questions' : 'tasks';
  const taskLabel = taskCount != null
    ? (completedCount != null ? `${completedCount} of ${taskCount} ${word}` : `${taskCount} ${word}`)
    : null;

  return (
    <div className={`flex w-full ${offset === 'left' ? 'justify-start' : offset === 'right' ? 'justify-end' : 'justify-center'} my-12 relative`}>
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={!isLocked ? onClick : undefined}
          style={{
            backgroundColor: color,
            borderBottom: `6px solid rgba(0,0,0,0.2)`,
            boxShadow: isLocked ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          className={`w-24 h-24 rounded-full text-white font-bold text-2xl flex items-center justify-center
                     transition-all duration-300 relative z-10
                     ${isLocked ? 'grayscale opacity-50 cursor-not-allowed' : 'hover:scale-110 active:translate-y-1 hover:shadow-lg'}`}
          disabled={isLocked}
        >
          {isLocked ? '🔒' : isCompleted ? '✓' : unit}
        </button>
        <div className="mt-2 text-center max-w-[150px]">
          <span className={`text-sm font-bold block ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
            {title}
          </span>
          {taskLabel && (
            <span className={`text-xs block mt-0.5 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
              {taskLabel}
            </span>
          )}
          {unitPct != null && (
            <div className="mt-1 w-full max-w-[80px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${unitPct}%`, backgroundColor: color, opacity: isLocked ? 0.5 : 1 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Roadmap = () => {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [progressPct, setProgressPct] = useState(0);
  const [streak, setStreak] = useState({ current_streak: 0, last_activity_date: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ts = Date.now();
        const [roadmapRes, streakRes] = await Promise.all([
          axiosInstance.get(`/user/roadmap?ts=${ts}`),
          axiosInstance.get(`/user/streak?ts=${ts}`)
        ]);

        if (roadmapRes.data?.success && (roadmapRes.data.data || roadmapRes.data.roadmap)) {
          // Support both standardized { success, data } and older { success, roadmap } shapes
          const r = roadmapRes.data.data || roadmapRes.data.roadmap;
          let content = r.roadmap_content;
          
          if (typeof content === 'string') {
            content = safeJsonParse(content, null, 'Roadmap-content');
          }
          
          // --- STRUCTURAL SHIELD START ---
          // This ensures roadmapData.roadmap.units always exists
          let normalized = {};
          if (content?.roadmap?.units) {
            normalized = content;
          } else if (content?.units) {
            normalized = { roadmap: content, ui_metadata: content.ui_metadata };
          } else {
            // Fallback for unexpected formats
            normalized = { roadmap: { units: content || [] } };
          }
          // --- STRUCTURAL SHIELD END ---
          
          setRoadmapData(normalized);
          setCompletedTasks(Array.isArray(r.completed_tasks) ? r.completed_tasks : []);
          setProgressPct(r.progress_percentage ?? 0);
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

  const units = useMemo(() => {
    // Check for units in multiple possible locations
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
        color: '#3B82F6' 
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

  const handleReset = async () => {
    if (!window.confirm('Reset your progress and generate a new journey?')) return;
    try {
      await axiosInstance.delete('/user/roadmap');
      setRoadmapData(null);
      navigate('/questionnaire', { replace: true });
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Charting your journey...</p>
      </div>
    </div>
  );

  if (!roadmapData || units.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md w-full border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No active path</h2>
          <p className="text-gray-500 mb-8">Ready to embark on a new adventure? Start your assessment to generate a map.</p>
          <button onClick={() => navigate('/questionnaire')} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Start Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <header className="py-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Path</h1>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                {roadmapData.roadmap?.domain || "Career Path"}
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900">{streak.current_streak} Day</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Streak</p>
            </div>
          </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Domain progress</span>
              <span className="font-bold text-blue-600">{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </header>

        <div className="relative mt-8">
          <div className="flex flex-col space-y-4">
            {units.map((unit) => (
              <RoadmapNode
                key={unit.unit_number || Math.random()}
                unit={unit.unit_number}
                title={unit.title}
                offset={unit.offset}
                color={unit.color}
                status={unit.status}
                onClick={() => handleNodeClick(unit)}
                taskCount={unit.taskCount}
                completedCount={unit.completedCount}
                isChapterLevel={unit.isChapterLevel}
                unitPct={unit.unitPct}
              />
            ))}
          </div>
        </div>

        <div className="mt-20 text-center">
          <button onClick={handleReset} className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">
            RESET JOURNEY
          </button>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;