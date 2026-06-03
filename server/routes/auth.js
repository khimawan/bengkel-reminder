const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt for username:', username);

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Database error during login:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found, comparing password...');
    const isMatch = bcrypt.compareSync(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', username);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  });
});

// Verify token
router.get('/verify', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// Reset admin password (development only)
router.post('/reset-admin', (req, res) => {
  const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const hashedPassword = bcrypt.hashSync(defaultPassword, 10);
  
  db.run('UPDATE users SET password = ? WHERE username = ?', 
    [hashedPassword, defaultUsername], 
    function(err) {
      if (err) {
        console.error('Error resetting admin password:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (this.changes === 0) {
        // User doesn't exist, create it
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
          [defaultUsername, hashedPassword], 
          (err) => {
            if (err) {
              console.error('Error creating admin user:', err);
              return res.status(500).json({ message: 'Database error' });
            }
            console.log('Admin user created with password reset');
            res.json({ message: 'Admin user created successfully', username: defaultUsername, password: defaultPassword });
          }
        );
      } else {
        console.log('Admin password reset successfully');
        res.json({ message: 'Admin password reset successfully', username: defaultUsername, password: defaultPassword });
      }
    }
  );
});

// Forgot password - bypass login for development
router.post('/forgot-password', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Database error during forgot password:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a temporary token for bypass
    const token = jwt.sign(
      { id: user.id, username: user.username, bypass: true },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    console.log('Bypass login generated for:', username);
    res.json({
      message: 'Password reset successful. You can now login.',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  });
});

module.exports = router;
