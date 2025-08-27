// frontend/src/pages/Questionnaire.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Questionnaire = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [engine, setEngine] = useState('gemini');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [roadmapImage, setRoadmapImage] = useState('');
  const [userInterests, setUserInterests] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Define scrollToBottom function before hooks that use it
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`chatHistory_${user.uid || 'guest'}`);
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          setChatHistory(parsedHistory);
        } catch (error) {
          console.error('Error parsing chat history:', error);
          setChatHistory([]);
        }
      }
    }
  }, [user]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (user && chatHistory.length > 0) {
      localStorage.setItem(`chatHistory_${user.uid || 'guest'}`, JSON.stringify(chatHistory));
    }
  }, [chatHistory, user]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Early return after all hooks
  if (!user) {
    return (
      <div className="min-h-screen relative" style={{ backgroundColor: '#F6F6F6' }}>
        {/* Actual Chat Interface (not blurred) */}
        <div className="h-screen flex flex-col">
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
                <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-black text-sm">
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#000000' }}>Start Your Career Journey</h2>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  Tell me about your career interests and goals! I can help you create a personalized roadmap.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                  {['What are the steps to become a Software Engineer?', 'How can I improve my React skills?', 'Suggest some career paths in AI.', 'What internships are available for data science?'].map((suggestion, index) => (
                    <button key={index} className="bg-white hover:bg-gray-50 border border-gray-300 text-black p-4 rounded-xl transition-colors duration-200 text-left hover:border-gray-400 shadow-sm">
                      <p className="text-sm font-medium">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-gray-300 p-4 shadow-lg">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tell me about your career interests and goals..."
                    disabled
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-500 pr-12"
                  />
                  <button disabled className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🔒</span>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>Login Required</h2>
              <p className="text-gray-600 mb-6">
                You need to be logged in to access the AI Career Assistant and start your personalized career journey.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200"
                >
                  Login Now
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Keywords that indicate user interests/goals
  const interestKeywords = [
    'interested in', 'want to learn', 'goal is', 'aspire to', 'dream of', 'passionate about',
    'career in', 'become a', 'study', 'pursue', 'focus on', 'specialize in', 'work in',
    'developer', 'engineer', 'designer', 'analyst', 'manager', 'consultant', 'entrepreneur',
    'data science', 'machine learning', 'web development', 'mobile development', 'cybersecurity',
    'cloud computing', 'devops', 'ui/ux', 'marketing', 'finance', 'healthcare', 'education'
  ];

  // Keywords that indicate agreement to roadmap generation
  const agreementKeywords = [
    'yes', 'ok', 'okay', 'sure', 'please', 'generate', 'create', 'show', 'give', 'provide',
    'roadmap', 'path', 'plan', 'guide', 'timeline', 'steps', 'journey', 'course', 'curriculum'
  ];

  // Check if user message contains interest/goal keywords
  const detectInterests = (message) => {
    const lowerMessage = message.toLowerCase();
    return interestKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Check if user agrees to roadmap generation
  const detectAgreement = (message) => {
    const lowerMessage = message.toLowerCase();
    return agreementKeywords.some(keyword => lowerMessage.includes(keyword));
  };

  // Generate roadmap image URL based on domain
  const generateRoadmapImage = (domain) => {
    const roadmapImages = {
      'software development': 'https://i.imgur.com/8JZqX3F.png',
      'web development': 'https://i.imgur.com/8JZqX3F.png',
      'data science': 'https://i.imgur.com/QW3K9L2.png',
      'machine learning': 'https://i.imgur.com/QW3K9L2.png',
      'mobile development': 'https://i.imgur.com/Y7H2M4N.png',
      'cybersecurity': 'https://i.imgur.com/L5P8R1T.png',
      'cloud computing': 'https://i.imgur.com/K9M3N6Q.png',
      'devops': 'https://i.imgur.com/V2X7Y4Z.png',
      'ui/ux design': 'https://i.imgur.com/H8F5J2W.png',
      'digital marketing': 'https://i.imgur.com/G4K7L9M.png',
      'product management': 'https://i.imgur.com/B6N2P8Q.png',
      'business analyst': 'https://i.imgur.com/C3M5R7T.png'
    };

    // Find the best matching domain
    const lowerDomain = domain.toLowerCase();
    for (const [key, imageUrl] of Object.entries(roadmapImages)) {
      if (lowerDomain.includes(key) || key.includes(lowerDomain)) {
        return imageUrl;
      }
    }

    // Default roadmap image
    return 'https://i.imgur.com/8JZqX3F.png';
  };

  // Extract domain from user message
  const extractDomain = (message) => {
    const domains = [
      'software development', 'web development', 'data science', 'machine learning',
      'mobile development', 'cybersecurity', 'cloud computing', 'devops', 'ui/ux design',
      'digital marketing', 'product management', 'business analyst', 'frontend development',
      'backend development', 'full stack development', 'artificial intelligence',
      'blockchain', 'game development', 'network engineering', 'database administration'
    ];

    const lowerMessage = message.toLowerCase();
    for (const domain of domains) {
      if (lowerMessage.includes(domain)) {
        return domain;
      }
    }

    // If no specific domain found, try to extract from context
    if (lowerMessage.includes('developer') || lowerMessage.includes('programming')) {
      return 'software development';
    } else if (lowerMessage.includes('data') || lowerMessage.includes('analytics')) {
      return 'data science';
    } else if (lowerMessage.includes('design') || lowerMessage.includes('ui')) {
      return 'ui/ux design';
    } else if (lowerMessage.includes('marketing') || lowerMessage.includes('digital')) {
      return 'digital marketing';
    }

    return 'software development'; // Default domain
  };

  // Mock AI responses for demo purposes
  const getMockResponse = (userQuestion, selectedEngine) => {
    const responses = {
      gemini: [
        "Based on your question about career development, I'd recommend focusing on building both technical and soft skills. Consider taking online courses in your field of interest and networking with professionals in your industry.",
        "That's an excellent question! For career growth, I suggest creating a personal development plan with specific goals and timelines. Regular skill assessments and continuous learning are key to staying competitive.",
        "Great question! I'd advise you to start by identifying your core strengths and interests. Then research in-demand skills in your target industry and create a structured learning path.",
        "From a career perspective, I'd suggest starting with foundational skills and gradually building expertise. Look for mentorship opportunities and consider certifications that are valued in your industry.",
        "Excellent inquiry! I recommend creating a skills roadmap with both short-term and long-term objectives. Focus on practical projects that demonstrate your capabilities to potential employers."
      ],
      groq: [
        "From a career perspective, I'd suggest starting with foundational skills and gradually building expertise. Look for mentorship opportunities and consider certifications that are valued in your industry.",
        "Excellent inquiry! I recommend creating a skills roadmap with both short-term and long-term objectives. Focus on practical projects that demonstrate your capabilities to potential employers.",
        "That's a thoughtful question! I'd advise you to analyze market trends in your field, identify skill gaps, and develop a strategic plan for acquiring the most valuable competencies.",
        "Based on current industry trends, I'd recommend focusing on emerging technologies and methodologies. Consider contributing to open-source projects to build a strong portfolio.",
        "Great question! I suggest adopting a growth mindset and seeking feedback from experienced professionals. Regular self-assessment and adaptation to industry changes are crucial."
      ],
      huggingface: [
        "Based on current industry trends, I'd recommend focusing on emerging technologies and methodologies. Consider contributing to open-source projects to build a strong portfolio.",
        "Great question! I suggest adopting a growth mindset and seeking feedback from experienced professionals. Regular self-assessment and adaptation to industry changes are crucial.",
        "That's an important consideration! I'd advise you to stay updated with industry developments, participate in relevant communities, and continuously refine your skill set based on market demands.",
        "From a technical standpoint, I'd recommend focusing on practical applications and real-world projects. Build a portfolio that showcases your problem-solving abilities.",
        "Excellent question! I suggest exploring interdisciplinary approaches and staying curious about new technologies. Continuous learning and adaptability are key in today's fast-paced industry."
      ]
    };

    const engineResponses = responses[selectedEngine] || responses.gemini;
    const randomIndex = Math.floor(Math.random() * engineResponses.length);
    return engineResponses[randomIndex];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      engine: engine
    };

    setChatHistory(prev => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion('');

    try {
      // Simulate typing indicator
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      let aiResponse = '';
      let shouldOfferRoadmap = false;

      // Check if user mentioned interests/goals
      if (detectInterests(currentQuestion)) {
        const domain = extractDomain(currentQuestion);
        setUserInterests(domain);
        aiResponse = `I can see you're interested in ${domain}! That's a great career choice. I can help you create a personalized roadmap for your ${domain} journey. Would you like me to generate a detailed roadmap with learning steps, resources, and timeline for you?`;
        shouldOfferRoadmap = true;
      } else if (detectAgreement(currentQuestion) && userInterests) {
        // User agreed to roadmap generation
        const imageUrl = generateRoadmapImage(userInterests);
        setRoadmapImage(imageUrl);
        setShowRoadmap(true);
        aiResponse = `Perfect! I've generated a comprehensive roadmap for your ${userInterests} career path. Here's your personalized learning journey:`;
      } else {
        // Regular response
        aiResponse = getMockResponse(currentQuestion, engine);
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        engine: engine,
        shouldOfferRoadmap: shouldOfferRoadmap
      };

      setChatHistory(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error('Failed to get response:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setError('');
    setShowRoadmap(false);
    setRoadmapImage('');
    setUserInterests('');
    localStorage.removeItem(`chatHistory_${user?.uid || 'guest'}`);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(chatHistory);

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
              <button
                onClick={clearChat}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                title="Clear Chat"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#F6F6F6' }}>
          <div className="max-w-4xl mx-auto">
            {Object.keys(messageGroups).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#000000' }}>Start Your Career Journey</h2>
                <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                  Tell me about your career interests and goals! I can help you create a personalized roadmap.
                </p>
                
                {/* Quick Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {[
                    "I'm interested in becoming a software developer",
                    "I want to learn data science and machine learning",
                    "My goal is to work in cybersecurity",
                    "I'm passionate about UI/UX design"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(suggestion)}
                      className="bg-white hover:bg-gray-50 border border-gray-300 text-black p-4 rounded-xl transition-colors duration-200 text-left hover:border-gray-400 shadow-sm"
                    >
                      <p className="text-sm font-medium">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(messageGroups).map(([date, messages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-8">
                      <div className="bg-white px-6 py-2 rounded-full border border-gray-300 shadow-sm">
                        <span className="text-gray-600 text-sm font-medium">{date}</span>
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                            <div className={`p-4 rounded-2xl shadow-lg ${
                              message.type === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-md' 
                                : 'bg-white text-black border border-gray-300 rounded-bl-md'
                            }`}>
                              {message.type === 'ai' && (
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-lg">🤖</span>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                    {message.engine}
                                  </span>
                                </div>
                              )}
                              <p className="leading-relaxed" style={{ color: message.type === 'user' ? '#ffffff' : '#000000' }}>{message.content}</p>
                              
                              {/* Roadmap Image */}
                              {message.shouldOfferRoadmap && showRoadmap && roadmapImage && (
                                <div className="mt-4">
                                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                                    <h4 className="font-semibold mb-3" style={{ color: '#000000' }}>Your Career Roadmap</h4>
                                    <img 
                                      src={roadmapImage} 
                                      alt={`${userInterests} Career Roadmap`}
                                      className="w-full rounded-lg shadow-lg"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x400/EEEFE0/000000?text=Career+Roadmap';
                                      }}
                                    />
                                    <p className="text-gray-600 text-sm mt-3">
                                      This roadmap shows the key skills, technologies, and milestones for your {userInterests} career path.
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              <p className="text-xs text-gray-500 mt-3">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-3 ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                            {message.type === 'user' ? (
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
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="order-1">
                      <div className="bg-white text-black p-4 rounded-2xl rounded-bl-md border border-gray-300 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">🤖</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                            {engine}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-3 order-2">
                      <span className="text-lg text-white">🤖</span>
                    </div>
                  </div>
                )}
                
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
            <form onSubmit={handleSubmit} className="flex gap-4">
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
