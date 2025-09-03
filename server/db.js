import Database from 'better-sqlite3';
import dotenv from 'dotenv';
dotenv.config();

const dbPath = process.env.DB_PATH || './data.db';
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name  TEXT NOT NULL,
  phone      TEXT NOT NULL,
  email      TEXT,
  account_type TEXT,
  has_single_address INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
`);

export default db;
