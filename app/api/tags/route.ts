import { NextResponse } from 'next/server';
import db from '../../../db';

export async function GET() {
  const tags = db.prepare('SELECT name FROM tags ORDER BY name ASC').all();
  return NextResponse.json(tags.map((t: any) => t.name));
} 