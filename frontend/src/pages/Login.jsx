import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import '../style/Login.css';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [form, setForm] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // 📌 Email/Password Login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axiosInstance.post('/auth/login', form);
            login(res.data.user, res.data.token);
            localStorage.setItem('token', res.data.token);
            navigate('/questionnaire');
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // 📌 Google Login via Firebase
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // ✅ Firebase ID token for backend verification
            const idToken = await user.getIdToken();

            const res = await axiosInstance.post('/auth/google', { idToken });

            login(res.data.user, res.data.token);
            localStorage.setItem('token', res.data.token);

            navigate('/questionnaire');
        } catch (error) {
            console.error('Google login failed:', error);
            alert('Google login failed. Please try again.');
        }
    };

    return (
        <div className="login-wrapper">
            {/* LEFT SECTION */}
            <div className="login-left">
                <div className="brand-section">
                    <div className="logo">
                        <div className="logo-icon">🚀</div>
                        <h2>EduRoute AI</h2>
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Log in to continue your career journey with our AI-powered guidance platform.</p>
                </div>
                <div className="illustration">
                    <div className="floating-card card-1">
                        <span>📈</span>
                        <p>Track Progress</p>
                    </div>
                    <div className="floating-card card-2">
                        <span>🎯</span>
                        <p>Set Goals</p>
                    </div>
                    <div className="floating-card card-3">
                        <span>💼</span>
                        <p>Build Skills</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="login-right">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Login</h2>
                        <p>Enter your credentials to log in</p>
                    </div>

                    {/* EMAIL/PASSWORD LOGIN */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <div className="input-wrapper">
                                <span className="input-icon">📧</span>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Email address"
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <a href="/forgot-password" className="forgot-link">Forgot password?</a>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <span className="loading-spinner">
                                    <div className="spinner"></div>
                                    Logging in...
                                </span>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    {/* DIVIDER */}
                    <div className="divider"><span>or</span></div>

                    {/* GOOGLE LOGIN */}
                    <div className="social-login">
                        <button className="google-btn" onClick={handleGoogleLogin}>
                            <img
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google logo"
                            />
                            Continue with Google
                        </button>
                    </div>

                    <div className="signup-link">
                        <p>Don't have an account? <a href="/signup">Sign up</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
