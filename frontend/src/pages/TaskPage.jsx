// frontend/src/pages/TaskPage.jsx
// Level gameplay: select option → Submit. Correct → next. Incorrect → re-ask at end. Completion animation.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeJsonParse } from "../utils/safeJsonParser";
import axiosInstance from '../api/axiosInstance';

const G = {
  green: '#2D6A4F', greenMid: '#40916C', greenLight: '#52B788',
  greenSoft: '#D8F3DC', greenMist: '#F0FAF3', greenLine: '#B7E4C7',
  sageDim: 'rgba(82,183,136,0.12)',
  text1: '#1A2E1A', text2: '#3D5A3E', text3: '#6B8F71', text4: '#9AB89D',
  surface: '#FFFFFF', bg: '#F4F9F5', bgDeep: '#EBF5EE',
  border: '#D4E8D7', borderSoft: '#E8F4EA',
  shadowXs: '0 1px 4px rgba(26,46,26,0.05)',
  shadowSm: '0 2px 10px rgba(26,46,26,0.06)',
  shadowMd: '0 6px 24px rgba(26,46,26,0.09)',
  shadowLg: '0 12px 40px rgba(26,46,26,0.12)',
  shadowGreen: '0 6px 24px rgba(45,106,79,0.18)',
  rose: '#E11D48', roseLight: '#FFF1F2',
};

function flattenTasks(content) {
  if (!content) return [];
  const list = [];
  if (content.roadmap && Array.isArray(content.roadmap.units)) {
    content.roadmap.units.forEach(unit => {
      (unit.tasks || []).forEach(task => {
        list.push({ ...task, id: task.task_id || task.id, unitTitle: unit.title, phaseName: unit.title });
      });
    });
    return list;
  }
  if (Array.isArray(content.phases)) {
    content.phases.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(phase => {
      (phase.topics || []).sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(topic => {
        (topic.tasks || []).forEach(t => list.push({ ...t, phaseName: phase.name, topicTitle: topic.title }));
      });
    });
  }
  return list;
}

/* Option state → style */
const optionStyle = (idx, selected, submitted, correctIndex) => {
  const isSelected = selected === idx;
  const isCorrect  = correctIndex === idx;

  if (!submitted) {
    return {
      border: `1.5px solid ${isSelected ? G.green : G.border}`,
      background: isSelected ? G.greenSoft : G.bg,
      color: isSelected ? G.text1 : G.text2,
      boxShadow: isSelected ? '0 2px 10px rgba(45,106,79,0.15)' : 'none',
    };
  }
  // After submit — show correct in green, selected-wrong in rose
  if (isCorrect) return { border: '1.5px solid #15803D', background: '#DCFCE7', color: '#14532D' };
  if (isSelected && !isCorrect) return { border: `1.5px solid ${G.rose}`, background: G.roseLight, color: G.rose };
  return { border: `1.5px solid ${G.borderSoft}`, background: G.surface, color: G.text3 };
};

const OptionLetter = ({ idx, selected, submitted, correctIndex }) => {
  const letters = ['A', 'B', 'C', 'D'];
  const isSelected = selected === idx;
  const isCorrect  = correctIndex === idx;
  let bg = G.surface, border = G.border, color = G.text3;
  if (!submitted && isSelected) { bg = G.green; border = G.green; color = '#fff'; }
  if (submitted && isCorrect)   { bg = '#15803D'; border = '#15803D'; color = '#fff'; }
  if (submitted && isSelected && !isCorrect) { bg = G.rose; border = G.rose; color = '#fff'; }
  return (
    <div style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid ${border}`, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color, flexShrink: 0, transition: 'all 0.15s' }}>
      {letters[idx] || idx + 1}
    </div>
  );
};

const TaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]               = useState(true);
  const [task, setTask]                     = useState(null);
  const [mainIndex, setMainIndex]           = useState(0);
  const [replayQueue, setReplayQueue]       = useState([]);
  const [replayIndex, setReplayIndex]       = useState(0);
  const [phase, setPhase]                   = useState('main');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback]             = useState(null);
  const [submitting, setSubmitting]         = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [correctCount, setCorrectCount]     = useState(0);
  const [replayStartSize, setReplayStartSize] = useState(0);

  useEffect(() => {
    axiosInstance.get(`/user/roadmap?ts=${Date.now()}`).then(res => {
      const row = res.data?.data ?? res.data?.roadmap;
      if (res.data?.success && row) {
        let content = row.roadmap_content;
        if (typeof content === 'string') content = safeJsonParse(content, null, 'TaskPage-roadmap_content');
        if (content) {
          const flat = flattenTasks(content);
          setTask(flat.find(x => (x.task_id || x.id) === taskId) || null);
        }
      }
    }).catch(e => console.error(e)).finally(() => setLoading(false));
  }, [taskId]);

  const mainQuestions = task?.mcqs || [];
  const currentMcq = phase === 'main' ? mainQuestions[mainIndex] || null : replayQueue[replayIndex] || null;
  const totalMain   = mainQuestions.length;
  const progressLabel = phase === 'replay'
    ? `Review ${replayIndex + 1} of ${replayQueue.length}`
    : `Question ${mainIndex + 1} of ${totalMain}`;
  const progressPct = phase === 'main'
    ? (totalMain ? ((mainIndex + 1) / totalMain) * 100 : 0)
    : (replayQueue.length ? ((replayIndex + 1) / replayQueue.length) * 100 : 0);

  const completeLevel = (quizCorrect, quizTotal) => {
    setShowCompletion(true);
    axiosInstance.post('/user/roadmap/complete-task', { taskId, quizCorrect: quizCorrect ?? 0, quizTotal: quizTotal ?? 0 })
      .then(() => setTimeout(() => navigate('/roadmap', { replace: true }), 2200))
      .catch(e => { console.error(e); setShowCompletion(false); setFeedback('error'); setSubmitting(false); });
  };

  const advanceQuestion = () => {
    setFeedback(null); setSelectedOption(null); setSubmitting(false);
    if (phase === 'main') {
      if (mainIndex + 1 >= totalMain) {
        if (replayQueue.length > 0) { setPhase('replay'); setReplayIndex(0); }
        else completeLevel();
      } else setMainIndex(i => i + 1);
    } else {
      if (replayIndex + 1 >= replayQueue.length) completeLevel();
      else setReplayIndex(i => i + 1);
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
          if (replayQueue.length > 0) { setCorrectCount(totalMain - replayQueue.length); setReplayStartSize(replayQueue.length); setPhase('replay'); setReplayIndex(0); }
          else completeLevel(totalMain, totalMain);
        } else { setCorrectCount(c => c + 1); setMainIndex(i => i + 1); }
      } else {
        setCorrectCount(c => c + 1);
        if (replayIndex + 1 >= replayQueue.length) completeLevel(correctCount + 1, totalMain + replayStartSize);
        else setReplayIndex(i => i + 1);
      }
      setSelectedOption(null); setFeedback(null); setSubmitting(false);
    } else {
      setReplayQueue(q => [...q, currentMcq]);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${G.greenSoft}`, borderTopColor: G.green, animation: 'spin .7s linear infinite' }} />
    </div>
  );

  /* ── No task ── */
  if (!task) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ maxWidth: 400, width: '100%', background: G.surface, borderRadius: 22, border: `1px solid ${G.border}`, boxShadow: '0 12px 40px rgba(26,46,26,0.09)', padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, background: G.bgDeep, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>🔍</div>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: G.text1, marginBottom: 8 }}>Task not found</h2>
        <p style={{ fontSize: 13, color: G.text3, marginBottom: 24, lineHeight: 1.7 }}>This task couldn't be found or has no questions available.</p>
        <button onClick={() => navigate('/roadmap')} style={{ padding: '12px 24px', background: G.green, color: '#fff', borderRadius: 11, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: G.shadowGreen }}>
          Back to roadmap
        </button>
      </div>
    </div>
  );

  /* ── No MCQs ── */
  if (mainQuestions.length === 0) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 420, width: '100%', background: G.surface, borderRadius: 22, border: `1px solid ${G.border}`, boxShadow: G.shadowLg, padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, background: G.greenMist, borderRadius: 16, border: `1px solid ${G.greenLine}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 24 }}>📋</div>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: G.text1, marginBottom: 6 }}>{task.task_name || task.title || 'Task'}</h2>
        <p style={{ fontSize: 13, color: G.text3, marginBottom: 24, lineHeight: 1.7 }}>
          {task.unitTitle ? `${task.unitTitle} · ` : ''}No quiz for this task. Mark it complete when done.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => {
              setSubmitting(true);
              axiosInstance.post('/user/roadmap/complete-task', { taskId, quizCorrect: 0, quizTotal: 0 })
                .then(() => navigate('/roadmap', { replace: true }))
                .catch(e => { console.error(e); setSubmitting(false); });
            }}
            disabled={submitting}
            style={{ padding: '13px', background: G.green, color: '#fff', borderRadius: 11, fontSize: 14, fontWeight: 700, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: G.shadowGreen, opacity: submitting ? 0.7 : 1 }}
          >{submitting ? 'Saving…' : 'Mark as complete'}</button>
          <button
            onClick={() => navigate('/roadmap')}
            style={{ padding: '12px', background: 'transparent', color: G.text3, borderRadius: 11, fontSize: 13, fontWeight: 600, border: `1.5px solid ${G.border}`, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          >Back to roadmap</button>
        </div>
      </div>
    </div>
  );

  /* ── Completion ── */
  if (showCompletion) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,400&display=swap'); @keyframes popin{0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ textAlign: 'center', animation: 'popin 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🌿</div>
        <div style={{ fontSize: 48, marginBottom: 18 }}>✨</div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 700, color: G.green, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Step Complete!
        </div>
        <p style={{ fontSize: 14, color: G.text3 }}>Returning to your roadmap…</p>
        <div style={{ marginTop: 20, width: 28, height: 28, borderRadius: '50%', border: `3px solid ${G.greenSoft}`, borderTopColor: G.green, animation: 'spin .7s linear infinite', margin: '20px auto 0' }} />
      </div>
    </div>
  );

  if (!currentMcq) return (
    <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${G.greenSoft}`, borderTopColor: G.green }} />
    </div>
  );

  /* ── Main quiz UI ── */
  return (
    <div style={{ minHeight: '100vh', background: G.bg, fontFamily: "'Plus Jakarta Sans',sans-serif", color: G.text1, WebkitFontSmoothing: 'antialiased', padding: '80px 16px 60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .tp-option {
          width: 100%; text-align: left; display: flex; align-items: center; gap: 12px;
          padding: 13px 15px; border-radius: 12px; cursor: pointer;
          transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 500; line-height: 1.45;
        }
        .tp-option:disabled { opacity: 0.7; cursor: default; }
        .tp-option:not(:disabled):hover { border-color: ${G.greenLine} !important; background: ${G.greenMist} !important; }

        .tp-submit {
          width: 100%; padding: 13px; border-radius: 12px;
          background: ${G.green}; color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 800;
          border: none; cursor: pointer; transition: all 0.18s;
          box-shadow: ${G.shadowGreen};
        }
        .tp-submit:hover:not(:disabled) { background: ${G.greenMid}; transform: translateY(-1px); }
        .tp-submit:disabled { background: ${G.text4}; cursor: not-allowed; box-shadow: none; }

        .tp-continue {
          width: 100%; padding: 12px; border-radius: 11px;
          background: ${G.green}; color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700;
          border: none; cursor: pointer; transition: all 0.15s;
        }
        .tp-continue:hover { background: ${G.greenMid}; }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <button onClick={() => navigate('/roadmap')} style={{ fontSize: 13, fontWeight: 700, color: G.green, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Plus Jakarta Sans',sans-serif", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back
          </button>
          <div style={{ flex: 1, height: 5, background: G.bgDeep, borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, progressPct)}%`, background: `linear-gradient(90deg,${G.green},${G.greenLight})`, borderRadius: 99, transition: 'width 0.35s ease' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: G.text4, whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{progressLabel}</span>
        </div>

        {/* Quiz card */}
        <div style={{ background: G.surface, borderRadius: 22, border: `1px solid ${G.border}`, boxShadow: G.shadowLg, overflow: 'hidden', animation: 'fadein 0.3s ease both' }}>

          {/* Card header */}
          <div style={{ background: G.green, padding: '18px 22px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: 3 }}>
              {phase === 'replay' ? '🔁 Review Round' : task.unitTitle || 'Current Unit'}
            </div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
              {task.task_name || task.title || 'Task'}
            </div>
          </div>

          <div style={{ padding: '22px' }}>
            {/* Question number */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: G.text4, marginBottom: 14 }}>
              {progressLabel}
            </div>

            {/* Question text */}
            <p style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 600, color: G.text1, lineHeight: 1.55, marginBottom: 22 }}>
              {currentMcq.question}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }}>
              {(currentMcq.options || []).map((option, idx) => {
                const styles = optionStyle(idx, selectedOption, submitting && feedback !== null, currentMcq.correctIndex);
                return (
                  <button
                    key={idx} type="button"
                    onClick={() => !submitting && setSelectedOption(idx)}
                    disabled={submitting}
                    className="tp-option"
                    style={{ ...styles }}
                  >
                    <OptionLetter idx={idx} selected={selectedOption} submitted={submitting && feedback !== null} correctIndex={currentMcq.correctIndex} />
                    <span style={{ flex: 1 }}>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit */}
            <button type="button" onClick={handleSubmit} disabled={selectedOption === null || submitting} className="tp-submit">
              Submit Answer
            </button>

            {/* Incorrect feedback */}
            {feedback === 'incorrect' && (
              <div style={{ marginTop: 16, padding: '16px', background: G.roseLight, border: '1px solid #FECDD3', borderLeft: `3px solid ${G.rose}`, borderRadius: 12, animation: 'fadein 0.2s ease' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: G.rose, marginBottom: 6 }}>Incorrect — this question will appear again at the end.</p>
                <p style={{ fontSize: 13, color: G.text2, marginBottom: 14 }}>
                  <span style={{ color: G.text4 }}>Correct answer: </span>
                  <strong style={{ color: G.green }}>{(currentMcq.options || [])[currentMcq.correctIndex ?? 0]}</strong>
                </p>
                <button type="button" onClick={advanceQuestion} className="tp-continue">Continue →</button>
              </div>
            )}

            {/* Error feedback */}
            {feedback === 'error' && (
              <p style={{ marginTop: 14, fontSize: 13, color: G.rose, fontWeight: 600 }}>Could not save progress. Try again.</p>
            )}
          </div>
        </div>

        {/* Path meta */}
        {[task.phaseName, task.topicTitle].filter(Boolean).length > 0 && (
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: G.text4, fontWeight: 600 }}>
            {[task.phaseName, task.topicTitle].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskPage;