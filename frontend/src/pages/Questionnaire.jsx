// frontend/src/pages/Questionnaire.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const Questionnaire = () => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [engine, setEngine] = useState('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!question.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: question,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setQuestion('');
    setIsTyping(true);

    try {
      const response = await axiosInstance.post('/ai/chat', {
        message: question,
        engine: engine
      });

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: response.data.reply,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: '#000000' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Early return if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F6F6' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg" style={{ color: '#000000' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="h-screen flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-300 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#000000' }}>Career AI Assistant</h1>
                <p className="text-gray-600 text-sm">Ask me anything about your career!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#F6F6F6' }}>
          <div className="max-w-4xl mx-auto">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#000000' }}>Start Your Career Journey</h2>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  Tell me about your career interests and goals! I can help you create a personalized roadmap.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {chatHistory.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                            <div className={`p-4 rounded-2xl shadow-lg ${
                        message.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-md' 
                                : 'bg-white text-black border border-gray-300 rounded-bl-md'
                            }`}>
                        <p className="leading-relaxed" style={{ color: message.sender === 'user' ? '#ffffff' : '#000000' }}>
                          {message.message}
                              </p>
                            </div>
                          </div>
                          
                          {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-3 ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                      {message.sender === 'user' ? (
                              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-lg text-white">🤖</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-center font-medium">{error}</p>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white border-t border-gray-300 p-4 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Tell me about your career interests and goals..."
                  disabled={isLoading || isTyping}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 pr-12"
                />
                <button
                  type="submit"
                  disabled={isLoading || isTyping || !question.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || isTyping ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
