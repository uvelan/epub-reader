require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);
const bcrypt = require('bcryptjs');

(async () => {
    // 1️⃣  users ---------------------------------------------------------------
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      username    TEXT UNIQUE NOT NULL,
      password    TEXT          NOT NULL,
      created_at  TIMESTAMPTZ    DEFAULT NOW()
    );
  `;

    // 3️⃣  books ---------------------------------------------------------------
    await sql `
    CREATE TABLE IF NOT EXISTS books (
      id          TEXT PRIMARY KEY,  -- or TEXT if you prefer
      title       TEXT NOT NULL,
      cover       TEXT,
      content     JSONB NOT NULL,
      description TEXT,
      chapterId  INT DEFAULT  0,
      sentenceId INT DEFAULT 0     
    );
  `;
});

module.exports = {sql};