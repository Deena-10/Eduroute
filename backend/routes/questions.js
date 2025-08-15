//backend\routes\questions.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    {
      id: 'interest',
      text: 'What subjects or topics interest you the most?',
      icon: '🎯',
      example_answers: [
        'Technology and AI',
        'Arts and Design',
        'Business and Marketing',
        'Environmental Science'
      ]
    },
    {
      id: 'skills',
      text: 'What skills do you feel most confident in?',
      icon: '💪',
      example_answers: [
        'Problem-solving',
        'Programming in JavaScript',
        'Creative writing',
        'Public speaking'
      ]
    },
    {
      id: 'goal',
      text: "What's your ultimate dream job?",
      icon: '🚀',
      example_answers: [
        'Software Engineer at Google',
        'Graphic Designer at an agency',
        'Entrepreneur running my own company',
        'Data Scientist in healthcare'
      ]
    },
    {
      id: 'values',
      text: 'What values matter most to you?',
      icon: '❤️',
      example_answers: [
        'Work-life balance',
        'High salary',
        'Helping people',
        'Opportunities for learning'
      ]
    }
  ]);
});

module.exports = router;
