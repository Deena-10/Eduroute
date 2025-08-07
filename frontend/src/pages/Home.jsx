import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../style/Home.css';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('roadmap');

    const careerRoadmaps = [
        {
            id: 1,
            title: 'Software Development',
            icon: '💻',
            description: 'Full-stack development path with modern technologies',
            duration: '6-12 months',
            skills: ['JavaScript', 'React', 'Node.js', 'Python']
        },
        {
            id: 2,
            title: 'Data Science',
            icon: '📊',
            description: 'Analytics and machine learning career path',
            duration: '8-14 months',
            skills: ['Python', 'SQL', 'Machine Learning', 'Statistics']
        },
        {
            id: 3,
            title: 'Digital Marketing',
            icon: '📱',
            description: 'Digital marketing and growth hacking',
            duration: '4-8 months',
            skills: ['SEO', 'Social Media', 'Analytics', 'Content Marketing']
        },
        {
            id: 4,
            title: 'UI/UX Design',
            icon: '🎨',
            description: 'User experience and interface design',
            duration: '6-10 months',
            skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research']
        }
    ];

    const internshipOpportunities = [
        {
            id: 1,
            company: 'TechCorp Solutions',
            position: 'Frontend Developer Intern',
            location: 'Remote',
            duration: '3 months',
            stipend: '$800/month',
            skills: ['React', 'JavaScript', 'CSS'],
            deadline: '2024-02-15'
        },
        {
            id: 2,
            company: 'DataFlow Analytics',
            position: 'Data Analyst Intern',
            location: 'New York',
            duration: '6 months',
            stipend: '$1200/month',
            skills: ['Python', 'SQL', 'Excel'],
            deadline: '2024-03-01'
        },
        {
            id: 3,
            company: 'Digital Growth Agency',
            position: 'Marketing Intern',
            location: 'Los Angeles',
            duration: '4 months',
            stipend: '$600/month',
            skills: ['Social Media', 'Content Creation', 'Analytics'],
            deadline: '2024-02-28'
        }
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: 'Tech Career Fair 2024',
            date: '2024-02-20',
            time: '10:00 AM - 4:00 PM',
            location: 'Virtual Event',
            description: 'Connect with top tech companies and startups',
            attendees: 500,
            type: 'Career Fair'
        },
        {
            id: 2,
            title: 'AI/ML Workshop',
            date: '2024-02-25',
            time: '2:00 PM - 5:00 PM',
            location: 'Tech Hub Center',
            description: 'Hands-on workshop on machine learning fundamentals',
            attendees: 50,
            type: 'Workshop'
        },
        {
            id: 3,
            title: 'Startup Networking Night',
            date: '2024-03-05',
            time: '6:00 PM - 9:00 PM',
            location: 'Innovation District',
            description: 'Network with entrepreneurs and investors',
            attendees: 100,
            type: 'Networking'
        }
    ];

    const currentOpenings = [
        {
            id: 1,
            company: 'Google',
            position: 'Software Engineer',
            location: 'Mountain View, CA',
            type: 'Full-time',
            experience: '2-4 years',
            salary: '$120k-$180k',
            skills: ['Java', 'Python', 'Distributed Systems']
        },
        {
            id: 2,
            company: 'Microsoft',
            position: 'Data Scientist',
            location: 'Seattle, WA',
            type: 'Full-time',
            experience: '1-3 years',
            salary: '$100k-$150k',
            skills: ['Python', 'Machine Learning', 'SQL']
        },
        {
            id: 3,
            company: 'Netflix',
            position: 'Product Manager',
            location: 'Los Gatos, CA',
            type: 'Full-time',
            experience: '3-5 years',
            salary: '$130k-$200k',
            skills: ['Product Strategy', 'Analytics', 'Leadership']
        }
    ];

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Welcome to <span className="gradient-text">EduRoute AI</span>
                        </h1>
                        <p className="hero-subtitle">
                            Your AI-powered career companion for personalized guidance, internship opportunities, 
                            and professional growth. Discover your path to success with intelligent career mapping.
                        </p>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Career Paths</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">1000+</span>
                                <span className="stat-label">Internships</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">50+</span>
                                <span className="stat-label">Events Monthly</span>
                            </div>
                        </div>
                        {!user ? (
                            <div className="hero-actions">
                                <Link to="/signup" className="cta-button primary">
                                    Get Started
                                </Link>
                                <Link to="/login" className="cta-button secondary">
                                    Login
                                </Link>
                            </div>
                        ) : (
                            <div className="hero-actions">
                                <Link to="/profile" className="cta-button primary">
                                    View My Profile
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="hero-visual">
                        <div className="floating-elements">
                            <div className="floating-card card-1">
                                <span>🎯</span>
                                <p>Career Mapping</p>
                            </div>
                            <div className="floating-card card-2">
                                <span>💼</span>
                                <p>Internships</p>
                            </div>
                            <div className="floating-card card-3">
                                <span>📅</span>
                                <p>Events</p>
                            </div>
                            <div className="floating-card card-4">
                                <span>🚀</span>
                                <p>Job Openings</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">What We Offer</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🗺️</div>
                            <h3>Career Guidance Roadmap</h3>
                            <p>AI-powered personalized career paths tailored to your skills, interests, and goals. Get step-by-step guidance for your dream career.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💼</div>
                            <h3>Internship Opportunities</h3>
                            <p>Discover relevant internship opportunities from top companies. Get hands-on experience and build your professional network.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📅</div>
                            <h3>Events & Workshops</h3>
                            <p>Stay updated with industry events, workshops, and networking opportunities. Connect with professionals and expand your knowledge.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🚀</div>
                            <h3>Current Job Openings</h3>
                            <p>Find the latest job openings in your domain. Get personalized job recommendations based on your profile and preferences.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Dashboard */}
            <section className="dashboard-section">
                <div className="container">
                    <h2 className="section-title">Explore Opportunities</h2>
                    <div className="tab-navigation">
                        <button 
                            className={`tab-button ${activeTab === 'roadmap' ? 'active' : ''}`}
                            onClick={() => setActiveTab('roadmap')}
                        >
                            🗺️ Career Roadmaps
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'internships' ? 'active' : ''}`}
                            onClick={() => setActiveTab('internships')}
                        >
                            💼 Internships
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
                            onClick={() => setActiveTab('events')}
                        >
                            📅 Events
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('jobs')}
                        >
                            🚀 Job Openings
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'roadmap' && (
                            <div className="roadmap-grid">
                                {careerRoadmaps.map(roadmap => (
                                    <div key={roadmap.id} className="roadmap-card">
                                        <div className="roadmap-header">
                                            <span className="roadmap-icon">{roadmap.icon}</span>
                                            <h3>{roadmap.title}</h3>
                                        </div>
                                        <p className="roadmap-description">{roadmap.description}</p>
                                        <div className="roadmap-details">
                                            <span className="duration">⏱️ {roadmap.duration}</span>
                                            <div className="skills">
                                                {roadmap.skills.map(skill => (
                                                    <span key={skill} className="skill-tag">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <button className="explore-btn">Explore Path</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'internships' && (
                            <div className="internship-grid">
                                {internshipOpportunities.map(internship => (
                                    <div key={internship.id} className="internship-card">
                                        <div className="internship-header">
                                            <h3>{internship.position}</h3>
                                            <span className="company">{internship.company}</span>
                                        </div>
                                        <div className="internship-details">
                                            <span>📍 {internship.location}</span>
                                            <span>⏱️ {internship.duration}</span>
                                            <span>💰 {internship.stipend}</span>
                                        </div>
                                        <div className="skills">
                                            {internship.skills.map(skill => (
                                                <span key={skill} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                        <div className="deadline">
                                            <span>⏰ Deadline: {internship.deadline}</span>
                                        </div>
                                        <button className="apply-btn">Apply Now</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div className="events-grid">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="event-card">
                                        <div className="event-header">
                                            <span className="event-type">{event.type}</span>
                                            <h3>{event.title}</h3>
                                        </div>
                                        <div className="event-details">
                                            <span>📅 {event.date}</span>
                                            <span>🕒 {event.time}</span>
                                            <span>📍 {event.location}</span>
                                        </div>
                                        <p className="event-description">{event.description}</p>
                                        <div className="event-footer">
                                            <span>👥 {event.attendees} attendees</span>
                                            <button className="register-btn">Register</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div className="jobs-grid">
                                {currentOpenings.map(job => (
                                    <div key={job.id} className="job-card">
                                        <div className="job-header">
                                            <h3>{job.position}</h3>
                                            <span className="company">{job.company}</span>
                                        </div>
                                        <div className="job-details">
                                            <span>📍 {job.location}</span>
                                            <span>💼 {job.type}</span>
                                            <span>⏱️ {job.experience}</span>
                                            <span>💰 {job.salary}</span>
                                        </div>
                                        <div className="skills">
                                            {job.skills.map(skill => (
                                                <span key={skill} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                        <button className="apply-btn">Apply Now</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Start Your Career Journey?</h2>
                        <p>Join thousands of professionals who are building their dream careers with EduRoute AI</p>
                        {!user ? (
                            <div className="cta-actions">
                                <Link to="/signup" className="cta-button primary">Get Started Free</Link>
                                <Link to="/login" className="cta-button secondary">Login</Link>
                            </div>
                        ) : (
                            <div className="cta-actions">
                                <Link to="/profile" className="cta-button primary">View My Dashboard</Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home; 