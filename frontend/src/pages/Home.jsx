//frontend/src/pages/Home.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('roadmaps');

  // Mock data for roadmaps
  const roadmaps = [
    {
      id: 1,
      title: 'Software Development',
      description: 'Complete roadmap from beginner to full-stack developer',
      duration: '12 months',
      level: 'Beginner to Advanced',
      skills: ['JavaScript', 'React', 'Node.js', 'Database'],
      color: 'from-blue-600 to-purple-600'
    },
    {
      id: 2,
      title: 'Data Science',
      description: 'Master data analysis, machine learning, and AI',
      duration: '10 months',
      level: 'Intermediate to Advanced',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow'],
      color: 'from-green-600 to-teal-600'
    },
    {
      id: 3,
      title: 'Cybersecurity',
      description: 'Learn ethical hacking and security practices',
      duration: '8 months',
      level: 'Beginner to Intermediate',
      skills: ['Network Security', 'Penetration Testing', 'Cryptography'],
      color: 'from-red-600 to-orange-600'
    },
    {
      id: 4,
      title: 'UI/UX Design',
      description: 'Create beautiful and functional user interfaces',
      duration: '6 months',
      level: 'Beginner to Intermediate',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      color: 'from-purple-600 to-pink-600'
    }
  ];

  // Mock data for internships
  const internships = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'TechCorp',
      location: 'Remote',
      duration: '3 months',
      stipend: '$2000/month',
      skills: ['React', 'JavaScript', 'CSS'],
      type: 'Paid'
    },
    {
      id: 2,
      title: 'Data Science Intern',
      company: 'DataFlow Inc',
      location: 'New York',
      duration: '6 months',
      stipend: '$3000/month',
      skills: ['Python', 'Machine Learning', 'SQL'],
      type: 'Paid'
    },
    {
      id: 3,
      title: 'UX Design Intern',
      company: 'DesignHub',
      location: 'San Francisco',
      duration: '4 months',
      stipend: '$2500/month',
      skills: ['Figma', 'User Research', 'Prototyping'],
      type: 'Paid'
    }
  ];

  // Mock data for events
  const events = [
    {
      id: 1,
      title: 'Tech Career Fair 2024',
      date: 'March 15, 2024',
      time: '10:00 AM - 4:00 PM',
      location: 'Virtual Event',
      description: 'Connect with top tech companies and find your dream job',
      attendees: 500,
      type: 'Career Fair'
    },
    {
      id: 2,
      title: 'AI/ML Workshop',
      date: 'March 20, 2024',
      time: '2:00 PM - 5:00 PM',
      location: 'Online',
      description: 'Hands-on workshop on machine learning fundamentals',
      attendees: 200,
      type: 'Workshop'
    },
    {
      id: 3,
      title: 'Startup Networking',
      date: 'March 25, 2024',
      time: '6:00 PM - 9:00 PM',
      location: 'Downtown Hub',
      description: 'Network with startup founders and investors',
      attendees: 150,
      type: 'Networking'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6F6' }}>
      {/* Quick Login Section for Non-Authenticated Users */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">🔐 Quick Access</h2>
              <p className="text-lg mb-6">Login to access your personalized career roadmap and AI chat</p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/login"
                  className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
              <div className="mt-4 text-sm opacity-90">
                <strong>Test Account:</strong> test@example.com / password123
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#000000' }}>
              Your Career Journey
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Starts Here</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover personalized career roadmaps, find internships, and connect with opportunities that match your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/questionnaire"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                Start Your Journey
              </Link>
              <Link
                to="/roadmap"
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                Explore Roadmaps
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#000000' }}>Why Choose EduRoute AI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-300 text-center hover:border-gray-400 transition-colors duration-200 shadow-lg">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>AI-Powered Guidance</h3>
                <p className="text-gray-600">Get personalized career advice and roadmap recommendations based on your interests and goals.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-300 text-center hover:border-gray-400 transition-colors duration-200 shadow-lg">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🗺️</span>
                </div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Structured Learning</h3>
                <p className="text-gray-600">Follow carefully crafted learning paths with clear milestones and progress tracking.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-300 text-center hover:border-gray-400 transition-colors duration-200 shadow-lg">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>Career Opportunities</h3>
                <p className="text-gray-600">Discover internships, events, and networking opportunities to accelerate your career growth.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setActiveTab('roadmaps')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                  activeTab === 'roadmaps'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Career Roadmaps
              </button>
              <button
                onClick={() => setActiveTab('internships')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                  activeTab === 'internships'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Internships
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                  activeTab === 'events'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Events
              </button>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'roadmaps' && roadmaps.map((roadmap) => (
                <div key={roadmap.id} className="bg-white rounded-2xl p-6 border border-gray-300 hover:border-gray-400 transition-colors duration-200 shadow-lg">
                  <div className={`w-12 h-12 bg-gradient-to-r ${roadmap.color} rounded-lg flex items-center justify-center mb-4`}>
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{roadmap.title}</h3>
                  <p className="text-gray-600 mb-4">{roadmap.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span style={{ color: '#000000' }}>{roadmap.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Level:</span>
                      <span style={{ color: '#000000' }}>{roadmap.level}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {roadmap.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="/roadmap"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-xl font-medium transition-colors duration-200"
                  >
                    Start Learning
                  </Link>
                </div>
              ))}

              {activeTab === 'internships' && internships.map((internship) => (
                <div key={internship.id} className="bg-white rounded-2xl p-6 border border-gray-300 hover:border-gray-400 transition-colors duration-200 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💼</span>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                      {internship.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{internship.title}</h3>
                  <p className="text-blue-600 mb-4">{internship.company}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span style={{ color: '#000000' }}>{internship.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span style={{ color: '#000000' }}>{internship.duration}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Stipend:</span>
                      <span style={{ color: '#000000' }}>{internship.stipend}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {internship.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded-xl font-medium transition-colors duration-200">
                    Apply Now
                  </button>
                </div>
              ))}

              {activeTab === 'events' && events.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl p-6 border border-gray-300 hover:border-gray-400 transition-colors duration-200 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📅</span>
                    </div>
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                      {event.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date:</span>
                      <span style={{ color: '#000000' }}>{event.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time:</span>
                      <span style={{ color: '#000000' }}>{event.time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span style={{ color: '#000000' }}>{event.location}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Attendees:</span>
                      <span style={{ color: '#000000' }}>{event.attendees}</span>
                    </div>
                  </div>
                  <button className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 rounded-xl font-medium transition-colors duration-200">
                    Register Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#000000' }}>Ready to Transform Your Career?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of students and professionals who have already discovered their path to success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/questionnaire"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                Get Started Today
              </Link>
              {user ? (
                <Link
                  to="/profile"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                >
                  View Profile
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                >
                  Login to View Profile
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home; 