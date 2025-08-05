import { NextRequest, NextResponse } from 'next/server';
import db from '../../../db';

// Helper to get tags for a post
function getTagsForPost(postId: number) {
  const stmt = db.prepare(`
    SELECT t.name FROM tags t
    JOIN post_tags pt ON pt.tag_id = t.id
    WHERE pt.post_id = ?
  `);
  return stmt.all(postId).map((row: any) => row.name);
}

export async function GET() {
  // Fetch posts with tags, newest first
  const posts = db.prepare(`SELECT * FROM posts ORDER BY created_at DESC LIMIT 20`).all();
  const result = posts.map((post: any) => ({
    ...post,
    tags: getTagsForPost(post.id),
  }));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { user, content, media_path, tags } = data;
  // Look up or create user
  let user_id: number | undefined;
  if (user) {
    let row = db.prepare('SELECT id FROM users WHERE name = ?').get(user) as any;
    if (!row) {
      const info = db.prepare('INSERT INTO users (name) VALUES (?)').run(user);
      user_id = info.lastInsertRowid as number;
    } else {
      user_id = row.id;
    }
  } else {
    user_id = undefined;
  }
  // Insert post
  const postStmt = db.prepare(`INSERT INTO posts (user_id, content, media_path) VALUES (?, ?, ?)`);
  const info = postStmt.run(user_id, content, media_path);
  const postId = info.lastInsertRowid as number;
  // Insert tags (if new)
  if (Array.isArray(tags)) {
    for (const tag of tags) {
      let tagId: number;
      try {
        const tagInfo = db.prepare(`INSERT INTO tags (name) VALUES (?)`).run(tag);
        tagId = tagInfo.lastInsertRowid as number;
        // Add to fresh_tags
        db.prepare(`INSERT INTO fresh_tags (name, usage_count) VALUES (?, 1) ON CONFLICT(name) DO UPDATE SET usage_count = usage_count + 1`).run(tag);
      } catch {
        // Tag exists
        const tagRow = db.prepare(`SELECT id FROM tags WHERE name = ?`).get(tag) as any;
        tagId = tagRow?.id;
        // If tag is still fresh, increment usage_count
        const fresh = db.prepare(`SELECT usage_count FROM fresh_tags WHERE name = ?`).get(tag) as any;
        if (fresh && fresh.usage_count < 3) {
          db.prepare(`UPDATE fresh_tags SET usage_count = usage_count + 1 WHERE name = ?`).run(tag);
        }
      }
      if (tagId) {
        db.prepare(`INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)`).run(postId, tagId);
      }
    }
  }
  // After all tags are inserted, update tag_relations for co-occurrence
  if (Array.isArray(tags) && tags.length > 1) {
    for (let i = 0; i < tags.length; i++) {
      for (let j = i + 1; j < tags.length; j++) {
        const t1 = tags[i];
        const t2 = tags[j];
        // Always store pairs in sorted order to avoid duplicates
        const [tagA, tagB] = [t1, t2].sort();
        db.prepare(`INSERT INTO tag_relations (tag1, tag2, count) VALUES (?, ?, 1) ON CONFLICT(tag1, tag2) DO UPDATE SET count = count + 1`).run(tagA, tagB);
      }
    }
  }
  return NextResponse.json({ success: true, post_id: postId });
} 