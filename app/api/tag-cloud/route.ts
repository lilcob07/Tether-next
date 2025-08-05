import { NextResponse } from 'next/server';
import db from '../../../db';

export async function GET() {
  const tags = db.prepare(`
    SELECT t.name, COUNT(pt.post_id) as count
    FROM tags t
    LEFT JOIN post_tags pt ON pt.tag_id = t.id
    GROUP BY t.id
    ORDER BY count DESC, t.name ASC
  `).all();
  return NextResponse.json(tags);
} 