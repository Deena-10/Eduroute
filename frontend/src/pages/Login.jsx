// frontend/src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext);
  const login = authContext?.login;
  const googleSignIn = authContext?.googleSignIn;
  const navigate = useNavigate();

  if (!authContext || typeof login !== "function") {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <p style={{ color: "#DC2626", fontWeight: 600, fontSize: 14 }}>
            Auth not available. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) navigate("/");
      else setError(result.message || "Login failed");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const result = await googleSignIn();
      if (result.success) navigate("/");
      else setError(result.message || "Google sign in failed");
    } catch (err) {
      setError(err.message || "Google sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green:       #2D6A4F;
          --green-mid:   #40916C;
          --green-light: #52B788;
          --green-soft:  #D8F3DC;
          --green-mist:  #F0FAF3;
          --green-line:  #B7E4C7;
          --sage-dim:    rgba(82,183,136,0.12);
          --text-1:      #1A2E1A;
          --text-2:      #3D5A3E;
          --text-3:      #6B8F71;
          --text-4:      #9AB89D;
          --surface:     #FFFFFF;
          --bg:          #F4F9F5;
          --bg-deep:     #EBF5EE;
          --border:      #D4E8D7;
          --border-soft: #E8F4EA;
          --shadow-green: 0 6px 24px rgba(45,106,79,0.18);
          --shadow-lg:    0 12px 40px rgba(26,46,26,0.12);
          --shadow-md:    0 6px 24px rgba(26,46,26,0.09);
        }

        .login-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Decorative background blobs */
        .login-page::before {
          content: '';
          position: fixed;
          top: -120px;
          right: -120px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(82,183,136,0.18) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .login-page::after {
          content: '';
          position: fixed;
          bottom: -100px;
          left: -100px;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(45,106,79,0.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
          animation: floatup 0.55s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes floatup {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Brand header */
        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 28px;
          text-align: center;
        }

        .login-brand-icon {
          width: 52px;
          height: 52px;
          background: var(--green);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-green);
          margin-bottom: 14px;
        }

        .login-brand-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: var(--text-1);
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .login-brand-name span { color: var(--green); }

        .login-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--green-mid);
          margin-bottom: 6px;
        }
        .eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--green-light);
          animation: sway 3s ease-in-out infinite;
        }
        @keyframes sway {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.5); opacity: .5; }
        }

        .login-headline {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-1);
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 4px;
        }
        .login-headline em {
          font-style: italic;
          color: var(--green);
        }

        .login-subtext {
          font-size: 13px;
          color: var(--text-3);
          line-height: 1.6;
        }

        /* Card */
        .login-card {
          background: var(--surface);
          border-radius: 22px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          padding: 28px 28px 24px;
        }

        /* Error */
        .login-error {
          margin-bottom: 18px;
          padding: 12px 14px;
          background: #FFF1F1;
          border: 1px solid #FECACA;
          border-left: 3px solid #EF4444;
          border-radius: 10px;
        }
        .login-error p {
          font-size: 13px;
          font-weight: 600;
          color: #DC2626;
        }

        /* Form */
        .form-group { margin-bottom: 16px; }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-2);
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }

        .form-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          font-size: 14px;
          color: var(--text-1);
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none;
          transition: border-color 0.16s, box-shadow 0.16s;
        }
        .form-input:focus {
          border-color: var(--green-mid);
          box-shadow: 0 0 0 3px rgba(64,145,108,0.1);
        }
        .form-input::placeholder { color: var(--text-4); }

        /* Forgot password */
        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -8px;
          margin-bottom: 20px;
        }
        .forgot-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-3);
          text-decoration: none;
          transition: color 0.15s;
        }
        .forgot-link:hover { color: var(--green); }

        /* Primary button */
        .btn-primary {
          width: 100%;
          padding: 12px 24px;
          border-radius: 11px;
          background: var(--green);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.16s, box-shadow 0.16s, transform 0.1s;
          box-shadow: var(--shadow-green);
          letter-spacing: 0.01em;
          min-height: 44px;
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--green-mid);
          box-shadow: 0 8px 32px rgba(45,106,79,0.28);
        }
        .btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Divider */
        .divider-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 20px 0;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border-soft);
        }
        .divider-text {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Google button */
        .btn-google {
          width: 100%;
          padding: 11px 24px;
          border-radius: 11px;
          background: var(--surface);
          color: var(--text-2);
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid var(--border);
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: border-color 0.16s, background 0.16s, transform 0.1s;
          min-height: 44px;
        }
        .btn-google:hover:not(:disabled) {
          border-color: var(--green-light);
          background: var(--green-mist);
        }
        .btn-google:active:not(:disabled) { transform: scale(0.97); }
        .btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Footer */
        .login-footer {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid var(--border-soft);
          text-align: center;
          font-size: 13px;
          color: var(--text-3);
        }
        .login-footer a {
          font-weight: 700;
          color: var(--green);
          text-decoration: none;
          transition: color 0.15s;
        }
        .login-footer a:hover { color: var(--green-mid); }

        /* Spinner */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .spinner-dark {
          border-color: rgba(45,106,79,0.25);
          border-top-color: var(--green);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="login-page">
        <div className="login-wrapper">

          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="login-eyebrow">
              <span className="eyebrow-dot"></span>
              Your learning path
            </div>
            <h1 className="login-headline">Welcome <em>back</em></h1>
            <p className="login-subtext">Sign in to continue your career journey</p>
          </div>

          {/* Card */}
          <div className="login-card">
            {error && (
              <div className="login-error">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>

              <div className="forgot-row">
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="divider-row">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="btn-google"
            >
              {isLoading ? (
                <>
                  <span className="spinner spinner-dark"></span>
                  Signing in…
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="login-footer">
              Don't have an account?{" "}
              <Link to="/signup">Sign up</Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

// Unused — kept for potential SSR/non-JSX fallback
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#F4F9F5",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  errorCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    textAlign: "center",
    maxWidth: 360,
    boxShadow: "0 12px 40px rgba(26,46,26,0.12)",
  },
};

export default Login;