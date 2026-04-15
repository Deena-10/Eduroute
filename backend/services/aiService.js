// backend/services/aiService.js
const axios = require("axios");

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "http://localhost:5001").replace(/\/$/, "");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error) => {
    const code = error?.code;
    // Do not retry ECONNABORTED — usually axios client timeout (already waited full duration).
    if (["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ETIMEDOUT"].includes(code)) {
        return true;
    }
    const status = error?.response?.status;
    if (status === 502 || status === 503 || status === 504) return true;
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("timeout")) return true;
    return false;
};

const postWithRetry = async (endpoint, data, config = {}, attempts = 3) => {
    const url = `${AI_SERVICE_URL}${endpoint}`;
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            return await axios.post(url, data, {
                ...config,
                timeout: config.timeout || 90000,
                headers: { "Content-Type": "application/json", ...config.headers },
            });
        } catch (err) {
            lastError = err;
            if (!shouldRetry(err) || i === attempts - 1) throw err;
            await sleep(5000); // 5s delay for full AI service cold starts
        }
    }
    throw lastError;
};

const get = async (endpoint, params = {}, config = {}) =>
    await axios.get(`${AI_SERVICE_URL}${endpoint}`, { params, ...config });

module.exports = { postWithRetry, get, AI_SERVICE_URL };
