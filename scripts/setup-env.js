const fs = require("fs");
const path = require("path");

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=edurouteai
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=upteduroute
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@upteduroute.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"

# AI Service Configuration
AI_SERVICE_URL=http://localhost:5001

# AI API Keys (Replace with your actual keys)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
HF_API_KEY=your_huggingface_api_key_here
`;

try {
  fs.writeFileSync(path.join(__dirname, ".env"), envContent);
  console.log("✅ .env file created successfully with Firebase configuration");
} catch (error) {
  console.error("❌ Error creating .env file:", error.message);
}
