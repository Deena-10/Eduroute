# application.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
import traceback
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv
from db_postgres import User, ChatHistory, RoadmapProgress, Event, Project, CareerOnboardingState
from roadmap import generate_roadmap_image
from events import get_events_for_user
from projects import get_projects_for_user
from notifications import send_email

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# ---------------- AI Setup ----------------
gemini_api_key = os.environ.get("GEMINI_API_KEY")
gemini_model_name = os.environ.get("GEMINI_MODEL", "models/gemini-2.5-flash")
try:
    if gemini_api_key:
        genai.configure(api_key=gemini_api_key)
        gemini_model = genai.GenerativeModel(gemini_model_name)
        print("[SUCCESS] Gemini AI configured successfully")
    else:
        gemini_model = None
        print("[WARNING] Gemini API key not found")
except Exception as e:
    print(f"[WARNING] Gemini client initialization failed: {e}")
    gemini_model = None

# ---------------- Global Error Handlers ----------------
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found", "details": str(error)}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request", "details": str(error)}), 400

@app.errorhandler(Exception)
def unhandled_exception(error):
    return jsonify({
        "error": "Unhandled server error",
        "details": str(error),
    }), 500

# ---------------- Routes ----------------
@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint to verify AI service is running"""
    return jsonify({
        "status": "AI service running",
        "service": "Flask AI Service",
        "version": "1.0.0",
        "gemini": {
            "initialized": bool(gemini_model),
            "model": gemini_model_name,
            "apiKeyPresent": bool(gemini_api_key),
        },
        "endpoints": [
            "GET / - Health check",
            "POST /ask_ai - AI chat endpoint",
            "GET /gemini/models - List Gemini models visible to this API key",
            "GET /get_chat_history - Get user chat history",
            "DELETE /clear_chat_history - Clear user chat history",
            "POST /career_chat - Career chat for roadmap generation",
            "POST /generate_career_roadmap_direct - Direct roadmap generation",
            "GET /career_onboarding_state - Get career onboarding state"
        ]
    })

@app.route("/gemini/models", methods=["GET"])
def gemini_list_models():
    if not gemini_api_key:
        return jsonify({"error": "GEMINI_API_KEY not configured"}), 500
    try:
        models = []
        for m in genai.list_models():
            models.append({
                "name": getattr(m, "name", None),
                "supported_generation_methods": getattr(m, "supported_generation_methods", None),
            })
        return jsonify({"models": models})
    except Exception as e:
        return jsonify({
            "error": "Failed to list models",
            "details": str(e),
            "trace": traceback.format_exc(),
        }), 500

@app.route("/ask_ai", methods=["POST"])
def ask_ai():
    data = request.get_json(force=True)
    engine = data.get("engine")
    question = data.get("question")
    uid = data.get("uid", "anonymous")

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
            
            Please provide a clean, well-structured response with the following format:
            
            **Overview**
            Brief introduction to the topic
            
            **Key Steps**
            1. First important step
            2. Second important step
            3. Third important step
            
            **Technologies & Skills**
            • Technology 1 - brief description
            • Technology 2 - brief description
            • Technology 3 - brief description
            
            **Timeline & Milestones**
            • Month 1-3: Focus area
            • Month 4-6: Next focus area
            • Month 7-12: Advanced topics
            
            **Learning Resources**
            • Course/Book 1 - brief description
            • Course/Book 2 - brief description
            • Platform/Resource 3 - brief description
            
            **Industry Insights**
            Current trends and market demand information
            
            Keep each section concise but informative. Use bullet points and numbered lists for clarity. Make the response easy to read and well-organized.
            
            Response:"""
        
        if engine == "gemini" and gemini_model:
            response = gemini_model.generate_content(career_prompt)
            answer_text = response.text
        elif engine == "groq" and groq_client:
            if question_lower in ['hi', 'hello', 'hey', 'hi there', 'hello there']:
                system_content = "You are a friendly career advisor for tech professionals. Give warm, brief responses (2-3 sentences max) for greetings. Be conversational and encouraging."
            else:
                system_content = """You are a professional career advisor specializing in technology and software development. 
                
                Provide clean, well-structured responses with:
                - **Overview** section
                - **Key Steps** (numbered list)
                - **Technologies & Skills** (bullet points)
                - **Timeline & Milestones** (bullet points)
                - **Learning Resources** (bullet points)
                - **Industry Insights** section
                
                Use proper formatting with **bold headers**, numbered lists (1. 2. 3.), and bullet points (•). Keep each section concise but informative. Make responses easy to read and well-organized."""
            
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
        elif engine == "openai" and openai_headers:
            if question_lower in ['hi', 'hello', 'hey', 'hi there', 'hello there']:
                system_content = "You are a friendly career advisor for tech professionals. Give warm, brief responses (2-3 sentences max) for greetings. Be conversational and encouraging."
            else:
                system_content = """You are a professional career advisor specializing in technology and software development.
                Provide clean, well-structured responses with:
                - **Overview** section
                - **Key Steps** (numbered list)
                - **Technologies & Skills** (bullet points)
                - **Timeline & Milestones** (bullet points)
                - **Learning Resources** (bullet points)
                - **Industry Insights** section
                Use proper formatting with **bold headers**, numbered lists, and bullet points. Keep each section concise but informative."""
            r = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=openai_headers,
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_content},
                        {"role": "user", "content": question},
                    ],
                },
                timeout=60,
            )
            r.raise_for_status()
            result = r.json()
            answer_text = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        else:
            # Fallback response when AI engines are not configured
            if question_lower in ['hi', 'hello', 'hey', 'hi there', 'hello there']:
                answer_text = f"""Hi there! I'm your career roadmap assistant. I'm here to help you navigate your tech career journey. What would you like to know about? Are you looking to start a career in tech, switch fields, or advance in your current role?"""
            else:
                answer_text = f"""**Overview**
I understand you're asking about: "{question}"

**Current Status**
• AI services are temporarily unavailable
• Please try again in a few moments

**General Career Guidance**
• Start with fundamentals (programming basics, problem-solving)
• Choose a specialization (web development, data science, mobile apps, etc.)
• Build projects to showcase your skills
• Network with professionals in your field
• Stay updated with industry trends

**Recommended Learning Path**
1. Learn core programming concepts
2. Pick a technology stack (e.g., MERN for web development)
3. Build small projects
4. Contribute to open source
5. Create a portfolio
6. Apply for internships/jobs

**Learning Resources**
• FreeCodeCamp, The Odin Project, Udemy
• YouTube channels: Traversy Media, The Net Ninja
• Books: "You Don't Know JS", "Clean Code"
• Practice platforms: LeetCode, HackerRank

**Next Steps**
1. Refresh the page and try again
2. Check your internet connection
3. Contact support if problems continue"""

        # ---------------- Store Chat ----------------
        ChatHistory.create(uid=uid, question=question, answer=answer_text, engine=engine)

    except Exception as e:
        return jsonify({
            "error": "AI Error",
            "details": str(e),
            "engine": engine,
            "gemini": {
                "initialized": bool(gemini_model),
                "model": gemini_model_name,
            },
            "trace": traceback.format_exc(),
        }), 500

    return jsonify({"answer": answer_text})

@app.route("/get_chat_history", methods=["GET"])
def get_chat_history():
    uid = request.args.get("uid")
    if not uid:
        return jsonify({"error": "UID is required"}), 400
    
    try:
        # Get chat history for the user
        chats = ChatHistory.get_by_uid(uid)
        
        # Convert to list of dictionaries
        chat_history = []
        for chat in chats:
            chat_history.append({
                "id": chat['id'],
                "type": "user",
                "content": chat['question'],
                "timestamp": chat['timestamp'].isoformat() if chat['timestamp'] else None,
                "engine": chat['engine']
            })
            chat_history.append({
                "id": chat['id'] + 1000,  # Different ID for AI response
                "type": "ai",
                "content": chat['answer'],
                "timestamp": chat['timestamp'].isoformat() if chat['timestamp'] else None,
                "engine": chat['engine']
            })
        
        return jsonify({"chat_history": chat_history})
    except Exception as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500

@app.route("/clear_chat_history", methods=["DELETE"])
def clear_chat_history():
    uid = request.args.get("uid")
    if not uid:
        return jsonify({"error": "UID is required"}), 400
    
    try:
        # Delete chat history for the user
        ChatHistory.clear_by_uid(uid)
        return jsonify({"message": "Chat history cleared successfully"})
    except Exception as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500

def _parse_domain_from_message(message):
    """Use AI to extract primary interest/domain from user message. Returns a short label."""
    if not gemini_model:
        return (message.strip()[:100] or "General Tech") if message else "General Tech"
    prompt = f"""From this user message about their career interest, extract ONE primary domain or interest in 2-6 words (e.g. "Python", "Web Development", "Data Science", "JavaScript", "Mobile Development"). Reply with ONLY that short label, nothing else. Message: "{message}" """
    try:
        r = gemini_model.generate_content(prompt)
        return (r.text.strip().strip('"') or message[:50])[:100]
    except Exception:
        return (message.strip() or "General Tech")[:100]


def _parse_proficiency_from_message(message):
    """Extract Beginner or Intermediate from message."""
    msg = (message or "").lower().strip()
    if "intermediate" in msg or "mid" in msg:
        return "Intermediate"
    return "Beginner"


def _parse_status_from_message(message):
    """Extract School student / College student / Working professional."""
    msg = (message or "").lower().strip()
    if "work" in msg or "professional" in msg or "job" in msg or "employed" in msg:
        return "Working professional"
    if "college" in msg or "university" in msg or "uni " in msg or "undergrad" in msg:
        return "College student"
    return "School student"


def _clean_json_response(text):
    """Clean markdown code fences from AI response."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines[-1].startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def _generate_full_roadmap_with_ai(domain, proficiency_level, current_status, professional_goal="job-ready"):
    """Generate a professional-level roadmap with robust JSON validation."""
    prompt = f"""You are an AI learning-path generator...""" # (Keeping original prompt content conceptually)

    if not gemini_model:
        raise RuntimeError("AI model not configured.")

    for attempt in range(2):
        try:
            response = gemini_model.generate_content(prompt)
            text = _clean_json_response(response.text)
            parsed = json.loads(text)
            
            # Validation
            if not isinstance(parsed, dict) or "phases" not in parsed:
                raise ValueError("Incomplete roadmap structure")
            
            return parsed
        except Exception as e:
            if attempt == 1:
                print(f"[ERROR] Roadmap generation failed twice: {e}")
                return _fallback_roadmap_json(domain, proficiency_level, current_status)
            print(f"[RETRY] Roadmap generation failed: {e}. Retrying...")


def _make_fallback_mcqs(n, task_id):
    """Generate n placeholder MCQs for a task."""
    return [
        {
            "id": "%s-q%d" % (task_id, qi + 1),
            "question": "What best describes the core concept in this topic? (Question %d)" % (qi + 1),
            "options": ["Definition A", "Definition B", "Definition C", "Definition D"],
            "correctIndex": qi % 4,
        }
        for qi in range(n)
    ]


def _fallback_roadmap_json(domain, proficiency_level, current_status):
    """Structured fallback roadmap when AI is unavailable. Each task has 13-15 MCQs."""
    tasks_1 = []
    for i in range(1, 16):
        title = (
            "Task 1: Core terminology and its role" if i == 1 else
            "Task 2: Relationship between key concepts" if i == 2 else
            "Task 3: Common patterns and when to apply them" if i == 3 else
            "Task 4: Execution flow for a simple scenario" if i == 4 else
            "Task 5: Compare two fundamental approaches" if i == 5 else
            "Task 6: Apply the concept to a minimal example" if i == 6 else
            "Task 7: Correct vs incorrect usage" if i == 7 else
            "Task 8: Set up a basic environment" if i == 8 else
            "Task 9: How errors are reported and handled" if i == 9 else
            "Task 10: Best practices for the topic" if i == 10 else
            "Task 11: Explain the concept in your own words" if i == 11 else
            "Task 12: Identify one real-world use case" if i == 12 else
            "Task 13: Verify understanding recap" if i == 13 else
            "Task 14: Recall the main takeaway" if i == 14 else
            "Week 1 recap: foundations and core terminology"
        )
        task_type = "recap" if i == 15 else ("concept" if i <= 10 else "question")
        tid = "t-1-1-%d" % i
        tasks_1.append({
            "id": tid,
            "title": title,
            "weekNumber": 1,
            "orderInWeek": i,
            "type": task_type,
            "isInterviewCritical": i <= 4,
            "mcqs": _make_fallback_mcqs(14, tid),
        })
    return {
        "domain": domain,
        "proficiencyLevel": proficiency_level,
        "currentStatus": current_status,
        "phases": [
            {
                "id": "phase-1",
                "name": "Foundations",
                "order": 1,
                "topics": [
                    {
                        "id": "topic-1-1",
                        "title": "Core concepts and environment",
                        "order": 1,
                        "interviewPriority": "high",
                        "tasks": tasks_1,
                    }
                ],
            },
            {"id": "phase-2", "name": "Core Concepts", "order": 2, "topics": []},
            {"id": "phase-3", "name": "Advanced Concepts", "order": 3, "topics": []},
            {"id": "phase-4", "name": "Practical Projects", "order": 4, "topics": []},
        ],
        "weeklyRecaps": [
            {
                "weekNumber": 1,
                "importantQuestions": [
                    "Define core terminology and its role",
                    "Explain the relationship between key concepts",
                    "Identify common patterns and when to apply them",
                ],
                "repeatedConcepts": ["Terminology", "Execution flow", "Patterns"],
                "selfAssessmentChecklist": [
                    "Can define key terms without notes",
                    "Can explain one real-world use case",
                    "Can recall the main takeaway for the week",
                ],
            }
        ],
    }


@app.route("/career_chat", methods=["POST"])
def career_chat():
    """Conversational flow: collect domain → proficiency → status, then generate full roadmap."""
    data = request.get_json(force=True)
    uid = data.get("uid", "anonymous")
    message = (data.get("message") or "").strip()
    start = data.get("start", False)

    # Start or get current state
    state = CareerOnboardingState.get_by_uid(uid)
    if start or (not state and ("roadmap" in message.lower() or "career path" in message.lower() or "learning path" in message.lower() or "get started" in message.lower())):
        CareerOnboardingState.create(uid)
        state = CareerOnboardingState.get_by_uid(uid)

    if not state:
        return jsonify({
            "reply": "Hi! When you're ready, say you'd like to create a **career roadmap** and I'll guide you step by step.",
            "state": None,
            "roadmap": None
        })

    step = state.get("step") or "domain"
    reply = ""
    next_step = step

    if step == "done":
        return jsonify({
            "reply": "You've already completed the setup. Your roadmap is on the Roadmap page. If you want a new one, ask your administrator to reset your career onboarding.",
            "state": {"step": "done"},
            "roadmap": None
        })

    if step == "domain":
        if not message and not start:
            reply = "What is your **primary interest or domain**? (e.g., a specific programming language, Web Development, Data Science, Cybersecurity, UI/UX)"
        else:
            domain = _parse_domain_from_message(message) if message else None
            if domain:
                CareerOnboardingState.update(uid, step="proficiency", domain=domain)
                next_step = "proficiency"
                reply = "Got it — we'll focus on **" + domain + "**. What is your **proficiency level**? (Beginner / Intermediate)"
            else:
                reply = "I'd love to tailor your roadmap. What is your **primary interest or domain**? (e.g., Python, Web Development, Data Science)"
    elif step == "proficiency":
        proficiency = _parse_proficiency_from_message(message) if message else "Beginner"
        CareerOnboardingState.update(uid, step="status", proficiency_level=proficiency)
        next_step = "status"
        reply = "Thanks. Are you currently a **School student**, **College student**, or **Working professional**?"
    elif step == "status":
        current_status = _parse_status_from_message(message) if message else "College student"
        CareerOnboardingState.update(uid, step="done", current_status=current_status)
        next_step = "done"
        reply = "Creating your personalized roadmap. One moment..."
        # Generate full roadmap
        roadmap = _generate_full_roadmap_with_ai(
            state.get("domain") or "Tech",
            state.get("proficiency_level") or "Beginner",
            current_status
        )
        return jsonify({
            "reply": "Your **career roadmap** is ready. You can view it on your Roadmap page and work through the tasks step by step. Good luck!",
            "state": {"step": "done", "domain": state.get("domain"), "proficiency_level": state.get("proficiency_level"), "current_status": current_status},
            "roadmap": roadmap
        })

    return jsonify({"reply": reply, "state": {"step": next_step}, "roadmap": None})


@app.route("/generate_career_roadmap_direct", methods=["POST"])
def generate_career_roadmap_direct():
    """Generate full roadmap from domain, proficiency, goal, status in one request (no chat)."""
    data = request.get_json(force=True)
    domain = (data.get("domain") or "").strip() or None
    if not domain:
        return jsonify({"error": "domain is required", "roadmap": None}), 400
    proficiency_level = (data.get("proficiency_level") or "Beginner").strip()
    professional_goal = (data.get("professional_goal") or "job-ready").strip()
    current_status = (data.get("current_status") or "College student").strip()
    if proficiency_level not in ("Beginner", "Intermediate", "Advanced"):
        proficiency_level = "Beginner"
    if professional_goal not in ("job-ready", "enterprise", "product-based"):
        professional_goal = "job-ready"
    if current_status not in ("School student", "College student", "Working professional"):
        current_status = "College student"
    print(f"[ROADMAP] generate_career_roadmap_direct received domain={domain!r}, proficiency={proficiency_level}, goal={professional_goal}, status={current_status}")
    try:
        roadmap = _generate_full_roadmap_with_ai(domain, proficiency_level, current_status, professional_goal)
        if roadmap and isinstance(roadmap.get("domain"), str):
            print(f"[ROADMAP] AI returned roadmap with domain={roadmap['domain']!r}")
        return jsonify({"roadmap": roadmap})

    except Exception as e:
        err_msg = str(e)
        print(f"[ROADMAP] Generation failed for domain={domain!r}: {err_msg}")
        # Always return JSON - never plain text
        return jsonify({
            "error": "AI service error", 
            "details": err_msg,
            "roadmap": None
        }), 503



@app.route("/career_onboarding_state", methods=["GET"])
def career_onboarding_state():
    uid = request.args.get("uid")
    if not uid:
        return jsonify({"error": "uid required"}), 400
    state = CareerOnboardingState.get_by_uid(uid)
    if not state:
        return jsonify({"state": None})
    return jsonify({"state": {"step": state.get("step"), "domain": state.get("domain"), "proficiency_level": state.get("proficiency_level"), "current_status": state.get("current_status")}})


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
    RoadmapProgress.create(uid=uid, roadmap_step=";".join(roadmap_steps), completion_percentage=0)

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

# Validating service reload
if __name__ == "__main__":
    print("Flask AI service running at http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)

