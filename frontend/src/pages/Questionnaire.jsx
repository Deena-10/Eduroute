// frontend/src/pages/Questionnaire.jsx
import React, { useState } from 'react';

const Questionnaire = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [engine, setEngine] = useState('gemini'); // Default engine

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAnswer('');

    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }

    setIsLoading(true);

    try {
      console.log("➡️ Sending request:", { question, engine });

      const apiUrl = 'http://localhost:5000/ask_ai';
      const body = { question, engine };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        const text = await response.text();
        console.error("Failed to parse JSON:", text);
        setError(`Unexpected response from server: ${text}`);
        return;
      }

      console.log("⬅️ Received response:", data);

      if (data.error) {
        setError(data.error);
        setAnswer('');
      } else {
        setAnswer(data.answer || data.result || 'No response received');
        setError('');
      }

    } catch (err) {
      console.error('Failed to fetch from API:', err);
      setError('Failed to get a response from the AI. Please try again.');
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '48rem', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', color: '#1f2937' }}>Ask the AI</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            disabled={isLoading}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          />

          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            disabled={isLoading}
            style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#fff' }}
          >
            <option value="gemini">Gemini</option>
            <option value="groq">Groq</option>
            <option value="huggingface">Hugging Face</option>
          </select>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', padding: '0.75rem 1.5rem', backgroundColor: isLoading ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 'bold', borderRadius: '0.375rem', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'background-color 0.3s ease-in-out' }}
          >
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb', minHeight: '12.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLoading && <p style={{ color: '#6b7280' }}>Generating a response...</p>}
          {error && <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>}
          {answer && (
            <div style={{ width: '100%' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>AI Response:</h2>
              <p style={{ color: '#1f2937', lineHeight: '1.625', whiteSpace: 'pre-wrap' }}>{answer}</p>
            </div>
          )}
          {!isLoading && !answer && !error && <p style={{ color: '#9ca3af', textAlign: 'center', fontStyle: 'italic' }}>Your AI-generated answer will appear here.</p>}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
