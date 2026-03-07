// frontend/src/pages/Home.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
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
      color: 'from-[#1C74D9] to-[#0A3FAE]',
    },
    {
      id: 2,
      title: 'Data Science',
      description: 'Master data analysis, machine learning, and AI',
      duration: '10 months',
      level: 'Intermediate to Advanced',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow'],
      color: 'from-[#00E5FF] to-[#1C74D9]',
    },
    {
      id: 3,
      title: 'Cybersecurity',
      description: 'Learn ethical hacking and security practices',
      duration: '8 months',
      level: 'Beginner to Intermediate',
      skills: ['Network Security', 'Penetration Testing', 'Cryptography'],
      color: 'from-[#00E5FF] to-[#0A3FAE]',
    },
    {
      id: 4,
      title: 'UI/UX Design',
      description: 'Create beautiful and functional user interfaces',
      duration: '6 months',
      level: 'Beginner to Intermediate',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      color: 'from-[#0F2F6B] to-[#1C74D9]',
    },
  ];

  const internships = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'TechCorp',
      location: 'Remote',
      duration: '3 months',
      stipend: '$2000/month',
      skills: ['React', 'JavaScript', 'CSS'],
      type: 'Paid',
    },
    {
      id: 2,
      title: 'Data Science Intern',
      company: 'DataFlow Inc',
      location: 'New York',
      duration: '6 months',
      stipend: '$3000/month',
      skills: ['Python', 'Machine Learning', 'SQL'],
      type: 'Paid',
    },
    {
      id: 3,
      title: 'UX Design Intern',
      company: 'DesignHub',
      location: 'San Francisco',
      duration: '4 months',
      stipend: '$2500/month',
      skills: ['Figma', 'User Research', 'Prototyping'],
      type: 'Paid',
    },
  ];

  const events = [
    {
      id: 1,
      title: 'Tech Career Fair 2024',
      date: 'March 15, 2024',
      time: '10:00 AM - 4:00 PM',
      location: 'Virtual Event',
      description: 'Connect with top tech companies and find your dream job',
      attendees: 500,
      type: 'Career Fair',
    },
    {
      id: 2,
      title: 'AI/ML Workshop',
      date: 'March 20, 2024',
      time: '2:00 PM - 5:00 PM',
      location: 'Online',
      description: 'Hands-on workshop on machine learning fundamentals',
      attendees: 200,
      type: 'Workshop',
    },
    {
      id: 3,
      title: 'Startup Networking',
      date: 'March 25, 2024',
      time: '6:00 PM - 9:00 PM',
      location: 'Downtown Hub',
      description: 'Network with startup founders and investors',
      attendees: 150,
      type: 'Networking',
    },
  ];

  const features = [
    {
      title: 'AI-Powered Guidance',
      description: 'Personalized career advice and roadmap recommendations based on your interests and goals.',
      bg: 'bg-[#1C74D9]/30',
    },
    {
      title: 'Structured Learning',
      description: 'Carefully crafted learning paths with clear milestones and progress tracking.',
      bg: 'bg-[#0A3FAE]/30',
    },
    {
      title: 'Career Opportunities',
      description: 'Discover internships, events, and networking to accelerate your career growth.',
      bg: 'bg-[#00E5FF]/20',
    },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const stagger = {
    animate: {
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-slate-50"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="relative">
        {/* Hero Section */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-block px-4 py-2 rounded-full border border-[#1C74D9]/40 bg-blue-50 text-[#1C74D9] text-sm font-medium mb-6">
                AI-Powered Career Platform
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-800 mb-5 sm:mb-6">
                Your Career Journey
                <span className="block sm:inline mt-2 sm:mt-0 sm:ml-2 bg-gradient-to-r from-[#1C74D9] to-[#0A3FAE] bg-clip-text text-transparent">
                  Starts Here
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                Discover personalized career roadmaps, find internships, and connect with opportunities that match your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/questionnaire"
                  className="inline-flex items-center justify-center min-h-[52px] px-8 py-4 rounded-2xl bg-[#1C74D9] text-white font-semibold text-base sm:text-lg shadow-lg hover:bg-[#0A3FAE] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 touch-manipulation"
                >
                  Start Your Journey
                </Link>
                <Link
                  to="/roadmap"
                  className="inline-flex items-center justify-center min-h-[52px] px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-base sm:text-lg border-2 border-slate-300 shadow-lg hover:bg-slate-50 hover:border-[#1C74D9] transition-all duration-300 touch-manipulation"
                >
                  Explore Roadmaps
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3">
                Why Choose EduRoute AI?
              </h2>
              <p className="text-slate-600 max-w-xl mx-auto">Built for ambitious learners ready to level up</p>
            </motion.div>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-30px' }}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group relative bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${feature.bg} mb-6`}
                  />
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Tab Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Horizontal scroll tabs - mobile friendly */}
            <div
              className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {[
                { id: 'roadmaps', label: 'Career Roadmaps' },
                { id: 'internships', label: 'Internships' },
                { id: 'events', label: 'Events' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-[140px] sm:min-w-0 shrink-0 snap-center min-h-[48px] px-5 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 touch-manipulation ${
                    activeTab === tab.id
                      ? 'bg-[#1C74D9] text-white shadow-lg'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#1C74D9] hover:bg-slate-50'
                  }`}
                >
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8 sm:mt-10">
              <AnimatePresence mode="wait">
                {activeTab === 'roadmaps' && (
                  <motion.div
                    key="roadmaps"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                  >
                    {roadmaps.map((item) => (
                      <Link
                        key={item.id}
                        to="/roadmap"
                        className="group block bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 text-white text-lg font-bold shadow-lg group-hover:scale-105 transition-transform`}
                        >
                          {item.title.charAt(0)}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#1C74D9] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {item.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <span className="inline-block text-[#1C74D9] font-semibold text-sm">
                          Start Learning
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'internships' && (
                  <motion.div
                    key="internships"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  >
                    {internships.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-[#1C74D9] font-bold text-sm">
                            {item.title.charAt(0)}
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-[#1C74D9] text-xs font-semibold rounded-full">
                            {item.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{item.title}</h3>
                        <p className="text-[#1C74D9] font-medium text-sm mb-4">{item.company}</p>
                        <div className="space-y-2 mb-4 text-sm text-slate-600">
                          <div className="flex justify-between">
                            <span>Location</span>
                            <span className="text-slate-800 font-medium">{item.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Stipend</span>
                            <span className="text-slate-800 font-medium">{item.stipend}</span>
                          </div>
                        </div>
                        <button className="w-full min-h-[48px] py-3.5 rounded-xl bg-[#1C74D9] text-white font-semibold shadow-lg transition-all touch-manipulation hover:bg-[#0A3FAE]">
                          Apply Now
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'events' && (
                  <motion.div
                    key="events"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  >
                    {events.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-[#1C74D9] font-bold text-sm">
                            {item.title.charAt(0)}
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-[#1C74D9] text-xs font-semibold rounded-full">
                            {item.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                        <div className="space-y-2 mb-4 text-sm text-slate-600">
                          <div className="flex justify-between">
                            <span>Date</span>
                            <span className="text-slate-800 font-medium">{item.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location</span>
                            <span className="text-slate-800 font-medium">{item.location}</span>
                          </div>
                        </div>
                        <button className="w-full min-h-[48px] py-3.5 rounded-xl bg-[#1C74D9] text-white font-semibold shadow-lg transition-all touch-manipulation hover:bg-[#0A3FAE]">
                          Register Now
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-10 sm:p-14 shadow-2xl border border-slate-200">
              <div className="relative text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
                  Ready to Transform Your Career?
                </h2>
                <p className="text-slate-600 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
                  Join thousands of students and professionals who have already discovered their path to success.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/questionnaire"
                    className="inline-flex items-center justify-center min-h-[52px] px-10 py-4 rounded-2xl bg-[#1C74D9] text-white font-bold text-lg shadow-lg hover:bg-[#0A3FAE] hover:scale-[1.02] transition-all touch-manipulation"
                  >
                    Get Started Today
                  </Link>
                  {user ? (
                    <Link
                      to="/profile"
                      className="inline-flex items-center justify-center min-h-[52px] px-10 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-lg border-2 border-slate-300 hover:bg-slate-50 hover:border-[#1C74D9] transition-all touch-manipulation"
                    >
                      View Profile
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center min-h-[52px] px-10 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-lg border-2 border-slate-300 hover:bg-slate-50 hover:border-[#1C74D9] transition-all touch-manipulation"
                    >
                      Login to View Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Hide scrollbar for tab strip */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;
