//frontend/src/pages/Home.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button, Box } from '@mui/material';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <div style={{
            flex: 1,
            backgroundColor: '#f8fafc',
            overflowY: 'auto',
            minHeight: '100vh'
        }}>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '64px 24px'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                       <h1 style={{
                           marginBottom: '16px',
                              fontWeight: 'bold',
                         fontSize: '48px',
    margin: '0 0 16px 0',
    color: '#FFFFFF'
}}>
    Welcome to EduRoute AI
</h1>



                        <p style={{
                            marginBottom: '32px',
                            opacity: 0.9,
                            maxWidth: '800px',
                            margin: '0 auto 32px',
                            fontSize: '18px',
                            lineHeight: '1.6'
                        }}>
                            Your AI-powered career companion for personalized guidance, internship opportunities, 
                            and professional growth. Discover your path to success with intelligent career mapping.
                        </p>
                        
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '32px',
                            marginBottom: '32px',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    marginBottom: '8px'
                                }}>500+</div>
                                <div style={{ fontSize: '14px' }}>Career Paths</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    marginBottom: '8px'
                                }}>1000+</div>
                                <div style={{ fontSize: '14px' }}>Internships</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    marginBottom: '8px'
                                }}>50+</div>
                                <div style={{ fontSize: '14px' }}>Events Monthly</div>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '16px',
                            flexWrap: 'wrap'
                        }}>
                            {!user ? (
                                <>
                                    <button style={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        padding: '16px 32px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }} onClick={() => navigate('/signup')}>
                                        Get Started
                                    </button>
                                    <button style={{
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        border: '2px solid white',
                                        padding: '16px 32px',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }} onClick={() => navigate('/login')}>
                                        Login
                                    </button>
                                </>
                            ) : (
                                <button style={{
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '16px 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }} onClick={() => navigate('/questionnaire')}>
                                    Take Career Assessment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div style={{ padding: '48px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: '48px',
                        fontSize: '36px',
                        color: '#1e293b',
                        fontWeight: '600'
                    }}>
                        What We Offer
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '32px'
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                            <h3 style={{
                                marginBottom: '16px',
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}>
                                        Career Guidance Roadmap
                            </h3>
                            <p style={{
                                color: '#64748b',
                                lineHeight: '1.6',
                                fontSize: '14px'
                            }}>
                                        AI-powered personalized career paths tailored to your skills, interests, and goals.
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
                            <h3 style={{
                                marginBottom: '16px',
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}>
                                        Internship Opportunities
                            </h3>
                            <p style={{
                                color: '#64748b',
                                lineHeight: '1.6',
                                fontSize: '14px'
                            }}>
                                        Discover relevant internship opportunities from top companies.
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                            <h3 style={{
                                marginBottom: '16px',
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}>
                                        Events & Workshops
                            </h3>
                            <p style={{
                                color: '#64748b',
                                lineHeight: '1.6',
                                fontSize: '14px'
                            }}>
                                        Stay updated with industry events, workshops, and networking opportunities.
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                            <h3 style={{
                                marginBottom: '16px',
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}>
                                        Current Job Openings
                            </h3>
                            <p style={{
                                color: '#64748b',
                                lineHeight: '1.6',
                                fontSize: '14px'
                            }}>
                                        Find the latest job openings in your domain with personalized recommendations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Dashboard */}
            <div style={{ padding: '48px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center',
                        marginBottom: '48px',
                        fontSize: '36px',
                        color: '#1e293b',
                        fontWeight: '600'
                    }}>
                        Explore Opportunities
                    </h2>
                    
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        marginBottom: '32px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            borderBottom: '1px solid #e5e7eb'
                        }}>
                            {['🗺️ Career Roadmaps', '💼 Internships', '📅 Events', '🚀 Job Openings'].map((label, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    style={{
                                        padding: '16px 24px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: activeTab === index ? '#3b82f6' : '#6b7280',
                                        borderBottom: activeTab === index ? '2px solid #3b82f6' : 'none'
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        {activeTab === 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '24px'
                            }}>
                                {careerRoadmaps.map(roadmap => (
                                    <div key={roadmap.id} style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '16px'
                                        }}>
                                            <div style={{ fontSize: '32px', marginRight: '16px' }}>{roadmap.icon}</div>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: '#1e293b',
                                                margin: 0
                                            }}>{roadmap.title}</h3>
                                        </div>
                                        <p style={{
                                            color: '#64748b',
                                            marginBottom: '16px',
                                            fontSize: '14px',
                                            lineHeight: '1.6'
                                        }}>
                                                    {roadmap.description}
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '16px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>⏰</span>
                                            {roadmap.duration}
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                                    {roadmap.skills.map(skill => (
                                                <span key={skill} style={{
                                                    display: 'inline-block',
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#374151',
                                                    padding: '4px 12px',
                                                    borderRadius: '16px',
                                                    fontSize: '12px',
                                                    marginRight: '8px',
                                                    marginBottom: '8px'
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <button style={{
                                            width: '100%',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}>
                                                    Explore Path
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '24px'
                            }}>
                                {internshipOpportunities.map(internship => (
                                    <div key={internship.id} style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#1e293b',
                                            marginBottom: '8px'
                                        }}>
                                                    {internship.position}
                                        </h3>
                                        <p style={{
                                            color: '#3b82f6',
                                            marginBottom: '16px',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>
                                                    {internship.company}
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>📍</span>
                                            {internship.location}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>⏰</span>
                                            {internship.duration}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '16px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>💰</span>
                                            {internship.stipend}
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                                    {internship.skills.map(skill => (
                                                <span key={skill} style={{
                                                    display: 'inline-block',
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#374151',
                                                    padding: '4px 12px',
                                                    borderRadius: '16px',
                                                    fontSize: '12px',
                                                    marginRight: '8px',
                                                    marginBottom: '8px'
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '16px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>📅</span>
                                            Deadline: {internship.deadline}
                                        </div>
                                        <button style={{
                                            width: '100%',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}>
                                                    Apply Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '24px'
                            }}>
                                {upcomingEvents.map(event => (
                                    <div key={event.id} style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <span style={{
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            marginBottom: '16px',
                                            display: 'inline-block'
                                        }}>
                                            {event.type}
                                        </span>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#1e293b',
                                            marginBottom: '16px'
                                        }}>
                                                    {event.title}
                                        </h3>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>📅</span>
                                            {event.date}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>⏰</span>
                                            {event.time}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '16px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>📍</span>
                                            {event.location}
                                        </div>
                                        <p style={{
                                            color: '#64748b',
                                            marginBottom: '16px',
                                            fontSize: '14px',
                                            lineHeight: '1.6'
                                        }}>
                                                    {event.description}
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#6b7280',
                                                fontSize: '14px'
                                            }}>
                                                <span style={{ marginRight: '8px' }}>👥</span>
                                                {event.attendees} attendees
                                            </div>
                                            <button style={{
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                cursor: 'pointer'
                                            }}>
                                                        Register
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 3 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '24px'
                            }}>
                                {currentOpenings.map(job => (
                                    <div key={job.id} style={{
                                        backgroundColor: 'white',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <h3 style={{
                                            fontSize: '18px',
                                            fontWeight: '600',
                                            color: '#1e293b',
                                            marginBottom: '8px'
                                        }}>
                                                    {job.position}
                                        </h3>
                                        <p style={{
                                            color: '#3b82f6',
                                            marginBottom: '16px',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>
                                                    {job.company}
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>📍</span>
                                            {job.location}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>💼</span>
                                            {job.type}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>⏰</span>
                                            {job.experience}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '16px',
                                            color: '#6b7280',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>💰</span>
                                            {job.salary}
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                                    {job.skills.map(skill => (
                                                <span key={skill} style={{
                                                    display: 'inline-block',
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#374151',
                                                    padding: '4px 12px',
                                                    borderRadius: '16px',
                                                    fontSize: '12px',
                                                    marginRight: '8px',
                                                    marginBottom: '8px'
                                                }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                        <button style={{
                                            width: '100%',
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}>
                                                    Apply Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '48px 24px',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{
                        marginBottom: '16px',
                        fontSize: '36px',
                        fontWeight: '600'
                    }}>
                        Ready to Start Your Career Journey?
                    </h2>
                    <p style={{
                        marginBottom: '32px',
                        opacity: 0.9,
                        fontSize: '18px',
                        lineHeight: '1.6'
                    }}>
                        Join thousands of professionals who are building their dream careers with EduRoute AI
                    </p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        flexWrap: 'wrap'
                    }}>
                        {!user ? (
                            <>
                                <button style={{
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '16px 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }} onClick={() => navigate('/signup')}>
                                    Get Started Free
                                </button>
                                <button style={{
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: '2px solid white',
                                    padding: '16px 32px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }} onClick={() => navigate('/login')}>
                                    Login
                                </button>
                            </>
                        ) : (
                            <button style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                padding: '16px 32px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }} onClick={() => navigate('/questionnaire')}>
                                Take Career Assessment
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home; 