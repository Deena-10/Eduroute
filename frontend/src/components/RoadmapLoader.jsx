import React, { useState, useEffect } from "react";
import { Brain } from "lucide-react";

const messages = [
  "Analyzing your goals and skills...",
  "Consulting AI to build your roadmap...",
  "Structuring your learning path...",
  "Almost there, finalizing your roadmap..."
];

const RoadmapLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Rotate messages every 4 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    // 2. Progress bar fills over 60 seconds
    // Increments approx every 100ms: 100 / (60 * 10) = 0.166% per increment
    const startTime = Date.now();
    const duration = 60000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 98); // Slow down near end
      setProgress(nextProgress);
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(244, 249, 245, 0.98)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      textAlign: 'center',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse-brain {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes slideIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Pulsing Brain Icon */}
      <div style={{
        marginBottom: '32px',
        animation: 'pulse-brain 2s ease-in-out infinite',
        color: '#2D6A4F'
      }}>
        <Brain size={64} fill="#D8F3DC" strokeWidth={1.5} />
      </div>

      {/* Rotating Status Messages */}
      <div key={messageIndex} style={{
        minHeight: '40px',
        marginBottom: '24px',
        animation: 'slideIn 0.4s ease-out'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#1A2E1A',
          margin: 0
        }}>
          {messages[messageIndex]}
        </h2>
      </div>

      {/* Progress Bar Container */}
      <div style={{
        width: '100%',
        maxWidth: '320px',
        height: '8px',
        background: '#E8F4EA',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '16px',
        border: '1px solid #D4E8D7'
      }}>
        {/* Fill */}
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #52B788, #2D6A4F)',
          transition: 'width 0.1s linear',
          borderRadius: '10px'
        }} />
      </div>

      <p style={{
        fontSize: '14px',
        color: '#6B8F71',
        fontWeight: 500,
        margin: 0
      }}>
        {Math.round(progress)}% Complete
      </p>

      {/* Note at bottom */}
      <div style={{
        marginTop: '48px',
        padding: '12px 20px',
        borderRadius: '12px',
        background: '#FFFFFF',
        border: '1px solid #D4E8D7',
        fontSize: '12px',
        color: '#9AB89D',
        maxWidth: '280px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        <span style={{ fontWeight: 700, color: '#40916C', display: 'block', marginBottom: '4px' }}>TIP</span>
        AI generation can take up to 60 seconds on first load as the service wakes up.
      </div>
    </div>
  );
};

export default RoadmapLoader;
