# 🚀 Career Roadmap App

A full-stack career guidance platform that generates personalized learning roadmaps, projects, and event recommendations using AI.

## 🏗️ Architecture

- **Frontend**: React (CRA) + Firebase Auth + Tailwind CSS
- **Backend (Service 1)**: Node.js + Express + Firebase Admin + MySQL
- **Backend (Service 2)**: Python Flask + AI APIs (Gemini, Groq, HuggingFace) + SQLite

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MySQL (optional, SQLite fallback available)
- Firebase project setup

### 1. Environment Setup

#### Backend (Node.js)
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here
FIREBASE_PROJECT_ID=your-firebase-project-id
AI_SERVICE_URL=http://localhost:5001
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
HF_API_KEY=your_huggingface_api_key
```

#### Flask AI Service
Create `backend/service/.env`:
```env
FLASK_ENV=development
FLASK_DEBUG=True
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
HF_API_KEY=your_huggingface_api_key
DATABASE_URL=sqlite:///career_roadmap.db
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### 2. Installation

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend && npm install

# Install Flask service dependencies
cd backend/service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Start Services

#### Option 1: Using the root start script
```bash
npm start
```

#### Option 2: Manual startup
```bash
# Terminal 1: Start Node.js backend
cd backend && npm start

# Terminal 2: Start Flask AI service
cd backend/service && python application.py

# Terminal 3: Start React frontend
cd frontend && npm start
```

## 🌐 Service URLs

- **Frontend**: http://localhost:3000
- **Node.js Backend**: http://localhost:5000
- **Flask AI Service**: http://localhost:5001

## 🔧 API Endpoints

### Node.js Backend (`/api`)

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile

#### AI Services (Proxied to Flask)
- `POST /ai/chat` - AI Q&A chatbot
- `POST /ai/generate-roadmap` - Generate career roadmap
- `POST /ai/suggest-events` - Get event recommendations
- `POST /ai/suggest-projects` - Get project recommendations
- `POST /ai/send-notification` - Send email notifications

### Flask AI Service

- `POST /ask_ai` - AI Q&A with multiple engines
- `POST /generate_roadmap` - Generate roadmap with visualization
- `POST /suggest_event` - Domain-based event suggestions
- `POST /suggest_project` - Domain-based project suggestions
- `POST /send_notification` - Email notification service

## 🗄️ Database Schema

### SQLite (Flask Service)
- `users` - User profiles and preferences
- `chat_history` - AI conversation history
- `roadmap_progress` - User learning progress
- `events` - Event recommendations
- `projects` - Project recommendations

### MySQL (Node.js Backend)
- User authentication and session management
- Additional user data and preferences

## 🔐 Authentication Flow

1. User signs up/logs in via Firebase Auth
2. JWT token stored in localStorage
3. Token sent with API requests via Authorization header
4. Node.js backend validates Firebase token
5. User data synchronized between services

## 🤖 AI Integration

### Supported AI Engines
- **Gemini**: Google's AI model (recommended)
- **Groq**: Fast inference API
- **HuggingFace**: Open-source models

### AI Features
- **Q&A Chatbot**: Multi-engine support with conversation history
- **Roadmap Generation**: Step-by-step learning paths with visualizations
- **Smart Recommendations**: Domain-specific events and projects
- **Email Notifications**: Progress updates and reminders

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first with Tailwind CSS
- **Protected Routes**: Authentication-based access control
- **Real-time Chat**: AI conversation interface
- **Roadmap Generator**: Interactive skill planning tool
- **Progress Tracking**: Learning milestone management

## 🛠️ Development

### Adding New Features

1. **Frontend**: Add components in `frontend/src/`
2. **Node.js Backend**: Add routes in `backend/routes/`
3. **Flask Service**: Add endpoints in `backend/service/application.py`
4. **Database**: Update models in respective services

### Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests (when implemented)
cd backend && npm test
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3000, 5000, and 5001 are available
2. **CORS Errors**: Check environment variables for correct URLs
3. **AI API Errors**: Verify API keys in environment files
4. **Database Issues**: Check connection strings and permissions

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and `FLASK_DEBUG=True`

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GROQ_API_KEY` | Groq API key | Optional |
| `HF_API_KEY` | HuggingFace API key | Optional |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `DATABASE_URL` | Database connection string | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
