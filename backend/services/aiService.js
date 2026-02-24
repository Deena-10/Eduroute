// backend/services/aiService.js
const axios = require("axios");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:5001";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error) => {
    const code = error?.code;
    return ["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"].includes(code);
};

const postWithRetry = async (endpoint, data, config = {}, attempts = 3) => {
    const url = `${AI_SERVICE_URL}${endpoint}`;
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            return await axios.post(url, data, {
                ...config,
                timeout: config.timeout || 30000,
                headers: { "Content-Type": "application/json", ...config.headers }
            });
        } catch (err) {
            lastError = err;
            if (!shouldRetry(err) || i === attempts - 1) throw err;
            await sleep(300 * Math.pow(2, i));
        }
    }
    throw lastError;
};

const get = async (endpoint, params = {}) => {
    return await axios.get(`${AI_SERVICE_URL}${endpoint}`, { params });
};

module.exports = { postWithRetry, get, AI_SERVICE_URL };
