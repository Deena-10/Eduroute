# AI Deployment Checklist — Fix "Sample Questions" in Production

If AI works locally but deployment uses template/sample questions, run through this list.

## 1. API keys must be on the **AI service**, not the backend

On Render, each service has its own Environment tab. Set API keys on the **AI service** (e.g. `eduroute-x2c8`), not on the backend.

**Required (at least one):**

| Variable        | Example source                    |
|----------------|------------------------------------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/) |
| `HF_TOKEN` or `HF_API_KEY` | [Hugging Face](https://huggingface.co/settings/tokens) |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/) |
| `OPENAI_API_KEY` | [OpenAI](https://platform.openai.com/api-keys) |

## 2. Backend must point to the AI service URL

On the **backend** service, set:

```
AI_SERVICE_URL=https://your-ai-service.onrender.com
```

Example: `AI_SERVICE_URL=https://eduroute-x2c8.onrender.com` (no trailing slash).

## 3. Verify AI service config

After deploy, open: `https://your-ai-service.onrender.com/health`

You should see:
```json
{
  "status": "ok",
  "ai_configured": true,
  "keys_present": { "GEMINI": true, "HF": false, ... }
}
```

If `ai_configured` is `false` or `keys_present` shows all `false`, keys are not set correctly on the AI service.

## 4. Check Render logs

In **AI service** logs, look for:

- `[AI] Startup: API keys configured: ['GEMINI']` → keys loaded
- `[AI] Startup: API keys configured: NONE` → no keys, will use fallback
- `[AI] Fallback: using templates for 'java developer' — keys present: []` → AI call failed

## 5. Common mistakes

- **Wrong service**: Keys on backend instead of AI service
- **Typos**: `GEMINI_API_KEY` vs `GEMINI_KEY` — use exact names
- **No redeploy**: After changing env vars, redeploy the AI service
- **Free tier limits**: Some APIs (e.g. Groq, Gemini) have rate limits; check provider dashboard
