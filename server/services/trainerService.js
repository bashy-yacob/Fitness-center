// server/services/trainerService.js
import pool from '../config/db.js';

export async function getTrainerDashboardSummary(trainerId) {
  const conn = await pool.getConnection();
  try {
    // כמות חוגים
    const [classesCountRows] = await conn.execute(
      'SELECT COUNT(*) as count FROM classes WHERE trainer_id = ? AND is_active = 1',
      [trainerId]
    );
    // כמות מתאמנים פעילים
    const [traineesRows] = await conn.execute(
      `SELECT COUNT(DISTINCT cr.trainee_id) as count
       FROM class_registrations cr
       JOIN classes c ON cr.class_id = c.id
       WHERE c.trainer_id = ? AND cr.status = 'registered'`,
      [trainerId]
    );
    // הודעות אחרונות (ספירה בלבד)
    const [messagesRows] = await conn.execute(
      `SELECT COUNT(*) as count FROM messages WHERE sender_id = ? OR recipient_id = ?`,
      [trainerId, trainerId]
    );
    return {
      classesCount: classesCountRows[0].count,
      activeTrainees: traineesRows[0].count,
      recentMessagesCount: messagesRows[0].count
    };
  } finally {
    conn.release();
  }
}

export async function getUpcomingClasses(trainerId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT id, name, start_time, end_time
       FROM classes
       WHERE trainer_id = ? AND start_time > NOW() AND is_active = 1
       ORDER BY start_time ASC
       LIMIT 5`,
      [trainerId]
    );
    return rows;
  } finally {
    conn.release();
  }
}

export async function getRecentMessages(trainerId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT id, message_text, sent_at, sender_id, recipient_id
       FROM messages
       WHERE sender_id = ? OR recipient_id = ?
       ORDER BY sent_at DESC
       LIMIT 5`,
      [trainerId, trainerId]
    );
    return rows;
  } finally {
    conn.release();
  }
}

// שליפת כל המתאמנים של מאמן
export async function fetchTraineesByTrainerId(trainerId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email
       FROM class_registrations cr
       JOIN classes c ON cr.class_id = c.id
       JOIN users u ON cr.trainee_id = u.id
       WHERE c.trainer_id = ? AND cr.status = 'registered'`,
      [trainerId]
    );
    return rows;
  } finally {
    conn.release();
  }
}

// שליחת הודעה קבוצתית למתאמנים
export async function sendMessagesToTrainees(trainerId, traineeIds, messageText) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const traineeId of traineeIds) {
      await conn.execute(
        `INSERT INTO messages (sender_id, receiver_id, message_text, sent_at, is_read, message_type)
         VALUES (?, ?, ?, NOW(), FALSE, 'private')`,
        [trainerId, traineeId, messageText]
      );
    }
    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// שליחת הודעה לכל משתתפי חוג
export async function sendMessageToClass(trainerId, classId, messageText) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [registrations] = await conn.execute(
      `SELECT cr.trainee_id FROM class_registrations cr WHERE cr.class_id = ? AND cr.status = 'registered'`,
      [classId]
    );
    for (const reg of registrations) {
      await conn.execute(
        `INSERT INTO messages (sender_id, receiver_id, message_text, sent_at, is_read, message_type)
         VALUES (?, ?, ?, NOW(), FALSE, 'class_update')`,
        [trainerId, reg.trainee_id, messageText]
      );
    }
    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// שליחת הודעה למנהל
export async function sendMessageToAdmin(trainerId, messageText) {
  const conn = await pool.getConnection();
  try {
    // שליפת כל המנהלים
    const [admins] = await conn.execute(
      `SELECT id FROM users WHERE user_type = 'admin'`
    );
    for (const admin of admins) {
      await conn.execute(
        `INSERT INTO messages (sender_id, receiver_id, message_text, sent_at, is_read, message_type)
         VALUES (?, ?, ?, NOW(), FALSE, 'private')`,
        [trainerId, admin.id, messageText]
      );
    }
    return { success: true };
  } finally {
    conn.release();
  }
}

// שליחת הודעות שנשלחו ע"י המאמן
export async function getSentMessages(trainerId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT m.id, m.message_text, m.sent_at, u.first_name, u.last_name, u.email
       FROM messages m
       JOIN users u ON m.receiver_id = u.id
       WHERE m.sender_id = ? AND m.message_type = 'private'
       ORDER BY m.sent_at DESC
       LIMIT 50`,
      [trainerId]
    );
    return rows;
  } finally {
    conn.release();
  }
}

// סטטיסטיקות למאמן
export async function getAttendanceSummary(trainerId) {
  const conn = await pool.getConnection();
  try {
    // משתתפים לפי חוג
    const [classRows] = await conn.execute(
      `SELECT c.name, COUNT(cr.trainee_id) as count
       FROM classes c
       LEFT JOIN class_registrations cr ON c.id = cr.class_id AND cr.status = 'registered'
       WHERE c.trainer_id = ?
       GROUP BY c.id` ,
      [trainerId]
    );
    // נוכחות/היעדרות כללית
    const [attendanceRows] = await conn.execute(
      `SELECT 
         SUM(CASE WHEN cr.status = 'attended' THEN 1 ELSE 0 END) as present,
         SUM(CASE WHEN cr.status = 'absent' THEN 1 ELSE 0 END) as absent
       FROM class_registrations cr
       JOIN classes c ON cr.class_id = c.id
       WHERE c.trainer_id = ?`,
      [trainerId]
    );
    return {
      classes: classRows.map(r => r.name),
      counts: classRows.map(r => r.count),
      attendancePie: [attendanceRows[0].present || 0, attendanceRows[0].absent || 0]
    };
  } finally {
    conn.release();
  }
}

export async function getStatsPerTrainee(trainerId) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT u.first_name as name,
              COUNT(cr.id) as total,
              SUM(CASE WHEN cr.status = 'attended' THEN 1 ELSE 0 END) as present,
              SUM(CASE WHEN cr.status = 'absent' THEN 1 ELSE 0 END) as absent
       FROM class_registrations cr
       JOIN classes c ON cr.class_id = c.id
       JOIN users u ON cr.trainee_id = u.id
       WHERE c.trainer_id = ?
       GROUP BY u.id` ,
      [trainerId]
    );
    return { trainees: rows };
  } finally {
    conn.release();
  }
}
