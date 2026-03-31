// frontend/src/pages/Signup.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const G = {
  green: '#2D6A4F', greenMid: '#40916C', greenLight: '#52B788',
  greenSoft: '#D8F3DC', greenMist: '#F0FAF3', greenLine: '#B7E4C7',
  sageDim: 'rgba(82,183,136,0.12)',
  text1: '#1A2E1A', text2: '#3D5A3E', text3: '#6B8F71', text4: '#9AB89D',
  surface: '#FFFFFF', bg: '#F4F9F5', bgDeep: '#EBF5EE',
  border: '#D4E8D7', borderSoft: '#E8F4EA',
  shadowSm: '0 2px 10px rgba(26,46,26,0.06)',
  shadowMd: '0 6px 24px rgba(26,46,26,0.09)',
  shadowLg: '0 12px 40px rgba(26,46,26,0.12)',
  shadowGreen: '0 6px 24px rgba(45,106,79,0.18)',
};

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup, googleSignIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setIsLoading(true);
    try {
      const result = await signup(formData.email, formData.password, formData.name);
      if (result.success) navigate("/");
      else setError(result.message || "Signup failed");
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    if (typeof googleSignIn !== "function") {
      setError("Google sign-in is not available. Please refresh the page.");
      return;
    }
    setError(""); setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result.success) navigate("/");
      else {
        const msg = result.message || "Google sign in failed";
        if (msg.includes("popup") || msg.includes("blocked")) {
          setError("Sign-in popup was blocked. Please allow popups for this site and try again.");
        } else {
          setError(msg);
        }
      }
    } catch (err) {
      const msg = err.message || "Google sign in failed. Please try again.";
      if (msg.includes("popup") || msg.includes("blocked")) {
        setError("Sign-in popup was blocked. Please allow popups for this site and try again.");
      } else {
        setError(msg);
      }
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: G.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'calc(env(safe-area-inset-top) + 24px) 20px calc(env(safe-area-inset-bottom) + 24px)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes floatup { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sway { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4);opacity:.6} }

        .sg-input {
          width: 100%; padding: 11px 14px;
          border-radius: 10px; border: 1.5px solid ${G.border};
          background: ${G.bg}; font-size: 14px; font-weight: 500;
          color: ${G.text1}; font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; transition: border-color 0.16s, box-shadow 0.16s, background 0.16s;
          box-sizing: border-box;
        }
        .sg-input:focus {
          border-color: ${G.greenMid} !important;
          box-shadow: 0 0 0 3px rgba(64,145,108,0.12) !important;
          background: ${G.surface} !important;
        }
        .sg-input::placeholder { color: ${G.text4}; }

        .sg-submit {
          width: 100%; min-height: 50px; border-radius: 13px;
          background: ${G.green}; color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 800;
          border: none; cursor: pointer; transition: all 0.2s;
          box-shadow: ${G.shadowGreen};
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .sg-submit:hover:not(:disabled) { background: ${G.greenMid}; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(45,106,79,0.32); }
        .sg-submit:active:not(:disabled) { transform: scale(0.98); }
        .sg-submit:disabled { background: ${G.text4}; cursor: not-allowed; box-shadow: none; }

        .sg-google {
          width: 100%; min-height: 50px; border-radius: 13px;
          background: ${G.surface}; color: ${G.text2};
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700;
          border: 1.5px solid ${G.border}; cursor: pointer; transition: all 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .sg-google:hover:not(:disabled) { border-color: ${G.greenLine}; background: ${G.greenMist}; color: ${G.text1}; }
        .sg-google:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 460, animation: 'floatup 0.5s cubic-bezier(0.22,1,0.36,1)' }}>

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: G.surface,
              border: `1px solid ${G.border}`,
              boxShadow: G.shadowMd,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL || ''}/logo.png`}
              alt="EduRoute"
              style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex'; }}
            />
            <span style={{ display: 'none', width: 52, height: 52, borderRadius: 12, background: '#2D6A4F', color: '#fff', fontWeight: 800, fontSize: 24, alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>E</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: G.greenMid, marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: G.greenLight, display: 'inline-block', animation: 'sway 3s ease-in-out infinite' }} />
            EduRoute AI
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.7rem,3.5vw,2.2rem)', fontWeight: 700, color: G.text1, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>
            Create Your Account
          </h1>
          <p style={{ fontSize: 14, color: G.text3, fontWeight: 500 }}>Join us to start your career journey</p>
        </div>

        {/* Form card */}
        <div style={{ background: G.surface, borderRadius: 22, border: `1px solid ${G.border}`, boxShadow: G.shadowLg, padding: '28px 28px 24px' }}>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#FFF5F5', border: '1px solid #FED7D7', borderLeft: `3px solid #E53E3E`, borderRadius: 11, fontSize: 13, color: '#C53030', lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {[
              { label: 'Full Name',        name: 'name',            type: 'text',     placeholder: 'John Doe' },
              { label: 'Email',            name: 'email',           type: 'email',    placeholder: 'you@example.com' },
              { label: 'Password',         name: 'password',        type: 'password', placeholder: '••••••••' },
              { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: '••••••••' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: G.text2, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>
                  {label}
                </label>
                <input
                  type={type} name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required placeholder={placeholder}
                  disabled={isLoading}
                  className="sg-input"
                />
              </div>
            ))}

            <button type="submit" disabled={isLoading} className="sg-submit" style={{ marginTop: 4 }}>
              {isLoading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                  Creating account…
                </>
              ) : (
                <>
                  Sign Up
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: G.borderSoft }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: G.text4 }}>or</span>
            <div style={{ flex: 1, height: 1, background: G.borderSoft }} />
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="sg-google">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Creating account…' : 'Continue with Google'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: G.text3 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: G.green, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = G.greenMid}
              onMouseLeave={e => e.currentTarget.style.color = G.green}
            >Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;