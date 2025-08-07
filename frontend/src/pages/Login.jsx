import React, { useState, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import '../style/Login.css';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [form, setForm] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axiosInstance.post('/auth/login', form);
            login(res.data.user, res.data.token);
            alert('Login successful!');
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-left">
                <div className="brand-section">
                    <div className="logo">
                        <div className="logo-icon">🚀</div>
                        <h2>EduRoute AI</h2>
                    </div>
                    <h1>Welcome to Your Career Journey</h1>
                    <p>Discover your path, build your future, and achieve your dreams with our comprehensive career roadmap platform.</p>
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
            
            <div className="login-right">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Login</h2>
                        <p>Enter your credentials to access your account</p>
                    </div>
                    
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
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password" 
                                    onChange={handleChange}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "🙈" : "👁️"}
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
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                    
                    <div className="divider">
                        <span>or</span>
                    </div>
                    
                    <div className="social-login">
                        <button className="social-btn google">
                            <span>🔍</span>
                            Continue with Google
                        </button>
                        <button className="social-btn github">
                            <span>🐙</span>
                            Continue with GitHub
                        </button>
                    </div>
                    
                    <div className="signup-link">
                        <p>Don't have an account? <a href="/signup">Create one</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
