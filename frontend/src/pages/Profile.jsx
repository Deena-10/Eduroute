import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

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
            setProfile({
                ...profile,
                [name]: value.split(',').map(item => item.trim()).filter(Boolean)
            });
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
            <div style={styles.loaderContainer}>
                <div style={styles.spinner}></div>
                <h3 style={styles.loaderText}>Loading your profile...</h3>
                <style>{spinKeyframes}</style>
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={styles.loaderContainer}>
                <div style={{ ...styles.avatar, backgroundColor: '#f87171' }}>⚠️</div>
                <h2 style={{ marginTop: '16px', color: '#1e293b', fontSize: '24px' }}>Profile Not Found</h2>
                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                    Unable to load your profile. Please try refreshing the page.
                </p>
            </div>
        );
    }

    return (
        <div style={styles.pageContainer}>
            <div style={styles.contentContainer}>
                {/* Profile Header */}
                <div style={styles.headerCard}>
                    <div style={{
                        ...styles.avatar,
                        backgroundColor: '#3b82f6',
                        fontSize: '48px'
                    }}>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <h1 style={styles.profileName}>{profile.name || 'User Profile'}</h1>
                    <p style={styles.email}>{user?.email}</p>

                    <div style={styles.statsContainer}>
                        <div style={styles.statBox}>
                            <div style={styles.statNumber}>{profile.interests?.length || 0}</div>
                            <div style={styles.statLabel}>Interests</div>
                        </div>
                        <div style={styles.statBox}>
                            <div style={styles.statNumber}>{profile.strengths?.length || 0}</div>
                            <div style={styles.statLabel}>Strengths</div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div style={styles.gridContainer}>
                    {/* Personal Information */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}><span style={{ marginRight: '12px', color: '#3b82f6', fontSize: '24px' }}>👤</span> Personal Information</div>
                        <input
                            style={styles.input}
                            placeholder="Enter your full name"
                            name="name"
                            value={profile.name || ''}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Career Interests */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}><span style={{ marginRight: '12px', color: '#3b82f6', fontSize: '24px' }}>🎯</span> Career Interests</div>
                        <p style={styles.cardText}>What fields or industries interest you?</p>
                        <textarea
                            style={styles.textarea}
                            placeholder="e.g., Web Development, Data Science, UI/UX Design"
                            name="interests"
                            value={profile.interests?.join(', ') || ''}
                            onChange={handleChange}
                        />
                        <p style={styles.helperText}>Separate multiple interests with commas</p>
                    </div>
                </div>

                {/* Skills & Strengths */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}><span style={{ marginRight: '12px', color: '#3b82f6', fontSize: '24px' }}>💪</span> Skills & Strengths</div>
                    <p style={styles.cardText}>What are your key skills and strengths?</p>
                    <textarea
                        style={styles.textarea}
                        placeholder="e.g., Problem Solving, Leadership, Technical Skills"
                        name="strengths"
                        value={profile.strengths?.join(', ') || ''}
                        onChange={handleChange}
                    />
                    <p style={styles.helperText}>Separate multiple strengths with commas</p>
                </div>

                {/* Message Display */}
                {message && (
                    <div style={{
                        ...styles.messageBox,
                        backgroundColor: message.includes('successfully') ? '#d1fae5' : '#fee2e2',
                        color: message.includes('successfully') ? '#065f46' : '#991b1b',
                        border: `1px solid ${message.includes('successfully') ? '#a7f3d0' : '#fecaca'}`
                    }}>
                        {message}
                    </div>
                )}

                {/* Save Button */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <button
                        onClick={handleUpdate}
                        disabled={isSaving}
                        style={{
                            ...styles.saveButton,
                            opacity: isSaving ? 0.7 : 1,
                            cursor: isSaving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSaving ? (
                            <>
                                <div style={styles.spinner}></div>
                                Saving...
                            </>
                        ) : (
                            <>💾 Save Changes</>
                        )}
                    </button>
                </div>
            </div>
            <style>{spinKeyframes}</style>
        </div>
    );
};

const spinKeyframes = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

const styles = {
    pageContainer: { flex: 1, backgroundColor: '#f8fafc', overflowY: 'auto', minHeight: '100vh', padding: '24px' },
    contentContainer: { maxWidth: '1200px', margin: '0 auto' },
    loaderContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', textAlign: 'center', backgroundColor: '#f8fafc' },
    spinner: { width: '20px', height: '20px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' },
    loaderText: { marginTop: '24px', color: '#64748b', fontWeight: 500 },
    avatar: { width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto 24px', color: 'white' },
    headerCard: { backgroundColor: 'white', padding: '32px', marginBottom: '32px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' },
    profileName: { marginBottom: '8px', color: '#1e293b', fontSize: '32px', fontWeight: 'bold' },
    email: { marginBottom: '24px', color: '#64748b', fontSize: '18px' },
    statsContainer: { display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' },
    statBox: { textAlign: 'center' },
    statNumber: { fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' },
    statLabel: { color: '#64748b', fontSize: '14px' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' },
    cardHeader: { display: 'flex', alignItems: 'center', marginBottom: '16px', fontSize: '20px', fontWeight: '600', color: '#1e293b' },
    cardText: { color: '#64748b', marginBottom: '8px', fontSize: '14px' },
    input: { width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', marginBottom: '24px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', marginBottom: '8px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
    helperText: { color: '#9ca3af', fontSize: '12px', margin: 0 },
    messageBox: { padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center' },
    saveButton: { padding: '16px 32px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', hover: { opacity: 0.85 } }
};

export default Profile;
