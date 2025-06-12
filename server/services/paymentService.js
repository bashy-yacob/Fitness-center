// services/paymentService.js
import pool from '../config/db.js';

/**
 * קבלת תשלום לפי ID
 * @param {number} paymentId - מזהה התשלום
 * @returns {Promise<Object|null>} אובייקט התשלום אם נמצא, או null
 */
export async function getPaymentById(paymentId) {
    const connection = await pool.getConnection();
    try {
        const [payments] = await connection.execute(
            `SELECT p.*, u.first_name, u.last_name, u.email
             FROM payments p
             INNER JOIN users u ON p.trainee_id = u.id
             WHERE p.id = ?`,
            [paymentId]
        );
        return payments[0] || null;
    } catch (error) {
        throw new Error(`Failed to get payment by ID: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת כל התשלומים
 * @param {Object} [filters={}] - אובייקט עם פילטרים אופציונליים (לדוגמה: traineeId, status)
 * @returns {Promise<Array>} מערך של אובייקטי תשלומים
 */
export async function getAllPayments(filters = {}) {
    const connection = await pool.getConnection();
    let query = `
        SELECT p.*, u.first_name, u.last_name, u.email, us.end_date AS subscription_end_date
        FROM payments p
        INNER JOIN users u ON p.trainee_id = u.id
        LEFT JOIN user_subscriptions us ON p.user_subscription_id = us.id
    `;
    const params = [];
    const conditions = [];

    if (filters.traineeId) {
        conditions.push('p.trainee_id = ?');
        params.push(filters.traineeId);
    }
    if (filters.status) {
        conditions.push('p.status = ?');
        params.push(filters.status);
    }
    if (filters.startDate) {
        conditions.push('p.payment_date >= ?');
        params.push(filters.startDate);
    }
    if (filters.endDate) {
        conditions.push('p.payment_date <= ?');
        params.push(filters.endDate);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.payment_date DESC';

    try {
        const [payments] = await connection.execute(query, params);
        return payments;
    } catch (error) {
        throw new Error(`Failed to get all payments: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * עדכון סטטוס תשלום
 * @param {number} paymentId - מזהה התשלום לעדכון
 * @param {string} newStatus - הסטטוס החדש (e.g., 'completed', 'failed', 'refunded')
 * @param {string} [notes] - הערות נוספות לעדכון
 * @returns {Promise<boolean>} true אם העדכון בוצע, false אחרת
 */
export async function updatePaymentStatus(paymentId, newStatus, notes = null) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `UPDATE payments SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [newStatus, notes, paymentId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to update payment status: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * מחיקת תשלום (ייתכן שזה לא רצוי בפועל אלא רק שינוי סטטוס ל'מבוטל')
 * @param {number} paymentId - מזהה התשלום למחיקה
 * @returns {Promise<boolean>} true אם המחיקה בוצעה, false אחרת
 */
export async function deletePayment(paymentId) {
    const connection = await pool.getConnection();
    try {
        // ברוב המערכות תשלומים לא נמחק, אלא משונה סטטוס ל'מבוטל'/'הוחזר'
        // אם מחיקה אכן נדרשת, וודא שאין תלויות קשיחות (לדוגמה, אם user_subscription_id הוא FK עם ON DELETE RESTRICT)
        const [result] = await connection.execute('DELETE FROM payments WHERE id = ?', [paymentId]);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to delete payment: ${error.message}`);
    } finally {
        connection.release();
    }
}
