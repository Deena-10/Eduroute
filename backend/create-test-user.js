const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'edurouteai'
});

async function createTestUser() {
  try {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'password123';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const [existingUsers] = await connection.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      console.log('✅ Test user already exists:', existingUsers[0]);
      return;
    }
    
    // Create user
    const [result] = await connection.promise().query(
      'INSERT INTO users (name, email, password, interests, strengths) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, '[]', '[]']
    );
    
    console.log('✅ Test user created successfully!');
    console.log('User ID:', result.insertId);
    console.log('Email:', email);
    console.log('Password:', password);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    connection.end();
  }
}

createTestUser();
