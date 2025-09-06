const mysql = require('mysql2');

// Create connection without database first
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
});

async function setupDatabase() {
  try {
    // Create database if not exists
    await connection.promise().query(`CREATE DATABASE IF NOT EXISTS edurouteai`);
    console.log('✅ Database "edurouteai" created/verified');
    
    // Use the database
    await connection.promise().query(`USE edurouteai`);
    
    // Create users table
    await connection.promise().query(`
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
    console.log('✅ Users table created/verified');
    
    // Create messages table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        sender ENUM('user', 'bot') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Messages table created/verified');
    
    // Create chat_history table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        sender ENUM('user', 'ai') NOT NULL,
        message TEXT NOT NULL,
        engine VARCHAR(50) DEFAULT 'gemini',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Chat History table created/verified');
    
    // Create user_profiles table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        education_grade VARCHAR(100),
        education_department VARCHAR(100),
        education_year VARCHAR(50),
        interests JSON DEFAULT (JSON_ARRAY()),
        skills_learned JSON DEFAULT (JSON_ARRAY()),
        skills_to_learn JSON DEFAULT (JSON_ARRAY()),
        planning_days INT DEFAULT 30,
        email VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ User Profiles table created/verified');
    
    // Create user_roadmaps table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS user_roadmaps (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        roadmap_content TEXT,
        status ENUM('active', 'completed', 'paused') DEFAULT 'active',
        progress_percentage DECIMAL(5,2) DEFAULT 0.00,
        completed_tasks JSON DEFAULT (JSON_ARRAY()),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ User Roadmaps table created/verified');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
  } finally {
    connection.end();
  }
}

setupDatabase();
