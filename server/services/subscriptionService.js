// services/subscriptionService.js
import pool from '../config/db.js';

/**
 * יצירת סוג מנוי חדש
 * @param {Object} subscriptionData - נתוני המנוי
 * @returns {Promise<number>} ID של סוג המנוי החדש
 */
export async function createSubscriptionType(subscriptionData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `INSERT INTO subscriptions (name, description, price, duration_months, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [
                subscriptionData.name,
                subscriptionData.description,
                subscriptionData.price,
                subscriptionData.duration_months,
                subscriptionData.is_active || true
            ]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(`Failed to create subscription type: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת סוג מנוי לפי ID
 * @param {number} subscriptionId - מזהה סוג המנוי
 * @returns {Promise<Object|null>} אובייקט סוג המנוי אם נמצא, או null
 */
export async function getSubscriptionTypeById(subscriptionId) {
    const connection = await pool.getConnection();
    try {
        const [subscriptions] = await connection.execute(
            `SELECT * FROM subscriptions WHERE id = ?`,
            [subscriptionId]
        );
        return subscriptions[0] || null;
    } catch (error) {
        throw new Error(`Failed to get subscription type by ID: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת כל סוגי המנויים
 * @returns {Promise<Array>} מערך של אובייקטי סוגי מנויים
 */
export async function getAllSubscriptionTypes() {
    const connection = await pool.getConnection();
    try {
        const [subscriptions] = await connection.execute(`SELECT * FROM subscriptions ORDER BY price ASC`);
        return subscriptions;
    } catch (error) {
        throw new Error(`Failed to get all subscription types: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * עדכון סוג מנוי קיים
 * @param {number} subscriptionId - מזהה סוג המנוי לעדכון
 * @param {Object} subscriptionData - נתוני המנוי לעדכון
 * @returns {Promise<boolean>} true אם העדכון בוצע, false אחרת
 */
export async function updateSubscriptionType(subscriptionId, subscriptionData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `UPDATE subscriptions SET name = ?, description = ?, price = ?, duration_months = ?, is_active = ?
             WHERE id = ?`,
            [
                subscriptionData.name,
                subscriptionData.description,
                subscriptionData.price,
                subscriptionData.duration_months,
                subscriptionData.is_active,
                subscriptionId
            ]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to update subscription type: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * מחיקת סוג מנוי
 * @param {number} subscriptionId - מזהה סוג המנוי למחיקה
 * @returns {Promise<boolean>} true אם המחיקה בוצעה, false אחרת
 */
export async function deleteSubscriptionType(subscriptionId) {
    const connection = await pool.getConnection();
    try {
        // בדוק אם ישנם מנויים פעילים מסוג זה
        const [activeSubscriptions] = await connection.execute(
            'SELECT id FROM user_subscriptions WHERE subscription_type_id = ?',
            [subscriptionId]
        );
        if (activeSubscriptions.length > 0) {
            throw new Error('Cannot delete subscription type with active user subscriptions. Please deactivate or reassign them first.');
        }

        const [result] = await connection.execute('DELETE FROM subscriptions WHERE id = ?', [subscriptionId]);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to delete subscription type: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * רכישת מנוי למתאמן
 * @param {number} traineeId - מזהה המתאמן
 * @param {number} subscriptionTypeId - מזהה סוג המנוי
 * @param {Object} paymentDetails - פרטי תשלום (לדוגמה, amount, transaction_id)
 * @returns {Promise<Object>} אובייקט המנוי של המשתמש שנוצר
 */
export async function purchaseSubscription(traineeId, subscriptionTypeId, paymentDetails) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [subscriptionType] = await connection.execute(
            'SELECT price, duration_months FROM subscriptions WHERE id = ?',
            [subscriptionTypeId]
        );
        if (!subscriptionType[0]) {
            throw new Error('Subscription type not found');
        }

        const { price, duration_months } = subscriptionType[0];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + duration_months);

        const [userSubscriptionResult] = await connection.execute(
            `INSERT INTO user_subscriptions (trainee_id, subscription_type_id, start_date, end_date, is_active)
             VALUES (?, ?, ?, ?, TRUE)`,
            [traineeId, subscriptionTypeId, startDate, endDate]
        );
        const userSubscriptionId = userSubscriptionResult.insertId;

        // יצירת רשומת תשלום
        const [paymentResult] = await connection.execute(
            `INSERT INTO payments (user_subscription_id, trainee_id, amount, payment_date, transaction_id, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userSubscriptionId,
                traineeId,
                price,
                new Date(),
                paymentDetails.transaction_id || null, // אם אין ID חיצוני
                paymentDetails.status || 'completed', // סטטוס תשלום
                paymentDetails.notes || null
            ]
        );

        await connection.commit();

        return { userSubscriptionId, paymentId: paymentResult.insertId };
    } catch (error) {
        await connection.rollback();
        throw new Error(`Failed to purchase subscription: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת כל המנויים של משתמש ספציפי
 * @param {number} traineeId - מזהה המתאמן
 * @returns {Promise<Array>} מערך של אובייקטי מנויים של המשתמש
 */
export async function getUserSubscriptions(traineeId) {
    const connection = await pool.getConnection();
    try {
        const [subscriptions] = await connection.execute(
            `SELECT us.id, s.name AS subscription_name, s.description, s.price, s.duration_months,
                    us.start_date, us.end_date, us.is_active
             FROM user_subscriptions us
             INNER JOIN subscriptions s ON us.subscription_type_id = s.id
             WHERE us.trainee_id = ?
             ORDER BY us.start_date DESC`,
            [traineeId]
        );
        return subscriptions;
    } catch (error) {
        throw new Error(`Failed to get user subscriptions: ${error.message}`);
    } finally {
        connection.release();
    }
}