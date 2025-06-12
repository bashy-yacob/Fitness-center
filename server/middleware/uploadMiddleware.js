// middleware/uploadMiddleware.js (חזרה לגרסה המקורית)

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  // הגדרת שם הקובץ: נשתמש ב-ID של המשתמש כדי להבטיח ייחודיות
  filename: function (req, file, cb) {
    // ודא ש-req.user קיים לפני שאתה ניגש אליו
    if (!req.user || !req.user.id) {
        // אם אין משתמש, נזרוק שגיאה ש-multer יתפוס
        return cb(new Error('Authentication error: User not found in request for filename generation.'));
    }
    const userId = req.user.id; 
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `user_${userId}_${Date.now()}${fileExtension}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, JPEG & PNG images are allowed.'), false);
    }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

export default upload;