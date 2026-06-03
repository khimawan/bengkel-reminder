const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/bengkel.db');

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

const initializeDatabase = () => {
  // Create tables sequentially to ensure they exist before checking for admin user
  db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create customers table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      whatsapp TEXT,
      vehicle_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create service_notes table
    db.run(`CREATE TABLE IF NOT EXISTS service_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      note TEXT NOT NULL,
      repair_items TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )`);

    // Create reminders table
    db.run(`CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      service_note_id INTEGER NOT NULL,
      reminder_date DATETIME NOT NULL,
      sent_email BOOLEAN DEFAULT 0,
      sent_whatsapp BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (service_note_id) REFERENCES service_notes(id) ON DELETE CASCADE
    )`);

    // Create default admin user if not exists (after tables are created)
    const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const bcrypt = require('bcryptjs');
    
    db.get('SELECT * FROM users WHERE username = ?', [defaultUsername], (err, user) => {
      if (err) {
        console.error('Error checking for existing admin user:', err.message);
      } else if (!user) {
        const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
          [defaultUsername, hashedPassword], 
          (err) => {
            if (err) {
              console.error('Error creating default admin user:', err.message);
            } else {
              console.log('Default admin user created successfully');
              console.log('Username:', defaultUsername);
              console.log('Password:', defaultPassword);
            }
          }
        );
      } else {
        console.log('Admin user already exists:', defaultUsername);
      }
    });

    console.log('Database tables initialized');
  });
};

module.exports = { db, initializeDatabase };
