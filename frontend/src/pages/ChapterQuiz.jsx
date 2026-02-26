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
  const [correctCount, setCorrectCount] = useState(0);
  const [replayStartSize, setReplayStartSize] = useState(0);

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

  const completeChapter = (quizCorrect, quizTotal) => {
    setShowCompletion(true);
    const taskId = `u${unitNumber}`;
    axiosInstance.post('/user/roadmap/complete-task', { taskId, quizCorrect, quizTotal })
      .then(() => setTimeout(() => navigate('/roadmap', { replace: true }), 2000))
      .catch((e) => {
        console.error('Complete chapter error:', e);
        setShowCompletion(false);
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
          completeChapter();
        }
      } else {
        setMainIndex(i => i + 1);
      }
    } else {
      if (replayIndex + 1 >= replayQueue.length) completeChapter(correctCount, totalMain + replayStartSize);
      else setReplayIndex((i) => i + 1);
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
            completeChapter(totalMain, totalMain);
          }
        } else {
          setCorrectCount((c) => c + 1);
          setMainIndex((i) => i + 1);
        }
      } else {
        setCorrectCount((c) => c + 1);
        if (replayIndex + 1 >= replayQueue.length) {
          completeChapter(correctCount + 1, totalMain + replayStartSize);
        } else {
          setReplayIndex((i) => i + 1);
        }
      }
      setFeedback(null);
      setSelectedOption(null);
      setSubmitting(false);
    } else {
      setReplayQueue(q => [...q, currentMcq]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-50">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center">
          <p className="text-slate-600 mb-4">Chapter not found.</p>
          <button type="button" onClick={() => navigate('/roadmap')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">Back to roadmap</button>
        </div>
      </div>
    );
  }

  if (mainQuestions.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-slate-50">
        <div className="max-w-lg w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center">
          <p className="text-slate-600 mb-4">No questions for this chapter.</p>
          <button type="button" onClick={() => navigate('/roadmap')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">Back to roadmap</button>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-[pulse_0.6s_ease-in-out]">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-bold text-indigo-600 mb-2">Chapter complete!</h2>
          <p className="text-slate-500">Returning to your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!currentMcq) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top bar - compact */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 sm:pt-6 sm:pb-4">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/roadmap')}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm py-2 -ml-1 min-w-[44px]"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[200px] sm:max-w-[240px]">
            <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, progressPct)}%` }} />
            </div>
            <span className="text-xs text-slate-500 tabular-nums shrink-0">{progressLabel}</span>
          </div>
        </div>
      </div>

      {/* Centered quiz card - main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 sm:py-6 pb-8">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 md:p-8 shadow-lg">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 mb-1">{unit.title}</h1>
            <p className="text-xs text-slate-500 mb-4 sm:mb-6">{unit.level || ''} · {mainQuestions.length} questions</p>
            <p className="text-sm sm:text-base font-medium text-slate-700 mb-4 sm:mb-6 leading-relaxed">{currentMcq.question}</p>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {(currentMcq.options || []).map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !submitting && setSelectedOption(idx)}
                  disabled={submitting}
                  className={`w-full text-left px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all font-medium text-sm sm:text-base min-h-[48px] sm:min-h-[52px] flex items-center ${selectedOption === idx ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 active:scale-[0.99]'} disabled:opacity-70`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedOption === null || submitting}
              className="w-full py-3.5 sm:py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[48px]"
            >
              Submit
            </button>
            {feedback === 'incorrect' && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm font-medium mb-1">Incorrect. This question will appear again at the end.</p>
                <p className="text-emerald-600 text-sm mb-3">
                  <span className="text-slate-500">Correct answer:</span>{' '}
                  {(currentMcq.options || [])[currentMcq.correctIndex ?? 0]}
                </p>
                <button
                  type="button"
                  onClick={advanceQuestion}
                  className="w-full py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 min-h-[44px]"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterQuiz;
