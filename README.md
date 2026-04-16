# 🚀 EduRoute AI - Career Roadmap Application

A comprehensive career guidance platform that provides personalized learning roadmaps, progress tracking, and milestone-based recommendations.

## 🌟 Key Features

### 1. **AI-Powered Career Assessment**
- Interactive questionnaire system with domain-specific analysis.
- Personalized roadmap generation based on education level, skills, and goals.
- Structured career assessment questions (Education, Interests, Skills inventory).

### 2. **Personalized Roadmap & Progress**
- AI-generated learning phases and milestones.
- Daily/weekly task breakdowns with resource recommendations.
- Real-time progress monitoring with visual indicators.
- **Task completion tracking** with automated progress calculation.

### 3. **Gamification & Community (New!)**
- **Streak System**: Track your daily learning consistency with visual "flame" streaks.
- **Leaderboard**: Compete with other learners based on your streaks and progress.
- **Achievements & Badges**: Earn rewards like "Halfway There" at 50% and "Path Master" on completion.
- **Skill Analytics**: Visual breakdown of mastered, advanced, and learning skills.

### 4. **Resource Library & Events**
- **Personalized Resources**: Curated video recommendations tailored to your career domain.
- **Events & Conferences**: Discover upcoming tech conferences, hackathons, and webinars.
- **Sharing Capabilities**: Easily share interesting events with your network.

### 5. **Smart Notifications System**
- **Daily reminders** via email to keep you on track.
- **Milestone notifications** triggered at specific progress points:
  - **40%**: Event and conference suggestions.
  - **60%**: Project recommendations.
  - **80%**: Job opening alerts and interview prep.

### 6. **Modern, Responsive UI**
- **Forest Sage Theme**: A premium, nature-inspired design system with smooth animations.
- **Mobile-First Approach**: Fully responsive with a dedicated bottom navigation bar for mobile users.
- **PWA Support**: Installable on mobile devices for a native app experience.

### 7. **Secure Authentication**
- **Email/Password** login with JWT security.
- **Google OAuth Integration**: Fast and secure one-tap login.

## 🏗️ Architecture

### Frontend (React.js)
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Dynamic navigation (Desktop/Mobile)
│   │   ├── NotificationBell.js # Real-time alerts
│   │   └── UI/                 # Framer Motion animated components
│   ├── pages/
│   │   ├── Roadmap.jsx         # Core learning path + Leaderboard + Achievements
│   │   ├── Events.jsx          # Tech conferences & webinars
│   │   ├── Profile.jsx         # User stats, Skills analytics & Streak history
│   │   └── Questionnaire.jsx   # AI-driven onboarding
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state + Google Sign-in
│   └── api/
│       └── axiosInstance.js    # Centralized API config with interceptors
```

### Backend (Node.js + Express)
```
backend/
├── routes/
│   ├── authRoutes.js           # Auth & Google OAuth
│   ├── userRoutes.js           # Profiles, Streaks, Leaderboard
│   ├── aiRoutes.js             # Roadmap generation logic
│   └── eventsRoutes.js         # Curated events management
├── prisma/
│   └── schema.prisma           # Database schema & migrations
└── services/
    └── application.py          # AI Service (Flask/LLM integration)
```

### Database Schema (PostgreSQL via Prisma)
```sql
-- Core Tables
User                     # Authentication & core profile
Profile                  # Detailed education & skills
Roadmap                  # AI-generated content & status
Task                     # Individual learning steps
Streak                   # Daily activity tracking
Achievement              # User badges and rewards
Notification             # System & milestone alerts
Event                    # Global tech conferences list
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd career-roadmap-app
```

2. **Install dependencies**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# AI Service
cd ../ai_service
pip install -r requirements.txt
```

3. **Database Setup**
```bash
# Configure your PostgreSQL connection in backend/.env
# Then run Prisma migrations
cd backend
npx prisma migrate dev --name init
```

4. **Environment Configuration**
```bash
# Backend .env
cd backend
cp env.example .env

# Configure environment variables
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=career_roadmap
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

5. **Start the application**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: AI Service
cd backend/service
python application.py

# Terminal 3: Frontend
cd frontend
npm start
```

## 📋 Complete Workflow

### 1. **User Registration & Login**
- User creates account or logs in
- Authentication token is generated and stored
- User profile is initialized

### 2. **Career Assessment**
- User clicks "Start Career Assessment"
- AI asks structured questions:
  - **Education**: Grade, department, year
  - **Interests**: Career domains and goals
  - **Skills**: Current and desired skills
  - **Timeline**: Planning days
  - **Contact**: Email and phone for notifications

### 3. **Roadmap Generation**
- AI analyzes user responses
- Generates comprehensive roadmap with:
  - Learning phases and milestones
  - Daily/weekly tasks
  - Resource recommendations
  - Timeline breakdown
- Roadmap is saved to database

### 4. **Progress Tracking**
- User can mark tasks as completed
- Progress percentage is calculated
- Milestone notifications are triggered:
  - Event suggestions
  - Project recommendations
  - Job opening alerts

### 5. **Smart Notifications**
- **Daily reminders** sent via email
- **Milestone notifications** with personalized recommendations
- **Event suggestions** based on user's domain
- **Project recommendations** for skill building
- **Job opening alerts** when user is ready

### 6. **Data Persistence**
- All user data stored in MySQL
- Chat history preserved
- Progress tracked over time
- Notifications logged

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth

### User Management
- `GET /api/user/profile` - Get user profile
- `POST /api/user/save-profile` - Save profile & roadmap
- `GET /api/user/roadmap` - Get user roadmap
- `PUT /api/user/roadmap/progress` - Update progress
- `GET /api/user/progress` - Get progress

### AI Chat
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/chat-history` - Get chat history
- `DELETE /api/ai/chat-history` - Clear chat

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 🎯 Key Features Implementation

### Assessment Questions
```javascript
const assessmentQuestions = [
  {
    id: 'education',
    question: "What's your current education level?",
    type: 'education',
    subQuestions: [
      { key: 'grade', label: 'Grade/Level' },
      { key: 'department', label: 'Department/Major' },
      { key: 'year', label: 'Current Year' }
    ]
  },
  // ... more questions
];
```

### Progress Tracking
```javascript
// Milestone checks
if (progress_percentage >= 40 && progress_percentage < 60) {
  suggestEvents(userId);
} else if (progress_percentage >= 60 && progress_percentage < 80) {
  suggestProjects(userId);
} else if (progress_percentage >= 80) {
  suggestJobOpenings(userId);
}
```

### Email Notifications
```javascript
// Daily reminders
const sendDailyReminders = async () => {
  // Get all active roadmaps
  // Send personalized emails
  // Track notification delivery
};
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variable management

## 📊 Database Design

### User Profiles
- Education details
- Skills inventory
- Career interests
- Contact information
- Planning preferences

### Roadmaps
- AI-generated content
- Progress tracking
- Status management
- Completion history

### Notifications
- Email delivery tracking
- Read status
- Notification types
- User preferences

## 🚀 Deployment

### Production Setup
1. Configure production database
2. Set up email service (Gmail SMTP)
3. Configure environment variables
4. Set up SSL certificates
5. Deploy to cloud platform

### Environment Variables
```bash
# Required for production
NODE_ENV=production
JWT_SECRET=your_production_secret
DB_HOST=your_production_db_host
EMAIL_USER=your_production_email
EMAIL_PASSWORD=your_production_email_password
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**EduRoute AI** - Empowering career growth through AI-driven personalized learning paths! 🚀 
