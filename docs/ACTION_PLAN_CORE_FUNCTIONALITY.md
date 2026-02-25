# Action Plan: Core Functionality & Data Persistence

This document outlines the analysis and fixes for login flow, roadmap generation, vertical roadmap UI, daily task generator, and database persistence. **Priority: functional correctness and stateful, persistent user data over UI polish.**

---

## 1. Login Flow

### Current State
- **Auth**: JWT (7d expiry), stored in `localStorage` as `token`; user object as `user`.
- **AuthContext** restores user from `localStorage` on load; validates JSON/corruption; can restore from JWT payload if `user` is missing.
- **ProtectedRoute** uses `isAuthenticated()` (user + token) with a 1s delay before redirect.
- **Backend** returns JSON for 401s; frontend axios interceptor clears storage and redirects to `/login` on any 401.

### Issues
- No token refresh: when JWT expires after 7 days, user is logged out without clear feedback.
- Hardcoded API URL in AuthContext (`http://localhost:5000`) for login/signup/Google — should use same base as axiosInstance.

### Action Plan
| # | Action | Owner |
|---|--------|--------|
| 1.1 | Keep current session persistence (localStorage + JWT). Ensure no code path overwrites `user`/`token` with non-JSON (already guarded by safeJsonParse and 401 interceptor). | Done |
| 1.2 | Use `axiosInstance` (or `REACT_APP_API_URL`) for auth API calls in AuthContext so base URL is consistent and env-driven. | Implement |
| 1.3 | (Optional) Add refresh token or “remember me” with longer-lived token; or document that session lasts 7 days and user must re-login. | Later |

---

## 2. Roadmap Generation & Remembering User Inputs

### Current State
- **Questionnaire** is the only place domain, proficiency, professional goal, and current status are entered. Values live only in component state; **not persisted** until user clicks “Generate my roadmap.”
- **Backend** has `CareerOnboardingState` table (`uid`, `step`, `domain`, `proficiency_level`, `current_status`) but it is **never written by the Node app**; only the Python `db_postgres` references it.
- After generation, the roadmap is stored in `user_roadmaps`; the questionnaire inputs used to create it are **not** stored for prefill on next visit.

### Issues
- Users must re-enter domain every time they open the app or go to the questionnaire.
- No API to “get my last preferences” for the questionnaire form.

### Action Plan
| # | Action | Owner |
|---|--------|--------|
| 2.1 | **Backend**: When `POST /api/ai/generate-career-roadmap` succeeds, upsert `career_onboarding_state` for this user: `uid = String(req.user.id)`, set `domain`, `proficiency_level`, `current_status` (and optionally `step`). | Implement |
| 2.2 | **Backend**: Add `GET /api/user/onboarding-preferences` (auth required) that reads `career_onboarding_state` by `uid = String(req.user.id)` and returns `{ domain, proficiency_level, current_status }` (or null if none). | Implement |
| 2.3 | **Frontend**: In Questionnaire, on mount call `GET /api/user/onboarding-preferences`. If data exists, prefill `domain`, `proficiency`, `currentStatus` (and professional goal if added to backend). | Implement |
| 2.4 | Keep questionnaire as the single source of truth before generation; no need to “remember” mid-form state across tabs — only last submitted preferences. | Done |

---

## 3. Vertical Roadmap UI

### Current State
- **Roadmap.jsx** fetches active roadmap and streak; normalizes `roadmap_content` to `roadmap.units`; maps units to nodes with status (locked / available / completed) based on `completed_tasks`.
- **RoadmapNode** shows unit number, title, color, and lock/check state. Click navigates to first (uncompleted) task in that unit.

### Issues
- **Streak** is read from wrong response path: backend returns `res.success(rows[0])` so payload is `{ success, data: { current_streak, last_activity_date } }`. Frontend uses `streakRes.data.current_streak` instead of `streakRes.data.data.current_streak`.
- Units don’t show task count or “X of Y tasks” for clarity.
- Dependencies are implicit (previous unit must be completed); not stated in UI.

### Action Plan
| # | Action | Owner |
|---|--------|--------|
| 3.1 | Fix streak in Roadmap.jsx: use `streakRes.data.data` for `current_streak` and `last_activity_date`. | Implement |
| 3.2 | Add one line under unit title: “N tasks” or “X of N tasks completed” for functional clarity. | Implement |
| 3.3 | Optional: add short label “Complete previous unit first” for locked nodes. | Optional |

---

## 4. Daily Task Generator (TaskPage)

### Current State
- **TaskPage** is driven by `taskId` from the URL. It fetches roadmap via `GET /api/user/roadmap`, flattens tasks from `roadmap_content`, and finds the task by `task_id`/`id`.
- It expects each task to have **`mcqs`** (array of `{ question, options, correctIndex }`). Correct answer triggers “next question” or “level complete”; incorrect pushes question to replay queue.
- **AI fallback** (`ai_service/application.py`) returns tasks with only `task_id` and `task_name` — **no `mcqs`**. So TaskPage always shows “No questions for this task yet.”

### Issues
- **Wrong API response shape**: `getRoadmap` uses `res.success(rows[0])`, so the roadmap row is in `res.data.data`, not `res.data.roadmap`. TaskPage reads `res.data.roadmap`, so it never gets the roadmap and task is always null or wrong.
- **No MCQs**: Fallback roadmap doesn’t include MCQs, so the “daily task” flow (answer questions → complete task) never works.

### Action Plan
| # | Action | Owner |
|---|--------|--------|
| 4.1 | **TaskPage**: Use same response shape as Roadmap.jsx: `res.data.success && (res.data.data || res.data.roadmap)`; get roadmap row from that; then read `roadmap_content` (parse if string) and `flattenTasks(content)`. | Implement |
| 4.2 | **AI fallback**: Add a `mcqs` array to each task in `_fallback_roadmap_json` (e.g. 2–3 MCQs per task with `question`, `options`, `correctIndex`). So every task has at least one “question” and the existing TaskPage logic runs. | Implement |
| 4.3 | If a task has no `mcqs` (legacy or future), show task name + a single “Mark as complete” button that calls `POST /user/roadmap/complete-task` and redirects to roadmap. Prevents “No questions for this task yet” dead end. | Implement |
| 4.4 | Ensure `complete-task` returns updated `progress_percentage` and `completed_tasks` in response so future UI can show progress without refetch (optional). | Optional |

---

## 5. Database Persistence

### Current State
- **PostgreSQL** via Prisma schema: `users`, `user_profiles`, `user_roadmaps` (roadmap_content JSON, completed_tasks JSON, progress_percentage), `user_learning_streak`, `notifications`, `chat_history`, `career_onboarding_state`.
- **user_roadmaps**: Active roadmap per user; `roadmap_content` stores full AI payload (e.g. `roadmap.units`, `ui_metadata`); `completed_tasks` is array of task IDs; progress recomputed on task completion.
- **userController.getRoadmap** returns the active row; **userController.completeTask** updates `completed_tasks` and `progress_percentage`; **aiController.generateRoadmap** inserts new row and pauses others.

### Issues
- **CareerOnboardingState** is never written by Node (only by Python). So domain/preferences are not persisted by the main app.
- **getRoadmap** uses raw SQL; response is wrapped with `res.success(row)` so clients must use `res.data.data`. Roadmap.jsx was fixed; TaskPage was not.
- **completed_tasks**: Backend expects JSON array; Prisma/Postgres JSONB handles it. No identified bug.
- **Profile** has interests/skills/planning_days but no “last domain”; using `career_onboarding_state` keeps schema as-is.

### Action Plan
| # | Action | Owner |
|---|--------|--------|
| 5.1 | Persist questionnaire inputs in `career_onboarding_state` on successful roadmap generation (see 2.1). | Implement |
| 5.2 | Expose onboarding preferences via GET endpoint (see 2.2). | Implement |
| 5.3 | Ensure all roadmap/task reads use consistent response shape: `{ success, data, message }` with roadmap row in `data`. Fix TaskPage (see 4.1). | Implement |
| 5.4 | Validate after changes: login → questionnaire (prefill if returning user) → generate roadmap → reload page → roadmap still visible; complete a task → reload → progress and streak persist. | Manual QA |

---

## Implementation Order

1. **Backend**: Persist onboarding state on generate; add GET onboarding-preferences. ✅
2. **Backend**: Ensure getRoadmap/getStreak/completeTask response shapes are documented and consistent. ✅
3. **Frontend**: Fix TaskPage roadmap response (res.data.data) and add “no MCQs” path (Mark complete). ✅
4. **Frontend**: Fix Roadmap.jsx streak (res.data.data). ✅
5. **Frontend**: Questionnaire prefill from GET onboarding-preferences. ✅
6. **AI service**: Add mcqs to fallback roadmap per task. ✅
7. **UI**: Roadmap unit line “N tasks” / “X of N completed” for clarity. ✅

---

## Summary Table

| Area | Main issue | Fix |
|------|------------|-----|
| Login | Session works; base URL hardcoded in AuthContext | Use env/axiosInstance for auth calls |
| Roadmap inputs | Not remembered | Save to career_onboarding_state; GET prefill in Questionnaire |
| Vertical roadmap | Streak wrong key; no task count | Use streakRes.data.data; show task count per unit |
| Daily tasks | Wrong API shape; no MCQs in fallback | TaskPage use data.data; add mcqs in AI; allow “Mark complete” if no MCQs |
| DB persistence | Onboarding state never written by Node | Write on generate; read for prefill; fix TaskPage data path |

This plan prioritizes **functional correctness and stateful behavior**; UI changes are minimal and aimed at clarity (task count, optional dependency text).
