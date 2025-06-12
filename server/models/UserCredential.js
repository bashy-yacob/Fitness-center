// models/UserCredential.js
import pool from '../config/db.js';

class UserCredential {
    static async create(credentialData) {
        const { user_id, password_hash } = credentialData;
        const [result] = await pool.execute(
            `INSERT INTO user_credentials (user_id, password_hash) 
             VALUES (?, ?)`,
            [user_id, password_hash]
        );
        return { id: result.insertId, ...credentialData };
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute('SELECT * FROM user_credentials WHERE user_id = ?', [userId]);
        return rows[0];
    }
}

export default UserCredential;
