#C:\finalyearproject\career-roadmap-app\ai_service\application.py
import os
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "ai-service",
        "mode": "fallback"
    }), 200

@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    try:
        data = request.get_json()
        domain = data.get("domain", "General")
        proficiency = data.get("proficiency_level", "Beginner")
        
        # This returns the structure expected by your Roadmap.jsx useMemo logic
        roadmap_payload = _fallback_roadmap_json(domain, proficiency)
        
        return jsonify(roadmap_payload), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def _fallback_roadmap_json(domain, proficiency):
    # This structure matches Roadmap.jsx line 120-130
    return {
        "roadmap": {
            "domain": domain,
            "units": [
                {
                    "unit_number": 1,
                    "title": f"Fundamentals of {domain}",
                    "tasks": [
                        {"task_id": "u1_t1", "task_name": "Introduction & History"},
                        {"task_id": "u1_t2", "task_name": "Environment Setup"}
                    ]
                },
                {
                    "unit_number": 2,
                    "title": f"Core Concepts in {domain}",
                    "tasks": [
                        {"task_id": "u2_t1", "task_name": "Data Types and Logic"},
                        {"task_id": "u2_t2", "task_name": "Building First Module"}
                    ]
                },
                {
                    "unit_number": 3,
                    "title": "Advanced Application",
                    "tasks": [
                        {"task_id": "u3_t1", "task_name": "Integration Systems"},
                        {"task_id": "u3_t2", "task_name": "Deployment Basics"}
                    ]
                }
            ]
        },
        "ui_metadata": {
            "node_config": [
                { "unit": 1, "offset": "left", "color": "#3B82F6" },
                { "unit": 2, "offset": "right", "color": "#10B981" },
                { "unit": 3, "offset": "left", "color": "#F59E0B" }
            ]
        },
        "gamification": {
            "daily_streak_goal_xp": 50
        }
    }

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)