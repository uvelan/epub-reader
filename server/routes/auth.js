// routes/auth.js
require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { sql } = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;          // keep it out of code!
const JWT_TTL    = '1h';                            // adjust as needed

/* -------------------------------------------------------------------- */
/* Helpers                                                              */
/* -------------------------------------------------------------------- */
function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TTL });
}

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.user = decoded;       // put the decoded payload on the request
        return next();
    });
}

/* -------------------------------------------------------------------- */
/* Registration                                                         */
/* -------------------------------------------------------------------- */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'username & password required' });

    try {
        const existing = await sql`
      SELECT 1 FROM users WHERE username = ${username} LIMIT 1
    `;
        if (existing.length)
            return res.status(409).json({ message: 'Username already in use' });

        const hash = await bcrypt.hash(password, 10);
        const [user] = await sql`
      INSERT INTO users (username, password)
      VALUES (${username}, ${hash})
      RETURNING id, username
    `;

        const token = signToken({ sub: user.id, username: user.username });
        return res.status(201).json({ token, user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
    }
});

/* -------------------------------------------------------------------- */
/* Login                                                                */
/* -------------------------------------------------------------------- */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'username & password required' });

    try {
        const [user] = await sql`
      SELECT id, username, password
      FROM users
      WHERE username = ${username}
    `;

        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        const token = signToken({ sub: user.id, username: user.username });
        return res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
    }
});

/* -------------------------------------------------------------------- */
/* Protected example                                                    */
/* -------------------------------------------------------------------- */
router.get('/check-auth', requireAuth, (req, res) => {
    // req.user was set by the middleware
    return res.json({ user: req.user });
});

module.exports = { authRouter: router, requireAuth };
