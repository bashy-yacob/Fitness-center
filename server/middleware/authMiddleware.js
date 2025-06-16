
import jwt from 'jsonwebtoken';

// חשוב להשתמש באותו מפתח סודי כמו בקובץ authService
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; 

const verifyToken = (req, res, next) => {
  // קבלת הטוקן מה-Header. נהוג להוסיף 'Bearer ' לפני הטוקן.
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  const token = authHeader.split(' ')[1]; // חילוץ הטוקן עצמו

  try {
    // פענוח הטוקן. חשוב להשתמש באותו מפתח סודי
    const decoded = jwt.verify(token, JWT_SECRET);

    // שמירת כל המידע המפוענח מהטוקן לתוך אובייקט req.user
    // כך יהיה לנו גישה גם ל-id וגם ל-user_type
    req.user = decoded; 
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  // עכשיו req.user קיים ויש לו את המידע מהטוקן
  if (req.user && req.user.user_type === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

const isTrainer = (req, res, next) => {
  if (req.user && req.user.user_type === 'trainer') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Trainer access required' });
  }
};

const isTrainee = (req, res, next) => {
  if (req.user && req.user.user_type === 'trainee') {
    next();
  } else {
    return res.status(403).json({ error: 'Forbidden: Trainee access required' });
  }
};

export { verifyToken, isAdmin, isTrainer, isTrainee };