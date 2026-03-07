// Level gameplay: select option → Submit. Correct → next. Incorrect → re-ask at end. Completion animation.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeJsonParse } from "../utils/safeJsonParser";
import axiosInstance from '../api/axiosInstance';

function flattenTasks(content) {
  if (!content) return [];
  const list = [];

  // New structure
  if (content.roadmap && Array.isArray(content.roadmap.units)) {
    content.roadmap.units.forEach(unit => {
      (unit.tasks || []).forEach(task => {
        list.push({
          ...task,
          id: task.task_id || task.id,
          unitTitle: unit.title,
          phaseName: unit.title // For display consistency with old UI if needed
        });
      });
    });
    return list;
  }

  // Old structure (fallback)
  if (Array.isArray(content.phases)) {
    content.phases
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((phase) => {
        (phase.topics || [])
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .forEach((topic) => {
            (topic.tasks || []).forEach((t) => list.push({ ...t, phaseName: phase.name, topicTitle: topic.title }));
          });
      });
  }
  return list;
}

const TaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [replayQueue, setReplayQueue] = useState([]);
  const [replayIndex, setReplayIndex] = useState(0);
  const [phase, setPhase] = useState('main');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [replayStartSize, setReplayStartSize] = useState(0);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axiosInstance.get(`/user/roadmap?ts=${Date.now()}`);
        const row = res.data?.data ?? res.data?.roadmap;
        if (res.data?.success && row) {
          let content = row.roadmap_content;
          if (typeof content === 'string') {
            content = safeJsonParse(content, null, 'TaskPage-roadmap_content');
          }
          if (content) {
            const flat = flattenTasks(content);
            const t = flat.find((x) => (x.task_id || x.id) === taskId);
            setTask(t || null);
          }
        }
      } catch (e) {
        console.error('Fetch roadmap error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [taskId]);

  const mainQuestions = task?.mcqs || [];
  const currentMcq =
    phase === 'main'
      ? mainQuestions[mainIndex] || null
      : replayQueue[replayIndex] || null;
  const totalMain = mainQuestions.length;
  const progressLabel =
    phase === 'replay'
      ? `Review ${replayIndex + 1} of ${replayQueue.length}`
      : `Question ${mainIndex + 1} of ${totalMain}`;
  const progressPct =
    phase === 'main'
      ? totalMain ? ((mainIndex + 1) / totalMain) * 100 : 0
      : replayQueue.length ? ((replayIndex + 1) / replayQueue.length) * 100 : 0;

  const completeLevel = (quizCorrect, quizTotal) => {
    setShowCompletion(true);
    axiosInstance
      .post('/user/roadmap/complete-task', { taskId, quizCorrect: quizCorrect ?? 0, quizTotal: quizTotal ?? 0 })
      .then(() => {
        setTimeout(() => navigate('/roadmap', { replace: true }), 2000);
      })
      .catch((e) => {
        console.error('Complete task error:', e);
        setShowCompletion(false);
        setFeedback('error');
        setSubmitting(false);
      });
  };

  const advanceQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setSubmitting(false);
    if (phase === 'main') {
      if (mainIndex + 1 >= totalMain) {
        if (replayQueue.length > 0) {
          setPhase('replay');
          setReplayIndex(0);
        } else {
          completeLevel();
        }
      } else {
        setMainIndex((i) => i + 1);
      }
    } else {
      if (replayIndex + 1 >= replayQueue.length) {
        completeLevel();
      } else {
        setReplayIndex((i) => i + 1);
      }
    }
  };

  const handleSubmit = () => {
    if (submitting || selectedOption === null || !currentMcq) return;
    const correct = currentMcq.correctIndex === selectedOption;
    setSubmitting(true);
    setFeedback(correct ? 'correct' : 'incorrect');

    if (correct) {
      if (phase === 'main') {
        if (mainIndex + 1 >= totalMain) {
          if (replayQueue.length > 0) {
            setCorrectCount(totalMain - replayQueue.length);
            setReplayStartSize(replayQueue.length);
            setPhase('replay');
            setReplayIndex(0);
          } else {
            completeLevel(totalMain, totalMain);
          }
        } else {
          setCorrectCount((c) => c + 1);
          setMainIndex((i) => i + 1);
        }
      } else {
        setCorrectCount((c) => c + 1);
        if (replayIndex + 1 >= replayQueue.length) {
          completeLevel(correctCount + 1, totalMain + replayStartSize);
        } else {
          setReplayIndex((i) => i + 1);
        }
      }
      setSelectedOption(null);
      setFeedback(null);
      setSubmitting(false);
    } else {
      setReplayQueue((q) => [...q, currentMcq]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#1C74D9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-50">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <p className="text-slate-600 mb-4">Task not found or no questions available.</p>
          <button
            type="button"
            onClick={() => navigate('/roadmap')}
            className="px-4 py-2 bg-[#1C74D9] text-white rounded-xl font-semibold hover:bg-[#1557b0]"
          >
            Back to roadmap
          </button>
        </div>
      </div>
    );
  }

  if (mainQuestions.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-50">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <h1 className="text-lg font-bold text-slate-900 mb-2">{task.task_name || task.title || 'Task'}</h1>
          <p className="text-slate-600 mb-6">
            {task.unitTitle ? `${task.unitTitle}` : ''} — No quiz for this task. Mark it complete when done.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                setSubmitting(true);
                axiosInstance
                  .post('/user/roadmap/complete-task', { taskId, quizCorrect: 0, quizTotal: 0 })
                  .then(() => navigate('/roadmap', { replace: true }))
                  .catch((e) => {
                    console.error('Complete task error:', e);
                    setSubmitting(false);
                  });
              }}
              disabled={submitting}
              className="px-4 py-2 bg-[#1C74D9] text-white rounded-xl font-semibold hover:bg-[#1557b0] disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Mark as complete'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/roadmap')}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50"
            >
              Back to roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-[pulse_0.6s_ease-in-out]">
          <div className="text-6xl mb-4">⭐</div>
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-[#1C74D9] mb-2">Level Complete!</h2>
          <p className="text-slate-600">Returning to your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!currentMcq) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#1C74D9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate('/roadmap')}
            className="text-[#1C74D9] hover:text-[#1557b0] font-medium text-sm shrink-0"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-2 flex-1 max-w-[120px] bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1C74D9] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>
            <span className="text-xs text-slate-600 tabular-nums shrink-0">{progressLabel}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xl">
          <h1 className="text-lg font-bold text-slate-900 mb-1">{task.task_name || task.title || 'Task'}</h1>
          <p className="text-xs text-slate-500 mb-6">
            {[task.unitTitle, task.phaseName, task.topicTitle].filter(Boolean).join(' · ') || '—'}
          </p>

          <p className="text-base font-medium text-slate-800 mb-6 leading-relaxed">{currentMcq.question}</p>

          <div className="space-y-3 mb-6">
            {(currentMcq.options || []).map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => !submitting && setSelectedOption(idx)}
                disabled={submitting}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium ${selectedOption === idx
                    ? 'border-[#1C74D9] bg-[#1C74D9]/10 text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                  } disabled:opacity-70`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedOption === null || submitting}
            className="w-full py-3 rounded-xl font-bold bg-[#1C74D9] text-white hover:bg-[#1557b0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>

          {feedback === 'incorrect' && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm font-medium mb-1">Incorrect. This question will appear again at the end.</p>
              <p className="text-[#1C74D9] text-sm mb-3">
                <span className="text-slate-500">Correct answer:</span>{' '}
                {(currentMcq.options || [])[currentMcq.correctIndex ?? 0]}
              </p>
              <button
                type="button"
                onClick={advanceQuestion}
                className="w-full py-2 rounded-xl font-semibold bg-[#1C74D9] text-white hover:bg-[#1557b0]"
              >
                Continue
              </button>
            </div>
          )}
          {feedback === 'error' && (
            <p className="mt-4 text-red-600 text-sm">Could not save progress. Try again.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
