// בקובץ: server/services/traineeService.js

import pool from '../config/db.js';

export async function getTraineeDashboard(traineeId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [classesResult] = await connection.execute(
            'SELECT COUNT(*) as attended_classes FROM class_registrations WHERE trainee_id = ? AND status = ?',
            [traineeId, 'attended']
        );

        const [subscriptionResult] = await connection.execute(
            `SELECT s.name, us.start_date, us.end_date 
             FROM user_subscriptions us
             JOIN subscriptions s ON us.subscription_id = s.id
             WHERE us.trainee_id = ? AND us.is_active = TRUE
             AND us.end_date >= CURDATE()`,
            [traineeId]
        );


        const [upcomingClasses] = await connection.execute(
            `SELECT 
                c.id, 
                c.name, 
                c.start_time, 
                c.end_time, 
                r.name as room_name, 
                CONCAT(t.first_name, ' ', t.last_name) as trainer_name
             FROM class_registrations cr
             JOIN classes c ON cr.class_id = c.id
             JOIN rooms r ON c.room_id = r.id
             JOIN trainers tr ON c.trainer_id = tr.user_id
             JOIN users t ON tr.user_id = t.id
             WHERE cr.trainee_id = ? 
             AND cr.status = 'registered'
             AND c.end_time > NOW()
             ORDER BY c.start_time
             LIMIT 5`,
            [traineeId]
        );

        await connection.commit();

        return {
            attended_classes: classesResult[0].attended_classes,
            active_subscription: subscriptionResult[0] || null,
            upcoming_classes: upcomingClasses
        };
    } catch (error) {
        await connection.rollback();
        // הוספתי console.error כדי שיהיה קל יותר לדבג בעתיד
        console.error("Error in getTraineeDashboard service:", error);
        throw error;
    } finally {
        connection.release();
    }
}


/**
 * מוצא את תוכנית האימונים הפעילה של מתאמן ומחזיר את פרטיה המלאים.
 * @param {number} traineeId - מזהה המתאמן
 * @returns {Promise<Object|null>} אובייקט התוכנית או null אם לא נמצאה.
 */
export async function findActiveProgramForTrainee(traineeId) {
    const connection = await pool.getConnection();
    try {
        // === כאן השאילתה המתוקנת והמפושטת ===
        const query = `
            SELECT 
                tp.id,
                tp.name AS program_name,
                tp.description AS program_description,
                tp.created_at,
                CONCAT(u.first_name, ' ', u.last_name) AS trainer_name
            FROM 
                trainee_programs AS tep
            INNER JOIN training_programs AS tp ON tep.program_id = tp.id
            INNER JOIN users AS u ON tp.created_by_trainer_id = u.id   
            LIMIT 1;
        `;

        const [rows] = await connection.execute(query, [traineeId]);
        console.log('[Service] SQL query result (rows):', rows);
        return rows[0] || null;

    } catch (error) {
        console.error(`Error finding active training program for trainee ${traineeId}:`, error);
        throw new Error('Failed to retrieve training program.');
    } finally {
        connection.release();
    }
}

/**
 * משייך תוכנית אימון למתאמן (ומבטל קודמות)
 * @param {number} traineeId - מזהה המתאמן
 * @param {number} programId - מזהה תוכנית האימון
 * @param {number} assignedByTrainerId - מזהה המאמן המשייך
 */
export async function assignTrainingProgramToTrainee(traineeId, programId, assignedByTrainerId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // מבטל תוכניות פעילות קודמות
        await connection.execute(
            'UPDATE trainee_programs SET is_active = FALSE WHERE trainee_id = ? AND is_active = TRUE',
            [traineeId]
        );
        // משייך תוכנית חדשה
        await connection.execute(
            `INSERT INTO trainee_programs (trainee_id, program_id, assigned_date, is_active) VALUES (?, ?, NOW(), TRUE)` ,
            [traineeId, programId]
        );
        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        console.error('Error assigning training program:', error);
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * שליפת כל תוכניות האימון (לרשימה לבחירה)
 */
export async function getAllTrainingPrograms() {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.execute('SELECT id, name FROM training_programs');
        return rows;
    } finally {
        connection.release();
    }
}