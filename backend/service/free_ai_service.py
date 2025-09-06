# free_ai_service.py - No-cost AI alternatives
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from dotenv import load_dotenv
from db import SessionLocal, User, ChatHistory, RoadmapProgress
from roadmap import generate_roadmap_image
from events import get_events_for_user
from projects import get_projects_for_user
from notifications import send_email

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# ---------------- Free AI Setup ----------------
# OpenAI API (Free tier: 3 requests/min, $5 credit monthly)
openai_api_key = os.environ.get("OPENAI_API_KEY")
openai_headers = {
    "Authorization": f"Bearer {openai_api_key}",
    "Content-Type": "application/json"
} if openai_api_key else None

# Hugging Face Inference API (Free tier: 30k requests/month)
hf_api_key = os.environ.get("HF_API_KEY")
hf_headers = {"Authorization": f"Bearer {hf_api_key}"} if hf_api_key else None

# YouTube Data API (Free tier: 10k requests/day)
youtube_api_key = os.environ.get("YOUTUBE_API_KEY")
youtube_base_url = "https://www.googleapis.com/youtube/v3"

# GitHub Jobs API (Completely free)
github_jobs_url = "https://jobs.github.com/positions.json"

# Stack Overflow API (Completely free)
stack_overflow_url = "https://api.stackexchange.com/2.3"

# ---------------- Free AI Response Function ----------------
def get_free_ai_response(question, engine="fallback"):
    """Get AI response using free services"""
    
    career_prompt = f"""You are a professional career advisor specializing in technology and software development. 
    
    The user asks: "{question}"
    
    Please provide a detailed, practical, and actionable response that includes:
    1. Specific steps or recommendations
    2. Relevant technologies, tools, or skills to learn
    3. Realistic timelines or milestones
    4. Resources for learning (courses, books, platforms)
    5. Industry insights and current trends
    
    Focus on being specific and helpful rather than generic advice. If the user is asking about a specific technology or career path, provide concrete guidance.
    
    Response:"""
    
    try:
        if engine == "openai" and openai_headers:
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a professional career advisor specializing in technology and software development. Provide detailed, practical, and actionable career guidance."},
                    {"role": "user", "content": question}
                ],
                "max_tokens": 500,
                "temperature": 0.7
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=openai_headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
        
        elif engine == "huggingface" and hf_headers:
            # Use a free model from Hugging Face
            payload = {"inputs": career_prompt}
            response = requests.post(
                "https://api-inference.huggingface.co/models/bigscience/bloom-560m",
                headers=hf_headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and "generated_text" in result[0]:
                    return result[0]["generated_text"]
        
        # Fallback: Use free career guidance without AI
        return get_fallback_career_guidance(question)
        
    except Exception as e:
        print(f"AI Error: {str(e)}")
        return get_fallback_career_guidance(question)

def get_fallback_career_guidance(question):
    """Fallback career guidance without AI"""
    
    # Pre-defined career guidance responses
    career_responses = {
        "web development": """
**Web Development Career Path:**

**1. Fundamentals (2-3 months):**
- HTML, CSS, JavaScript basics
- Git version control
- Command line basics

**2. Frontend Development (3-4 months):**
- React.js or Vue.js
- Responsive design
- CSS frameworks (Bootstrap, Tailwind)

**3. Backend Development (3-4 months):**
- Node.js with Express
- Database (MongoDB or PostgreSQL)
- RESTful APIs

**4. Advanced Skills (2-3 months):**
- TypeScript
- Testing (Jest, Cypress)
- Deployment (Vercel, Netlify)

**Free Resources:**
- freeCodeCamp.org
- The Odin Project
- MDN Web Docs
- YouTube: Traversy Media, The Net Ninja

**Projects to Build:**
1. Personal portfolio
2. Todo app with CRUD
3. E-commerce site
4. Social media clone
        """,
        
        "data science": """
**Data Science Career Path:**

**1. Programming Fundamentals (2-3 months):**
- Python basics
- Jupyter notebooks
- Git version control

**2. Data Analysis (3-4 months):**
- Pandas, NumPy
- Data visualization (Matplotlib, Seaborn)
- SQL basics

**3. Machine Learning (4-6 months):**
- Scikit-learn
- Statistics fundamentals
- Feature engineering

**4. Advanced Topics (3-4 months):**
- Deep learning (TensorFlow/PyTorch)
- Big data tools (Spark)
- MLOps basics

**Free Resources:**
- Kaggle Learn
- DataCamp (free courses)
- YouTube: StatQuest, Krish Naik
- Books: "Python for Data Analysis"

**Projects to Build:**
1. Data analysis of public datasets
2. Predictive model for house prices
3. Image classification model
4. Recommendation system
        """,
        
        "mobile development": """
**Mobile Development Career Path:**

**1. Choose Platform (1 month):**
- iOS (Swift) or Android (Kotlin/Java)
- Cross-platform: React Native or Flutter

**2. Fundamentals (3-4 months):**
- Platform-specific basics
- UI/UX design principles
- App lifecycle

**3. Core Development (4-5 months):**
- Navigation and routing
- State management
- API integration
- Local storage

**4. Advanced Features (3-4 months):**
- Push notifications
- Maps integration
- Camera and media
- Performance optimization

**Free Resources:**
- Official platform documentation
- YouTube: CodeWithChris, The Net Ninja
- Udemy free courses
- GitHub sample projects

**Projects to Build:**
1. Weather app
2. Todo app with offline support
3. Social media app
4. E-commerce app
        """
    }
    
    # Check if question matches any predefined topics
    question_lower = question.lower()
    for topic, response in career_responses.items():
        if topic in question_lower:
            return response
    
    # Generic response
    return f"""
I understand you're asking about: "{question}"

Here's some general career guidance for technology professionals:

**General Technology Career Path:**

**1. Foundation (2-3 months):**
- Programming fundamentals
- Problem-solving skills
- Version control (Git)
- Command line basics

**2. Specialization (3-6 months):**
- Choose your focus area
- Learn relevant technologies
- Build small projects
- Join communities

**3. Advanced Skills (3-6 months):**
- Framework expertise
- Testing and debugging
- Performance optimization
- Security best practices

**4. Professional Development:**
- Build portfolio
- Contribute to open source
- Network with professionals
- Stay updated with trends

**Free Learning Resources:**
- freeCodeCamp.org
- The Odin Project
- MDN Web Docs
- YouTube educational channels
- GitHub (for projects and collaboration)

**Recommended Next Steps:**
1. Identify your specific interest area
2. Start with fundamentals
3. Build projects consistently
4. Join online communities
5. Create a learning schedule

Would you like more specific guidance for a particular technology or career path?
        """

# ---------------- Free Career Data APIs ----------------
def get_job_market_data(technology):
    """Get job market data using free APIs"""
    try:
        # GitHub Jobs API
        params = {
            "description": technology,
            "full_time": "true",
            "location": "remote"
        }
        
        response = requests.get(github_jobs_url, params=params, timeout=10)
        if response.status_code == 200:
            jobs = response.json()
            return {
                "job_count": len(jobs),
                "sample_jobs": jobs[:5] if len(jobs) > 5 else jobs,
                "source": "GitHub Jobs"
            }
    except Exception as e:
        print(f"Job market data error: {str(e)}")
    
    return {"job_count": 0, "sample_jobs": [], "source": "No data available"}

def get_learning_resources(technology):
    """Get learning resources using free APIs"""
    resources = []
    
    try:
        # YouTube Data API for tutorials
        if youtube_api_key:
            params = {
                "part": "snippet",
                "q": f"{technology} tutorial",
                "type": "video",
                "maxResults": 5,
                "order": "relevance",
                "key": youtube_api_key
            }
            
            response = requests.get(f"{youtube_base_url}/search", params=params, timeout=10)
            if response.status_code == 200:
                videos = response.json().get("items", [])
                for video in videos:
                    resources.append({
                        "title": video["snippet"]["title"],
                        "url": f"https://www.youtube.com/watch?v={video['id']['videoId']}",
                        "type": "video",
                        "source": "YouTube"
                    })
    except Exception as e:
        print(f"Learning resources error: {str(e)}")
    
    # Add static free resources
    static_resources = {
        "javascript": [
            {"title": "JavaScript Tutorial - MDN", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "type": "documentation", "source": "MDN"},
            {"title": "JavaScript Course - freeCodeCamp", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "type": "course", "source": "freeCodeCamp"}
        ],
        "python": [
            {"title": "Python Tutorial - Official", "url": "https://docs.python.org/3/tutorial/", "type": "documentation", "source": "Python.org"},
            {"title": "Python Course - freeCodeCamp", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "type": "course", "source": "freeCodeCamp"}
        ],
        "react": [
            {"title": "React Tutorial - Official", "url": "https://react.dev/learn", "type": "documentation", "source": "React"},
            {"title": "React Course - freeCodeCamp", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/", "type": "course", "source": "freeCodeCamp"}
        ]
    }
    
    for tech, tech_resources in static_resources.items():
        if tech in technology.lower():
            resources.extend(tech_resources)
    
    return resources[:10]  # Limit to 10 resources

# ---------------- Routes ----------------
@app.route("/ask_ai", methods=["POST"])
def ask_ai():
    data = request.get_json(force=True)
    engine = data.get("engine", "fallback")
    question = data.get("question")
    uid = data.get("uid", "anonymous")
    session = SessionLocal()

    try:
        # Get AI response using free services
        answer_text = get_free_ai_response(question, engine)
        
        # Add job market data if relevant
        if any(tech in question.lower() for tech in ["javascript", "python", "react", "node", "java", "c++"]):
            job_data = get_job_market_data(question)
            if job_data["job_count"] > 0:
                answer_text += f"\n\n**Job Market Data:**\nCurrently {job_data['job_count']} remote jobs available for this technology (via {job_data['source']})."
        
        # Add learning resources
        learning_resources = get_learning_resources(question)
        if learning_resources:
            answer_text += "\n\n**Free Learning Resources:**\n"
            for resource in learning_resources[:5]:
                answer_text += f"- [{resource['title']}]({resource['url']}) ({resource['source']})\n"

        # Store chat
        chat = ChatHistory(uid=uid, question=question, answer=answer_text, engine=engine)
        session.add(chat)
        session.commit()

    except Exception as e:
        session.close()
        return jsonify({"error": f"AI Error: {str(e)}"}), 500

    session.close()
    return jsonify({"answer": answer_text})

# Keep existing routes for chat history, roadmap, etc.
@app.route("/get_chat_history", methods=["GET"])
def get_chat_history():
    uid = request.args.get("uid")
    if not uid:
        return jsonify({"error": "UID is required"}), 400
    
    session = SessionLocal()
    try:
        chats = session.query(ChatHistory).filter(ChatHistory.uid == uid).order_by(ChatHistory.timestamp.asc()).all()
        
        chat_history = []
        for chat in chats:
            chat_history.append({
                "id": chat.id,
                "type": "user",
                "content": chat.question,
                "timestamp": chat.timestamp.isoformat(),
                "engine": chat.engine
            })
            chat_history.append({
                "id": chat.id + 1000,
                "type": "ai",
                "content": chat.answer,
                "timestamp": chat.timestamp.isoformat(),
                "engine": chat.engine
            })
        
        return jsonify({"chat_history": chat_history})
    except Exception as e:
        session.close()
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        session.close()

@app.route("/clear_chat_history", methods=["DELETE"])
def clear_chat_history():
    uid = request.args.get("uid")
    if not uid:
        return jsonify({"error": "UID is required"}), 400
    
    session = SessionLocal()
    try:
        session.query(ChatHistory).filter(ChatHistory.uid == uid).delete()
        session.commit()
        return jsonify({"message": "Chat history cleared successfully"})
    except Exception as e:
        session.rollback()
        session.close()
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        session.close()

@app.route("/generate_roadmap", methods=["POST"])
def generate_roadmap():
    data = request.get_json(force=True)
    uid = data.get("uid")
    skills_to_learn = data.get("skills_to_learn", [])
    planning_days = data.get("planning_days", 30)
    if not uid or not skills_to_learn:
        return jsonify({"error": "Missing uid or skills_to_learn"}), 400

    roadmap_steps = [f"Learn {skill}" for skill in skills_to_learn]
    img_path = generate_roadmap_image(roadmap_steps, uid)

    session = SessionLocal()
    progress = RoadmapProgress(uid=uid, roadmap_step=";".join(roadmap_steps), completion_percentage=0)
    session.add(progress)
    session.commit()
    session.close()

    return jsonify({"roadmap_steps": roadmap_steps, "roadmap_image": img_path})

@app.route("/suggest_event", methods=["POST"])
def suggest_event():
    data = request.get_json(force=True)
    uid = data.get("uid")
    domain = data.get("domain")
    completion = data.get("completion_percentage", 0)
    if not uid or not domain:
        return jsonify({"error": "Missing uid or domain"}), 400
    events = get_events_for_user(domain, completion)
    return jsonify({"events": events})

@app.route("/suggest_project", methods=["POST"])
def suggest_project():
    data = request.get_json(force=True)
    uid = data.get("uid")
    domain = data.get("domain")
    completion = data.get("completion_percentage", 0)
    if not uid or not domain:
        return jsonify({"error": "Missing uid or domain"}), 400
    projects = get_projects_for_user(domain, completion)
    return jsonify({"projects": projects})

@app.route("/send_notification", methods=["POST"])
def send_notification():
    data = request.get_json(force=True)
    email = data.get("email")
    subject = data.get("subject", "Career Roadmap Update")
    message = data.get("message", "")
    if not email:
        return jsonify({"error": "Missing email"}), 400
    success = send_email(email, subject, message)
    return jsonify({"success": success})

# ---------------- Run Flask ----------------
if __name__ == "__main__":
    print("Free AI service running at http://localhost:5001")
    print("Using only no-cost APIs and services")
    app.run(host="0.0.0.0", port=5001, debug=True)


