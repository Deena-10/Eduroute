import hashlib
from flask import Flask, request, jsonify
import random

app = Flask(__name__)

LEVELS = ["beginner", "intermediate", "advanced"]

# Interview-style MCQ templates with context and reasoning
_QUESTION_TEMPLATES = [
    (
        "Which of the following best demonstrates a core concept from \"{chapter}\" in {domain}?",
        "Applying {domain} principles appropriately in a real-world scenario",
        [
            "Memorizing definitions without application",
            "Copying solutions blindly",
            "Ignoring {domain} fundamentals",
        ],
    ),
    (
        "In an interview, if asked about \"{chapter}\" in {domain}, what approach is most effective?",
        "Explaining the rationale and providing a practical example",
        [
            "Reciting textbook definitions",
            "Avoiding the question",
            "Giving unrelated examples",
        ],
    ),
    (
        "What would be the correct strategy to solve a problem using concepts from \"{chapter}\" in {domain}?",
        "Break down the problem and apply {domain} techniques step by step",
        [
            "Guessing the answer without reasoning",
            "Applying irrelevant methods",
            "Deferring the solution to someone else",
        ],
    ),
    (
        "After mastering \"{chapter}\" in {domain}, which of these is an appropriate skill to showcase in interviews?",
        "Ability to design, debug, and explain solutions using {domain} principles",
        [
            "Listing random functions without context",
            "Ignoring practical applications",
            "Memorizing code snippets without understanding",
        ],
    ),
    (
        "Why is \"{chapter}\" crucial at the {level} stage in {domain} learning?",
        "It builds conceptual depth needed for solving complex problems",
        [
            "It is optional and can be skipped",
            "It is only theoretical with no impact",
            "It duplicates other chapters unnecessarily",
        ],
    ),
]

def generate_mcqs(unit_title, domain, level, unit_number, repeat_chance=0.1):
    """
    Generate 5 interview-style MCQs per chapter.
    Deterministic shuffling ensures consistent correctIndex.
    repeat_chance: fraction of questions that repeat from previous unit
    """
    mcqs = []
    for i in range(5):
        tmpl = _QUESTION_TEMPLATES[i]

        # Decide if we reuse a previous question (~10%)
        if random.random() < repeat_chance and unit_number > 1:
            prev_unit_num = unit_number - 1
            seed_unit = prev_unit_num
        else:
            seed_unit = unit_number

        question = tmpl[0].format(chapter=unit_title, domain=domain, level=level)
        correct = tmpl[1].format(chapter=unit_title, domain=domain, level=level)
        distractors = [d.format(chapter=unit_title, domain=domain, level=level) for d in tmpl[2]]

        # Deterministic shuffle of distractors
        seed = hashlib.md5(f"{domain}:{seed_unit}:{i}".encode()).hexdigest()
        random.seed(int(seed[:8], 16))
        random.shuffle(distractors)

        options = [correct] + distractors[:3]

        # Deterministic shuffle of all options
        order_seed = hashlib.md5(f"{domain}:{seed_unit}:{i}:order".encode()).hexdigest()
        random.seed(int(order_seed[:8], 16))
        indices = list(range(4))
        random.shuffle(indices)
        shuffled = [options[idx] for idx in indices]
        correct_index = shuffled.index(correct)

        mcqs.append({
            "question": question,
            "options": shuffled,
            "correctIndex": correct_index,
        })
    return mcqs

def build_unit(unit_number, domain):
    """Build a single unit with 5 interview-style MCQs."""
    if unit_number <= 3:
        level = LEVELS[0]
    elif unit_number <= 6:
        level = LEVELS[1]
    else:
        level = LEVELS[2]

    unit_title = f"{level.capitalize()} concepts of {domain} — Unit {unit_number}"
    tasks = [{"task_id": f"u{unit_number}_t{i}", "task_name": f"Task {i} in {unit_title}"} for i in range(1, 5)]
    mcqs = generate_mcqs(unit_title, domain, level, unit_number)
    return {"unit_number": unit_number, "title": unit_title, "level": level, "tasks": tasks, "mcqs": mcqs}

# Generate roadmap payload
def build_roadmap_payload(domain):
    """Build roadmap payload with initial 3 units."""
    units = [build_unit(i, domain) for i in range(1, 4)]
    return {
        "roadmap": {"domain": domain, "units": units},
        "ui_metadata": {
            "node_config": [
                {"unit": 1, "offset": "left", "color": "#4024f6"},
                {"unit": 2, "offset": "right", "color": "#021710"},
                {"unit": 3, "offset": "left", "color": "#ffffff"},
            ]
        },
        "gamification": {"daily_streak_goal_xp": 50},
    }

# API Endpoints
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ai-service"}), 200

@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    data = request.get_json() or {}
    domain = (data.get("domain") or "General").strip()
    payload = build_roadmap_payload(domain)
    return jsonify(payload), 200

@app.route("/generate-next-chapter", methods=["POST"])
def generate_next_chapter():
    """
    Generate the next 3 units dynamically.
    Returns {"units": [unit4, unit5, unit6]}
    """
    data = request.get_json() or {}
    domain = (data.get("domain") or "General").strip()
    last_unit_number = data.get("last_unit_number", 3)

    new_units = []
    for i in range(1, 4):  # next 3 chapters
        next_num = last_unit_number + i
        unit = build_unit(next_num, domain)
        new_units.append(unit)

    return jsonify({"units": new_units}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)