// services/authService.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userService from './userService.js';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// פונקציית הרשמה למשתמש חדש
export async function register(userData) {
    const connection = await pool.getConnection();

    try {
        // בדוק אם המייל קיים
        const existingUser = await userService.findUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // הצפן סיסמה
        const password_hash = await bcrypt.hash(userData.password, 10);

        // התחל טרנזקציה
        await connection.beginTransaction();

        try {
            // צור משתמש בסיסי
            const userId = await userService.createUser(userData);

            // שמור פרטי התחברות
            await userService.saveUserCredentials(userId, password_hash);

            // צור פרופיל ספציפי
            if (userData.user_type === 'trainee') {
                await userService.createTraineeProfile(userId, userData.date_of_birth, userData.gender);
            } else if (userData.user_type === 'trainer') {
                await userService.createTrainerProfile(userId, userData.specialization, userData.bio);
            }

            await connection.commit();

            // החזר פרטי משתמש
            return await userService.getUserById(userId);

        } catch (error) {
            await connection.rollback();
            throw error;
        }
    } finally {
        connection.release();
    }
}

// פונקציית התחברות למשתמש קיים
export async function login(email, password) {
    // קבל פרטי משתמש כולל סיסמה מוצפנת
    const user = await userService.getUserWithCredentials(email);

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // בדוק סיסמה
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    const token = jwt.sign(
        // האובייקט הראשון - הפרטים שיהיו מוצפנים בתוך הטוקן (payload)
        {
            id: user.id,           // מזהה המשתמש - נשמר בטוקן לזיהוי מהיר
            user_type: user.user_type,  // סוג המשתמש (trainee/trainer) - לבדיקת הרשאות
            email: user.email      // אימייל - מידע נוסף שימושי
        },
        // הפרמטר השני - המפתח הסודי שאיתו מצפינים את הטוקן
        JWT_SECRET,  // מגיע מ-process.env.JWT_SECRET או ערך ברירת מחדל
        // הפרמטר השלישי - אפשרויות נוספות
        {
            expiresIn: '1h'  // הטוקן יפוג תוקף אחרי שעה
        }
    );

    // הסר סיסמה מוצפנת מהאובייקט
    delete user.password_hash;

    return { token, user };
}