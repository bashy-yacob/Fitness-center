// services/classService.js
import pool from '../config/db.js';

/**
 * יצירת חוג חדש
 * @param {Object} classData - נתוני החוג
 * @returns {Promise<number>} ID של החוג החדש
 */
export async function createClass(classData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `INSERT INTO classes (name, description, start_time, end_time, room_id, trainer_id, max_capacity)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                classData.name,
                classData.description,
                classData.start_time,
                classData.end_time,
                classData.room_id,
                classData.trainer_id,
                classData.max_capacity
            ]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(`Failed to create class: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת חוג לפי ID
 * @param {number} classId - מזהה החוג
 * @returns {Promise<Object|null>} אובייקט החוג אם נמצא, או null
 */
export async function getClassById(classId) {
    const connection = await pool.getConnection();
    try {
        const [classes] = await connection.execute(
            `SELECT c.*, r.name AS room_name, r.capacity AS room_capacity,
                    u.first_name AS trainer_first_name, u.last_name AS trainer_last_name
             FROM classes c
             INNER JOIN rooms r ON c.room_id = r.id
             INNER JOIN users u ON c.trainer_id = u.id
             WHERE c.id = ?`,
            [classId]
        );
        return classes[0] || null;
    } catch (error) {
        throw new Error(`Failed to get class by ID: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת כל החוגים (אפשרות לסינון עתידי)
 * @returns {Promise<Array>} מערך של אובייקטי חוגים
 */
export async function getAllClasses() {
    const connection = await pool.getConnection();
    try {
        const [classes] = await connection.execute(
            `SELECT c.*, r.name AS room_name, r.capacity AS room_capacity,
                    u.first_name AS trainer_first_name, u.last_name AS trainer_last_name
             FROM classes c
             INNER JOIN rooms r ON c.room_id = r.id
             INNER JOIN users u ON c.trainer_id = u.id
             ORDER BY c.start_time ASC`
        );
        return classes;
    } catch (error) {
        throw new Error(`Failed to get all classes: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * עדכון חוג קיים
 * @param {number} classId - מזהה החוג לעדכון
 * @param {Object} classData - נתוני החוג לעדכון
 * @returns {Promise<boolean>} true אם העדכון בוצע, false אחרת
 */
export async function updateClass(classId, classData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `UPDATE classes SET name = ?, description = ?, start_time = ?, end_time = ?, room_id = ?, trainer_id = ?, max_capacity = ?, is_active = ?
             WHERE id = ?`,
            [
                classData.name,
                classData.description,
                classData.start_time,
                classData.end_time,
                classData.room_id,
                classData.trainer_id,
                classData.max_capacity,
                classData.is_active,
                classId
            ]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to update class: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * מחיקת חוג
 * @param {number} classId - מזהה החוג למחיקה
 * @returns {Promise<boolean>} true אם המחיקה בוצעה, false אחרת
 */
export async function deleteClass(classId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // יש למחוק רישומים לחוג לפני מחיקת החוג עצמו
        await connection.execute('DELETE FROM class_registrations WHERE class_id = ?', [classId]);
        const [result] = await connection.execute('DELETE FROM classes WHERE id = ?', [classId]);
        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to delete class: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * רישום מתאמן לחוג
 * @param {number} traineeId - מזהה המתאמן
 * @param {number} classId - מזהה החוג
 * @returns {Promise<number>} ID של הרישום החדש
 */
// services/classService.js

export async function registerForClass(traineeId, classId) {
    const connection = await pool.getConnection();
    try {
        // 1. בדיקה ראשונה (חדשה): האם המתאמן הספציפי הזה כבר רשום?
        // זו צריכה להיות הבדיקה הראשונה כי היא ספציפית יותר.
        const [existingRegistration] = await connection.execute(
            'SELECT id FROM class_registrations WHERE trainee_id = ? AND class_id = ?', 
            [traineeId, classId]
        );
        if (existingRegistration.length > 0) {
            throw new Error('Trainee already registered for this class');
        }

        // 2. בדיקה שנייה: אם המתאמן לא רשום, נבדוק אם יש מקום בחוג.
        const [classInfo] = await connection.execute('SELECT max_capacity FROM classes WHERE id = ?', [classId]);
        if (!classInfo[0]) {
            throw new Error('Class not found');
        }

        const [currentRegistrations] = await connection.execute('SELECT COUNT(*) AS count FROM class_registrations WHERE class_id = ?', [classId]);
        if (currentRegistrations[0].count >= classInfo[0].max_capacity) {
            throw new Error('Class is full');
        }

        // 3. אם כל הבדיקות עברו, בצע את הרישום
        const [result] = await connection.execute(
            `INSERT INTO class_registrations (trainee_id, class_id) VALUES (?, ?)`,
            [traineeId, classId]
        );
        return result.insertId;
        
    } catch (error) {
        // שינוי קטן כאן כדי שההודעה מה-throw תעבור הלאה בצורה נקייה יותר
        throw new Error(`Failed to register for class: ${error.message}`);
    } finally {
        connection.release();
    }
}
/**
 * ביטול רישום מתאמן מחוג
 * @param {number} traineeId - מזהה המתאמן
 * @param {number} classId - מזהה החוג
 * @returns {Promise<boolean>} true אם הביטול בוצע, false אחרת
 */
export async function unregisterFromClass(traineeId, classId) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `DELETE FROM class_registrations WHERE trainee_id = ? AND class_id = ?`,
            [traineeId, classId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to unregister from class: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת רשימת מתאמנים בחוג
 * @param {number} classId - מזהה החוג
 * @returns {Promise<Array>} מערך של אובייקטי מתאמנים
 */
export async function getClassRegistrations(classId) {
    const connection = await pool.getConnection();
    try {
        const [registrations] = await connection.execute(
            `SELECT u.id AS trainee_id, u.first_name, u.last_name, u.email, cr.registered_at
             FROM class_registrations cr
             INNER JOIN users u ON cr.trainee_id = u.id
             WHERE cr.class_id = ?`,
            [classId]
        );
        return registrations;
    } catch (error) {
        throw new Error(`Failed to get class registrations: ${error.message}`);
    } finally {
        connection.release();
    }
}
// services/classService.js - הוסף את הפונקציה הבאה לקובץ

/**
 * קבלת כל החוגים שמתאמן ספציפי רשום אליהם
 * @param {number} traineeId - מזהה המתאמן
 * @returns {Promise<Array>} מערך של אובייקטי חוגים
 */
export async function getRegisteredClassesForUser(traineeId) {
    const connection = await pool.getConnection();
    try {
        // שאילתה שמצטרפת לטבלת הרישומים כדי למצוא את החוגים של המשתמש
        const [classes] = await connection.execute(
            `SELECT c.*, r.name AS room_name, u.first_name AS trainer_first_name, u.last_name AS trainer_last_name
             FROM classes c
             INNER JOIN class_registrations cr ON c.id = cr.class_id
             INNER JOIN rooms r ON c.room_id = r.id
             INNER JOIN users u ON c.trainer_id = u.id
             WHERE cr.trainee_id = ? AND cr.status = 'registered'
             ORDER BY c.start_time ASC`,
            [traineeId]
        );
        return classes;
    } catch (error) {
        throw new Error(`Failed to get registered classes for user: ${error.message}`);
    } finally {
        connection.release();
    }
}