const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
    // Create users table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Create files table
    db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

    db.run(`CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT,
    cover TEXT,
    content TEXT,
    description TEXT
  )`);

    // Create a test user (for demonstration)
    const testUsername = 'testuser';
    const testPassword = 'testpass';
    bcrypt.hash(testPassword, 10, (err, hash) => {
        if (err) throw err;

        db.get('SELECT id FROM users WHERE username = ?', [testUsername], (err, row) => {
            if (err) throw err;

            if (!row) {
                db.run('INSERT INTO users (username, password) VALUES (?, ?)', [testUsername, hash], (err) => {
                    if (err) throw err;
                    console.log('Test user created');
                });
            }
        });
    });
});

module.exports = db;