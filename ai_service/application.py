import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)

LEVELS = ["beginner", "intermediate", "advanced"]

# Interview-style MCQ templates
# Each tuple: (question_pattern, correct_answer_pattern, distractor_patterns)
# Placeholders: {domain}, {level}, {chapter}
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

def deterministic_shuffle(items, seed_str):
    """
    Fisher-Yates shuffle with deterministic seed via hashlib
    """
    perm = list(range(len(items)))
    seed = hashlib.md5(seed_str.encode()).hexdigest()
    for j in range(len(items)-1, 0, -1):
        idx = int(seed[j*2:j*2+2], 16) % (j+1)
        perm[j], perm[idx] = perm[idx], perm[j]
    return [items[i] for i in perm]

# Strict: 4-5 questions per chapter. Use 5 unique questions per unit.
MCQS_PER_CHAPTER = 5
MAX_MCQS_PER_CHAPTER = 5


def normalize_units_mcqs(units, domain="General"):
    """
    Ensure each unit has at most MAX_MCQS_PER_CHAPTER (5) MCQs.
    Excess questions are moved to the next unit. Creates new unit if needed for last unit's excess.
    """
    if not units:
        return units
    result = []
    overflow = []
    for u in units:
        mcqs = list(u.get("mcqs") or [])
        unit_copy = {**u, "mcqs": mcqs}
        # Prepend any overflow from previous unit
        if overflow:
            unit_copy["mcqs"] = overflow + unit_copy["mcqs"]
            overflow = []
        # If this unit has >5, keep first 5, move rest to overflow
        if len(unit_copy["mcqs"]) > MAX_MCQS_PER_CHAPTER:
            overflow = unit_copy["mcqs"][MAX_MCQS_PER_CHAPTER:]
            unit_copy["mcqs"] = unit_copy["mcqs"][:MAX_MCQS_PER_CHAPTER]
        result.append(unit_copy)
    # If overflow remains, create a new unit for it
    if overflow:
        last = result[-1] if result else {}
        new_unit_num = (last.get("unit_number") or 0) + 1
        result.append({
            "unit_number": new_unit_num,
            "title": get_unique_chapter_title(new_unit_num, domain),
            "level": get_level_for_unit(new_unit_num),
            "tasks": [{"task_id": f"u{new_unit_num}_t{j}", "task_name": f"Task {j}"} for j in range(1, 5)],
            "mcqs": overflow,
        })
    return result


def generate_mcqs(unit_number, unit_title, domain, level):
    """
    Generate exactly 4-5 unique MCQs per chapter. STRICT: no repeats from other chapters.
    Each question is unique to this unit (uses unit_number + unit_title in seed).
    """
    mcqs = []
    for i in range(MCQS_PER_CHAPTER):
        tmpl = _QUESTION_TEMPLATES[i]
        # Always use current chapter - no repeat from previous units
        question = tmpl[0].format(chapter=unit_title, domain=domain, level=level)
        correct = tmpl[1].format(chapter=unit_title, domain=domain, level=level)
        distractors = [d.format(chapter=unit_title, domain=domain, level=level) for d in tmpl[2]]

        # Shuffle distractors deterministically (unique per unit)
        distractors = deterministic_shuffle(distractors, f"{domain}:{unit_number}:{i}:distractors")

        options = [correct] + distractors[:3]
        shuffled = deterministic_shuffle(options, f"{domain}:{unit_number}:{i}:options")
        correct_index = shuffled.index(correct)

        mcqs.append({"question": question, "options": shuffled, "correctIndex": correct_index})
    return mcqs

def get_level_for_unit(unit_number):
    """Determine level based on unit number (cycles every 9 units for variety)"""
    idx = (unit_number - 1) % 9
    if idx < 3:
        return LEVELS[0]
    elif idx < 6:
        return LEVELS[1]
    else:
        return LEVELS[2]

# Unique chapter title templates - one per "batch" so headings never repeat
CHAPTER_TITLE_TEMPLATES = [
    "Getting started with {domain}",
    "Core foundations of {domain}",
    "Essential {domain} skills",
    "Building on {domain} basics",
    "Intermediate {domain} concepts",
    "Practical {domain} applications",
    "Advanced {domain} techniques",
    "Mastering {domain} patterns",
    "Expert-level {domain}",
    "Deep dive into {domain}",
    "Production-ready {domain}",
    "Scaling {domain} projects",
    "Optimizing {domain} performance",
    "Architecting {domain} solutions",
    "Enterprise {domain} practices",
]


def get_unique_chapter_title(unit_number, domain):
    """Generate a unique chapter heading for each unit (1, 2, 3... 50... 100... indefinitely)"""
    level = get_level_for_unit(unit_number)
    # Use unit_number to pick template - ensures uniqueness
    template_idx = (unit_number - 1) % len(CHAPTER_TITLE_TEMPLATES)
    base_title = CHAPTER_TITLE_TEMPLATES[template_idx].format(domain=domain)
    # Append unit number so even with same template (after cycling), it's unique
    return f"{base_title} — Chapter {unit_number}"


def build_unit(unit_number, domain):
    """Build a single roadmap unit. Unit numbers: 1, 2, 3, 4, 5... indefinitely."""
    level = get_level_for_unit(unit_number)
    unit_title = get_unique_chapter_title(unit_number, domain)

    # Tasks
    tasks = [{"task_id": f"u{unit_number}_t{i}", "task_name": f"Task {i} in {unit_title}"} for i in range(1, 5)]

    # MCQs
    mcqs = generate_mcqs(unit_number, unit_title, domain, level)

    return {
        "unit_number": unit_number,
        "title": unit_title,
        "level": level,
        "tasks": tasks,
        "mcqs": mcqs
    }

COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444", "#84CC16", "#6366F1"]


def build_node_config(start_unit, count):
    """Generate node config dynamically for any number of units"""
    config = []
    for i in range(start_unit, start_unit + count):
        offset = "left" if (i - 1) % 2 == 0 else "right"
        color = COLORS[(i - 1) % len(COLORS)]
        config.append({"unit": i, "offset": offset, "color": color})
    return config

def build_roadmap_payload(domain, start_unit=1, count=3):
    """Build roadmap payload. Each unit has 4-5 unique MCQs. Normalized to max 5 per unit."""
    units = [build_unit(i, domain) for i in range(start_unit, start_unit + count)]
    units = normalize_units_mcqs(units, domain)
    node_config = build_node_config(start_unit, len(units))
    return {
        "roadmap": {"domain": domain, "units": units},
        "ui_metadata": {"node_config": node_config},
        "gamification": {"daily_streak_goal_xp": 50},
    }

# ========== API Endpoints ==========

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ai-service"}), 200

@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    """
    Generate initial roadmap for a domain (3 units by default)
    """
    data = request.get_json() or {}
    domain = (data.get("domain") or "General").strip()
    payload = build_roadmap_payload(domain, start_unit=1, count=3)
    return jsonify(payload), 200

@app.route("/generate-next-chapter", methods=["POST"])
def generate_next_chapter():
    """
    STRICT: When one chapter is finished, generate the next TWO chapters only.
    Each chapter has 4-5 unique questions (no repeats).
    Expects: {"domain": "Python", "last_unit_number": 3}
    Returns: {"units": [unit4, unit5]}
    """
    data = request.get_json() or {}
    domain = (data.get("domain") or "General").strip()
    last_unit_number = int(data.get("last_unit_number", 0))
    if last_unit_number < 1:
        last_unit_number = 0

    # Strict: next 2 chapters only; normalize to max 5 MCQs per unit
    new_units = [build_unit(last_unit_number + i, domain) for i in range(1, 3)]
    new_units = normalize_units_mcqs(new_units, domain)
    node_config = build_node_config(last_unit_number + 1, len(new_units))

    return jsonify({"units": new_units, "ui_metadata": {"node_config": node_config}}), 200

# ========== Run App ==========

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)