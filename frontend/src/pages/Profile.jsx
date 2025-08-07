import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import '../style/Profile.css';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/user/profile');
                setProfile(res.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'interests' || name === 'strengths') {
            setProfile({ ...profile, [name]: value.split(',').map(item => item.trim()) });
        } else {
            setProfile({ ...profile, [name]: value });
        }
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            await axiosInstance.put('/user/profile', profile);
            setMessage('Profile updated successfully! 🎉');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update profile. Please try again.');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-error">
                <div className="error-card">
                    <span className="error-icon">⚠️</span>
                    <h2>Profile Not Found</h2>
                    <p>Unable to load your profile. Please try refreshing the page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                    <h1>{profile.name || 'User Profile'}</h1>
                    <p className="profile-email">{user?.email}</p>
                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-number">{profile.interests?.length || 0}</span>
                            <span className="stat-label">Interests</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{profile.strengths?.length || 0}</span>
                            <span className="stat-label">Strengths</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-section">
                    <div className="section-header">
                        <span className="section-icon">👤</span>
                        <h2>Personal Information</h2>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={profile.name || ''}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                        />
                    </div>
                </div>

                <div className="profile-section">
                    <div className="section-header">
                        <span className="section-icon">🎯</span>
                        <h2>Career Interests</h2>
                        <p className="section-description">What fields or industries interest you?</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="interests">Interests (comma-separated)</label>
                        <textarea
                            id="interests"
                            name="interests"
                            value={profile.interests?.join(', ') || ''}
                            onChange={handleChange}
                            placeholder="e.g., Web Development, Data Science, UI/UX Design"
                            rows="3"
                        />
                        <div className="input-help">
                            Separate multiple interests with commas
                        </div>
                    </div>
                </div>

                <div className="profile-section">
                    <div className="section-header">
                        <span className="section-icon">💪</span>
                        <h2>Skills & Strengths</h2>
                        <p className="section-description">What are your key skills and strengths?</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="strengths">Strengths (comma-separated)</label>
                        <textarea
                            id="strengths"
                            name="strengths"
                            value={profile.strengths?.join(', ') || ''}
                            onChange={handleChange}
                            placeholder="e.g., Problem Solving, Leadership, Technical Skills"
                            rows="3"
                        />
                        <div className="input-help">
                            Separate multiple strengths with commas
                        </div>
                    </div>
                </div>

                {message && (
                    <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                        <span className="message-icon">
                            {message.includes('successfully') ? '✅' : '❌'}
                        </span>
                        {message}
                    </div>
                )}

                <div className="profile-actions">
                    <button 
                        className="save-btn" 
                        onClick={handleUpdate}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <span className="loading-spinner">
                                <div className="spinner"></div>
                                Saving...
                            </span>
                        ) : (
                            <>
                                <span className="btn-icon">💾</span>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
