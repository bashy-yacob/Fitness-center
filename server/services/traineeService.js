import pool from '../config/db.js';

export async function getTraineeDashboard(traineeId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // שליפת נתוני השתתפות בחוגים
        const [classesResult] = await connection.execute(
            'SELECT COUNT(*) as attended_classes FROM class_registrations WHERE trainee_id = ? AND status = ?',
            [traineeId, 'attended']
        );

        // שליפת נתוני מנוי פעיל
        const [subscriptionResult] = await connection.execute(
            `SELECT s.name, us.start_date, us.end_date 
             FROM user_subscriptions us
             JOIN subscriptions s ON us.subscription_id = s.id
             WHERE us.trainee_id = ? AND us.is_active = TRUE
             AND us.end_date >= CURDATE()`,
            [traineeId]
        );

        // שליפת החוגים הקרובים
        const [upcomingClasses] = await connection.execute(
            `SELECT c.id, c.name, c.start_time, c.end_time, r.name as room_name, 
                    t.first_name as trainer_name, t.last_name as trainer_lastname
             FROM class_registrations cr
             JOIN classes c ON cr.class_id = c.id
             JOIN rooms r ON c.room_id = r.id
             JOIN users t ON c.trainer_id = t.id
             WHERE cr.trainee_id = ? 
             AND cr.status = 'registered'
             AND c.start_time > NOW()
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
        throw error;
    } finally {
        connection.release();
    }
}
