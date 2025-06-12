// models/User.js
import pool from '../config/db.js';

class User {
    static async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async create(userData) {
        const { first_name, last_name, email, password_hash, phone_number, user_type } = userData;
        const [result] = await pool.execute(
            `INSERT INTO users (first_name, last_name, email, password_hash, phone_number, user_type) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, email, password_hash, phone_number, user_type]
        );
        return { id: result.insertId, ...userData };
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }
}

export default User;
