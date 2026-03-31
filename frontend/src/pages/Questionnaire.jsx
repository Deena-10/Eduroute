// frontend/src/pages/Questionnaire.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const steps = ['Domain', 'Level', 'Goal', 'Status'];

const Questionnaire = () => {
  const { loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [domain, setDomain] = useState("");
  const [proficiency, setProficiency] = useState("Beginner");
  const [professionalGoal, setProfessionalGoal] = useState("job-ready");
  const [currentStatus, setCurrentStatus] = useState("College student");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPrefill = async () => {
      try {
        const res = await axiosInstance.get("/user/onboarding-preferences");
        const prefs = res.data?.data ?? res.data;
        if (prefs) {
          if (prefs.domain) setDomain(prefs.domain);
          if (prefs.proficiency_level) setProficiency(prefs.proficiency_level);
          if (prefs.professional_goal) setProfessionalGoal(prefs.professional_goal);
          if (prefs.current_status) setCurrentStatus(prefs.current_status);
          const hasAll = prefs.domain && prefs.proficiency_level && prefs.professional_goal;
          if (hasAll) {
            const r = await axiosInstance.get("/user/roadmap").catch(() => null);
            const row = r?.data?.data ?? r?.data?.roadmap;
            if (row) navigate("/roadmap", { replace: true });
          }
        }
      } catch (e) { console.warn("Could not load onboarding preferences:", e?.message); }
    };
    loadPrefill();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) { setError("Domain is required."); return; }
    if (!professionalGoal.trim()) { setError("Professional goal is required."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/ai/generate-career-roadmap", {
        domain: domain.trim(), proficiency_level: proficiency,
        professional_goal: professionalGoal, current_status: currentStatus, forceRegenerate: true,
      });
      if (res.data.success) { navigate("/roadmap"); }
      else { setError("Something went wrong. Please try again."); }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      const isUnreachable =
        msg?.includes("not running") ||
        msg?.includes("ECONNREFUSED") ||
        msg?.includes("ENOTFOUND") ||
        msg?.includes("timeout") ||
        msg?.includes("AI service unavailable") ||
        err.response?.status === 503;
      setError(
        isUnreachable
          ? "Could not reach the AI service. On Render: set the backend env AI_SERVICE_URL to your Python service URL (no trailing slash), redeploy backend, then try again. For local dev: run the ai_service on port 5001."
          : msg || "Failed to generate roadmap. Please try again."
      );
    } finally { setSubmitting(false); }
  };

  const filledCount = [domain.trim(), proficiency, professionalGoal, currentStatus].filter(Boolean).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F9F5' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #D8F3DC', borderTopColor: '#2D6A4F', animation: 'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 20px 60px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#1A2E1A',
      background: '#F4F9F5',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes floatup { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sway { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4);opacity:.6} }

        .q-form-card {
          background: #FFFFFF;
          border-radius: 22px;
          border: 1px solid #D4E8D7;
          box-shadow: 0 12px 40px rgba(26,46,26,0.09);
          padding: 30px;
          animation: floatup 0.5s cubic-bezier(0.22,1,0.36,1);
        }

        .q-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1.5px solid #D4E8D7;
          background: #F4F9F5;
          font-size: 14px;
          color: #1A2E1A;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.16s, box-shadow 0.16s;
          box-sizing: border-box;
          font-weight: 500;
        }
        .q-input:focus {
          border-color: #40916C !important;
          box-shadow: 0 0 0 3px rgba(64,145,108,0.12) !important;
          background: #FFFFFF;
        }
        .q-input::placeholder { color: #9AB89D; }

        .q-select {
          width: 100%;
          padding: 11px 36px 11px 14px;
          border-radius: 10px;
          border: 1.5px solid #D4E8D7;
          background: #F4F9F5;
          font-size: 14px;
          color: #1A2E1A;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          transition: border-color 0.16s, box-shadow 0.16s;
          box-sizing: border-box;
        }
        .q-select:focus {
          border-color: #40916C !important;
          box-shadow: 0 0 0 3px rgba(64,145,108,0.12) !important;
          background: #FFFFFF;
        }

        .q-pill-btn {
          flex: 1;
          padding: 11px 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          border-radius: 11px;
          cursor: pointer;
          transition: all 0.15s;
          border: 1.5px solid #D4E8D7;
          background: #F4F9F5;
          color: #6B8F71;
        }
        .q-pill-btn:hover { border-color: #B7E4C7; background: #F0FAF3; color: #2D6A4F; }
        .q-pill-btn.selected {
          border-color: #2D6A4F;
          background: #D8F3DC;
          color: #2D6A4F;
          box-shadow: 0 2px 10px rgba(45,106,79,0.18);
        }

        .q-submit-btn {
          width: 100%;
          min-height: 50px;
          padding: 0 24px;
          background: #2D6A4F;
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 800;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 24px rgba(45,106,79,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 4px;
        }
        .q-submit-btn:hover:not(:disabled) { background: #40916C; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(45,106,79,0.35); }
        .q-submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .q-submit-btn:disabled { background: #9AB89D; cursor: not-allowed; box-shadow: none; }

        .q-step-dot {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800;
          transition: all 0.3s;
          flex-shrink: 0;
        }
        .q-step-dot.done { background: #2D6A4F; color: #fff; box-shadow: 0 2px 10px rgba(45,106,79,0.35); }
        .q-step-dot.current { background: #D8F3DC; border: 2px solid #2D6A4F; color: #2D6A4F; }
        .q-step-dot.pending { background: #EBF5EE; color: #9AB89D; border: 1.5px solid #D4E8D7; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 500 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#40916C', marginBottom: 18,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#52B788',
              display: 'inline-block', animation: 'sway 3s ease-in-out infinite',
            }} />
            EduRoute AI
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(1.8rem,4vw,2.4rem)',
            fontWeight: 700, color: '#1A2E1A',
            letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 10,
          }}>
            Create Your Career<br/>
            <em style={{ fontStyle: 'italic', color: '#2D6A4F' }}>Roadmap</em>
          </h1>
          <p style={{ fontSize: 14, color: '#6B8F71', lineHeight: 1.7, fontWeight: 500 }}>
            Enter your details once. You won't be asked again on future logins.
          </p>
        </div>

        {/* Progress steps */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #D4E8D7', borderRadius: 16,
          padding: '14px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center',
          boxShadow: '0 2px 10px rgba(26,46,26,0.05)',
        }}>
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div className={`q-step-dot ${i < filledCount ? 'done' : i === filledCount ? 'current' : 'pending'}`}>
                  {i < filledCount ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, marginTop: 4,
                  color: i <= filledCount ? '#2D6A4F' : '#9AB89D',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>{step}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  height: 2, flex: 1, borderRadius: 2,
                  background: i < filledCount - 1 ? '#2D6A4F' : '#E8F4EA',
                  transition: 'background 0.3s',
                  marginBottom: 18,
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form card */}
        <div className="q-form-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Domain */}
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700, color: '#3D5A3E',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
              }}>
                Primary Interest or Domain
              </label>
              <input
                type="text" value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="e.g. Python, Web Development, Data Science"
                disabled={submitting}
                className="q-input"
              />
            </div>

            {/* Proficiency - visual pills */}
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700, color: '#3D5A3E',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
              }}>
                Proficiency Level
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button
                    key={lvl} type="button"
                    onClick={() => !submitting && setProficiency(lvl)}
                    className={`q-pill-btn${proficiency === lvl ? ' selected' : ''}`}
                    disabled={submitting}
                  >{lvl}</button>
                ))}
              </div>
            </div>

            {/* Professional Goal */}
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700, color: '#3D5A3E',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
              }}>
                Professional Goal
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={professionalGoal}
                  onChange={e => setProfessionalGoal(e.target.value)}
                  disabled={submitting}
                  className="q-select"
                >
                  <option value="job-ready">Job-ready</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="product-based">Product-based</option>
                </select>
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B8F71' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <label style={{
                display: 'block', fontSize: 12, fontWeight: 700, color: '#3D5A3E',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
              }}>
                Current Status
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={currentStatus}
                  onChange={e => setCurrentStatus(e.target.value)}
                  disabled={submitting}
                  className="q-select"
                >
                  <option value="School student">School student</option>
                  <option value="College student">College student</option>
                  <option value="Working professional">Working professional</option>
                </select>
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6B8F71' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '12px 16px',
                background: '#FFF5F5',
                border: '1px solid #FED7D7',
                borderLeft: '3px solid #E53E3E',
                borderRadius: 11,
                fontSize: 13, color: '#C53030', lineHeight: 1.5,
              }}>{error}</div>
            )}

            {/* Submit */}
            <button type="submit" disabled={submitting} className="q-submit-btn">
              {submitting ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', animation: 'spin 0.7s linear infinite',
                  }} />
                  Generating roadmap…
                </>
              ) : (
                <>
                  Generate My Roadmap
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#9AB89D' }}>
          Your preferences are saved. No re-entry needed on future logins.
        </p>
      </div>
    </div>
  );
};

export default Questionnaire;