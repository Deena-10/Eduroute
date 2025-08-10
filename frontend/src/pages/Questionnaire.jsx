import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion';

const Questionnaire = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  const questions = [
    { id: 'interest', text: 'What subjects or topics interest you the most?' },
    { id: 'skills', text: 'What skills do you feel confident in?' },
    { id: 'goal', text: 'What’s your dream job or career goal?' },
    { id: 'values', text: 'What values matter most in your work environment?' },
  ];

  const handleAnswer = (e) => {
    setAnswers({ ...answers, [questions[step].id]: e.target.value });
  };

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitToAI();
    }
  };

  const submitToAI = async () => {
    setLoading(true);
    try {
      // Send answers to backend API that calls GenAI
      const res = await axiosInstance.post('/ai/career-suggestion', { answers });
      setAiSuggestion(res.data.suggestion);
    } catch (err) {
      console.error(err);
      setAiSuggestion('⚠️ Could not get suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center">
        <div className="spinner border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        <p className="mt-4">Analyzing your answers with AI...</p>
      </div>
    );
  }

  if (aiSuggestion) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your AI Career Suggestion</h1>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 bg-blue-100 rounded-lg shadow-lg"
        >
          {aiSuggestion}
        </motion.div>
        <button
          onClick={() => {
            setStep(0);
            setAnswers({});
            setAiSuggestion('');
          }}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Career Questionnaire</h1>
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-4 bg-white rounded-xl shadow-lg"
      >
        <p className="text-lg font-semibold mb-4">{questions[step].text}</p>
        <textarea
          rows="4"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          value={answers[questions[step].id] || ''}
          onChange={handleAnswer}
        ></textarea>
        <div className="flex justify-end mt-4">
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {step === questions.length - 1 ? 'Get AI Suggestion' : 'Next'}
          </button>
        </div>
      </motion.div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Step {step + 1} of {questions.length}
      </div>
    </div>
  );
};

export default Questionnaire;
