import { NextResponse } from 'next/server';
import db from '../../../db';

export async function GET() {
  const tags = db.prepare(`SELECT name FROM fresh_tags WHERE usage_count < 3 ORDER BY first_used DESC LIMIT 12`).all();
  return NextResponse.json(tags.map((t: any) => t.name));
} 