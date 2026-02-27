require("dotenv").config();

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTables() {
  try {
    // 1️⃣ users ---------------------------------------------------------------
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        username    TEXT UNIQUE NOT NULL,
        password    TEXT          NOT NULL,
        created_at  TIMESTAMPTZ    DEFAULT NOW()
      );
    `);
    console.log("Users table created or already exists.");

    // 2️⃣ books ---------------------------------------------------------------
    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id          TEXT PRIMARY KEY,  -- or TEXT if you prefer
        title       TEXT NOT NULL,
        cover       TEXT,
        content     JSONB NOT NULL,
        description TEXT,
        chapterId  INT DEFAULT  0,
        sentenceId INT DEFAULT 0     
      );
    `);
    console.log("Books table created or already exists.");
  } catch (err) {
    console.error("Error creating tables", err);
  }
}

createTables();

// To retain compatibility, export a function that acts like the neon sql function
// While not perfectly identical to how neon returns things, it allows basic
// query operations to pass through. 
const sql = async (strings, ...values) => {
  if (typeof strings === 'string') {
    const res = await pool.query(strings, values);
    return res.rows;
  }

  // Tagged template literal support
  const query = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '');
  const res = await pool.query(query, values);
  return res.rows;
};

module.exports = { sql, pool };