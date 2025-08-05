import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'tether.db'));

// Create tables if they don't exist
// Users (for now, just a name; can expand later)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Posts (text, media, user, timestamp)
db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  content TEXT,
  media_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

// Tags (mood, medium, etc.)
db.exec(`
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
`);

// Post <-> Tag many-to-many
db.exec(`
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY(post_id) REFERENCES posts(id),
  FOREIGN KEY(tag_id) REFERENCES tags(id)
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS fresh_tags (
  name TEXT PRIMARY KEY,
  first_used DATETIME DEFAULT CURRENT_TIMESTAMP,
  usage_count INTEGER DEFAULT 1
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS tag_relations (
  tag1 TEXT,
  tag2 TEXT,
  count INTEGER DEFAULT 1,
  PRIMARY KEY (tag1, tag2)
);
`);

db.exec(`
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(content, content='posts', content_rowid='id');
`);

db.exec(`
CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, content) VALUES (new.id, new.content);
END;
`);

db.exec(`
CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, content) VALUES('delete', old.id, old.content);
END;
`);

db.exec(`
CREATE TRIGGER IF NOT EXISTS posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, content) VALUES('delete', old.id, old.content);
  INSERT INTO posts_fts(rowid, content) VALUES (new.id, new.content);
END;
`);

export default db;