import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists
export const UPLOADS_FOLDER = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

// Storage configuration
export const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

export const upload = multer({ storage });
