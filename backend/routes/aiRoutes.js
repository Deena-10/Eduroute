const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/career-suggestion', async (req, res) => {
  try {
    const { answers } = req.body;
    const prompt = `
      Based on the following student answers, suggest a suitable career path:
      Interests: ${answers.interest}
      Skills: ${answers.skills}
      Career Goal: ${answers.goal}
      Values: ${answers.values}
      Provide the answer in 3-4 sentences.
    `;

    const hfRes = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs: prompt },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );

    res.json({ suggestion: hfRes.data[0]?.generated_text || 'No suggestion found.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ suggestion: 'Error generating suggestion' });
  }
});

module.exports = router;
