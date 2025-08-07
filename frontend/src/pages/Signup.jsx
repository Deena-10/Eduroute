import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../style/Signup.css';

const Signup = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!form.password) {
            newErrors.password = 'Password is required';
        } else if (form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await axiosInstance.post('/auth/signup', {
                name: form.name,
                email: form.email,
                password: form.password
            });
            alert('Signup successful! Please login.');
            // Redirect to login page
            window.location.href = '/login';
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-wrapper">
            <div className="signup-left">
                <div className="brand-section">
                    <div className="logo">
                        <div className="logo-icon">🚀</div>
                        <h2>EduRoute AI</h2>
                    </div>
                    <h1>Start Your Career Journey</h1>
                    <p>Join thousands of professionals who are building their dream careers with our comprehensive roadmap platform.</p>
                </div>
                <div className="benefits">
                    <div className="benefit-item">
                        <span className="benefit-icon">🎯</span>
                        <div className="benefit-content">
                            <h3>Personalized Roadmaps</h3>
                            <p>Get customized career paths based on your goals and skills</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">📈</span>
                        <div className="benefit-content">
                            <h3>Track Progress</h3>
                            <p>Monitor your advancement and celebrate milestones</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">💡</span>
                        <div className="benefit-content">
                            <h3>Expert Guidance</h3>
                            <p>Access industry insights and professional advice</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="signup-right">
                <div className="signup-form-container">
                    <div className="form-header">
                        <h2>Create Account</h2>
                        <p>Join our community and start building your future</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="input-group">
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input 
                                    name="name" 
                                    type="text"
                                    placeholder="Full name" 
                                    onChange={handleChange}
                                    className={errors.name ? 'error' : ''}
                                    required
                                />
                            </div>
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                        
                        <div className="input-group">
                            <div className="input-wrapper">
                                <span className="input-icon">📧</span>
                                <input 
                                    name="email" 
                                    type="email"
                                    placeholder="Email address" 
                                    onChange={handleChange}
                                    className={errors.email ? 'error' : ''}
                                    required
                                />
                            </div>
                            {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        
                        <div className="input-group">
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input 
                                    name="password" 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password" 
                                    onChange={handleChange}
                                    className={errors.password ? 'error' : ''}
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
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>
                        
                        <div className="input-group">
                            <div className="input-wrapper">
                                <span className="input-icon">🔐</span>
                                <input 
                                    name="confirmPassword" 
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password" 
                                    onChange={handleChange}
                                    className={errors.confirmPassword ? 'error' : ''}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>
                        
                        <div className="form-options">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" required />
                                <span className="checkmark"></span>
                                I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                            </label>
                        </div>
                        
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (
                                <span className="loading-spinner">
                                    <div className="spinner"></div>
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                    
                    <div className="divider">
                        <span>or</span>
                    </div>
                    
                    <div className="social-signup">
                        <button className="social-btn google">
                            <span>🔍</span>
                            Continue with Google
                        </button>
                        <button className="social-btn github">
                            <span>🐙</span>
                            Continue with GitHub
                        </button>
                    </div>
                    
                    <div className="login-link">
                        <p>Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
