// services/classService.js
import pool from '../config/db.js';
import BaseService from './BaseService.js';

class ClassService extends BaseService {
  constructor() {
    super('classes', pool);
  }

  /**
   * קבלת כל החוגים עם מידע מורחב (כולל הרשמה למשתמש)
   * @param {number} traineeId - מזהה המתאמן (אופציונלי)
   * @returns {Promise<Array>} מערך של אובייקטי חוגים
   */
  async getAllClasses(traineeId = null) {
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
   * רישום מתאמן לחוג
   * @param {number} traineeId - מזהה המתאמן
   * @param {number} classId - מזהה החוג
   * @returns {Promise<number>} ID של הרישום החדש
   */
  async registerForClass(traineeId, classId) {
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
  async unregisterFromClass(traineeId, classId) {
    const connection = await pool.getConnection();
    try {
        // התחלת טרנזקציה כדי להבטיח שכל הפעולות יצליחו או ייכשלו יחד
        await connection.beginTransaction();

        // שלב 1: נמצא את הרישום הקיים כדי לקבל את ה-ID שלו
        const [existingRegistration] = await connection.execute(
            'SELECT id FROM class_registrations WHERE trainee_id = ? AND class_id = ? AND status = ?',
            [traineeId, classId, 'registered']
        );

        // אם לא נמצא רישום פעיל, אין מה לבטל
        if (existingRegistration.length === 0) {
            await connection.rollback(); // בטל את הטרנזקציה
            console.log(`Unregistration failed: No active registration found for trainee ${traineeId} in class ${classId}.`);
            return false;
        }

        const registrationId = existingRegistration[0].id;

        // שלב 2: עדכון הסטטוס של הרישום ל-'cancelled'
        const [updateRegResult] = await connection.execute(
            `UPDATE class_registrations SET status = 'cancelled' WHERE id = ?`,
            [registrationId]
        );

        // שלב 3: עדכון הסטטוס של התשלום המשויך ל-'refund_pending'
        // אנחנו מניחים שלכל הרשמה יש תשלום.
        // ה-notes מכיל את ID ההרשמה, מה שעוזר לנו למצוא את התשלום.
        const notesQuery = `Payment for class registration ID: ${registrationId}`;
        const [updatePayResult] = await connection.execute(
            `UPDATE payments SET status = 'pending' WHERE notes = ? AND status = 'completed'`,
            [notesQuery]
        );

        // שלב 4: אישור כל השינויים
        await connection.commit();

        // נחזיר true רק אם עדכון ההרשמה הצליח
        return updateRegResult.affectedRows > 0;

    } catch (error) {
        // אם קרתה שגיאה כלשהי, בטל את כל השינויים
        await connection.rollback();
        console.error("Error in unregisterFromClass service:", error);
        throw new Error(`Failed to unregister from class: ${error.message}`);
    } finally {
        // שחרר את החיבור למסד הנתונים תמיד
        connection.release();
    }
  }

  /**
   * קבלת רשימת מתאמנים בחוג
   * @param {number} classId - מזהה החוג
   * @returns {Promise<Array>} מערך של אובייקטי מתאמנים
   */
  async getClassRegistrations(classId) {
    const connection = await pool.getConnection();
    try {
        const [registrations] = await connection.execute(
            `SELECT u.id AS trainee_id, u.first_name, u.last_name, u.email, cr.registration_date
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

  /**
   * קבלת כל החוגים שמתאמן ספציפי רשום אליהם
   * @param {number} traineeId - מזהה המתאמן
   * @returns {Promise<Array>} מערך של אובייקטי חוגים
   */
  async getRegisteredClassesForUser(traineeId) {
    const connection = await pool.getConnection();
    try {
        // === כאן התיקון בשאילתה ===
        const [classes] = await connection.execute(
            `SELECT 
                c.id, 
                c.name, 
                c.start_time, 
                c.end_time, 
                r.name AS room_name, 
                CONCAT(u.first_name, ' ', u.last_name) AS trainer_name,
                cr.status -- הוספנו את שדה הסטטוס מההרשמה
             FROM classes c
             INNER JOIN class_registrations cr ON c.id = cr.class_id
             INNER JOIN rooms r ON c.room_id = r.id
             INNER JOIN users u ON c.trainer_id = u.id
             WHERE cr.trainee_id = ? 
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

  /**
   * רישום ותשלום לחוג
   * @param {number} traineeId - מזהה המתאמן
   * @param {number} classId - מזהה החוג
   * @returns {Promise<Object>} תוצאות הרישום והתשלום
   */
  async processRegistrationWithPayment(traineeId, classId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // שלב 1: בדיקת זמינות מקום בחוג (תוך נעילת השורה למניעת התנגשויות)
        const [classInfo] = await connection.execute(
            'SELECT max_capacity FROM classes WHERE id = ? FOR UPDATE',
            [classId]
        );

        if (!classInfo.length) {
            throw new AppError('Class not found.', 404);
        }

        const maxCapacity = classInfo[0].max_capacity;
        const [registrations] = await connection.execute(
            "SELECT COUNT(*) as count FROM class_registrations WHERE class_id = ? AND status = 'registered'",
            [classId]
        );

        const currentCapacity = registrations[0].count;

        // שלב 2: בדיקת הרישום הקיים של המתאמן הספציפי
        const [existingRegistration] = await connection.execute(
            'SELECT id, status FROM class_registrations WHERE trainee_id = ? AND class_id = ?',
            [traineeId, classId]
        );

        let registrationId;

        // שלב 3: החלטה - האם ליצור רישום חדש או לעדכן קיים?
        if (existingRegistration.length > 0) {
            // אם נמצא רישום קיים
            const currentStatus = existingRegistration[0].status;
            registrationId = existingRegistration[0].id;

            if (currentStatus === 'registered') {
                // אם הוא כבר רשום, אין מה להמשיך
                throw new AppError('You are already registered for this class.', 409);
            }

            // אם הסטטוס הוא 'cancelled' או 'attended', אפשר להירשם מחדש
            // אבל רק אם יש מקום פנוי!
            if (currentCapacity >= maxCapacity) {
                throw new AppError('This class is full.', 409);
            }

            // עדכון הרישום הקיים לסטטוס 'registered'
            await connection.execute(
                "UPDATE class_registrations SET status = 'registered', registration_date = NOW() WHERE id = ?",
                [registrationId]
            );

        } else {
            // אם לא נמצא רישום קיים - זו הרשמה ראשונה
            // בדוק שוב אם יש מקום (חשוב למקרה שהבדיקה הקודמת לא הספיקה)
            if (currentCapacity >= maxCapacity) {
                throw new AppError('This class is full.', 409);
            }

            // יצירת רישום חדש
            const [registrationResult] = await connection.execute(
                "INSERT INTO class_registrations (trainee_id, class_id, status) VALUES (?, ?, 'registered')",
                [traineeId, classId]
            );
            registrationId = registrationResult.insertId;
        }

        // שלב 4: תיעוד התשלום (זהה לקודם)
        const classPrice = 50.00;
        const transactionId = `cl_reg_${registrationId}_${Date.now()}`;

        await connection.execute(
            `INSERT INTO payments (trainee_id, amount, currency, payment_date, payment_method, transaction_id, status, notes)
             VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
            [traineeId, classPrice, 'ILS', 'credit_card', transactionId, 'completed', `Payment for class registration ID: ${registrationId}`]
        );
        
        // שלב 5: אישור הטרנזקציה
        await connection.commit();

        return {
            registrationId: registrationId,
            message: "Successfully registered and payment processed."
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }

  /**
   * ספירת חוגים פעילים
   * @returns {Promise<number>} מספר החוגים הפעילים
   */
  async countActiveClasses() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute(
            'SELECT COUNT(*) AS count FROM classes WHERE is_active = TRUE'
        );
        return rows[0].count;
    } finally {
        connection.release();
    }
  }
}

const classService = new ClassService();
export default classService;