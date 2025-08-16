import React, { useState } from 'react';

const Questionnaire = () => {
  // State to hold the user's question, the AI's answer, and loading status
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setAnswer(''); // Clear any previous answers

    // Do not proceed if the question is empty
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }

    setIsLoading(true);

    try {
      // Make a POST request to the backend API
      const response = await fetch('http://localhost:5000/ask_ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question }),
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON response
      const data = await response.json();

      // Check for an error message from the backend
      if (data.error) {
        setError(data.error);
        setAnswer('');
      } else {
        setAnswer(data.answer);
        setError('');
      }
      
    } catch (err) {
      console.error('Failed to fetch from API:', err);
      setError('Failed to get a response from the AI. Please try again.');
    } finally {
      setIsLoading(false);
      setQuestion(''); // Clear the input field
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6', // Equivalent to bg-gray-100
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '48rem', // Equivalent to max-w-2xl
        backgroundColor: '#fff',
        borderRadius: '0.5rem', // Equivalent to rounded-lg
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Equivalent to shadow-xl
        padding: '2rem', // Equivalent to p-8
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem', // Equivalent to space-y-8
      }}>
        <h1 style={{
          fontSize: '1.875rem', // Equivalent to text-3xl
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1f2937', // Equivalent to text-gray-800
        }}>
          Ask the AI
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#4b5563', // Equivalent to text-gray-600
        }}>
          Have questions about career paths, skills, or anything else? Ask our AI assistant!
        </p>

        {/* The form for user input */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem', // Equivalent to space-y-4
        }}>
          <input
            type="text"
            style={{
              flex: '1 1 0%', // Equivalent to flex-grow
              padding: '0.75rem', // Equivalent to p-3
              border: '1px solid #d1d5db', // Equivalent to border-gray-300
              borderRadius: '0.375rem', // Equivalent to rounded-md
              outline: 'none',
            }}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            disabled={isLoading}
          />
          <button
            type="submit"
            style={{
              width: '100%', // Equivalent to w-full
              padding: '0.75rem 1.5rem', // Equivalent to px-6 py-3
              backgroundColor: isLoading ? '#93c5fd' : '#2563eb', // Equivalent to bg-blue-400 and bg-blue-600
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '0.375rem', // Equivalent to rounded-md
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transitionProperty: 'background-color',
              transitionDuration: '300ms',
              transitionTimingFunction: 'ease-in-out',
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        {/* Display area for the answer and errors */}
        <div style={{
          marginTop: '2rem', // Equivalent to mt-8
          padding: '1.5rem', // Equivalent to p-6
          backgroundColor: '#f9fafb', // Equivalent to bg-gray-50
          borderRadius: '0.5rem', // Equivalent to rounded-lg
          border: '1px solid #e5e7eb', // Equivalent to border-gray-200
          minHeight: '12.5rem', // Equivalent to min-h-[200px]
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isLoading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <div style={{
                animation: 'spin 1s linear infinite',
                borderRadius: '9999px',
                height: '2rem',
                width: '2rem',
                borderTopWidth: '2px',
                borderBottomWidth: '2px',
                borderColor: '#3b82f6',
              }}></div>
              <p style={{
                marginTop: '0.5rem', // Equivalent to mt-2
                color: '#6b7280', // Equivalent to text-gray-500
              }}>
                Generating a response...
              </p>
            </div>
          )}
          {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}
          {answer && (
            <div style={{ width: '100%' }}>
              <h2 style={{
                fontSize: '1.25rem', // Equivalent to text-xl
                fontWeight: '600',
                marginBottom: '0.5rem', // Equivalent to mb-2
                color: '#374151', // Equivalent to text-gray-700
              }}>
                AI Response:
              </h2>
              <p style={{
                color: '#1f2937', // Equivalent to text-gray-800
                lineHeight: '1.625', // Equivalent to leading-relaxed
                whiteSpace: 'pre-wrap',
              }}>{answer}</p>
            </div>
          )}
          {!isLoading && !answer && !error && (
            <p style={{
              color: '#9ca3af', // Equivalent to text-gray-400
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              Your AI-generated answer will appear here.
            </p>
          )}
        </div>
      </div>
      {/* Keyframe animation for spinning loader */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Questionnaire;
