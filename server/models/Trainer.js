// models/Trainer.js
import pool from '../config/db.js';

class Trainer {
    static async create(trainerData) {
        const { user_id, specialization, bio } = trainerData;
        const [result] = await pool.execute(
            `INSERT INTO trainers (user_id, specialization, bio) 
             VALUES (?, ?, ?)`,
            [user_id, specialization, bio]
        );
        return { id: result.insertId, ...trainerData };
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute('SELECT * FROM trainers WHERE user_id = ?', [userId]);
        return rows[0];
    }
}

export default Trainer;