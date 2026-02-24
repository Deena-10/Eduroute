# Free APIs Guide for Career Roadmap App

## Current Paid APIs Being Used:
- **Gemini API** (Google) - Paid
- **Groq API** - Paid  
- **Hugging Face API** - Paid tier

## Free API Alternatives:

### 1. **OpenAI API (Free Tier)**
- **Cost**: Free tier with $5 credit monthly
- **Rate Limit**: 3 requests per minute
- **Model**: gpt-3.5-turbo
- **Setup**: 
  ```bash
  # Add to .env
  OPENAI_API_KEY=your_openai_key
  ```
- **Usage**: Replace Gemini/Groq for AI responses

### 2. **Hugging Face Inference API (Free Tier)**
- **Cost**: 30,000 requests per month free
- **Models**: Many open-source models
- **Current Usage**: Already configured but with API key
- **Free Models**: 
  - `bigscience/bloom-560m`
  - `gpt2`
  - `microsoft/DialoGPT-medium`

### 3. **Ollama (Completely Free)**
- **Cost**: $0 (runs locally)
- **Models**: Llama 2, Mistral, CodeLlama
- **Setup**: Install locally, no API keys needed
- **Usage**: Replace all AI services

### 4. **Free Career & Job APIs:**

#### **GitHub Jobs API**
- **Cost**: Completely free
- **Rate Limit**: None specified
- **Endpoint**: `https://jobs.github.com/positions.json`
- **Use Case**: Job listings, salary data, skill requirements
- **Example**:
  ```javascript
  fetch('https://jobs.github.com/positions.json?description=javascript&location=remote')
  ```

#### **Stack Overflow API**
- **Cost**: Completely free
- **Rate Limit**: 10,000 requests per day
- **Endpoint**: `https://api.stackexchange.com/2.3/`
- **Use Case**: Technology trends, skill popularity
- **Example**:
  ```javascript
  fetch('https://api.stackoverflow.com/2.3/tags?order=desc&sort=popular&site=stackoverflow')
  ```

#### **Indeed API (Free Tier)**
- **Cost**: Limited free requests
- **Use Case**: Job market analysis, salary data

### 5. **Free Learning Resource APIs:**

#### **YouTube Data API**
- **Cost**: Free tier - 10,000 requests per day
- **Use Case**: Video tutorials, learning content
- **Setup**: Get API key from Google Cloud Console
- **Example**:
  ```javascript
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=javascript+tutorial&type=video&key=${API_KEY}`)
  ```

#### **GitHub API**
- **Cost**: Free tier - 5,000 requests per hour
- **Use Case**: Project examples, trending repositories
- **Example**:
  ```javascript
  fetch('https://api.github.com/search/repositories?q=javascript+stars:>1000')
  ```

### 6. **Free Educational APIs:**

#### **Coursera API**
- **Cost**: Free tier available
- **Use Case**: Course recommendations

#### **edX API**
- **Cost**: Free access
- **Use Case**: Educational content

## Implementation Strategy:

### Option 1: Replace with OpenAI Free Tier
```python
# Replace in application.py
import openai

openai.api_key = os.environ.get("OPENAI_API_KEY")

def get_ai_response(question):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a career advisor..."},
                {"role": "user", "content": question}
            ],
            max_tokens=500
        )
        return response.choices[0].message.content
    except:
        return get_fallback_response(question)
```

### Option 2: Use Hugging Face Free Tier
```python
# Already configured in your app
# Just remove API key requirement for free models
response = requests.post(
    "https://api-inference.huggingface.co/models/bigscience/bloom-560m",
    json={"inputs": prompt}
)
```

### Option 3: Local Ollama Setup
```python
# Install Ollama locally
# pip install ollama

import ollama

def get_ai_response(question):
    response = ollama.chat(model='llama2', messages=[
        {'role': 'user', 'content': question}
    ])
    return response['message']['content']
```

### Option 4: Fallback with Free Career Data
```python
def get_career_guidance(question):
    # Pre-defined career paths
    career_paths = {
        "web development": "Learn HTML, CSS, JavaScript...",
        "data science": "Learn Python, Pandas, ML...",
        "mobile development": "Choose iOS/Android or React Native..."
    }
    
    # Add job market data
    job_data = get_github_jobs(question)
    
    # Add learning resources
    resources = get_youtube_tutorials(question)
    
    return combined_response
```

## Recommended Migration Steps:

1. **Start with OpenAI free tier** - Easiest replacement
2. **Add GitHub Jobs API** - For job market data
3. **Add YouTube Data API** - For learning resources
4. **Implement fallback responses** - For when APIs are unavailable
5. **Consider Ollama** - For completely free local AI

## Environment Variables for Free APIs:
```bash
# .env file
OPENAI_API_KEY=your_openai_key
YOUTUBE_API_KEY=your_youtube_key
HF_API_KEY=your_huggingface_key  # Optional for free tier
```

## Cost Comparison:
- **Current Setup**: ~$50-100/month (estimated)
- **Free Setup**: $0-5/month (OpenAI free tier only)
- **Savings**: 95-100% cost reduction

This migration will make your career roadmap app completely free to operate while maintaining most functionality.


