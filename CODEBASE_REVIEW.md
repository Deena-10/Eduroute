# Codebase Review — Career Roadmap App

## 1. Overall System Design and Architecture

- **Stack:** Node.js (Express) backend, React (Vite/CRA) frontend, Python (Flask) AI service, PostgreSQL primary DB. Optional React Native mobile app present.
- **Request flow:** Browser → Express (port 5000) → auth/profile/roadmap/chat routes; AI and roadmap generation → proxy to Flask (port 5001). Frontend uses `axiosInstance` with base URL `http://localhost:5000/api` and Bearer JWT.
- **Auth model:** JWT issued by Node (email/password or Google ID token). Token and user stored in localStorage; AuthContext restores session. Protected routes (Questionnaire, Roadmap, Profile) use `ProtectedRoute` and redirect to `/login` when unauthenticated.
- **Data split:** Node/Postgres own users, user_profiles, user_roadmaps, messages, notifications. Flask/Postgres (same or separate DB) own chat_history, roadmap_progress, career_onboarding_state; Flask also references events and projects tables. Schema and table creation differ between Node (`config/postgres.js`) and Flask (`db_postgres.py`), so shared DB usage may have schema drift.

---

## 2. Implemented Features and Completed Flows

### Authentication (complete)
- Email/password signup and login; bcrypt password hash; JWT (7d) returned and stored.
- Google OAuth: Firebase client `signInWithRedirect`, ID token sent to Node `POST /api/auth/google-signin`; Firebase Admin verifies token; user created or updated with `googleId`/`profilePicture`; JWT returned. AuthContext handles redirect result and persists user + token.
- Auth middleware: validates Bearer JWT, loads user from `users` by `id`, attaches `req.user`; used on all `/api/chat`, `/api/user`, `/api/ai` routes.

### Career roadmap generation (complete)
- **Form-based flow:** Questionnaire page collects domain (text), proficiency (Beginner/Intermediate), current status (School/College/Working professional). Submits to `POST /api/ai/generate-career-roadmap`. Node proxies to Flask `POST /generate_career_roadmap_direct`; Flask generates phased roadmap (Foundations → Core Concepts → Advanced Concepts → Practical Projects) with 13–17 tasks per topic, weekly recaps, interview-priority and repetition logic; returns JSON. Node inserts into `user_roadmaps` (roadmap_content JSON, progress 0, completed_tasks []), then frontend redirects to `/roadmap`.
- **Legacy conversational flow:** Flask `POST /career_chat` and Node `POST /api/ai/career-chat` still exist; state in `career_onboarding_state` (domain → proficiency → status). Not used by current UI (Questionnaire is form-only).

### Roadmap consumption and progress (complete)
- Roadmap page: `GET /api/user/roadmap` returns latest user_roadmap row. If `roadmap_content` parses to object with `phases`, a flat task list is built (flattenTasks); tasks shown in order with sequential unlock. Completed task IDs kept in `completed_tasks`; “Mark done” calls `PUT /api/user/roadmap/progress` with updated `progress_percentage` and `completed_tasks`. Weekly recaps (importantQuestions, repeatedConcepts, selfAssessmentChecklist or selfCheckSummary) rendered at bottom.

### Profile and user data (backend complete; frontend partial)
- Backend: `POST /api/user/save-profile` upserts `user_profiles` (education, interests, skills_learned, skills_to_learn, planning_days, email, phone); optional `roadmap` body can insert into `user_roadmaps`. `GET /api/user/profile` returns profile by user_id with JSONB fields parsed.
- Frontend Profile page does not call these APIs; it uses local mock data (username, interests, lessonsCompleted, skills, achievements, recentActivity). Only `user.name` and `user.email` from AuthContext are used.

### Chat and AI (backend complete; frontend chat UI removed)
- Node: `POST /api/chat` stores message in `messages`; no AI call from Node for this. `POST /api/ai/chat` proxies to Flask `POST /ask_ai` (question, engine, uid); Flask uses Gemini/Groq/OpenAI/Hugging Face for career-advisor response and stores in `chat_history`; Node returns reply. `GET /api/ai/chat-history` and `DELETE /api/ai/chat-history` proxy to Flask.
- Frontend: No chat UI. Questionnaire is form-only; no component calls `/api/ai/chat` or `/api/chat`.

### Events and projects (backend only)
- Flask: `POST /suggest_event` and `POST /suggest_project` read from `events` and `projects` by domain and completion_percentage. Node exposes `POST /api/ai/suggest-events` and `POST /api/ai/suggest-projects`. No frontend screen calls these endpoints.

### Notifications (backend only)
- Node `backend/service/notifications.js`: daily reminders query users with `user_profiles` and active `user_roadmaps`, send email via nodemailer, insert into `notifications`. No cron or scheduler is mounted in `server.js`; reminders are not triggered automatically.
- Flask: `POST /send_notification` calls Python `send_email`. Node exposes `POST /api/ai/send-notification`. No UI to trigger or view notifications.

### Legacy roadmap (skills list)
- `POST /api/ai/generate-roadmap` (Node) → Flask `POST /generate_roadmap`: accepts `skills_to_learn` array; returns `roadmap_steps` (“Learn X”) and `roadmap_image` path; Flask writes to `roadmap_progress`. No frontend uses this flow; Roadmap page uses only the structured roadmap from `generate-career-roadmap`.

### Static content
- Home: mock roadmaps, internships, events; links to Questionnaire and Roadmap. No API calls for internships/events.
- Roadmap: when no personalized roadmap exists, static “Career Path Selection” (Software Development, Data Science, Cybersecurity, UI/UX) with phases/skills/resources/projects; “Start Learning” / “View Progress” buttons have no handlers.
- Questions: `GET /api/questions` returns static array of 4 interest/skills/goal/values items; no frontend consumes it.

---

## 3. Key Functions and Modules

| Layer | Module / File | Responsibility |
|-------|----------------|----------------|
| Node | `server.js` | Express app, CORS, session, passport, mount routes; no DB init beyond Postgres pool. |
| Node | `config/postgres.js` | Pool creation; on startup creates `users`, `messages`, `user_profiles`, `user_roadmaps`, `notifications`, `career_onboarding_state` if not exist. |
| Node | `routes/authRoutes.js` | Signup, login (email/password), google-signin; JWT creation; Firebase Admin verify. |
| Node | `routes/userRoutes.js` | save-profile, GET profile, GET roadmap, PUT roadmap/progress, GET progress. |
| Node | `routes/aiRoutes.js` | Proxy: chat, chat-history, career-chat, generate-career-roadmap, career-onboarding-state, generate-roadmap, suggest-events, suggest-projects, send-notification. |
| Node | `routes/chatRoutes.js` | POST/GET/DELETE messages (user_id, sender, message). |
| Node | `routes/questions.js` | GET static questionnaire items. |
| Node | `middleware/authMiddleware.js` | JWT verify, load user from `users`, set `req.user`. |
| Flask | `application.py` | ask_ai (multi-engine), career_chat state machine, generate_career_roadmap_direct, career_onboarding_state, generate_roadmap (legacy), suggest_event, suggest_project, send_notification; chat_history get/clear. |
| Flask | `application.py` (internal) | _generate_full_roadmap_with_ai (prompt + Gemini), _fallback_roadmap_json; _parse_domain/proficiency/status_from_message. |
| Flask | `db_postgres.py` | User, ChatHistory, RoadmapProgress, Event, Project, CareerOnboardingState; init_database creates Flask-style tables (e.g. users with uid). |
| Flask | `events.py` / `projects.py` | Thin wrappers over DB: get_events_for_user, get_projects_for_user. |
| Flask | `roadmap.py` | generate_roadmap_image (PIL); used by legacy generate_roadmap. |
| Frontend | `AuthContext.jsx` | loadUser (localStorage, Firebase redirect, token restore), login, signup, googleSignIn, logout, isAuthenticated, clearCorruptedData. |
| Frontend | `ProtectedRoute.jsx` | Renders children or redirects to /login based on isAuthenticated after loading. |
| Frontend | `Questionnaire.jsx` | Form (domain, proficiency, status) → POST generate-career-roadmap → navigate /roadmap. |
| Frontend | `Roadmap.jsx` | GET user/roadmap; flattenTasks; list tasks with unlock and “Mark done”; PUT roadmap/progress; weekly recaps; static career paths when no roadmap. |

---

## 4. Data Models, Schemas, and Stored Entities

### PostgreSQL (schema_postgres.sql / Node usage)
- **users:** id, name, email, password, googleId, profilePicture, interests (JSONB), strengths (JSONB), created_at, updated_at.
- **messages:** id, user_id (FK users), sender ('user'|'bot'), message (TEXT), created_at.
- **user_profiles:** id, user_id (FK), education_grade/department/year, interests/skills_learned/skills_to_learn (JSONB), planning_days, email, phone, created_at, updated_at.
- **user_roadmaps:** id, user_id (FK), roadmap_content (TEXT, JSON), status (active|completed|paused), progress_percentage, completed_tasks (JSONB array of task ids), created_at, updated_at.
- **user_progress:** id, user_id, roadmap_id (FK user_roadmaps), task_name, task_description, status (pending|in_progress|completed|skipped), completed_at. **Not used by any route;** progress is stored in user_roadmaps.completed_tasks.
- **notifications:** id, user_id (FK), type, title, message, is_read, created_at.
- **chat_history:** id, user_id, uid, sender, question, answer, message, engine, timestamp. Used by Flask; Node does not read/write.
- **career_onboarding_state:** id, uid (unique), step (domain|proficiency|status|done), domain, proficiency_level, current_status, created_at, updated_at.
- **roadmap_progress:** id, uid, roadmap_step, completion_percentage, date_updated. Used by Flask legacy generate_roadmap only.
- **events / projects:** id, domain, suggested_for_percentage, plus event/project fields. Used by Flask suggest_event / suggest_project; no seed data visible.

### Generated roadmap JSON (in user_roadmaps.roadmap_content)
- domain, proficiencyLevel, currentStatus; phases[] (id, name, order, topics[] (id, title, order, interviewPriority, tasks[] (id, title, weekNumber, orderInWeek, type, isInterviewCritical))); weeklyRecaps[] (weekNumber, importantQuestions, repeatedConcepts, selfAssessmentChecklist or selfCheckSummary).

---

## 5. API Routes and Services in Use

| Method | Path | Auth | Status / Notes |
|--------|------|------|----------------|
| POST | /api/auth/signup | No | Used by Signup page. |
| POST | /api/auth/login | No | Used by Login via AuthContext. |
| POST | /api/auth/google-signin | No | Used after Firebase redirect. |
| POST | /api/chat | Yes | Not used by current UI. |
| GET | /api/chat | Yes | Not used by current UI. |
| DELETE | /api/chat | Yes | Not used by current UI. |
| POST | /api/ai/chat | Yes | Not used (chat UI removed). |
| GET | /api/ai/chat-history | Yes | Not used. |
| DELETE | /api/ai/chat-history | Yes | Not used. |
| POST | /api/ai/career-chat | Yes | Backend only; UI uses form. |
| GET | /api/ai/career-onboarding-state | Yes | Not used by form flow. |
| POST | /api/ai/generate-career-roadmap | Yes | Used by Questionnaire. |
| POST | /api/ai/generate-roadmap | Yes | Legacy; not used by UI. |
| POST | /api/ai/suggest-events | Yes | Not called by frontend. |
| POST | /api/ai/suggest-projects | Yes | Not called by frontend. |
| POST | /api/ai/send-notification | Yes | Not called by frontend. |
| GET | /api/user/profile | Yes | Implemented; Profile page does not call it. |
| POST | /api/user/save-profile | Yes | Implemented; no form submits to it. |
| GET | /api/user/roadmap | Yes | Used by Roadmap page. |
| PUT | /api/user/roadmap/progress | Yes | Used by Roadmap “Mark done”. |
| GET | /api/user/progress | Yes | Not used by frontend. |
| GET | /api/questions | No | Static list; not consumed by UI. |

---

## 6. UI Components and Screens

- **App.jsx:** Router; AuthProvider; Navbar; routes: / (Home), /login, /signup, /questionnaire (protected), /roadmap (protected), /profile (protected).
- **Navbar:** Links Home, Create roadmap (/questionnaire), Roadmap, Profile (if user); auth buttons; mobile menu.
- **ProtectedRoute:** Redirects to /login when not authenticated.
- **Home:** Tabs (roadmaps, internships, events); mock data; CTAs to Questionnaire and Roadmap.
- **Login:** Email/password form (AuthContext.login); Google button (AuthContext.googleSignIn); link to Signup.
- **Signup:** Name, email, password; AuthContext.signup; link to Login.
- **Questionnaire:** Single form (domain, proficiency, current status); submit → generate-career-roadmap → redirect to /roadmap; loading and error state.
- **Roadmap:** Fetches user roadmap; “My Learning Journey” with flat tasks, unlock order, “Mark done”, weekly recaps; when no roadmap, static career path cards (no actions).
- **Profile:** Tabs (Overview, Skills, Achievements); all data from local mock; only user.name and user.email from context.
- **FormattedMessage:** Exists; used when chat was present; no current use in Questionnaire.
- **auth.js:** Exports signup, login, getUserProfile; imports from `./axios` (no `axios.js` in api folder — broken import if used). Not referenced by Login/Signup or Profile; AuthContext uses fetch to backend directly.

---

## 7. Partially Implemented Features

- **Profile:** Backend profile and save-profile are implemented; frontend does not load or save profile. Profile page is fully mock-driven.
- **Events and projects:** Backend suggest-events and suggest-projects work; no screen or component calls them. Roadmap progress milestones (40%, 60%, 80%) only log to console; no integration with events/projects or UI.
- **Notifications:** Backend can send email and store notifications; no cron runs `sendDailyReminders`; no UI to view or manage notifications.
- **Chat:** Backend chat and AI chat routes and Flask ask_ai are implemented; frontend chat UI was removed, so chat is unused.
- **Career onboarding (conversational):** career_chat and career_onboarding_state are implemented; UI uses direct form and generate-career-roadmap only.

---

## 8. Placeholder or Unfinished Logic

- **PUT /api/user/roadmap/progress:** Updates all rows with `user_id = X AND status = 'active'`. If multiple active roadmaps exist, all get the same completed_tasks; design assumes one active roadmap per user.
- **user_progress table:** Defined in schema and created by Node/Flask setup scripts but never read or written by any route; progress lives only in user_roadmaps.completed_tasks.
- **auth.js:** `getUserProfile` calls `/user/profile`; file imports `./axios` which does not exist in `src/api`; if any code imported auth.js for profile, the axios import would fail.
- **axiosInstance:** References `criticalAuthEndpoints` including `/auth/verify`; there is no `/api/auth/verify` route. 401 on those paths triggers redirect to login; verify is never called.
- **Static Roadmap CTAs:** “Start Learning” and “View Progress” on static career path cards have no onClick or navigation.
- **Flask notifications:** `send_email` (e.g. in notifications.py) must be implemented and configured; send_notification route exists but depends on that implementation.
- **Node notifications.js:** Uses `JOIN user_profiles` and `JOIN user_roadmaps`; users without a profile or roadmap are excluded from reminders; no scheduling mechanism to run the function.

---

## 9. Missing Integrations vs. Intended Design

- **Profile ↔ backend:** Profile screen does not call GET /user/profile or POST /user/save-profile; intended profile persistence is not wired.
- **Home data:** Internships and events are mock; no API or DB backend for them.
- **Questions:** GET /api/questions exists; no onboarding or questionnaire UI uses it.
- **Notifications:** No cron/scheduler for daily reminders; no UI to view notifications or trigger sends.
- **Events/projects on progress:** Milestone logs (40/60/80%) do not call suggest-events or suggest-projects or show results in UI.
- **Auth verify:** Frontend treats /auth/verify as critical for 401 handling; endpoint does not exist.
- **Mobile app:** Separate React Native app (screens, navigation, api config); not verified for parity with web backend or shared auth/roadmap flows.
- **Dual DB/table usage:** Flask db_postgres creates its own table set (e.g. users with uid); Node uses different users schema. If both use same DB name, table definitions and ownership of `users`/chat_history etc. are ambiguous.

---

## 10. Summary Table

| Area | Implemented | Partially implemented | Placeholder / missing |
|------|-------------|------------------------|------------------------|
| Auth (email + Google) | Yes | — | /auth/verify missing |
| Roadmap generation (form) | Yes | — | — |
| Roadmap display + progress | Yes | — | — |
| Profile backend | Yes | — | — |
| Profile frontend | — | Mock only | No API integration |
| Chat backend | Yes | — | — |
| Chat frontend | — | — | Removed |
| Events/projects API | Yes | — | No UI, no scheduling |
| Notifications | Backend logic | No cron, no UI | — |
| Questions API | Yes | — | No consumer |
| user_progress table | — | — | Unused |
| Home internships/events | — | Mock only | No backend |
