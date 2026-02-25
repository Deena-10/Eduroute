// Ensures one-time mandatory inputs (domain, proficiency, professional_goal) are complete before allowing access to roadmap/tasks.
// If incomplete, redirects to questionnaire. Returning users with stored inputs see children (roadmap) without re-prompt.
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const OnboardingGate = ({ children }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'complete' | 'incomplete'
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await axiosInstance.get('/user/onboarding-preferences');
        const prefs = res.data?.data ?? res.data;
        if (cancelled) return;
        const hasDomain = prefs?.domain && String(prefs.domain).trim();
        const hasProficiency = prefs?.proficiency_level && String(prefs.proficiency_level).trim();
        const hasGoal = prefs?.professional_goal && String(prefs.professional_goal).trim();
        setStatus(hasDomain && hasProficiency && hasGoal ? 'complete' : 'incomplete');
      } catch (e) {
        if (!cancelled) setStatus('incomplete');
      } finally {
        if (!cancelled) setChecked(true);
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  if (!checked || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'incomplete') {
    return <Navigate to="/questionnaire" replace />;
  }

  return children;
};

export default OnboardingGate;
