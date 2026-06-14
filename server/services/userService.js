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

// קבלת משתמשים לפי סוג (user_type)
export async function getUsersByType(userType) {
    const connection = await pool.getConnection();
    try {
        const [users] = await connection.execute(
            `SELECT id, first_name, last_name, email, phone_number, user_type
             FROM users
             WHERE user_type = ?`,
            [userType]
        );
        return users;
    } catch (error) {
        throw new Error(`Failed to get users by type: ${error.message}`);
    } finally {
        connection.release();
    }
}

export async function getUserById(userId) {
    const connection = await pool.getConnection();
    try {
        const [users] = await connection.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.phone_number, u.user_type, u.profile_picture_url, t.date_of_birth, t.gender
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

/**
 * קבלת רשימת כל המשתמשים עם פרטים מינימליים
 * @returns {Promise<Array>} מערך של אובייקטי משתמשים עם פרטים מינימליים
 */
export async function getAllUsersMinimal() {
    const connection = await pool.getConnection();
    try {
        const [users] = await connection.execute(
            'SELECT id, first_name, last_name, email, user_type FROM users'
        );
        return users;
    } finally {
        connection.release();
    }
}

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

/**
 * יצירת פרופיל מתאמן
 * @param {number} userId - מזהה המשתמש
 * @param {string} date_of_birth - תאריך לידה
 * @param {string} gender - מין
 * @returns {Promise<void>}
 */
export async function createTraineeProfile(userId, date_of_birth, gender) {
    if (!userId) throw new Error('User ID is required');
    // אפשר לעדכן גם אם date_of_birth או gender הם null (כל עוד לפחות אחד מהם סופק)
    if (date_of_birth === undefined && gender === undefined) {
        throw new Error('At least one of date_of_birth or gender is required');
    }
    const connection = await pool.getConnection();
    try {
        // נשתמש ב-INSERT ... ON DUPLICATE KEY UPDATE כדי לאפשר גם עדכון וגם יצירה
        const fields = [];
        const values = [userId];
        const updates = [];
        if (date_of_birth !== undefined) {
            fields.push('date_of_birth');
            values.push(date_of_birth);
            updates.push('date_of_birth = VALUES(date_of_birth)');
        }
        if (gender !== undefined) {
            fields.push('gender');
            values.push(gender);
            updates.push('gender = VALUES(gender)');
        }
        if (fields.length === 0) throw new Error('No fields to update');
        await connection.execute(
            `INSERT INTO trainees (user_id, ${fields.join(', ')}) VALUES (?, ${fields.map(() => '?').join(', ')})
             ON DUPLICATE KEY UPDATE ${updates.join(', ')}`,
            values
        );
    } catch (error) {
        throw new Error(`Failed to create/update trainee profile: ${error.message}`);
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
    if (specialization === undefined) throw new Error('Specialization is required');
    // bio יכול להיות null או undefined
    const connection = await pool.getConnection();
    try {
        // תמיכה גם בעדכון וגם ביצירה
        const fields = ['specialization'];
        const values = [userId, specialization];
        const updates = ['specialization = VALUES(specialization)'];
        if (bio !== undefined) {
            fields.push('bio');
            values.push(bio);
            updates.push('bio = VALUES(bio)');
        }
        await connection.execute(
            `INSERT INTO trainers (user_id, ${fields.join(', ')}) VALUES (?, ${fields.map(() => '?').join(', ')})
             ON DUPLICATE KEY UPDATE ${updates.join(', ')}`,
            values
        );
    } catch (error) {
        throw new Error(`Failed to create/update trainer profile: ${error.message}`);
    } finally {
        connection.release();
    }
}

export async function updateUser(userId, userData) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // --- שלב 1: עדכון טבלת 'users' ---
        const userFieldsToUpdate = {};
        if (userData.first_name !== undefined) userFieldsToUpdate.first_name = userData.first_name;
        if (userData.last_name !== undefined) userFieldsToUpdate.last_name = userData.last_name;
        if (userData.email !== undefined) userFieldsToUpdate.email = userData.email;
        if (userData.phone_number !== undefined) userFieldsToUpdate.phone_number = userData.phone_number || null;
        if (userData.password) {
            userFieldsToUpdate.password_hash = await bcrypt.hash(userData.password, 10);
        }
        if (Object.keys(userFieldsToUpdate).length > 0) {
            const userSetClause = Object.keys(userFieldsToUpdate).map(key => `${key} = ?`).join(', ');
            const userValues = Object.values(userFieldsToUpdate);
            await connection.execute(
                `UPDATE users SET ${userSetClause} WHERE id = ?`,
                [...userValues, userId]
            );
        }
        // --- שלב 2: עדכון פרופיל מתאמן (אם רלוונטי) ---
        if (userData.date_of_birth !== undefined || userData.gender !== undefined) {
            await createTraineeProfile(
                userId,
                userData.date_of_birth !== undefined ? userData.date_of_birth || null : undefined,
                userData.gender !== undefined ? userData.gender || null : undefined
            );
        }
        // --- שלב 3: עדכון פרופיל מאמן (אם רלוונטי) ---
        if (userData.specialization !== undefined || userData.bio !== undefined) {
            await createTrainerProfile(
                userId,
                userData.specialization !== undefined ? userData.specialization : undefined,
                userData.bio !== undefined ? userData.bio : undefined
            );
        }
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        console.error(`Failed to update user in service: ${error.message}`);
        throw new Error(`Failed to update user: ${error.message}`);
    } finally {
        connection.release();
    }
}

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

export async function countUsers() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT COUNT(*) AS count FROM users');
        return rows[0].count;
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

        // --- שלב 1: מחיקת כל התשלומים שקשורים למנויים של המשתמש ---
        const [subscriptions] = await connection.execute('SELECT id FROM user_subscriptions WHERE trainee_id = ?', [userId]);
        if (subscriptions.length > 0) {
            const subIds = subscriptions.map(sub => sub.id);
            await connection.execute(
                `DELETE FROM payments WHERE user_subscription_id IN (${subIds.map(() => '?').join(',')})`,
                subIds
            );
        }
        // --- שלב 2: מחיקת כל התשלומים שקשורים ל-trainee_id (אם יש עמודה כזו)
        try {
            await connection.execute('DELETE FROM payments WHERE trainee_id = ?', [userId]);
        } catch (e) {/* יתעלם אם אין עמודה כזו */}
        // --- שלב 3: מחיקת המנויים ---
        await connection.execute('DELETE FROM user_subscriptions WHERE trainee_id = ?', [userId]);
        await connection.execute('DELETE FROM payments WHERE trainee_id = ?', [userId]);
        await connection.execute('DELETE FROM trainee_programs WHERE trainee_id = ?', [userId]);
        await connection.execute('DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);
        await connection.execute('DELETE FROM trainees WHERE user_id = ?', [userId]);
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

export async function getReceivedMessages(userId) {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            `SELECT m.id, m.message_text, m.sent_at, m.message_type, m.sender_id, u.first_name AS sender_name, u.email AS sender_email
             FROM messages m
             LEFT JOIN users u ON m.sender_id = u.id
             WHERE m.receiver_id = ?
             ORDER BY m.sent_at DESC
             LIMIT 100`,
            [userId]
        );
        return rows;
    } catch (error) {
        throw new Error(`Failed to get received messages: ${error.message}`);
    } finally {
        connection.release();
    }
}