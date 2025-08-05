import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  return new Promise((resolve, reject) => {
    upload.single('file')(req as any, {} as any, (err: any) => {
      if (err) {
        resolve(NextResponse.json({ error: 'Upload failed' }, { status: 500 }));
      } else {
        // @ts-ignore
        const file = req.file;
        resolve(NextResponse.json({ path: '/uploads/' + file.filename }));
      }
    });
  });
} 