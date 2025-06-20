const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret_key'; // In production, use environment variable
// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ token, user: { id: user.id, username: user.username } });
        });
    });
});

// Protected route example
router.get('/check-auth', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        res.json({ user: decoded });
    });
});

module.exports = router;