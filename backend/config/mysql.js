const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'edurouteai'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ MySQL Connected');

  // Create users table if not exists
  connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      googleId VARCHAR(255) DEFAULT NULL,
      profilePicture VARCHAR(255) DEFAULT NULL,
      interests JSON DEFAULT (JSON_ARRAY()),
      strengths JSON DEFAULT (JSON_ARRAY()),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Create messages table if not exists
  connection.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNSIGNED NOT NULL,
      sender ENUM('user', 'bot') NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
});

module.exports = connection;
