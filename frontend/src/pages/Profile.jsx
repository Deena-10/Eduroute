import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Mock user data
  const userData = {
    username: user.name || 'John Doe',
    email: user.email || 'john.doe@example.com',
    interests: ['Software Development', 'Web Development', 'React', 'Node.js'],
    lessonsCompleted: 24,
    totalLessons: 50,
    currentStreak: 7,
    totalHours: 156,
    skills: [
      { name: 'JavaScript', level: 85, category: 'Programming' },
      { name: 'React', level: 72, category: 'Frontend' },
      { name: 'Node.js', level: 68, category: 'Backend' },
      { name: 'HTML/CSS', level: 90, category: 'Frontend' },
      { name: 'Python', level: 45, category: 'Programming' },
      { name: 'SQL', level: 60, category: 'Database' },
      { name: 'Git', level: 75, category: 'Tools' },
      { name: 'Docker', level: 30, category: 'DevOps' }
    ],
    achievements: [
      { title: 'First Lesson', description: 'Completed your first lesson', date: '2024-01-15', icon: '🎯' },
      { title: 'Week Warrior', description: '7 days learning streak', date: '2024-01-22', icon: '🔥' },
      { title: 'JavaScript Master', description: 'Completed JavaScript fundamentals', date: '2024-01-28', icon: '⚡' },
      { title: 'React Explorer', description: 'Built your first React app', date: '2024-02-01', icon: '⚛️' }
    ],
    recentActivity: [
      { action: 'Completed lesson', title: 'React Hooks', time: '2 hours ago' },
      { action: 'Started lesson', title: 'Node.js Basics', time: '1 day ago' },
      { action: 'Earned badge', title: 'JavaScript Master', time: '2 days ago' },
      { action: 'Completed quiz', title: 'HTML Fundamentals', time: '3 days ago' }
    ]
  };

  const getSkillCategoryColor = (category) => {
    const colors = {
      'Programming': 'from-blue-500 to-blue-600',
      'Frontend': 'from-green-500 to-green-600',
      'Backend': 'from-purple-500 to-purple-600',
      'Database': 'from-orange-500 to-orange-600',
      'Tools': 'from-red-500 to-red-600',
      'DevOps': 'from-indigo-500 to-indigo-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#000000' }}>Profile</h1>
            <p className="text-gray-600">Track your learning progress and achievements</p>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-300 shadow-lg">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl text-white font-bold">
                  {userData.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1" style={{ color: '#000000' }}>{userData.username}</h2>
                <p className="text-gray-600 mb-2">{userData.email}</p>
                <div className="flex flex-wrap gap-2">
                  {userData.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{userData.currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === 'skills'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Skills Analytics
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === 'achievements'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Recent Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activeTab === 'overview' && (
              <>
                {/* Progress Overview */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-300 shadow-lg">
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>Learning Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{userData.lessonsCompleted}</div>
                      <div className="text-sm text-gray-600">Lessons Completed</div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(userData.lessonsCompleted / userData.totalLessons) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{userData.totalHours}</div>
                      <div className="text-sm text-gray-600">Hours Learned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{userData.skills.length}</div>
                      <div className="text-sm text-gray-600">Skills Tracked</div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl p-6 border border-gray-300 shadow-lg">
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="font-bold" style={{ color: '#000000' }}>{userData.currentStreak} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-bold" style={{ color: '#000000' }}>{Math.round((userData.lessonsCompleted / userData.totalLessons) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Avg. Daily Hours</span>
                      <span className="font-bold" style={{ color: '#000000' }}>2.3 hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Skills Mastered</span>
                      <span className="font-bold" style={{ color: '#000000' }}>3</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'skills' && (
              <>
                {/* Skills Grid */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-300 shadow-lg">
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>Skills Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.skills.map((skill, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium" style={{ color: '#000000' }}>{skill.name}</span>
                          <span className="text-sm text-gray-600">{skill.category}</span>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium" style={{ color: '#000000' }}>{skill.level}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className={`bg-gradient-to-r ${getSkillCategoryColor(skill.category)} h-2 rounded-full`}
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Summary */}
                <div className="bg-white rounded-2xl p-6 border border-gray-300 shadow-lg">
                  <h3 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>Skills Summary</h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {userData.skills.filter(s => s.level >= 80).length}
                      </div>
                      <div className="text-sm text-gray-600">Mastered Skills</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {userData.skills.filter(s => s.level >= 60 && s.level < 80).length}
                      </div>
                      <div className="text-sm text-gray-600">Advanced Skills</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {userData.skills.filter(s => s.level < 60).length}
                      </div>
                      <div className="text-sm text-gray-600">Learning Skills</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'achievements' && (
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-300 shadow-lg">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {userData.achievements.map((achievement, index) => (
                    <div key={index} className="text-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200">
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h4 className="font-bold mb-2" style={{ color: '#000000' }}>{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <p className="text-xs text-gray-500">{achievement.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-300 shadow-lg">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#000000' }}>Recent Activity</h3>
                <div className="space-y-4">
                  {userData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-lg">
                          {activity.action.includes('Completed') ? '✅' : 
                           activity.action.includes('Started') ? '🚀' : 
                           activity.action.includes('Earned') ? '🏆' : '📝'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: '#000000' }}>{activity.action}</div>
                        <div className="text-sm text-gray-600">{activity.title}</div>
                      </div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
