// services/subscriptionService.js
import pool from '../config/db.js';
import BaseService from './BaseService.js';

class SubscriptionService extends BaseService {
  constructor() {
    super('subscriptions', pool);
  }

  /**
   * רכישת מנוי למתאמן
   * @param {number} traineeId - מזהה המתאמן
   * @param {number} subscriptionTypeId - מזהה סוג המנוי
   * @param {Object} paymentDetails - פרטי תשלום
   * @returns {Promise<Object>} אובייקט עם ID המנוי והתשלום
   */
  async purchaseSubscription(traineeId, subscriptionTypeId, paymentDetails = {}) { // הוספנו ערך ברירת מחדל
    // בדיקה מקדימה ברורה
    if (!traineeId || !subscriptionTypeId) {
        throw new Error('traineeId and subscriptionTypeId are required');
    }
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [subscriptionType] = await connection.execute(
            'SELECT price, duration_days FROM subscriptions WHERE id = ?',
            [subscriptionTypeId]
        );
        if (!subscriptionType.length) {
            throw new Error('Subscription type not found');
        }
        const { price, duration_days } = subscriptionType[0];
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration_days);
        const [userSubscriptionResult] = await connection.execute(
            `INSERT INTO user_subscriptions (trainee_id, subscription_id, start_date, end_date, is_active)
             VALUES (?, ?, ?, ?, TRUE)`,
            [traineeId, subscriptionTypeId, startDate, endDate]
        );
        const userSubscriptionId = userSubscriptionResult.insertId;
        const [paymentResult] = await connection.execute(
            `INSERT INTO payments (user_subscription_id, trainee_id, amount, payment_date, transaction_id, status, notes)
             VALUES (?, ?, ?, NOW(), ?, ?, ?)`, // שימוש ב-NOW() של SQL הוא עדיף
            [
                userSubscriptionId,
                traineeId,
                price,
                // הערכים הבאים נלקחים מ-paymentDetails או מקבלים ערך ברירת מחדל null
                paymentDetails.transaction_id || null, 
                paymentDetails.status || 'completed',
                paymentDetails.notes || null // אם notes לא קיים, ישלח null
            ]
        );

        await connection.commit();

        return { userSubscriptionId, paymentId: paymentResult.insertId };
    } catch (error) {
        await connection.rollback();
        // שגיאה יותר אינפורמטיבית
        throw new Error(`Failed to purchase subscription. Reason: ${error.message}`);
    } finally {
        connection.release();
    }
  }

  /**
   * קבלת כל המנויים של משתמש ספציפי
   * @param {number} traineeId - מזהה המתאמן
   * @returns {Promise<Array>} מערך של אובייקטי מנויים של המשתמש
   */
  async getUserSubscriptions(traineeId) {
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
  /**
   * מוצא את המנוי הפעיל היחיד של מתאמן ספציפי
   * @param {number} traineeId - מזהה המתאמן
   * @returns {Promise<Object|null>} אובייקט המנוי הפעיל, או null אם לא נמצא
   */
  async findActiveSubscriptionForUser(traineeId) {
    const connection = await pool.getConnection();
    try {
        // שאילתה זו מאחדת מידע משתי טבלאות כדי להחזיר תשובה מלאה
        const query = `
            SELECT 
                us.id, 
                s.name, 
                s.description, 
                s.price, 
                us.start_date, 
                us.end_date, 
                us.is_active
            FROM user_subscriptions us
            INNER JOIN subscriptions s ON us.subscription_id = s.id
            WHERE us.trainee_id = ? AND us.is_active = TRUE
            LIMIT 1;
        `;
        const [rows] = await connection.execute(query, [traineeId]);

        // execute מחזיר מערך. אנחנו רוצים את האיבר הראשון או null.
        return rows[0] || null;
    } catch (error) {
        console.error(`Error finding active subscription for user ${traineeId}:`, error);
        // זרוק את השגיאה הלאה כדי שהקונטרולר יתפוס אותה
        throw new Error('Failed to retrieve active subscription.');
    } finally {
        connection.release();
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;