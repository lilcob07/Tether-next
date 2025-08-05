import { NextRequest, NextResponse } from 'next/server';
import db from '../../../db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const tag = searchParams.get('tag');
  if (!tag) return NextResponse.json([]);
  // Find related tags (either as tag1 or tag2)
  const rows = db.prepare(`
    SELECT CASE WHEN tag1 = ? THEN tag2 ELSE tag1 END as related, count
    FROM tag_relations
    WHERE tag1 = ? OR tag2 = ?
    ORDER BY count DESC, related ASC
    LIMIT 8
  `).all(tag, tag, tag);
  return NextResponse.json(rows.map((r: any) => r.related));
} 