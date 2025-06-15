// services/userService.js
import pool from '../config/db.js';
import { hashPassword } from '../utils/authUtils.js'; // ייבוא לפעולות עדכון סיסמה
export async function getAttendedClassesCount(userId) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) AS count FROM class_registrations WHERE trainee_id = ? AND status = "attended"',
            [userId]
        );
        return rows[0].count;
    } catch (error) {
        throw new Error(`Failed to get attended classes count: ${error.message}`);
    } finally {
        connection.release();
    }
}

export async function getActiveSubscription(userId) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            `SELECT s.name AS subscription_name, us.end_date
             FROM user_subscriptions us
             JOIN subscriptions s ON us.subscription_id = s.id
             WHERE us.trainee_id = ? AND us.is_active = TRUE
             AND us.end_date >= CURDATE()
             ORDER BY us.end_date ASC
             LIMIT 1`,
            [userId]
        );
        return rows[0] || null;
    } catch (error) {
        throw new Error(`Failed to get active subscription: ${error.message}`);
    } finally {
        connection.release();
    }
}
//#region Database Operations
/**
 * בדיקה האם משתמש קיים לפי אימייל
 * @param {string} email - כתובת האימייל לחיפוש
 * @returns {Promise<Object|null>} אובייקט המשתמש אם נמצא, או null אם לא נמצא
 */
export async function findUserByEmail(email) {
    if (!email) {
        throw new Error('Email is required');
    }

    const connection = await pool.getConnection();
    try {
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        return users[0];
    } catch (error) {
        throw new Error(`Failed to find user: ${error.message}`);
    } finally {
        connection.release();
    }
}
//#endregion

//#region User Creation
/**
 * יצירת משתמש חדש
 * @param {Object} userData - נתוני המשתמש
 * @param {string} userData.first_name - שם פרטי
 * @param {string} userData.last_name - שם משפחה
 * @param {string} userData.email - כתובת אימייל
 * @param {string} userData.phone_number - מספר טלפון
 * @param {string} userData.user_type - סוג משתמש
 * @returns {Promise<number>} ID של המשתמש החדש
 */
export async function createUser(userData) {
    const { first_name, last_name, email, phone_number, user_type } = userData;
    
    // בדיקת תקינות השדות
    if (!first_name) throw new Error('First name is required');
    if (!last_name) throw new Error('Last name is required');
    if (!email) throw new Error('Email is required');
    if (!phone_number) throw new Error('Phone number is required');
    if (!user_type) throw new Error('User type is required');

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `INSERT INTO users (first_name, last_name, email, phone_number, user_type) 
             VALUES (?, ?, ?, ?, ?)`,
            [first_name, last_name, email, phone_number, user_type]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(`Failed to create user: ${error.message}`);
    } finally {
        connection.release();
    }
}
//#endregion

//#region User Authentication
/**
 * שמירת פרטי התחברות
 * @param {number} userId - מזהה המשתמש
 * @param {string} password_hash - הסיסמה המוצפנת
 * @returns {Promise<void>}
 */
export async function saveUserCredentials(userId, password_hash) {
    if (!userId) throw new Error('User ID is required');
    if (!password_hash) throw new Error('Password hash is required');

    const connection = await pool.getConnection();
    try {
        await connection.execute(
            `INSERT INTO user_credentials (user_id, password_hash) 
             VALUES (?, ?)`,
            [userId, password_hash]
        );
    } catch (error) {
        throw new Error(`Failed to save user credentials: ${error.message}`);
    } finally {
        connection.release();
    }
}
//#endregion

//#region Profile Management
/**
 * יצירת פרופיל מתאמן
 * @param {number} userId - מזהה המשתמש
 * @param {string} date_of_birth - תאריך לידה
 * @param {string} gender - מין
 * @returns {Promise<void>}
 */
export async function createTraineeProfile(userId, date_of_birth, gender) {
    if (!userId) throw new Error('User ID is required');
    if (!date_of_birth) throw new Error('Date of birth is required');
    if (!gender) throw new Error('Gender is required');

    const connection = await pool.getConnection();
    try {
        await connection.execute(
            `INSERT INTO trainees (user_id, date_of_birth, gender) 
             VALUES (?, ?, ?)`,
            [userId, date_of_birth, gender]
        );
    } catch (error) {
        throw new Error(`Failed to create trainee profile: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * יצירת פרופיל מאמן
 * @param {number} userId - מזהה המשתמש
 * @param {string} specialization - התמחות
 * @param {string} bio - תיאור אישי
 * @returns {Promise<void>}
 */
export async function createTrainerProfile(userId, specialization, bio) {
    if (!userId) throw new Error('User ID is required');
    if (!specialization) throw new Error('Specialization is required');
    // bio יכול להיות אופציונלי, אז לא נבדוק אותו

    const connection = await pool.getConnection();
    try {
        await connection.execute(
            `INSERT INTO trainers (user_id, specialization, bio) 
             VALUES (?, ?, ?)`,
            [userId, specialization, bio]
        );
    } catch (error) {
        throw new Error(`Failed to create trainer profile: ${error.message}`);
    } finally {
        connection.release();
    }
}
//#endregion

//#region User Retrieval
/**
 * קבלת פרטי משתמש מלאים
 * @param {string} email - כתובת האימייל של המשתמש
 * @returns {Promise<Object>} אובייקט המשתמש המלא כולל הסיסמה המוצפנת
 */
export async function getUserWithCredentials(email) {
    if (!email) {
        throw new Error('Email is required');
    }

    const connection = await pool.getConnection();
    try {
        const [users] = await connection.execute(
            `SELECT u.*, uc.password_hash 
             FROM users u 
             JOIN user_credentials uc ON u.id = uc.user_id 
             WHERE u.email = ?`,
            [email]
        );

        if (!users.length) {
            throw new Error('User not found');
        }

        return users[0];
    } catch (error) {
        throw new Error(`Failed to get user: ${error.message}`);
    } finally {
        connection.release();
    }
}
//#endregion

//#region Class Schedule
/**
 * מביא את כל החוגים של המשתמש לפי תאריכים
 * @param {number} userId - מזהה המשתמש
 * @param {Date} startDate - תאריך התחלה (אופציונלי)
 * @param {Date} endDate - תאריך סיום (אופציונלי)
 * @returns {Promise<Array>} רשימת החוגים של המשתמש
 */
export async function getUserClassSchedule(userId, startDate = null, endDate = null) {
    if (!userId) throw new Error('User ID is required');

    const connection = await pool.getConnection();
    try {
        let query = `
            SELECT 
                c.*,
                r.name as room_name,
                r.capacity as room_capacity,
                u.first_name as trainer_first_name,
                u.last_name as trainer_last_name,
                cr.status as registration_status
            FROM classes c
            INNER JOIN class_registrations cr ON c.id = cr.class_id
            INNER JOIN rooms r ON c.room_id = r.id
            INNER JOIN trainers t ON c.trainer_id = t.user_id
            INNER JOIN users u ON t.user_id = u.id
            WHERE cr.trainee_id = ?
            AND c.is_active = TRUE`;

        const params = [userId];

        // הוספת סינון לפי תאריכים אם סופקו
        if (startDate) {
            query += ' AND c.start_time >= ?';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND c.end_time <= ?';
            params.push(endDate);
        }

        // מיון לפי תאריך ושעה
        query += ' ORDER BY c.start_time ASC';

        const [classes] = await connection.execute(query, params);
        
        // עיבוד התוצאות לפורמט נוח יותר
        return classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            description: cls.description,
            startTime: cls.start_time,
            endTime: cls.end_time,
            room: {
                name: cls.room_name,
                capacity: cls.room_capacity
            },
            trainer: {
                fullName: `${cls.trainer_first_name} ${cls.trainer_last_name}`
            },
            maxCapacity: cls.max_capacity,
            status: cls.registration_status
        }));
    } catch (error) {
        throw new Error(`Failed to get user class schedule: ${error.message}`);
    } finally {
        connection.release();
    }
}
//#endregion


/**
 * קבלת רשימת כל המשתמשים
 * @returns {Promise<Array>} מערך של אובייקטי משתמשים
 */
export async function getAllUsers() {
    const connection = await pool.getConnection();
    try {
        const [users] = await connection.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.phone_number, u.user_type, u.profile_picture_url,
                    t.date_of_birth, t.gender,
                    tr.specialization, tr.bio
             FROM users u
             LEFT JOIN trainees t ON u.id = t.user_id
             LEFT JOIN trainers tr ON u.id = tr.user_id
             ORDER BY u.created_at DESC`
        );
        return users;
    } catch (error) {
        throw new Error(`Failed to get all users: ${error.message}`);
    } finally {
        connection.release();
    }
}


/**
 * מחיקת משתמש
 * @param {number} userId - מזהה המשתמש למחיקה
 * @returns {Promise<boolean>} true אם המחיקה בוצעה בהצלחה, false אחרת
 */
export async function deleteUser(userId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // חשוב למחוק בסדר הנכון עקב תלות במפתחות זרים
        await connection.execute('DELETE FROM class_registrations WHERE trainee_id = ?', [userId]);
        await connection.execute('DELETE FROM user_subscriptions WHERE trainee_id = ?', [userId]);
        await connection.execute('DELETE FROM payments WHERE trainee_id = ?', [userId]);
        await connection.execute('DELETE FROM trainee_programs WHERE trainee_id = ?', [userId]);
        await connection.execute('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);
        await connection.execute('DELETE FROM trainees WHERE user_id = ?', [userId]);
        // אם המשתמש הוא מאמן, נצטרך לטפל בחוגים שהוא יצר
        // כרגע נניח שאנחנו לא מאפשרים מחיקת מאמן שיש לו חוגים פעילים.
        // אם מאמן נמחק, יש לשקול מה קורה לחוגים שלו: האם מוחקים אותם? מעבירים למאמן אחר?
        // לדוגמה, נוכל להגדיר ON DELETE SET NULL בטבלת classes עבור trainer_id.
        // כרגע נמחק גם את פרופיל המאמן
        await connection.execute('DELETE FROM trainers WHERE user_id = ?', [userId]);
        await connection.execute('DELETE FROM user_credentials WHERE user_id = ?', [userId]);
        const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to delete user: ${error.message}`);
    } finally {
        connection.release();
    }
}

// פונקציה שכנראה כבר קיימת אצלך ומעודכנת
export async function getUserById(userId) {
    const connection = await pool.getConnection();
    try {
        const [users] = await connection.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.phone_number, u.user_type, t.date_of_birth, t.gender
             FROM users u
             LEFT JOIN trainees t ON u.id = t.user_id
             WHERE u.id = ?`,
            [userId]
        );
        // נחזיר null אם המשתמש לא נמצא
        if (users.length === 0) {
            return null;
        }
        // ננקה את הנתונים לפני החזרה
        const user = users[0];
        // נמיר את הסיסמה כדי שלא תישלח בטעות לקליינט
        delete user.password_hash; 
        return user;

    } catch (error) {
        console.error(`Failed to get user by ID: ${error.message}`);
        throw error;
    } finally {
        connection.release();
    }
}

// --- פונקציית העדכון המתוקנת והחסינה ---
export async function updateUser(userId, userData) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // --- שלב 1: עדכון טבלת 'users' ---
        const userFieldsToUpdate = {};
        if (userData.first_name !== undefined) userFieldsToUpdate.first_name = userData.first_name;
        if (userData.last_name !== undefined) userFieldsToUpdate.last_name = userData.last_name;
        if (userData.email !== undefined) userFieldsToUpdate.email = userData.email;
        // נמיר מחרוזת ריקה ל-null כדי שזה יתאים למסד הנתונים
        if (userData.phone_number !== undefined) userFieldsToUpdate.phone_number = userData.phone_number || null;
        
        // עדכון סיסמה רק אם סופקה
        if (userData.password) {
            userFieldsToUpdate.password_hash = await bcrypt.hash(userData.password, 10);
        }

        // אם יש מה לעדכן בטבלת users, נבצע את העדכון
        if (Object.keys(userFieldsToUpdate).length > 0) {
            const userSetClause = Object.keys(userFieldsToUpdate).map(key => `${key} = ?`).join(', ');
            const userValues = Object.values(userFieldsToUpdate);
            
            await connection.execute(
                `UPDATE users SET ${userSetClause} WHERE id = ?`,
                [...userValues, userId]
            );
        }

        // --- שלב 2: עדכון טבלת 'trainees' (אם רלוונטי) ---
        const traineeFieldsToUpdate = {};
        if (userData.date_of_birth !== undefined) traineeFieldsToUpdate.date_of_birth = userData.date_of_birth || null;
        if (userData.gender !== undefined) traineeFieldsToUpdate.gender = userData.gender || null;
        
        // אם יש מה לעדכן בטבלת trainees
        if (Object.keys(traineeFieldsToUpdate).length > 0) {
             const traineeSetClause = Object.keys(traineeFieldsToUpdate).map(key => `${key} = ?`).join(', ');
             const traineeValues = Object.values(traineeFieldsToUpdate);

             // נשתמש ב-INSERT ... ON DUPLICATE KEY UPDATE.
             // זה יצור רשומה אם היא לא קיימת (למשל, למשתמש חדש) או יעדכן אותה אם היא קיימת.
             await connection.execute(
                `INSERT INTO trainees (user_id, ${Object.keys(traineeFieldsToUpdate).join(', ')})
                 VALUES (?, ${'?'.repeat(traineeValues.length).split('').join(', ')})
                 ON DUPLICATE KEY UPDATE ${traineeSetClause}`,
                 [userId, ...traineeValues, ...traineeValues]
             );
        }

        await connection.commit();
        return true; // העדכון הצליח

    } catch (error) {
        await connection.rollback();
        // נספק הודעת שגיאה ברורה יותר
        console.error(`Failed to update user in service: ${error.message}`);
        throw new Error(`Failed to update user: ${error.message}`);
    } finally {
        connection.release();
    }
}

// services/userService.js - הוסף את הפונקציה הבאה

export async function updateUserProfilePicture(userId, pictureUrl) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `UPDATE users SET profile_picture_url = ? WHERE id = ?`,
            [pictureUrl, userId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to update profile picture: ${error.message}`);
    } finally {
        connection.release();
    }
}