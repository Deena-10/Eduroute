# EduRoute AI Backend

## Setup Instructions

### 1. Environment Variables
Copy `env.example` to `.env` and fill in your values:
```bash
cp env.example .env
```

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- Firebase service account key (see below)

### 2. Firebase Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Place it in `config/serviceAccountKey.json`

### 3. MongoDB Setup
Make sure MongoDB is running locally or update the MONGO_URI in .env

### 4. Install Dependencies
```bash
npm install
```

### 5. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/google-signin` - Google OAuth

### User Profile
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

## Features
- JWT-based authentication
- Password hashing with bcrypt
- Google OAuth integration
- MongoDB user storage
- CORS enabled for frontend
