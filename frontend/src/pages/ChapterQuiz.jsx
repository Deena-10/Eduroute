// Chapter-level quiz: exactly 5 MCQs per unit. Completion is tracked by unit id (u1, u2, u3).
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeJsonParse } from '../utils/safeJsonParser';
import axiosInstance from '../api/axiosInstance';

const ChapterQuiz = () => {
  const { unitNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState(null);
  const [mainIndex, setMainIndex] = useState(0);
  const [replayQueue, setReplayQueue] = useState([]);
  const [replayIndex, setReplayIndex] = useState(0);
  const [phase, setPhase] = useState('main');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axiosInstance.get(`/user/roadmap?ts=${Date.now()}`);
        const row = res.data?.data ?? res.data?.roadmap;
        if (res.data?.success && row) {
          let content = row.roadmap_content;
          if (typeof content === 'string') content = safeJsonParse(content, null, 'ChapterQuiz');
          const units = content?.roadmap?.units || content?.units || [];
          const num = parseInt(unitNumber, 10);
          const u = units.find(un => (un.unit_number === num || un.unit_number === unitNumber));
          setUnit(u || null);
        }
      } catch (e) {
        console.error('Fetch roadmap error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [unitNumber]);

  const mainQuestions = (unit?.mcqs || []).slice(0, 5);
  const currentMcq = phase === 'main' ? mainQuestions[mainIndex] || null : replayQueue[replayIndex] || null;
  const totalMain = mainQuestions.length;
  const progressLabel = phase === 'replay' ? `Review ${replayIndex + 1} of ${replayQueue.length}` : `Question ${mainIndex + 1} of ${totalMain}`;
  const progressPct = phase === 'main' ? (totalMain ? ((mainIndex + 1) / totalMain) * 100 : 0) : (replayQueue.length ? ((replayIndex + 1) / replayQueue.length) * 100 : 0);

  const completeChapter = () => {
    setShowCompletion(true);
    const taskId = `u${unitNumber}`;
    axiosInstance.post('/user/roadmap/complete-task', { taskId })
      .then(() => setTimeout(() => navigate('/roadmap', { replace: true }), 2000))
      .catch((e) => {
        console.error('Complete chapter error:', e);
        setShowCompletion(false);
        setSubmitting(false);
      });
  };

  const handleSubmit = () => {
    if (submitting || selectedOption === null || !currentMcq) return;
    const correct = currentMcq.correctIndex === selectedOption;
    setSubmitting(true);
    setFeedback(correct ? 'correct' : 'incorrect');

    if (phase === 'main') {
      if (correct) {
        if (mainIndex + 1 >= totalMain) {
          if (replayQueue.length > 0) {
            setPhase('replay');
            setReplayIndex(0);
          } else {
            completeChapter();
          }
        } else {
          setMainIndex(i => i + 1);
        }
      } else {
        setReplayQueue(q => [...q, currentMcq]);
        if (mainIndex + 1 >= totalMain) {
          setPhase('replay');
          setReplayIndex(0);
        } else {
          setMainIndex(i => i + 1);
        }
      }
    } else {
      if (correct) {
        if (replayIndex + 1 >= replayQueue.length) completeChapter();
        else setReplayIndex(i => i + 1);
      } else {
        setReplayQueue(q => [...q, currentMcq]);
        setReplayIndex(i => i + 1);
      }
    }
    setSelectedOption(null);
    setFeedback(null);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="max-w-lg w-full bg-gray-800 rounded-2xl p-8 border border-gray-600 text-center">
          <p className="text-gray-300 mb-4">Chapter not found.</p>
          <button type="button" onClick={() => navigate('/roadmap')} className="px-4 py-2 bg-amber-500 text-gray-900 rounded-xl font-semibold hover:bg-amber-400">Back to roadmap</button>
        </div>
      </div>
    );
  }

  if (mainQuestions.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="max-w-lg w-full bg-gray-800 rounded-2xl p-8 border border-gray-600 text-center">
          <p className="text-gray-300 mb-4">No questions for this chapter.</p>
          <button type="button" onClick={() => navigate('/roadmap')} className="px-4 py-2 bg-amber-500 text-gray-900 rounded-xl font-semibold hover:bg-amber-400">Back to roadmap</button>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="text-center animate-[pulse_0.6s_ease-in-out]">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold text-amber-400 mb-2">Chapter complete!</h2>
          <p className="text-gray-400">Returning to your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!currentMcq) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: '#1a1a2e' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-2">
          <button type="button" onClick={() => navigate('/roadmap')} className="text-amber-400 hover:text-amber-300 font-medium text-sm shrink-0">← Back</button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-2 flex-1 max-w-[120px] bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progressPct)}%` }} />
            </div>
            <span className="text-xs text-gray-400 tabular-nums shrink-0">{progressLabel}</span>
          </div>
        </div>
        <div className="bg-gray-800 rounded-2xl border border-gray-600 p-6 md:p-8 shadow-xl">
          <h1 className="text-lg font-bold text-white mb-1">{unit.title}</h1>
          <p className="text-xs text-gray-500 mb-6">{unit.level || ''} · {mainQuestions.length} questions</p>
          <p className="text-base font-medium text-gray-100 mb-6 leading-relaxed">{currentMcq.question}</p>
          <div className="space-y-3 mb-6">
            {(currentMcq.options || []).map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => !submitting && setSelectedOption(idx)}
                disabled={submitting}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all font-medium ${selectedOption === idx ? 'border-amber-500 bg-amber-500/20 text-white' : 'border-gray-600 bg-gray-700/50 text-gray-200 hover:border-gray-500'} disabled:opacity-70`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedOption === null || submitting}
            className="w-full py-3 rounded-xl font-bold bg-amber-500 text-gray-900 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
          {feedback === 'incorrect' && (
            <p className="mt-4 text-red-400 text-sm font-medium">Incorrect. This question will appear again at the end.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterQuiz;
