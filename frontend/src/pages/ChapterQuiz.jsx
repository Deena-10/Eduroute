// Chapter-level quiz: exactly 5 MCQs per unit. Completion is tracked by unit id (u1, u2, u3).
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { safeJsonParse } from '../utils/safeJsonParser';
import axiosInstance from '../api/axiosInstance';

/* ─── Green theme (same as home / Roadmap) ─── */
const QuizStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --green:       #2D6A4F;
      --green-mid:   #40916C;
      --green-light: #52B788;
      --green-soft:  #D8F3DC;
      --green-mist:  #F0FAF3;
      --green-line:  #B7E4C7;
      --sage-dim:    rgba(82,183,136,0.12);
      --red:         #DC2626;
      --red-soft:    #FEE2E2;
      --amber:       #D97706;
      --amber-light: #FFFBEB;
      --text-1:      #1A2E1A;
      --text-2:      #3D5A3E;
      --text-muted:  #6B8F71;
      --surface:     #FFFFFF;
      --bg:          #F4F9F5;
      --bg-deep:     #EBF5EE;
      --border:      #D4E8D7;
      --border-soft: #E8F4EA;
      --shadow:      0 2px 10px rgba(26,46,26,0.06);
      --shadow-md:   0 6px 24px rgba(26,46,26,0.09);
      --shadow-lg:   0 12px 40px rgba(26,46,26,0.12);
      --shadow-green: 0 6px 24px rgba(45,106,79,0.18);
      --r:           16px;
    }

    .cq-root {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      min-height: 100vh;
      color: var(--text-1);
      -webkit-font-smoothing: antialiased;
      display: flex;
      flex-direction: column;
    }

    /* ── TOP BAR ── */
    .cq-topbar {
      flex-shrink: 0;
      background: rgba(244,249,245,0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 14px 20px;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .cq-topbar-inner {
      max-width: 640px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .cq-back {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 700; color: var(--green);
      background: var(--green-soft); border: none; cursor: pointer;
      padding: 7px 14px; border-radius: 10px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: background 0.15s, transform 0.1s;
      white-space: nowrap; flex-shrink: 0;
      touch-action: manipulation;
    }
    .cq-back:hover { background: var(--green-mist); }
    .cq-back:active { transform: scale(0.97); }

    .cq-progress-area { flex: 1; min-width: 0; }
    .cq-progress-meta {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 6px;
    }
    .cq-progress-label { font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.04em; }
    .cq-progress-phase {
      font-size: 9px; font-weight: 800; letter-spacing: 0.14em;
      text-transform: uppercase; padding: 2px 8px; border-radius: 20px;
    }
    .cq-progress-phase.main   { background: var(--sage-dim); color: var(--green); }
    .cq-progress-phase.replay { background: var(--amber-light); color: var(--amber); }
    .cq-progress-track {
      height: 6px; background: var(--border-soft); border-radius: 99px; overflow: hidden;
    }
    .cq-progress-fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, var(--green), var(--green-light));
      transition: width 0.5s cubic-bezier(.4,0,.2,1);
    }
    .cq-progress-fill.replay { background: linear-gradient(90deg, var(--amber), #FCD34D); }

    /* ── SCROLL BODY ── */
    .cq-body {
      flex: 1;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 28px 16px 80px;
    }
    .cq-card-col { width: 100%; max-width: 640px; }

    /* ── CHAPTER HEADER STRIP ── */
    .cq-chapter-header {
      display: flex; align-items: center; gap: 14px;
      background: var(--surface); border-radius: var(--r);
      border: 1px solid var(--border); padding: 16px 20px;
      margin-bottom: 16px;
      box-shadow: var(--shadow);
    }
    .cq-chapter-icon {
      width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px;
      background: var(--green-soft);
      display: flex; align-items: center; justify-content: center;
    }
    .cq-chapter-title { font-family: 'Fraunces', serif; font-size: 15px; font-weight: 700; color: var(--text-1); line-height: 1.25; }
    .cq-chapter-sub   { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

    /* ── QUESTION CARD ── */
    .cq-card {
      background: var(--surface);
      border-radius: var(--r);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .cq-q-number-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 22px 0;
    }
    .cq-q-number {
      font-size: 10px; font-weight: 800; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--text-muted);
    }
    .cq-dot-row { display: flex; gap: 5px; }
    .cq-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--border-soft); transition: background 0.3s;
    }
    .cq-dot.done     { background: var(--green); }
    .cq-dot.current  { background: var(--green); box-shadow: 0 0 0 2px rgba(45,106,79,0.22); }

    .cq-question-text {
      font-family: 'Fraunces', serif;
      font-size: 19px; font-weight: 400; line-height: 1.5;
      color: var(--text-1); padding: 16px 22px 22px;
    }
    @media (max-width: 480px) {
      .cq-question-text { font-size: 16px; padding: 14px 18px 18px; }
    }

    /* ── OPTIONS ── */
    .cq-options { display: flex; flex-direction: column; gap: 10px; padding: 0 18px; }

    .cq-option {
      width: 100%; text-align: left;
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px; border-radius: 13px;
      border: 2px solid var(--border);
      background: var(--bg);
      cursor: pointer; transition: all 0.17s;
      font-size: 14px; font-weight: 500; color: var(--text-2);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 52px; touch-action: manipulation;
    }
    .cq-option:not(:disabled):hover {
      border-color: var(--green-line);
      background: var(--green-soft);
      color: var(--text-1);
    }
    .cq-option.selected {
      border-color: var(--green);
      background: var(--green-soft);
      color: var(--text-1);
    }
    .cq-option.correct {
      border-color: var(--green);
      background: var(--green-soft);
      color: #2D6A4F;
    }
    .cq-option.wrong {
      border-color: var(--red);
      background: var(--red-soft);
      color: var(--red);
    }
    .cq-option:disabled { cursor: default; }

    .cq-option-letter {
      width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; letter-spacing: 0.04em;
      background: var(--surface); border: 1.5px solid var(--border);
      color: var(--text-muted); transition: all 0.17s;
    }
    .cq-option.selected .cq-option-letter  { background: var(--green); border-color: var(--green); color: #fff; }
    .cq-option.correct  .cq-option-letter  { background: var(--green); border-color: var(--green); color: #fff; }
    .cq-option.wrong    .cq-option-letter  { background: var(--red); border-color: var(--red); color: #fff; }
    .cq-option-text { flex: 1; line-height: 1.45; }

    /* ── SUBMIT AREA ── */
    .cq-submit-area { padding: 18px 18px 22px; }
    .cq-submit-btn {
      width: 100%; padding: 14px 0; border-radius: 13px;
      background: var(--green);
      color: #fff; font-size: 14px; font-weight: 800;
      border: none; cursor: pointer; letter-spacing: 0.02em;
      font-family: 'Plus Jakarta Sans', sans-serif;
      box-shadow: var(--shadow-green);
      transition: opacity 0.15s, transform 0.1s;
      min-height: 50px;
    }
    .cq-submit-btn:hover:not(:disabled) { opacity: 0.9; background: var(--green-mid); }
    .cq-submit-btn:active:not(:disabled) { transform: scale(0.98); }
    .cq-submit-btn:disabled { opacity: 0.42; cursor: not-allowed; }

    /* ── FEEDBACK PANEL ── */
    .cq-feedback {
      margin: 0 18px 20px;
      border-radius: 14px;
      overflow: hidden;
      border: 1.5px solid;
    }
    .cq-feedback.correct { border-color: var(--green); background: var(--green-soft); }
    .cq-feedback.incorrect { border-color: var(--red); background: var(--red-soft); }

    .cq-feedback-header {
      display: flex; align-items: center; gap: 10px;
      padding: 13px 16px 10px;
    }
    .cq-feedback-icon {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .cq-feedback.correct  .cq-feedback-icon { background: var(--green); }
    .cq-feedback.incorrect .cq-feedback-icon { background: var(--red); }
    .cq-feedback-title { font-size: 14px; font-weight: 800; }
    .cq-feedback.correct  .cq-feedback-title { color: #2D6A4F; }
    .cq-feedback.incorrect .cq-feedback-title { color: var(--red); }

    .cq-feedback-body { padding: 0 16px 14px; }
    .cq-feedback-answer-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 5px; }
    .cq-feedback-answer-text  { font-size: 13px; font-weight: 600; color: var(--text-1); line-height: 1.45; }
    .cq-feedback-note { font-size: 11px; color: var(--text-muted); margin-top: 8px; font-style: italic; }

    .cq-feedback-continue {
      margin: 0 18px 20px;
      width: calc(100% - 36px);
      padding: 13px 0; border-radius: 13px;
      background: var(--green);
      color: #fff; font-size: 13px; font-weight: 800;
      border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
      box-shadow: var(--shadow-green);
      transition: opacity 0.15s, transform 0.1s; display: block;
      min-height: 48px; touch-action: manipulation;
    }
    .cq-feedback-continue:hover { opacity: 0.9; background: var(--green-mid); }
    .cq-feedback-continue:active { transform: scale(0.98); }

    /* ── COMPLETION SCREEN ── */
    .cq-complete-screen {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: var(--bg); padding: 24px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .cq-complete-card {
      background: var(--surface); border-radius: 24px;
      border: 1px solid var(--border); box-shadow: var(--shadow-lg);
      padding: 48px 36px; text-align: center; max-width: 380px; width: 100%;
    }
    .cq-complete-badge {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--green);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 24px;
      box-shadow: var(--shadow-green);
    }
    .cq-complete-title {
      font-family: 'Fraunces', serif;
      font-size: 28px; color: var(--text-1); margin: 0 0 10px;
    }
    .cq-complete-sub   { font-size: 14px; color: var(--text-muted); margin: 0 0 28px; line-height: 1.6; }
    .cq-complete-score {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      background: var(--green-soft); border-radius: 14px; padding: 14px 24px;
      margin-bottom: 20px;
    }
    .cq-complete-score-num { font-size: 32px; font-weight: 900; color: var(--green); }
    .cq-complete-score-denom { font-size: 18px; font-weight: 600; color: var(--text-muted); }
    .cq-complete-score-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); margin-top: 4px; }
    .cq-returning { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; gap: 6px; }
    .cq-returning-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: cqpulse 1.2s ease-in-out infinite; }
    @keyframes cqpulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

    /* ── LOADING / ERROR SCREENS ── */
    .cq-center {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 16px; background: var(--bg);
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .cq-spinner {
      width: 36px; height: 36px; border-radius: 50%;
      border: 3px solid var(--border-soft);
      border-top-color: var(--green);
      animation: cqspin .8s linear infinite;
    }
    @keyframes cqspin { to { transform: rotate(360deg); } }
    .cq-spinner-label { font-size: 13px; color: var(--text-muted); }

    .cq-error-card {
      background: var(--surface); border-radius: 22px;
      border: 1px solid var(--border); padding: 44px 32px;
      text-align: center; max-width: 360px; width: 100%;
      box-shadow: var(--shadow);
    }
    .cq-error-ico { width: 52px; height: 52px; background: var(--bg-deep); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
    .cq-error-card h2 { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 700; color: var(--text-1); margin: 0 0 8px; }
    .cq-error-card p  { font-size: 14px; color: var(--text-muted); margin: 0 0 24px; line-height: 1.6; }
    .cq-error-btn {
      padding: 12px 28px; border-radius: 12px;
      background: var(--green);
      color: #fff; font-size: 14px; font-weight: 700;
      border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
      box-shadow: var(--shadow-green);
      transition: opacity .15s;
    }
    .cq-error-btn:hover { opacity: .9; background: var(--green-mid); }
  `}</style>
);

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const ChapterQuiz = () => {
  const { unitNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]               = useState(true);
  const [unit, setUnit]                     = useState(null);
  const [mainIndex, setMainIndex]           = useState(0);
  const [replayQueue, setReplayQueue]       = useState([]);
  const [replayIndex, setReplayIndex]       = useState(0);
  const [phase, setPhase]                   = useState('main');
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback]             = useState(null);   // null | 'correct' | 'incorrect'
  const [submitting, setSubmitting]         = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [correctCount, setCorrectCount]     = useState(0);
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
  const currentMcq    = phase === 'main' ? mainQuestions[mainIndex] || null : replayQueue[replayIndex] || null;
  const totalMain     = mainQuestions.length;

  const progressPct = phase === 'main'
    ? (totalMain ? ((mainIndex + 1) / totalMain) * 100 : 0)
    : (replayQueue.length ? ((replayIndex + 1) / replayQueue.length) * 100 : 0);

  const progressLabel = phase === 'replay'
    ? `Review ${replayIndex + 1} / ${replayQueue.length}`
    : `${mainIndex + 1} / ${totalMain}`;

  /* ── completion ── */
  const completeChapter = (quizCorrect, quizTotal) => {
    setShowCompletion(true);
    const taskId = `u${unitNumber}`;
    axiosInstance.post('/user/roadmap/complete-task', { taskId, quizCorrect, quizTotal })
      .then(() => setTimeout(() => navigate('/roadmap', { replace: true }), 2200))
      .catch((e) => {
        console.error('Complete chapter error:', e);
        setShowCompletion(false);
        setSubmitting(false);
      });
  };

  /* ── advance ── */
  const advanceQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setSubmitting(false);
    if (phase === 'main') {
      if (mainIndex + 1 >= totalMain) {
        if (replayQueue.length > 0) { setPhase('replay'); setReplayIndex(0); }
        else completeChapter();
      } else setMainIndex(i => i + 1);
    } else {
      if (replayIndex + 1 >= replayQueue.length) completeChapter(correctCount, totalMain + replayStartSize);
      else setReplayIndex(i => i + 1);
    }
  };

  /* ── submit ── */
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
          } else completeChapter(totalMain, totalMain);
        } else {
          setCorrectCount(c => c + 1);
          setMainIndex(i => i + 1);
        }
      } else {
        setCorrectCount(c => c + 1);
        if (replayIndex + 1 >= replayQueue.length)
          completeChapter(correctCount + 1, totalMain + replayStartSize);
        else setReplayIndex(i => i + 1);
      }
      setFeedback(null);
      setSelectedOption(null);
      setSubmitting(false);
    } else {
      setReplayQueue(q => [...q, currentMcq]);
    }
  };

  /* ─── LOADING ─── */
  if (loading) return (
    <div className="cq-center">
      <QuizStyles />
      <div className="cq-spinner" />
      <p className="cq-spinner-label">Loading chapter…</p>
    </div>
  );

  /* ─── NOT FOUND ─── */
  if (!unit) return (
    <div className="cq-center" style={{ padding: 24 }}>
      <QuizStyles />
      <div className="cq-error-card">
        <div className="cq-error-ico">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0C0D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2>Chapter not found</h2>
        <p>We couldn't locate this chapter. Please go back to your roadmap.</p>
        <button className="cq-error-btn" onClick={() => navigate('/roadmap')}>← Back to Roadmap</button>
      </div>
    </div>
  );

  /* ─── NO QUESTIONS ─── */
  if (mainQuestions.length === 0) return (
    <div className="cq-center" style={{ padding: 24 }}>
      <QuizStyles />
      <div className="cq-error-card">
        <div className="cq-error-ico">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B0C0D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <h2>No questions yet</h2>
        <p>This chapter doesn't have any questions set up. Check back later.</p>
        <button className="cq-error-btn" onClick={() => navigate('/roadmap')}>← Back to Roadmap</button>
      </div>
    </div>
  );

  /* ─── COMPLETION ─── */
  if (showCompletion) return (
    <div className="cq-complete-screen">
      <QuizStyles />
      <motion.div
        className="cq-complete-card"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="cq-complete-badge"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </motion.div>

        <motion.h2
          className="cq-complete-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Chapter Complete!
        </motion.h2>

        <motion.p
          className="cq-complete-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Great work finishing <strong>{unit.title}</strong>. You're making real progress.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
        >
          <div className="cq-complete-score">
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center' }}>
                <span className="cq-complete-score-num">{correctCount}</span>
                <span className="cq-complete-score-denom">/ {totalMain}</span>
              </div>
              <div className="cq-complete-score-label">Correct answers</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="cq-returning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <span className="cq-returning-dot" />
          Returning to your roadmap…
        </motion.div>
      </motion.div>
    </div>
  );

  /* ─── LOADING CURRENT MCQ ─── */
  if (!currentMcq) return (
    <div className="cq-center">
      <QuizStyles />
      <div className="cq-spinner" />
    </div>
  );

  /* ─── QUIZ UI ─── */
  const optionState = (idx) => {
    if (!feedback) return selectedOption === idx ? 'selected' : '';
    if (idx === currentMcq.correctIndex) return 'correct';
    if (idx === selectedOption && feedback === 'incorrect') return 'wrong';
    return '';
  };

  return (
    <div className="cq-root">
      <QuizStyles />

      {/* ── TOP BAR ── */}
      <div className="cq-topbar">
        <div className="cq-topbar-inner">
          <button className="cq-back" onClick={() => navigate('/roadmap')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>

          <div className="cq-progress-area">
            <div className="cq-progress-meta">
              <span className="cq-progress-label">{progressLabel}</span>
              <span className={`cq-progress-phase ${phase}`}>
                {phase === 'replay' ? '⟳ Review' : 'Quiz'}
              </span>
            </div>
            <div className="cq-progress-track">
              <div
                className={`cq-progress-fill ${phase}`}
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="cq-body">
        <div className="cq-card-col">

          {/* Chapter info strip */}
          <motion.div
            className="cq-chapter-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="cq-chapter-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <p className="cq-chapter-title">{unit.title}</p>
              <p className="cq-chapter-sub">{unit.level ? `${unit.level} · ` : ''}{totalMain} questions</p>
            </div>
          </motion.div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phase}-${phase === 'main' ? mainIndex : replayIndex}`}
              className="cq-card"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >
              {/* Number + dots */}
              <div className="cq-q-number-row">
                <span className="cq-q-number">
                  Question {phase === 'main' ? mainIndex + 1 : replayIndex + 1}
                </span>
                <div className="cq-dot-row">
                  {mainQuestions.map((_, i) => (
                    <div
                      key={i}
                      className={`cq-dot ${
                        phase === 'main'
                          ? i < mainIndex ? 'done' : i === mainIndex ? 'current' : ''
                          : 'done'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question text */}
              <p className="cq-question-text">{currentMcq.question}</p>

              {/* Options */}
              <div className="cq-options">
                {(currentMcq.options || []).map((option, idx) => (
                  <motion.button
                    key={idx}
                    className={`cq-option ${optionState(idx)}`}
                    onClick={() => !submitting && setSelectedOption(idx)}
                    disabled={submitting}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.1 }}
                  >
                    <span className="cq-option-letter">{LETTERS[idx]}</span>
                    <span className="cq-option-text">{option}</span>
                  </motion.button>
                ))}
              </div>

              {/* Submit */}
              {!feedback && (
                <div className="cq-submit-area">
                  <button
                    className="cq-submit-btn"
                    onClick={handleSubmit}
                    disabled={selectedOption === null || submitting}
                  >
                    {submitting ? 'Checking…' : 'Submit Answer'}
                  </button>
                </div>
              )}

              {/* Feedback panel */}
              <AnimatePresence>
                {feedback === 'incorrect' && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className={`cq-feedback ${feedback}`} style={{ margin: '0 18px 14px' }}>
                      <div className="cq-feedback-header">
                        <div className="cq-feedback-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </div>
                        <span className="cq-feedback-title">Not quite right</span>
                      </div>
                      <div className="cq-feedback-body">
                        <p className="cq-feedback-answer-label">Correct answer</p>
                        <p className="cq-feedback-answer-text">
                          {(currentMcq.options || [])[currentMcq.correctIndex ?? 0]}
                        </p>
                        <p className="cq-feedback-note">This question will appear again for review.</p>
                      </div>
                    </div>

                    <button className="cq-feedback-continue" onClick={advanceQuestion}>
                      Continue →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default ChapterQuiz;