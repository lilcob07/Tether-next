import { NextRequest, NextResponse } from 'next/server';
import db from '../../../db';

function getTagsForPost(postId: number) {
  const stmt = db.prepare(`
    SELECT t.name FROM tags t
    JOIN post_tags pt ON pt.tag_id = t.id
    WHERE pt.post_id = ?
  `);
  return stmt.all(postId).map((row: any) => row.name);
}

export async function POST(req: NextRequest) {
  const { query, mode, postId } = await req.json();
  let results: any[] = [];

  // Fuzzy/content search (FTS)
  if (!mode || mode === 'fts') {
    let fts: any[] = [];
    if (query) {
      fts = db.prepare(`SELECT id, content, media_path, created_at, user_id FROM posts_fts JOIN posts ON posts_fts.rowid = posts.id WHERE posts_fts MATCH ? ORDER BY created_at DESC LIMIT 20`).all(query);
    }
    results.push({ mode: 'fts', posts: fts.map((post: any) => ({ ...post, tags: getTagsForPost(post.id) })) });
  }

  // Tag search
  if (!mode || mode === 'tag') {
    let tagPosts: any[] = [];
    if (query) {
      const tagRows = db.prepare(`SELECT id FROM tags WHERE name LIKE ?`).all(`%${query}%`);
      const tagIds = tagRows.map((r: any) => r.id);
      if (tagIds.length) {
        tagPosts = db.prepare(`SELECT DISTINCT p.* FROM posts p JOIN post_tags pt ON pt.post_id = p.id WHERE pt.tag_id IN (${tagIds.map(() => '?').join(',')}) ORDER BY p.created_at DESC LIMIT 20`).all(...tagIds);
      }
    }
    results.push({ mode: 'tag', posts: tagPosts.map((post: any) => ({ ...post, tags: getTagsForPost(post.id) })) });
  }

  // More Like This (by tag/content overlap)
  if ((!mode || mode === 'morelike') && postId) {
    // Get tags for the reference post
    const refTags = getTagsForPost(postId);
    // Find posts with most overlapping tags
    let similarPosts: any[] = [];
    if (refTags.length) {
      similarPosts = db.prepare(`
        SELECT p.*, COUNT(pt.tag_id) as overlap
        FROM posts p
        JOIN post_tags pt ON pt.post_id = p.id
        WHERE pt.tag_id IN (${refTags.map(() => '?').join(',')}) AND p.id != ?
        GROUP BY p.id
        ORDER BY overlap DESC, p.created_at DESC
        LIMIT 20
      `).all(...refTags, postId);
    }
    results.push({ mode: 'morelike', posts: similarPosts.map((post: any) => ({ ...post, tags: getTagsForPost(post.id) })) });
  }

  // Serendipity (random, but with tag or content filter)
  if (!mode || mode === 'serendipity') {
    let serendipityPosts: any[] = [];
    if (query) {
      serendipityPosts = db.prepare(`SELECT * FROM posts WHERE content LIKE ? ORDER BY RANDOM() LIMIT 5`).all(`%${query}%`);
    } else {
      serendipityPosts = db.prepare(`SELECT * FROM posts ORDER BY RANDOM() LIMIT 5`).all();
    }
    results.push({ mode: 'serendipity', posts: serendipityPosts.map((post: any) => ({ ...post, tags: getTagsForPost(post.id) })) });
  }

  // Ensure the requested mode is always present in the results
  if (mode && !results.some(r => r.mode === mode)) {
    results.push({ mode, posts: [] });
  }

  return NextResponse.json(results);
} 