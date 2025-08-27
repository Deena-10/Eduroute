// test-integration.js
const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const AI_SERVICE_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:3000';

async function testBackendHealth() {
    try {
        const response = await axios.get(`${BACKEND_URL}/`);
        console.log('✅ Backend is running:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Backend is not responding:', error.message);
        return false;
    }
}

async function testAIServiceHealth() {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/ask_ai`, {
            question: 'Hello, are you working?',
            engine: 'gemini',
            uid: 'test-user'
        });
        console.log('✅ AI Service is running:', response.data);
        return true;
    } catch (error) {
        console.log('❌ AI Service is not responding:', error.message);
        return false;
    }
}

async function testRoadmapGeneration() {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/generate_roadmap`, {
            uid: 'test-user',
            skills_to_learn: ['JavaScript', 'React', 'Node.js'],
            planning_days: 30
        });
        console.log('✅ Roadmap generation works:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Roadmap generation failed:', error.message);
        return false;
    }
}

async function testEventSuggestions() {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/suggest_event`, {
            uid: 'test-user',
            domain: 'web-development',
            completion_percentage: 0
        });
        console.log('✅ Event suggestions work:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Event suggestions failed:', error.message);
        return false;
    }
}

async function testProjectSuggestions() {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/suggest_project`, {
            uid: 'test-user',
            domain: 'web-development',
            completion_percentage: 0
        });
        console.log('✅ Project suggestions work:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Project suggestions failed:', error.message);
        return false;
    }
}

async function runIntegrationTests() {
    console.log('🚀 Running Career Roadmap App Integration Tests...\n');

    const tests = [
        { name: 'Backend Health', test: testBackendHealth },
        { name: 'AI Service Health', test: testAIServiceHealth },
        { name: 'Roadmap Generation', test: testRoadmapGeneration },
        { name: 'Event Suggestions', test: testEventSuggestions },
        { name: 'Project Suggestions', test: testProjectSuggestions }
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
        console.log(`Testing ${test.name}...`);
        const result = await test.test();
        if (result) passed++;
        console.log('');
    }

    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All integration tests passed! Your Career Roadmap App is ready to use.');
    } else {
        console.log('⚠️ Some tests failed. Please check your configuration and try again.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runIntegrationTests().catch(console.error);
}

module.exports = { runIntegrationTests };
