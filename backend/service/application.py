# application.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv
from db import SessionLocal, User, ChatHistory, RoadmapProgress
from roadmap import generate_roadmap_image
from events import get_events_for_user
from projects import get_projects_for_user
from notifications import send_email

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# ---------------- AI Setup ----------------
gemini_api_key = os.environ.get("GEMINI_API_KEY")
try:
    if gemini_api_key:
        genai.configure(api_key=gemini_api_key)
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        print("✅ Gemini AI configured successfully")
    else:
        gemini_model = None
        print("⚠️  Gemini API key not found")
except Exception as e:
    print(f"⚠️  Gemini client initialization failed: {e}")
    gemini_model = None

groq_api_key = os.environ.get("GROQ_API_KEY")
try:
    groq_client = Groq(api_key=groq_api_key) if groq_api_key else None
except Exception as e:
    print(f"⚠️  Groq client initialization failed: {e}")
    groq_client = None

hf_api_key = os.environ.get("HF_API_KEY")
try:
    hf_headers = {"Authorization": f"Bearer {hf_api_key}"} if hf_api_key else None
    if hf_api_key:
        print("✅ Hugging Face API configured successfully")
    else:
        print("⚠️  Hugging Face API key not found")
except Exception as e:
    print(f"⚠️  Hugging Face client initialization failed: {e}")
    hf_headers = None

# ---------------- Startup Message ----------------
print("\n🚀 Flask AI Service Starting...")
print("=" * 50)
print(f"✅ Gemini AI: {'Available' if gemini_model else 'Not Available'}")
print(f"✅ Groq AI: {'Available' if groq_client else 'Not Available'}")
print(f"✅ Hugging Face: {'Available' if hf_headers else 'Not Available'}")
print("=" * 50)

# ---------------- Routes ----------------
@app.route("/ask_ai", methods=["POST"])
def ask_ai():
    data = request.get_json(force=True)
    engine = data.get("engine")
    question = data.get("question")
    uid = data.get("uid", "anonymous")
    session = SessionLocal()

    # ---------------- AI Response ----------------
    answer_text = ""
    try:
        # Check if it's a simple greeting
        question_lower = question.lower().strip()
        if question_lower in ['hi', 'hello', 'hey', 'hi there', 'hello there']:
            career_prompt = f"""You are a friendly career advisor for tech professionals. The user just said: "{question}"

            Give a warm, brief response (2-3 sentences max) welcoming them and asking what they'd like help with regarding their tech career. Be conversational and encouraging.
            
            Response:"""
        else:
            # Enhanced prompt for career guidance
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
        
        if engine == "gemini" and gemini_model:
            response = gemini_model.generate_content(career_prompt)
            answer_text = response.text
        elif engine == "groq" and groq_client:
            if question_lower in ['hi', 'hello', 'hey', 'hi there', 'hello there']:
                system_content = "You are a friendly career advisor for tech professionals. Give warm, brief responses (2-3 sentences max) for greetings. Be conversational and encouraging."
            else:
                system_content = "You are a professional career advisor specializing in technology and software development. Provide detailed, practical, and actionable career guidance."
            
            response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": question}
                ],
            )
            answer_text = response.choices[0].message.content
        elif engine == "huggingface" and hf_headers:
            payload = {"inputs": career_prompt}
            r = requests.post(
                "https://api-inference.huggingface.co/models/bigscience/bloom-560m",
                headers=hf_headers,
                json=payload,
                timeout=60
            )
            r.raise_for_status()
            result = r.json()
            if isinstance(result, list) and "generated_text" in result[0]:
                answer_text = result[0]["generated_text"]
            else:
                answer_text = str(result)
        else:
            # Fallback response when AI engines are not configured
            if question_lower in ['hi', 'hello', 'hey', 'hi there', 'hello there']:
                answer_text = f"""Hi there! 👋 I'm your career roadmap assistant. I'm here to help you navigate your tech career journey. What would you like to know about? Are you looking to start a career in tech, switch fields, or advance in your current role?"""
            else:
                answer_text = f"""I understand you're asking about: "{question}"

Since the AI service is not fully configured, here's some general career guidance:

**For Technology Careers:**
- Start with fundamentals (programming basics, problem-solving)
- Choose a specialization (web development, data science, mobile apps, etc.)
- Build projects to showcase your skills
- Network with professionals in your field
- Stay updated with industry trends

**Recommended Learning Path:**
1. Learn core programming concepts
2. Pick a technology stack (e.g., MERN for web development)
3. Build small projects
4. Contribute to open source
5. Create a portfolio
6. Apply for internships/jobs

**Resources:**
- FreeCodeCamp, The Odin Project, Udemy
- YouTube channels: Traversy Media, The Net Ninja
- Books: "You Don't Know JS", "Clean Code"
- Practice platforms: LeetCode, HackerRank

Would you like me to help you create a more specific roadmap once the AI service is fully configured?"""

        # ---------------- Store Chat ----------------
        chat = ChatHistory(uid=uid, question=question, answer=answer_text, engine=engine)
        session.add(chat)
        session.commit()

    except Exception as e:
        session.close()
        return jsonify({"error": f"AI Error: {str(e)}"}), 500

    session.close()
    return jsonify({"answer": answer_text})

@app.route("/get_chat_history", methods=["GET"])
def get_chat_history():
    uid = request.args.get("uid")
    if not uid:
        return jsonify({"error": "UID is required"}), 400
    
    session = SessionLocal()
    try:
        # Get chat history for the user
        chats = session.query(ChatHistory).filter(ChatHistory.uid == uid).order_by(ChatHistory.timestamp.asc()).all()
        
        # Convert to list of dictionaries
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
                "id": chat.id + 1000,  # Different ID for AI response
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
        # Delete chat history for the user
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

    # Store progress
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
    print("Flask AI service running at http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
