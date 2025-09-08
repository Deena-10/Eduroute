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
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD8Uye+oI85KtbS\\ncoGjTTdME+CTLGpcyRFzzAODgPZyJEs79jHtyNz1ijbE4IZ71W/+SbkODdgV5Qgy\\nSuLmCDPtV0gx12XOkfNBmxXIWpKJVJ3szdKNK9WX5wPacsjprtuvYRU0e92KLweR\\nITP9uA7myHRLPhf/agcQu9FTGaxHtX3EUx7KRRHuYKV0Q+0J3EffQTS3zFfH5/8a\\nAkV5SrUSUy1sdIRKyC9fNtyGfhgRMv9/tmYJkd/wHCkJRp+xXyJCosRZqkpsZh+z\\nc7pVI8Y/IBYzhWZlSW8uFqaYahZY07/P0f7NuF4iiH+lX/TMkz9GvKXabhGpl6qd\\npBONePnfAgMBAAECggEAP9DMKYM0FfJGuJzrOqDpzlzsnGxMTkEwH8hGTzkLm1yg\\nhn7Cq+/0KkmVhn9+o80ccQS2P96yev8c7pNQBXunnmxHvwtKHU9+ZWZSwQRfMUps\\nUprPmJKwh6WOrO4A8FEgEKAOG+MD6dHxKPxryMyHQEkMWIdQzHFFbi8CRvEkSFIW\\n99CvVuKd1bH4vW1eILS5T8yTpLu7+NjJuz32i+UfTCI0dBwWqhYF6b5FbEbViZCO\\nlykK5SdQ8pFGVBCsmCGhadEBrQ6jTCT8+2k22O7eBf29rEX3ZQXg2wh6qdEPvSPm\\nbLMzz3RW2fnwT+ZFK75gBCILM/U4vNlwVoNFXUqBWQKBgQD/9c5fui0LbQJ1kL07\\n/OINgz9ppC9wGc0dk1KJCDbiLMR4MYeiF3Th+0F1DRfZJnTbxAIfxOuz3LpJTysm\\nq0cox8fLwDsBLU/1Dp3pLzhZ4MUVm8CmYgDgIeO9XA5DSmeHHsoTPK7eH5hipRza\\n4B103F8bpBmZu9tWwgWIQ9qwIwKBgQD8XTROgbkW8wu0Tr5I63LiNP6qoy7tE6y3\\n+o8miQWwT7/IbGMaSzk7My49MWQeA1hW7BFoGuH5M6ydF5xplPS4gvUcnbFSv5l+\\nNdhEzDBa00cBnKuQgRv0pViGMr2g8ycM3WzsGNOne+AH2AzHwZ9zDQ/BAsiajhz+\\nnjNnhhpNFQKBgQC8VMOFgfo0xv+hO19RbS9y29hjxY+1/vYCRezbsPSZFHF3MpJm\\nvLWetP2jv3+FopsnPKCHeaAoFkfnOt44NJxGMEEc9RM1OX70g83CzqC62PyKerCU\\ne9XDFIx6PuqrrmpgbFIpN2Q/QaYhJvYFQhPKcX91WhgQGr43psjlS2/0WwKBgQDZ\\nsjUq+/CEgYi5M6wmDyV9SSXeYQJb9LrrwjK2lUDZBRJ1fDpJNlbaYJ4kn3S0B0Kv\\nSNkDKx1/8TmYEgQVeC9a820qEEYlEa8BFsXHIzUbRGJeW54L+7P36KJisWavbtFi\\n4afSSuBZ/BwX6CGuN7Kqdrv+Tb5qxOjyI9pIFYCeuQKBgEM2+GoDWTMCp9eswhpI\\nix/Jh0nRqmaYCe9hvGKNI2GjHcgjDO12bGZ6GtdiIFBNbn+dHDXOGmhr68YTs+F5\\naW+SjJsSr337fg76sXym1Nv5iOYC7BFzp43PM66PyRNVTfxZMyOGDHWW3i5GZ/0K\\n98VdE6PSUQl95Xx8+p7bp2q4\\n-----END PRIVATE KEY-----\\n"

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
