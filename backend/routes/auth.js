const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Simple demo login: matches username/password directly (no hashing).
// In production, use bcrypt + JWT.
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() }).lean();
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // For demo: return user info without token
    return res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple registration endpoint (optional, for future use)
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      password, // NOTE: store hashed password in real apps
      name,
      email
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


