
// models/Trainee.js
import pool from '../config/db.js';

class Trainee {
    static async create(traineeData) {
        const { user_id, date_of_birth, gender } = traineeData;
        const [result] = await pool.execute(
            `INSERT INTO trainees (user_id, date_of_birth, gender) 
             VALUES (?, ?, ?)`,
            [user_id, date_of_birth, gender]
        );
        return { id: result.insertId, ...traineeData };
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute('SELECT * FROM trainees WHERE user_id = ?', [userId]);
        return rows[0];
    }
}

export default Trainee;

