# backend/service/application.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# ---------------- Gemini Setup ----------------
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
else:
    gemini_model = None
    print("⚠️ GEMINI_API_KEY not set, Gemini won't work.")

# ---------------- Groq Setup ----------------
groq_api_key = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None
if not groq_api_key:
    print("⚠️ GROQ_API_KEY not set, Groq won't work.")

# ---------------- Hugging Face Setup ----------------
hf_api_key = os.environ.get("HF_API_KEY")
hf_headers = {"Authorization": f"Bearer {hf_api_key}"} if hf_api_key else None
if not hf_api_key:
    print("⚠️ HF_API_KEY not set, Hugging Face won't work.")

# ---------------- Main Route ----------------
@app.route("/ask_ai", methods=["POST"])
def ask_ai():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), 400

        engine = data.get("engine")
        question = data.get("question")

        if not engine or not question:
            return jsonify({"error": "Both 'engine' and 'question' are required"}), 400

        # ---------------- Gemini ----------------
        if engine == "gemini":
            if not gemini_model:
                return jsonify({"error": "Gemini not configured"}), 500
            response = gemini_model.generate_content(question)
            return jsonify({"answer": response.text}), 200

        # ---------------- Groq ----------------
        elif engine == "groq":
            if not groq_client:
                return jsonify({"error": "Groq not configured"}), 500
            response = groq_client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": question}],
            )
            return jsonify({"answer": response.choices[0].message.content}), 200

        # ---------------- Hugging Face ----------------
        elif engine == "huggingface":
            if not hf_headers:
                return jsonify({"error": "Hugging Face not configured"}), 500
            payload = {"inputs": question}
            hf_url = "https://api-inference.huggingface.co/models/bigscience/bloom-560m"
            try:
                response = requests.post(hf_url, headers=hf_headers, json=payload, timeout=60)
                response.raise_for_status()
                result = response.json()

                # Handle various response formats safely
                if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
                    return jsonify({"answer": result[0]["generated_text"]}), 200
                elif isinstance(result, dict) and "error" in result:
                    return jsonify({"error": f"Hugging Face API error: {result['error']}"}), 500
                else:
                    return jsonify({"answer": str(result)}), 200

            except requests.exceptions.RequestException as req_err:
                return jsonify({"error": f"Hugging Face request failed: {req_err}"}), 500

        else:
            return jsonify({"error": f"Unsupported engine '{engine}'"}), 400

    except Exception as e:
        print(f"Unexpected server error: {e}")
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500

# ---------------- Run Flask ----------------
if __name__ == "__main__":
    print("Flask server running at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
