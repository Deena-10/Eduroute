import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { safeJsonParse } from "../utils/safeJsonParser";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [streak, setStreak] = useState({ current_streak: 0, last_activity_date: null });
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [profile, setProfile] = useState(null);
  const [streakSnapshots, setStreakSnapshots] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await axiosInstance.get('/user/streak');
        const d = res.data?.data ?? res.data;
        if (res.data?.success) {
          setStreak({
            current_streak: d.current_streak ?? 0,
            last_activity_date: d.last_activity_date ?? null,
          });
        }
      } catch (e) {
        console.error('Fetch streak error:', e);
      }
    };
    fetchStreak();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/user/profile');
        const p = res.data?.data ?? res.data;
        if (p) {
          setProfile(p);
          setStreakSnapshots(Array.isArray(p.streak_snapshots) ? p.streak_snapshots : []);
        }
      } catch (e) {
        console.error('Fetch profile error:', e);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await axiosInstance.get('/user/roadmap');
        const r = res.data?.data ?? res.data?.roadmap;
        if (res.data?.success && r) {
          setCurrentRoadmap(r);
        } else {
          setCurrentRoadmap(null);
        }
      } catch (e) {
        console.error('Fetch roadmap error:', e);
        setCurrentRoadmap(null);
      }
    };
    fetchRoadmap();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosInstance.get('/user/profile/dashboard');
        const d = res.data?.data ?? res.data;
        if (res.data?.success && d) {
          setDashboard(d);
          if (d.profile?.streak_snapshots?.length) {
            setStreakSnapshots(Array.isArray(d.profile.streak_snapshots) ? d.profile.streak_snapshots : []);
          }
        }
      } catch (e) {
        console.error('Fetch dashboard error:', e);
      }
    };
    fetchDashboard();
  }, []);

  // Progress from active roadmap only (no roadmap = 0)
  const lessonsCompleted = currentRoadmap?.completed_tasks?.length ?? 0;
  const totalLessons = currentRoadmap?.total_task_count ?? 0;
  const totalHours = Number(currentRoadmap?.completed_hours) ?? 0;
  const completionRatePct = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  const interestsList = (() => {
    const raw = profile?.interests ?? user?.interests;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      try { const arr = JSON.parse(raw); return Array.isArray(arr) ? arr : []; } catch { return []; }
    }
    return [];
  })();

  const domainName = (() => {
    if (currentRoadmap?.domain) return currentRoadmap.domain;
    const content = currentRoadmap?.roadmap_content ?? currentRoadmap?.roadmap;
    const c = typeof content === 'string' ? safeJsonParse(content, null, 'Profile-domain') : content;
    return c?.roadmap?.domain || c?.domain || null;
  })();

  const ov = dashboard?.overview;
  const skillsList = dashboard?.skills ?? [];
  const achievementsList = dashboard?.achievements ?? [];
  const recentActivityList = dashboard?.recentActivity ?? [];

  const userData = {
    username: dashboard?.profile?.name ?? profile?.name ?? profile?.user_name ?? user?.name ?? 'User',
    email: dashboard?.profile?.email ?? profile?.email ?? profile?.user_email ?? user?.email ?? '',
    domain: domainName,
    interests: dashboard?.profile?.interests ?? interestsList,
    lessonsCompleted: ov?.lessonsCompleted ?? lessonsCompleted,
    totalLessons: ov?.totalLessons ?? totalLessons,
    totalHours: ov?.totalHours ?? totalHours,
    completionRatePct: ov?.completionRatePct ?? completionRatePct,
    skillsCount: ov?.skillsCount ?? skillsList.length,
    quizAccuracy: ov?.quizAccuracy ?? 0,
    skills: skillsList,
    achievements: achievementsList,
    recentActivity: recentActivityList,
  };

  const getSkillCategoryColor = (category) => {
    const colors = {
      'Programming': 'from-blue-500 to-blue-600',
      'Frontend': 'from-[#1C74D9] to-blue-600',
      'Backend': 'from-purple-500 to-purple-600',
      'Database': 'from-[#1C74D9] to-[#0A3FAE]',
      'Tools': 'from-slate-600 to-[#1C74D9]',
      'DevOps': 'from-indigo-500 to-indigo-600',
      'Learned': 'from-[#1C74D9] to-blue-600',
      'Learning': 'from-[#1C74D9] to-[#0A3FAE]',
      'Domain': 'from-indigo-500 to-indigo-600',
    };
    return colors[category] || 'from-slate-500 to-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-slate-900">Profile</h1>
            <p className="text-slate-600">Track your learning progress and achievements</p>
          </div>

          {/* Profile Overview Card */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl text-white font-bold">
                  {userData.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1 text-slate-900">{userData.username}</h2>
                <p className="text-slate-600 mb-1">{userData.email}</p>
                {userData.domain && (
                  <p className="text-sm text-[#1C74D9] mb-2 font-medium">Domain: {userData.domain}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {userData.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-[#1C74D9]/10 text-[#1C74D9] text-sm rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Domains & roadmaps — Add New Domain only in Profile */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Learning domains</h3>
            <p className="text-slate-600 text-sm mb-4">
              You learn one domain at a time. To start another domain, add it here. Your current roadmap stays until you reset it.
            </p>
            {currentRoadmap && (() => {
              let content = currentRoadmap.roadmap_content ?? currentRoadmap.roadmap;
              if (typeof content === 'string') {
                content = safeJsonParse(content, null, 'Profile-roadmap_content');
              }
              const domainName = content?.roadmap?.domain || content?.domain || 'Your current domain';
              return (
                <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Current active roadmap</p>
                  <p className="font-semibold text-slate-900">{domainName}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/roadmap')}
                    className="mt-2 text-sm text-[#1C74D9] hover:underline"
                  >
                    Open roadmap →
                  </button>
                </div>
              );
            })()}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/questionnaire')}
                className="px-4 py-3 bg-[#1C74D9] text-white rounded-xl font-medium hover:bg-[#1557b0] transition-colors"
              >
                Add new domain
              </button>
              {currentRoadmap && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Reset your progress and generate a new journey?')) return;
                    try {
                      await axiosInstance.delete('/user/roadmap');
                      setCurrentRoadmap(null);
                      navigate('/questionnaire', { replace: true });
                    } catch (e) {
                      console.error('Reset error:', e);
                    }
                  }}
                  className="px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors"
                >
                  Reset journey
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Reset journey clears your current roadmap and progress. Add new domain creates a fresh roadmap.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'bg-[#1C74D9] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === 'skills'
                  ? 'bg-[#1C74D9] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Skills Analytics
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === 'achievements'
                  ? 'bg-[#1C74D9] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                activeTab === 'activity'
                  ? 'bg-[#1C74D9] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
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
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 text-slate-900">Learning Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#1C74D9] mb-2">{userData.lessonsCompleted}</div>
                      <div className="text-sm text-slate-600">Lessons Completed</div>
                      <div className="mt-2 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-[#1C74D9] h-2 rounded-full" 
                          style={{ width: `${userData.completionRatePct}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#1C74D9] mb-2">{userData.totalHours}</div>
                      <div className="text-sm text-slate-600">Hours Learned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#1C74D9] mb-2">{userData.skillsCount}</div>
                      <div className="text-sm text-slate-600">Skills Tracked</div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 text-slate-900">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Current Streak</span>
                      <span className="font-bold text-slate-900">{streak.current_streak} days</span>
                    </div>
                    {streak.current_streak === 0 && (
                      <p className="text-xs text-slate-500">Complete a task today to start your streak.</p>
                    )}
                    {streakSnapshots.length > 0 && (
                      <div className="p-3 bg-[#1C74D9]/5 rounded-lg border border-[#1C74D9]/20">
                        <h4 className="text-sm font-semibold text-[#1C74D9] mb-2">Streak history</h4>
                        <div className="flex gap-1 flex-wrap">
                          {streakSnapshots.slice(0, 7).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700">
                              {s.date}: {s.streak}d
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Completion Rate</span>
                      <span className="font-bold text-slate-900">{userData.completionRatePct}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Quiz Accuracy</span>
                      <span className="font-bold text-slate-900">{userData.quizAccuracy}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Skills Mastered</span>
                      <span className="font-bold text-slate-900">{userData.skills.filter(s => s.level >= 80).length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'skills' && (
              <>
                {/* Skills Grid */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 text-slate-900">Skills Analytics</h3>
                  {userData.skills.length === 0 ? (
                    <p className="text-slate-600">Complete the questionnaire and your roadmap to see skills tracked from your profile and domain.</p>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.skills.map((skill, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-900">{skill.name}</span>
                          <span className="text-sm text-slate-600">{skill.category}</span>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium text-slate-900">{skill.level}%</span>
                          </div>
                          <div className="bg-slate-200 rounded-full h-2">
                            <div 
                              className={`bg-gradient-to-r ${getSkillCategoryColor(skill.category)} h-2 rounded-full`}
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>

                {/* Skills Summary */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 text-slate-900">Skills Summary</h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-[#1C74D9]/5 rounded-lg">
                      <div className="text-2xl font-bold text-[#1C74D9] mb-1">
                        {userData.skills.filter(s => (s.level || 0) >= 80).length}
                      </div>
                      <div className="text-sm text-slate-600">Mastered Skills</div>
                    </div>
                    <div className="text-center p-4 bg-[#1C74D9]/5 rounded-lg">
                      <div className="text-2xl font-bold text-[#1C74D9] mb-1">
                        {userData.skills.filter(s => (s.level || 0) >= 60 && (s.level || 0) < 80).length}
                      </div>
                      <div className="text-sm text-slate-600">Advanced Skills</div>
                    </div>
                    <div className="text-center p-4 bg-[#1C74D9]/10 rounded-lg">
                      <div className="text-2xl font-bold text-[#1C74D9] mb-1">
                        {userData.skills.filter(s => (s.level || 0) < 60).length}
                      </div>
                      <div className="text-sm text-slate-600">Learning Skills</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'achievements' && (
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-slate-900">Achievements</h3>
                {userData.achievements.length === 0 ? (
                  <p className="text-slate-600">Complete tasks to earn achievements. First task, 50% roadmap, and full roadmap completion unlock badges.</p>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {userData.achievements.map((achievement, index) => (
                    <div key={index} className="text-center p-6 border border-slate-200 rounded-lg hover:border-[#1C74D9]/50 transition-colors duration-200">
                      <div className="w-12 h-12 rounded-xl bg-[#1C74D9]/20 flex items-center justify-center text-[#1C74D9] font-bold text-sm mb-3 mx-auto">{(achievement.title || achievement.achievement_type || 'A').charAt(0)}</div>
                      <h4 className="font-bold mb-2 text-slate-900">{achievement.title || achievement.achievement_type}</h4>
                      <p className="text-sm text-slate-600 mb-2">{achievement.desc}</p>
                      <p className="text-xs text-slate-500">{achievement.achieved_at ? new Date(achievement.achieved_at).toLocaleDateString() : ''}</p>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-slate-900">Recent Activity</h3>
                {userData.recentActivity.length === 0 ? (
                  <p className="text-slate-600">Complete tasks and earn achievements to see your activity here.</p>
                ) : (
                <div className="space-y-4">
                  {userData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                      <div className="w-10 h-10 bg-[#1C74D9]/20 rounded-full flex items-center justify-center text-[#1C74D9] text-sm font-bold">
                        {(activity.action || 'A').charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">{activity.action}</div>
                        <div className="text-sm text-slate-600">{activity.title}</div>
                      </div>
                      <div className="text-sm text-slate-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
