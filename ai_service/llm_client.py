"""
LLM client for AI-generated roadmap content.
Uses: Hugging Face -> Gemini -> Cohere -> Claude -> Groq -> OpenAI (first available).
"""
import os
import json
import re

def _extract_json(text):
    """Extract JSON from LLM response (may be wrapped in markdown code block)."""
    text = (text or "").strip()
    # Try to find ```json ... ``` block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        text = match.group(1).strip()
    # Fallback: find first { ... } block
    start = text.find("{")
    if start >= 0:
        depth = 0
        for i in range(start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    text = text[start : i + 1]
                    break
    return text


def _call_huggingface(prompt: str, api_key: str) -> str | None:
    """Call Hugging Face Inference API (OpenAI-compatible, e.g. Qwen)."""
    try:
        import requests
        model = os.environ.get("HF_MODEL", "Qwen/Qwen3-Coder-Next:novita")
        resp = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8,
                "max_tokens": 8192,
            },
            timeout=90,
        )
        if resp.status_code == 200:
            data = resp.json()
            msg = data.get("choices", [{}])[0].get("message", {})
            return msg.get("content")
        return None
    except Exception as e:
        print(f"Hugging Face API error: {e}")
        return None


def _call_gemini(prompt: str, api_key: str) -> str | None:
    """Call Google Gemini API. Tries REST API first (X-goog-api-key), then SDK."""
    for model_name in ("gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.0-pro"):
        try:
            import requests
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
            resp = requests.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "X-goog-api-key": api_key,
                },
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.8, "maxOutputTokens": 8192},
                },
                timeout=60,
            )
            if resp.status_code == 200:
                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    content = candidates[0].get("content", {})
                    parts = content.get("parts", [])
                    if parts:
                        return parts[0].get("text")
        except Exception as e:
            print(f"Gemini REST ({model_name}) error: {e}")
            continue

    # Fallback: SDK
    for model_name in ("gemini-2.0-flash", "gemini-1.5-flash-8b", "gemini-pro"):
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.8,
                    max_output_tokens=8192,
                ),
            )
            return response.text if response else None
        except Exception as e:
            print(f"Gemini SDK ({model_name}) error: {e}")
            continue
    return None


def _call_cohere(prompt: str, api_key: str) -> str | None:
    """Call Cohere Chat API v2."""
    try:
        import requests
        model = os.environ.get("COHERE_MODEL", "command-r-plus")
        resp = requests.post(
            "https://api.cohere.com/v2/chat",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8,
                "max_tokens": 8192,
            },
            timeout=90,
        )
        if resp.status_code == 200:
            data = resp.json()
            msg = data.get("message", {})
            if isinstance(msg, dict):
                text = msg.get("text") or msg.get("content")
                if text:
                    return text
                for block in msg.get("content", []) or []:
                    if isinstance(block, dict) and block.get("text"):
                        return block["text"]
                    if isinstance(block, str):
                        return block
            return str(msg) if msg else None
        return None
    except Exception as e:
        print(f"Cohere API error: {e}")
        return None


def _call_claude(prompt: str, api_key: str) -> str | None:
    """Call Anthropic Claude Messages API."""
    try:
        import requests
        model = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "max_tokens": 8192,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8,
            },
            timeout=90,
        )
        if resp.status_code == 200:
            data = resp.json()
            for block in data.get("content", []):
                if block.get("type") == "text":
                    return block.get("text")
        return None
    except Exception as e:
        print(f"Claude API error: {e}")
        return None


def _call_groq(prompt: str, api_key: str) -> str | None:
    """Call Groq API via REST (avoids groq package compatibility issues)."""
    try:
        import requests
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8,
                "max_tokens": 8192,
            },
            timeout=60,
        )
        if resp.status_code == 200:
            data = resp.json()
            msg = data.get("choices", [{}])[0].get("message", {})
            return msg.get("content")
        return None
    except Exception as e:
        print(f"Groq API error: {e}")
        return None


def _call_openai(prompt: str, api_key: str) -> str | None:
    """Call OpenAI API."""
    try:
        import requests
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-3.5-turbo",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.8,
                "max_tokens": 8192,
            },
            timeout=60,
        )
        if resp.status_code == 200:
            data = resp.json()
            msg = data.get("choices", [{}])[0].get("message", {})
            return msg.get("content")
        return None
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return None


def call_llm(prompt: str) -> str | None:
    """
    Call first available LLM: Hugging Face -> Gemini -> Cohere -> Claude -> Groq -> OpenAI.
    Returns raw text response or None if all fail.
    """
    hf_token = os.environ.get("HF_TOKEN", os.environ.get("HF_API_KEY", "")).strip()
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    cohere_key = os.environ.get("COHERE_API_KEY", "").strip()
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    groq_key = os.environ.get("GROQ_API_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()

    if hf_token:
        out = _call_huggingface(prompt, hf_token)
        if out:
            return out
    if gemini_key:
        out = _call_gemini(prompt, gemini_key)
        if out:
            return out
    if cohere_key:
        out = _call_cohere(prompt, cohere_key)
        if out:
            return out
    if anthropic_key:
        out = _call_claude(prompt, anthropic_key)
        if out:
            return out
    if groq_key:
        out = _call_groq(prompt, groq_key)
        if out:
            return out
    if openai_key:
        out = _call_openai(prompt, openai_key)
        if out:
            return out

    return None


def generate_roadmap_via_ai(domain: str, proficiency_level: str = "", professional_goal: str = "", current_status: str = "", start_unit: int = 1, count: int = 3) -> dict | None:
    """
    Generate roadmap units using AI. Returns dict with 'units' list or None on failure.
    Each unit has: unit_number, title, level, tasks, mcqs.
    When proficiency is beginner, chapters MUST start from absolute basics of the domain.
    """
    level_hint = f"Proficiency: {proficiency_level}. " if proficiency_level else ""
    goal_hint = f"Professional goal: {professional_goal}. " if professional_goal else ""
    status_hint = f"Current status: {current_status}. " if current_status else ""

    is_beginner = proficiency_level and str(proficiency_level).strip().lower() in ("beginner", "beginning", "starter", "new")
    if is_beginner and start_unit == 1:
        order_instruction = (
            f'IMPORTANT: The learner is a BEGINNER. You MUST start from the absolute BASICS and FOUNDATIONS of "{domain}". '
            "First chapters must cover: definitions, core concepts, terminology, and fundamental skills in order. "
            "Do NOT jump to random or advanced topics. Progress from basics → simple applications → slightly harder concepts. "
            "Chapter 1 must be the very first thing a complete beginner would need (e.g. what is X, why it matters, first steps)."
        )
    else:
        order_instruction = ""

    unit_nums = list(range(start_unit, start_unit + count))
    def _level(n):
        r = (n - 1) % 3
        return ["beginner", "intermediate", "advanced"][r]
    levels_desc = ", ".join([f"Chapter {n}: {_level(n)}" for n in unit_nums])

    prompt = f"""You are an expert career coach and learning path designer. Generate a structured learning roadmap for the domain "{domain}".
{level_hint}{goal_hint}{status_hint}
{order_instruction}

Create exactly {count} chapters (units) for chapters {start_unit} through {start_unit + count - 1}.
Levels for these chapters: {levels_desc}.

For EACH chapter, provide:
1. A unique, specific title (e.g. "Variables and Data Types in {domain}", "Functions and Modularity in {domain}") - NOT generic like "Getting started".
2. Four concrete learning tasks (task_name only, short).
3. Exactly 4 or 5 UNIQUE multiple-choice questions (MCQs) - NO MORE THAN 5 per chapter. Each question must be DIFFERENT from other chapters. Focus on {domain}-specific concepts.

Output ONLY valid JSON in this exact format (no markdown, no extra text):
{{
  "units": [
    {{
      "unit_number": 1,
      "title": "Specific chapter title",
      "level": "beginner",
      "tasks": [
        {{"task_id": "u1_t1", "task_name": "Task 1 name"}},
        {{"task_id": "u1_t2", "task_name": "Task 2 name"}},
        {{"task_id": "u1_t3", "task_name": "Task 3 name"}},
        {{"task_id": "u1_t4", "task_name": "Task 4 name"}}
      ],
      "mcqs": [
        {{
          "question": "Unique question text for this chapter?",
          "options": ["Correct answer", "Wrong 1", "Wrong 2", "Wrong 3"],
          "correctIndex": 0
        }}
      ]
    }}
  ]
}}

Use unit_number {start_unit} for first chapter, {start_unit + 1} for second, etc. correctIndex is 0-3 (index of correct option). Each MCQ must have exactly 4 options. Generate UNIQUE questions per chapter - no repetition."""

    raw = call_llm(prompt)
    if not raw:
        return None

    try:
        json_str = _extract_json(raw)
        data = json.loads(json_str)
        units = data.get("units") or data.get("roadmap", {}).get("units") or []
        if not units:
            return None
        return {"units": units}
    except json.JSONDecodeError as e:
        print(f"LLM JSON parse error: {e}")
        return None


def generate_next_chapters_via_ai(domain: str, last_unit_number: int, count: int = 2) -> dict | None:
    """
    Generate next N chapters using AI. Returns dict with 'units' list or None.
    """
    start = last_unit_number + 1
    return generate_roadmap_via_ai(domain, start_unit=start, count=count)
