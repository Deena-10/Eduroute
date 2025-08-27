// frontend/src/pages/Roadmap.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Roadmap = () => {
  const { user } = useContext(AuthContext);
  const [selectedPath, setSelectedPath] = useState('software-development');

  const careerPaths = {
    'software-development': {
      title: 'Software Development',
      description: 'Full-stack development path with modern technologies',
      duration: '12 months',
      difficulty: 'Beginner to Advanced',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Database', 'DevOps'],
      steps: [
        {
          phase: 'Foundation',
          duration: '3 months',
          skills: ['HTML/CSS', 'JavaScript', 'Git', 'Command Line'],
          resources: ['MDN Web Docs', 'freeCodeCamp', 'GitHub'],
          projects: ['Personal Portfolio', 'Todo App', 'Calculator']
        },
        {
          phase: 'Frontend Development',
          duration: '3 months',
          skills: ['React', 'TypeScript', 'CSS Frameworks', 'State Management'],
          resources: ['React Documentation', 'TypeScript Handbook', 'Tailwind CSS'],
          projects: ['E-commerce Site', 'Social Media App', 'Dashboard']
        },
        {
          phase: 'Backend Development',
          duration: '3 months',
          skills: ['Node.js', 'Express', 'Databases', 'APIs'],
          resources: ['Node.js Documentation', 'Express Guide', 'MongoDB Atlas'],
          projects: ['REST API', 'Blog Platform', 'Chat Application']
        },
        {
          phase: 'Advanced Topics',
          duration: '3 months',
          skills: ['Testing', 'Deployment', 'Performance', 'Security'],
          resources: ['Jest Documentation', 'Docker Tutorial', 'OWASP Guide'],
          projects: ['Full-stack Application', 'Microservices', 'CI/CD Pipeline']
        }
      ]
    },
    'data-science': {
      title: 'Data Science',
      description: 'Analytics and machine learning career path',
      duration: '10 months',
      difficulty: 'Intermediate to Advanced',
      skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Data Visualization'],
      steps: [
        {
          phase: 'Python & Statistics',
          duration: '2 months',
          skills: ['Python', 'Pandas', 'NumPy', 'Statistics'],
          resources: ['Python Documentation', 'Pandas Guide', 'Statistics Course'],
          projects: ['Data Analysis', 'Statistical Report', 'Data Cleaning']
        },
        {
          phase: 'Data Visualization',
          duration: '2 months',
          skills: ['Matplotlib', 'Seaborn', 'Plotly', 'Tableau'],
          resources: ['Matplotlib Tutorial', 'Seaborn Guide', 'Tableau Training'],
          projects: ['Interactive Dashboard', 'Data Story', 'Business Report']
        },
        {
          phase: 'Machine Learning',
          duration: '3 months',
          skills: ['Scikit-learn', 'TensorFlow', 'Deep Learning', 'Model Evaluation'],
          resources: ['Scikit-learn Documentation', 'TensorFlow Tutorial', 'Coursera ML'],
          projects: ['Classification Model', 'Recommendation System', 'Image Recognition']
        },
        {
          phase: 'Advanced ML & Deployment',
          duration: '3 months',
          skills: ['MLOps', 'Model Deployment', 'Big Data', 'Cloud Platforms'],
          resources: ['MLOps Guide', 'AWS ML', 'Google Cloud ML'],
          projects: ['Production ML Model', 'Real-time Prediction', 'ML Pipeline']
        }
      ]
    },
    'cybersecurity': {
      title: 'Cybersecurity',
      description: 'Learn ethical hacking and security practices',
      duration: '8 months',
      difficulty: 'Beginner to Intermediate',
      skills: ['Network Security', 'Penetration Testing', 'Cryptography', 'Incident Response'],
      steps: [
        {
          phase: 'Security Fundamentals',
          duration: '2 months',
          skills: ['Network Basics', 'Security Concepts', 'Linux', 'Cryptography'],
          resources: ['CompTIA Security+', 'Linux Academy', 'Cryptography Course'],
          projects: ['Network Setup', 'Security Assessment', 'Encryption Tool']
        },
        {
          phase: 'Penetration Testing',
          duration: '3 months',
          skills: ['Kali Linux', 'Metasploit', 'Burp Suite', 'Social Engineering'],
          resources: ['Kali Linux Documentation', 'Metasploit Guide', 'OWASP Testing'],
          projects: ['Vulnerability Assessment', 'Penetration Test Report', 'Security Tool']
        },
        {
          phase: 'Advanced Security',
          duration: '3 months',
          skills: ['Web Security', 'Mobile Security', 'Cloud Security', 'Incident Response'],
          resources: ['Web Security Course', 'Mobile Security Guide', 'Cloud Security'],
          projects: ['Security Audit', 'Incident Response Plan', 'Security Framework']
        }
      ]
    },
    'ui-ux-design': {
      title: 'UI/UX Design',
      description: 'User experience and interface design',
      duration: '6 months',
      difficulty: 'Beginner to Intermediate',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
      steps: [
        {
          phase: 'Design Fundamentals',
          duration: '2 months',
          skills: ['Design Principles', 'Color Theory', 'Typography', 'Layout'],
          resources: ['Design Course', 'Color Theory Guide', 'Typography Rules'],
          projects: ['Design System', 'Brand Identity', 'Style Guide']
        },
        {
          phase: 'User Research',
          duration: '2 months',
          skills: ['User Interviews', 'Surveys', 'Personas', 'User Journey'],
          resources: ['UX Research Methods', 'Interview Guide', 'Survey Tools'],
          projects: ['User Research Report', 'Persona Development', 'Journey Mapping']
        },
        {
          phase: 'Prototyping & Testing',
          duration: '2 months',
          skills: ['Figma', 'Prototyping', 'Usability Testing', 'Iteration'],
          resources: ['Figma Tutorial', 'Prototyping Guide', 'Testing Methods'],
          projects: ['Interactive Prototype', 'Usability Test', 'Design Iteration']
        }
      ]
    }
  };

  const currentPath = careerPaths[selectedPath];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F6F6' }}>
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#000000' }}>Career Roadmaps</h1>
            <p className="text-gray-600">Choose your path and follow a structured learning journey</p>
          </div>

          {/* Career Path Selection */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-300 shadow-lg">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#000000' }}>Select Your Career Path</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(careerPaths).map(([key, path]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPath(key)}
                  className={`p-4 rounded-xl border transition-colors duration-200 text-left ${
                    selectedPath === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>{path.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{path.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{path.duration}</span>
                    <span>{path.difficulty}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Path Details */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-gray-300 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>{currentPath.title}</h2>
              <p className="text-gray-600 mb-4">{currentPath.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{currentPath.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Difficulty:</span>
                  <span className="font-medium" style={{ color: '#000000' }}>{currentPath.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Skills Overview */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3" style={{ color: '#000000' }}>Skills You'll Learn</h3>
              <div className="flex flex-wrap gap-2">
                {currentPath.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Learning Steps */}
          <div className="space-y-6">
            {currentPath.steps.map((step, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-300 shadow-lg">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-xl font-bold" style={{ color: '#000000' }}>{step.phase}</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {step.duration}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Skills */}
                      <div>
                        <h4 className="font-semibold mb-3" style={{ color: '#000000' }}>Skills</h4>
                        <div className="space-y-2">
                          {step.skills.map((skill, skillIndex) => (
                            <div key={skillIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              <span className="text-sm text-gray-700">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resources */}
                      <div>
                        <h4 className="font-semibold mb-3" style={{ color: '#000000' }}>Resources</h4>
                        <div className="space-y-2">
                          {step.resources.map((resource, resourceIndex) => (
                            <div key={resourceIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              <span className="text-sm text-gray-700">{resource}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Projects */}
                      <div>
                        <h4 className="font-semibold mb-3" style={{ color: '#000000' }}>Projects</h4>
                        <div className="space-y-2">
                          {step.projects.map((project, projectIndex) => (
                            <div key={projectIndex} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                              <span className="text-sm text-gray-700">{project}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white mt-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-blue-100 mb-6">
              Begin your {currentPath.title.toLowerCase()} journey today and track your progress
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition-colors duration-200">
                Start Learning
              </button>
              <button className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-xl font-semibold transition-colors duration-200">
                View Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
