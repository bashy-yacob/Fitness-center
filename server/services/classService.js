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



// בקובץ: src/services/classService.js
export async function getAllClasses(traineeId = null) {
    const connection = await pool.getConnection();
    try {
        const query = `
            SELECT 
                c.id, c.name, c.description, c.start_time, c.end_time,
                c.max_capacity, r.name AS room_name,
                CONCAT(u.first_name, ' ', u.last_name) AS trainer_name,
                (SELECT COUNT(*) FROM class_registrations cr WHERE cr.class_id = c.id AND cr.status = 'registered') AS registered_count,
                CASE WHEN reg.id IS NOT NULL THEN TRUE ELSE FALSE END AS isRegistered
            FROM classes c
            JOIN rooms r ON c.room_id = r.id
            JOIN trainers t ON c.trainer_id = t.user_id
            JOIN users u ON t.user_id = u.id
            LEFT JOIN class_registrations reg ON c.id = reg.class_id AND reg.trainee_id = ? AND reg.status = 'registered'
            WHERE 1=1
            ${traineeId ? 'AND c.is_active = TRUE' : ''}
            ORDER BY c.start_time ASC;
        `;

        const [classes] = await connection.execute(query, [traineeId]);

        return classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            description: cls.description,
            startTime: cls.start_time,
            endTime: cls.end_time,
            maxCapacity: cls.max_capacity,
            roomName: cls.room_name,
            trainerName: cls.trainer_name,
            registeredCount: parseInt(cls.registered_count, 10),
            availableSlots: Math.max(0, cls.max_capacity - cls.registered_count),
            isRegistered: !!cls.isRegistered
        }));

    } catch (error) {
        console.error("Error in getAllClasses service:", error);
        throw new Error(`Failed to get available classes: ${error.message}`);
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

export async function processRegistrationWithPayment(traineeId, classId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [classInfo] = await connection.execute(
            'SELECT max_capacity, start_time FROM classes WHERE id = ? FOR UPDATE',
            [classId]
        );

        if (!classInfo.length) {
            throw new Error('Class not found.');
        }

        const [existingRegistration] = await connection.execute(
            'SELECT id FROM class_registrations WHERE trainee_id = ? AND class_id = ?',
            [traineeId, classId]
        );

        if (existingRegistration.length > 0) {
            throw new Error('You are already registered for this class.');
        }

        const [registrations] = await connection.execute(
            'SELECT COUNT(*) as count FROM class_registrations WHERE class_id = ? AND status = ?',
            [classId, 'registered']
        );

        if (registrations[0].count >= classInfo[0].max_capacity) {
            throw new Error('This class is full.');
        }

        const [registrationResult] = await connection.execute(
            'INSERT INTO class_registrations (trainee_id, class_id, status) VALUES (?, ?, ?)',
            [traineeId, classId, 'registered']
        );
        const newRegistrationId = registrationResult.insertId;

        const classPrice = 50.00; // מחיר קבוע לחוג
        const transactionId = `cl_reg_${newRegistrationId}_${Date.now()}`;

        const [paymentResult] = await connection.execute(
            `INSERT INTO payments (trainee_id, amount, currency, payment_date, payment_method, transaction_id, status, notes)
             VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
            [traineeId, classPrice, 'ILS', 'credit_card', transactionId, 'completed', `Payment for class registration ID: ${newRegistrationId}`]
        );
        const newPaymentId = paymentResult.insertId;

        await connection.commit();

        return {
            registrationId: newRegistrationId,
            paymentId: newPaymentId,
            message: "Successfully registered and payment processed."
        };

    } catch (error) {
        await connection.rollback();
        throw error; // זרוק את השגיאה הלאה לקונטרולר
    } finally {
        connection.release();
    }
}