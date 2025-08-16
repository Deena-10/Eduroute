//frontend/src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FloatingCard = ({ delay, icon, text, startX, horizontalRange, duration }) => {
  const animationName = `floatMovement${delay}`;

  return (
    <div style={{
      position: 'absolute',
      top: '10%',
      left: startX,
      backgroundColor: 'rgba(255,255,255,0.15)',
      backdropFilter: 'blur(10px)',
      padding: '16px',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 'bold',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      width: '144px',
      height: '96px',
      animation: `${animationName} ${duration}s ease-in-out infinite`,
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      <div style={{ fontSize: '32px' }}>{icon}</div>
      <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '14px' }}>{text}</div>
      <style>{`
        @keyframes ${animationName} {
          0% { transform: translate(0,0); opacity: 0.8; }
          50% { transform: translate(${horizontalRange}, 80%); opacity: 1; }
          100% { transform: translate(0,0); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

const LoginApp = () => {
  const { login, googleSignIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return setMessage('Please enter both email and password.');
    setIsLoading(true);
    setMessage('');
    try {
      const result = await login(email, password);
      if (result.success) {
        setMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/questionnaire'), 2000);
      } else {
        setMessage(result.error || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setMessage('Login failed. Please try again.');
      console.error(err);
    } finally { setIsLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const result = await googleSignIn();
      if (result.success) {
        setMessage('Google login successful! Redirecting...');
        setTimeout(() => navigate('/questionnaire'), 2000);
      } else {
        setMessage(result.error || 'Google login failed.');
      }
    } catch (err) {
      setMessage('Google login failed. Please try again.');
      console.error(err);
    } finally { setIsLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', overflowY: 'auto' }}>
      {/* Left Section */}
      <div style={{
        flex: 1,
        padding: '24px 48px',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #9242f5 0%, #000 100%)'
      }}>
        <div style={{ zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '48px' }}>🎓</div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>EduRoute AI</h2>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginTop: '32px', marginBottom: 0 }}>Welcome back!</h1>
          <p style={{ marginTop: '16px', opacity: 0.9, maxWidth: '400px', fontSize: '18px', lineHeight: 1.6 }}>
            Login to continue your personalized learning journey with EduRoute AI.
          </p>
        </div>

        {/* Floating Cards */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <FloatingCard delay={0} icon="🌐" text="Global Access" startX="15%" horizontalRange="20px" duration={10} />
          <FloatingCard delay={4} icon="🔒" text="Secure Login" startX="35%" horizontalRange="-18px" duration={12} />
          <FloatingCard delay={8} icon="⚙️" text="Settings" startX="55%" horizontalRange="22px" duration={11} />
          <FloatingCard delay={12} icon="📅" text="Schedule" startX="70%" horizontalRange="-20px" duration={9} />
          <FloatingCard delay={16} icon="🚀" text="Fast Progress" startX="85%" horizontalRange="18px" duration={10} />
        </div>
      </div>

      {/* Right Section */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 40px' }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '32px 48px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            {/* 🎯 THE FIX: Changed to "Login to your account" */}
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>Login to your account</h2>
            <p style={{ color: '#64748b', marginTop: '8px', fontSize: '16px' }}>Enter your details below to continue</p>
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', color: '#9ca3af', fontSize: '20px' }}>📧</span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#111827'
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', color: '#9ca3af', fontSize: '20px' }}>🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                color: '#111827'
              }}
            />
            <button onClick={() => setShowPassword(!showPassword)} style={{
              position: 'absolute',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              fontSize: '20px'
            }}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Remember/Forgot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#374151', fontSize: '14px' }}>
              <input type="checkbox" style={{ marginRight: '8px' }} /> Remember me
            </label>
            <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '14px' }}>Forgot password?</button>
          </div>

          {/* Login Button */}
          {/* 🎯 THE FIX: Changed to "Login" and "Logging In..." */}
          <button onClick={handleLogin} disabled={isLoading} style={{
            width: '100%',
            padding: '16px',
            marginBottom: '24px',
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}>
            {isLoading ? 'Logging In...' : 'Login'}
          </button>

          {/* Message */}
          {message && <div style={{
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            backgroundColor: message.includes('successful') ? '#d1fae5' : '#fee2e2',
            color: message.includes('successful') ? '#065f46' : '#991b1b',
            border: `1px solid ${message.includes('successful') ? '#a7f3d0' : '#fecaca'}`
          }}>{message}</div>}

          {/* Google Login */}
          {/* 🎯 THE FIX: Changed to "Login with Google" */}
          <button onClick={handleGoogleLogin} disabled={isLoading} style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#fff',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            {/* Google Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google
          </button>

          {/* Signup Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Don&apos;t have an account?{' '}
              <button onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginApp;
