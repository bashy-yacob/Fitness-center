// services/roomService.js
import pool from '../config/db.js';

/**
 * יצירת חדר חדש
 * @param {Object} roomData - נתוני החדר
 * @returns {Promise<number>} ID של החדר החדש
 */
export async function createRoom(roomData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `INSERT INTO rooms (name, capacity) VALUES (?, ?)`,
            [roomData.name, roomData.capacity]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(`Failed to create room: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת חדר לפי ID
 * @param {number} roomId - מזהה החדר
 * @returns {Promise<Object|null>} אובייקט החדר אם נמצא, או null
 */
export async function getRoomById(roomId) {
    const connection = await pool.getConnection();
    try {
        const [rooms] = await connection.execute(
            `SELECT * FROM rooms WHERE id = ?`,
            [roomId]
        );
        return rooms[0] || null;
    } catch (error) {
        throw new Error(`Failed to get room by ID: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * קבלת כל החדרים
 * @returns {Promise<Array>} מערך של אובייקטי חדרים
 */
export async function getAllRooms() {
    const connection = await pool.getConnection();
    try {
        const [rooms] = await connection.execute(`SELECT * FROM rooms ORDER BY name ASC`);
        return rooms;
    } catch (error) {
        throw new Error(`Failed to get all rooms: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * עדכון חדר קיים
 * @param {number} roomId - מזהה החדר לעדכון
 * @param {Object} roomData - נתוני החדר לעדכון
 * @returns {Promise<boolean>} true אם העדכון בוצע, false אחרת
 */
export async function updateRoom(roomId, roomData) {
    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `UPDATE rooms SET name = ?, capacity = ? WHERE id = ?`,
            [roomData.name, roomData.capacity, roomId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to update room: ${error.message}`);
    } finally {
        connection.release();
    }
}

/**
 * מחיקת חדר
 * @param {number} roomId - מזהה החדר למחיקה
 * @returns {Promise<boolean>} true אם המחיקה בוצעה, false אחרת
 */
export async function deleteRoom(roomId) {
    const connection = await pool.getConnection();
    try {
        // בדוק אם יש חוגים המשויכים לחדר זה
        const [classesInRoom] = await connection.execute('SELECT id FROM classes WHERE room_id = ?', [roomId]);
        if (classesInRoom.length > 0) {
            throw new Error('Cannot delete room with active classes. Please reassign or delete classes first.');
        }

        const [result] = await connection.execute('DELETE FROM rooms WHERE id = ?', [roomId]);
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error(`Failed to delete room: ${error.message}`);
    } finally {
        connection.release();
    }
}