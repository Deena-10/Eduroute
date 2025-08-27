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
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
else:
    gemini_model = None

groq_api_key = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

hf_api_key = os.environ.get("HF_API_KEY")
hf_headers = {"Authorization": f"Bearer {hf_api_key}"} if hf_api_key else None

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
        if engine == "gemini" and gemini_model:
            response = gemini_model.generate_content(question)
            answer_text = response.text
        elif engine == "groq" and groq_client:
            response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": question}],
            )
            answer_text = response.choices[0].message.content
        elif engine == "huggingface" and hf_headers:
            payload = {"inputs": question}
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
            return jsonify({"error": f"Engine {engine} not configured"}), 500

        # ---------------- Store Chat ----------------
        chat = ChatHistory(uid=uid, question=question, answer=answer_text, engine=engine)
        session.add(chat)
        session.commit()

    except Exception as e:
        session.close()
        return jsonify({"error": f"AI Error: {str(e)}"}), 500

    session.close()
    return jsonify({"answer": answer_text})

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
