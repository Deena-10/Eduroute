# Career Roadmap Application - Complete Project Structure

## 🏗️ Project Overview
A comprehensive career roadmap application with AI-powered guidance, user authentication, progress tracking, and multi-platform access (web + mobile), backed by a PostgreSQL database and a dedicated Python AI microservice.

## 📁 File Structure

```
career-roadmap-app/
├── backend/                          # Node.js / Express backend API
│   ├── config/
│   │   ├── firebaseAdmin.js         # Firebase Admin SDK setup
│   │   ├── mysql.js                 # Legacy MySQL config (not used in prod)
│   │   ├── postgres.js              # PostgreSQL connection config
│   │   ├── sqlite.js                # Legacy SQLite config (local/dev only)
│   │   └── serviceAccountKey*.json  # Firebase service account (local only)
│   ├── controllers/
│   │   ├── authController.js        # Auth & session handling
│   │   ├── userController.js        # User profile & settings
│   │   ├── aiController.js          # Proxy to AI service (roadmaps/chat)
│   │   └── chatController.js        # Chat message history & helpers
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT / Firebase token verification
│   │   └── validation.js            # Request validation helpers
│   ├── models/                      # Legacy / helper models (kept for ref)
│   ├── prisma/
│   │   └── schema.prisma            # PostgreSQL schema (users, roadmaps, chats, notifications, streaks, onboarding)
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── userRoutes.js            # /api/users/*
│   │   ├── chatRoutes.js            # /api/chat/*
│   │   ├── aiRoutes.js              # /api/ai/* (talks to ai_service)
│   │   └── questions.js             # Questionnaire / quiz routes
│   ├── services/
│   │   └── aiService.js             # HTTP client for Python AI service
│   ├── middleware/                  # Shared middlewares (see above)
│   ├── .env                         # Backend environment variables
│   ├── package.json                 # Backend dependencies & scripts
│   ├── package-lock.json
│   └── server.js                    # Express app entrypoint
│
├── ai_service/                      # Python Flask AI microservice
│   ├── application.py               # Flask app (health + /generate-roadmap)
│   ├── db_postgres.py               # PostgreSQL connection helpers
│   ├── db_mysql.py / db_sqlite.py   # Legacy DB adapters (kept for reference)
│   ├── roadmap.py                   # Roadmap-related helpers (older flow)
│   ├── events.py / projects.py      # Event & project recommendation helpers
│   ├── notifications.py             # Notification templates / helpers (Python)
│   ├── free_ai_service.py           # Alternative free-API implementation
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Container definition for AI service
│   ├── gunicorn.conf.py             # Gunicorn configuration
│   └── .env / .env.template         # AI service configuration
│
├── frontend/                        # React SPA for the web client
│   ├── public/
│   │   ├── index.html               # Main HTML shell
│   │   └── assets (favicons, logos)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Signup.jsx           # Signup / onboarding
│   │   │   ├── Questionnaire.jsx    # Multi-step questionnaire / assessment
│   │   │   ├── Roadmap.jsx          # Roadmap view (uses AI/back-end data)
│   │   │   ├── TaskPage.jsx         # Daily tasks & progress
│   │   │   └── Profile.jsx          # User profile & settings
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state (token, user)
│   │   │   └── RoadmapContext.jsx   # Roadmap state & helpers
│   │   ├── api/                     # API clients (Axios wrappers)
│   │   ├── components/              # Reusable UI components
│   │   ├── styles/                  # Global & component styles
│   │   ├── App.jsx                  # Root React component
│   │   └── index.js                 # React entrypoint
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── package-lock.json
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── nginx.conf                   # Nginx config for production build
│   └── Dockerfile                   # Frontend container
│
├── mobile/                          # React Native mobile client
│   ├── src/                         # Mobile screens, navigation, components
│   ├── android/                     # Native Android project
│   ├── app.json                     # App metadata
│   ├── index.js                     # React Native entrypoint
│   ├── package.json                 # Mobile dependencies & scripts
│   └── README.md                    # Mobile-specific docs
│
├── database/                        # Database reference assets (legacy)
│   ├── schema.sql                   # Original relational schema (MySQL)
│   ├── migrations/                  # SQL migrations (legacy)
│   └── seeds/                       # Sample data (legacy)
│
├── docs/
│   ├── API.md                       # REST API documentation
│   ├── SETUP.md                     # Local setup instructions
│   ├── DEPLOYMENT.md                # Deployment guide
│   ├── FEATURES.md                  # Feature overview
│   ├── MIGRATION_MYSQL_TO_POSTGRES.md # Notes on DB migration
│   └── BACKEND_DEBUG_GUIDE.md       # Debugging tips for backend
│
├── scripts/
│   ├── start-dev.sh                 # Dev startup (Unix)
│   ├── start-prod.sh                # Prod startup (Unix)
│   ├── setup-database.sh            # DB initialization (legacy)
│   └── deploy.sh                    # Deployment helper (legacy)
│
├── docker-compose.yml               # Orchestrates backend, frontend, ai_service, db
├── start-dev.bat                    # Windows: start full dev stack
├── start-app.bat                    # Windows: start production-like stack
├── package.json                     # Root-level tooling / scripts
├── .env                             # Root environment config (service URLs, etc.)
├── .gitignore                       # Git ignore rules
└── README.md                        # High-level project documentation
```

## 🔧 Key Features Implementation

### 1. **User Authentication (JWT + OAuth/Firebase)**
- Email/password login
- Google / OAuth-based authentication (via Passport / Firebase)
- JWT-based session handling on the backend
- Protected routes on the frontend and mobile app

### 2. **AI Roadmap & Guidance**
- AI-assisted roadmap generation via the Python `ai_service`
- Fallback roadmap generator for stable behavior when AI is disabled
- Progress-aware content (tasks, quiz questions, milestones)
- Dedicated `/generate-roadmap` endpoint exposed to the backend

### 3. **Assessment & Progress Tracking**
- Structured questionnaires linked to a user profile
- Daily task views and completion tracking
- Roadmap progress percentage stored in PostgreSQL (via Prisma)
- Learning streak tracking and notifications

### 4. **Multi-Platform Clients**
- Responsive web app built with React
- Dedicated React Native mobile client
- Shared authentication and roadmap data across clients via a common backend API

### 5. **Database Storage**
- PostgreSQL database (primary, via Prisma)
- User profiles and onboarding state
- Roadmaps and completed tasks
- Chat history and notifications
- Legacy MySQL/SQLite support in the AI service kept for reference only

### 6. **Notification & Engagement**
- In-app notifications and reminders
- Email notifications (backend service layer)
- Streak tracking to encourage daily usage

### 7. **Event & Project Suggestions**
- Event and project helper modules (Python) for future expansion
- Designed to surface relevant events/projects as progress increases

## 🚀 Technology Stack

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** database via **Prisma ORM**
- **JWT** for authentication
- **Passport.js / Firebase Admin** for OAuth / identity integration
- **Nodemailer** (and similar providers) for emails

### AI Service
- **Python 3** with **Flask**
- Pluggable AI engines (e.g. **Gemini**) behind a stable HTTP contract
- Fallback deterministic roadmap generator for offline / non-AI mode

### Frontend (Web)
- **React.js** with hooks
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation
- **Context API** for state management

### Mobile
- **React Native** mobile application
- Shared auth and API layer with the web app

### DevOps
- **Docker** and **Docker Compose** for containerization and orchestration
- Environment-based configuration via `.env` files
- Production-ready Nginx + React build for the frontend
