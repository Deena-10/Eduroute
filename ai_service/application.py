import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load env for API keys
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

LEVELS = ["beginner", "intermediate", "advanced"]
MCQS_PER_CHAPTER = 5
MAX_MCQS_PER_CHAPTER = 5

# ========== FALLBACK: Template-based (used only when AI API fails or no keys) ==========
_QUESTION_TEMPLATES = [
    ("Which of the following best demonstrates a core concept from \"{chapter}\" in {domain}?", "Applying {domain} principles appropriately", ["Memorizing only", "Copying blindly", "Ignoring fundamentals"]),
    ("In an interview about \"{chapter}\" in {domain}, what approach is most effective?", "Explaining rationale with practical example", ["Reciting definitions", "Avoiding the question", "Unrelated examples"]),
    ("What strategy solves problems using \"{chapter}\" in {domain}?", "Break down and apply {domain} techniques step by step", ["Guessing", "Irrelevant methods", "Deferring to others"]),
    ("After mastering \"{chapter}\" in {domain}, what skill to showcase?", "Design, debug, and explain using {domain} principles", ["Listing functions", "Ignoring applications", "Memorizing snippets"]),
    ("Why is \"{chapter}\" crucial at {level} in {domain}?", "Builds conceptual depth for complex problems", ["Optional", "Theoretical only", "Duplicates others"]),
]

CHAPTER_TITLE_TEMPLATES = [
    "Getting started with {domain}", "Core foundations of {domain}", "Essential {domain} skills",
    "Building on {domain} basics", "Intermediate {domain} concepts", "Practical {domain} applications",
    "Advanced {domain} techniques", "Mastering {domain} patterns", "Expert-level {domain}",
]

def _shuffle(items, seed_str):
    import hashlib
    perm = list(range(len(items)))
    seed = hashlib.md5(seed_str.encode()).hexdigest()
    for j in range(len(items) - 1, 0, -1):
        idx = int(seed[j * 2 : j * 2 + 2], 16) % (j + 1)
        perm[j], perm[idx] = perm[idx], perm[j]
    return [items[i] for i in perm]

def _fallback_mcqs(unit_number, unit_title, domain, level):
    mcqs = []
    for i in range(min(MCQS_PER_CHAPTER, len(_QUESTION_TEMPLATES))):
        t = _QUESTION_TEMPLATES[i]
        q = t[0].format(chapter=unit_title, domain=domain, level=level)
        correct = t[1].format(chapter=unit_title, domain=domain, level=level)
        dist = [d.format(chapter=unit_title, domain=domain, level=level) for d in t[2]]
        dist = _shuffle(dist, f"{domain}:{unit_number}:{i}:d")
        opts = [correct] + dist[:3]
        opts = _shuffle(opts, f"{domain}:{unit_number}:{i}:o")
        mcqs.append({"question": q, "options": opts, "correctIndex": opts.index(correct)})
    return mcqs

def _get_level(unit_number):
    idx = (unit_number - 1) % 9
    return LEVELS[0] if idx < 3 else LEVELS[1] if idx < 6 else LEVELS[2]

def _fallback_title(unit_number, domain):
    tpl = CHAPTER_TITLE_TEMPLATES[(unit_number - 1) % len(CHAPTER_TITLE_TEMPLATES)].format(domain=domain)
    return f"{tpl} — Chapter {unit_number}"

def _fallback_unit(unit_number, domain):
    level = _get_level(unit_number)
    title = _fallback_title(unit_number, domain)
    tasks = [{"task_id": f"u{unit_number}_t{i}", "task_name": f"Task {i} in {title}"} for i in range(1, 5)]
    mcqs = _fallback_mcqs(unit_number, title, domain, level)
    return {"unit_number": unit_number, "title": title, "level": level, "tasks": tasks, "mcqs": mcqs}

# ========== NORMALIZE: Max 5 MCQs per chapter ==========
def normalize_units_mcqs(units, domain="General"):
    if not units:
        return units
    result, overflow = [], []
    for u in units:
        mcqs = list(u.get("mcqs") or [])
        unit_copy = {**u, "mcqs": overflow + mcqs if overflow else mcqs}
        overflow = []
        if len(unit_copy["mcqs"]) > MAX_MCQS_PER_CHAPTER:
            overflow = unit_copy["mcqs"][MAX_MCQS_PER_CHAPTER:]
            unit_copy["mcqs"] = unit_copy["mcqs"][:MAX_MCQS_PER_CHAPTER]
        result.append(unit_copy)
    while overflow:
        last = result[-1] if result else {}
        n = (last.get("unit_number") or 0) + 1
        take = min(MAX_MCQS_PER_CHAPTER, len(overflow))
        mcqs_for_unit = overflow[:take]
        overflow = overflow[take:]
        result.append({
            "unit_number": n,
            "title": _fallback_title(n, domain),
            "level": _get_level(n),
            "tasks": [{"task_id": f"u{n}_t{j}", "task_name": f"Task {j}"} for j in range(1, 5)],
            "mcqs": mcqs_for_unit,
        })
    return result

# ========== AI-POWERED ROADMAP GENERATION ==========
def _ensure_mcq_format(mcq):
    """Ensure each MCQ has question, options (4 items), correctIndex (0-3)."""
    q = mcq.get("question") or "Question"
    opts = list(mcq.get("options") or [])
    while len(opts) < 4:
        opts.append(f"Option {len(opts) + 1}")
    opts = opts[:4]
    ci = int(mcq.get("correctIndex", 0))
    if ci < 0 or ci >= len(opts):
        ci = 0
    return {"question": q, "options": opts, "correctIndex": ci}

def _ensure_unit_format(unit, domain):
    """Ensure unit has required fields; fix MCQs."""
    u = dict(unit)
    u.setdefault("unit_number", 0)
    u.setdefault("title", f"{domain} — Chapter {u['unit_number']}")
    u.setdefault("level", _get_level(u["unit_number"]))
    tasks = u.get("tasks") or []
    tid = u["unit_number"]
    u["tasks"] = [
        t if isinstance(t, dict) else {"task_id": f"u{tid}_t{i+1}", "task_name": str(t)}
        for i, t in enumerate(tasks[:4])
    ]
    while len(u["tasks"]) < 4:
        u["tasks"].append({"task_id": f"u{tid}_t{len(u['tasks'])+1}", "task_name": f"Task {len(u['tasks'])+1}"})
    mcqs = [m for m in (unit.get("mcqs") or []) if isinstance(m, dict) and m.get("question")]
    u["mcqs"] = [_ensure_mcq_format(m) for m in mcqs[:MAX_MCQS_PER_CHAPTER]]
    return u

def _build_payload_from_ai(ai_result, domain):
    """Convert AI result to full roadmap payload."""
    units = ai_result.get("units") or []
    units = [_ensure_unit_format(u, domain) for u in units]
    units = normalize_units_mcqs(units, domain)
    colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444", "#84CC16"]
    node_config = [{"unit": u["unit_number"], "offset": "left" if (u["unit_number"] - 1) % 2 == 0 else "right", "color": colors[(u["unit_number"] - 1) % len(colors)]} for u in units]
    return {
        "roadmap": {"domain": domain, "units": units},
        "ui_metadata": {"node_config": node_config},
        "gamification": {"daily_streak_goal_xp": 50},
    }

# ========== API Endpoints ==========
@app.route("/health", methods=["GET"])
def health():
    has_key = bool(os.environ.get("HF_TOKEN") or os.environ.get("HF_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("COHERE_API_KEY") or os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("GROQ_API_KEY") or os.environ.get("OPENAI_API_KEY"))
    return jsonify({"status": "ok", "service": "ai-service", "ai_configured": has_key}), 200

@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    """Generate roadmap using AI (Gemini/Groq/OpenAI). Falls back to templates if AI fails."""
    data = request.get_json() or {}
    domain = (data.get("domain") or "General").strip()
    proficiency = data.get("proficiency_level") or ""
    goal = data.get("professional_goal") or ""
    status = data.get("current_status") or ""

    # Try AI first
    from llm_client import generate_roadmap_via_ai
    ai_result = generate_roadmap_via_ai(domain, proficiency, goal, status, start_unit=1, count=8)

    if ai_result and ai_result.get("units"):
        payload = _build_payload_from_ai(ai_result, domain)
        print(f"[AI] Roadmap generated for '{domain}' via LLM")
        return jsonify(payload), 200

    # Fallback: template-based (no API keys or all APIs failed)
    print(f"[AI] Fallback: using templates for '{domain}' (add API keys to .env for AI generation)")
    units = [_fallback_unit(i, domain) for i in range(1, 9)]
    units = normalize_units_mcqs(units, domain)
    colors = ["#3B82F6", "#10B981", "#F59E0B"]
    node_config = [{"unit": u["unit_number"], "offset": "left" if (u["unit_number"] - 1) % 2 == 0 else "right", "color": colors[i]} for i, u in enumerate(units)]
    payload = {
        "roadmap": {"domain": domain, "units": units},
        "ui_metadata": {"node_config": node_config},
        "gamification": {"daily_streak_goal_xp": 50},
    }
    return jsonify(payload), 200

@app.route("/generate-next-chapter", methods=["POST"])
def generate_next_chapter():
    """Generate next 2 chapters using AI. Falls back to templates if AI fails."""
    data = request.get_json() or {}
    domain = (data.get("domain") or "General").strip()
    last_unit = int(data.get("last_unit_number", 0))
    if last_unit < 1:
        last_unit = 0

    from llm_client import generate_next_chapters_via_ai
    ai_result = generate_next_chapters_via_ai(domain, last_unit, count=2)

    if ai_result and ai_result.get("units"):
        units = [_ensure_unit_format(u, domain) for u in ai_result["units"]]
        units = normalize_units_mcqs(units, domain)
    else:
        units = [_fallback_unit(last_unit + i, domain) for i in range(1, 3)]
        units = normalize_units_mcqs(units, domain)

    colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"]
    node_config = [{"unit": u["unit_number"], "offset": "left" if (u["unit_number"] - 1) % 2 == 0 else "right", "color": colors[(u["unit_number"] - 1) % len(colors)]} for u in units]
    return jsonify({"units": units, "ui_metadata": {"node_config": node_config}}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
