import db from '../config/db.js';

const messageService = {
  // שליחת הודעה שיווקית (broadcast)
  async sendBroadcastMessage(senderId, subject, text) {
    const messageText = subject + '\n' + text;
    await db.query(
      `INSERT INTO messages (sender_id, receiver_id, message_text, message_type) VALUES (?, NULL, ?, 'broadcast')`,
      [senderId, messageText]
    );
  },

  // שליפת כל ההודעות השיווקיות שנשלחו (broadcast)
  async fetchSentMessages() {
    const [rows] = await db.query(
      `SELECT * FROM messages WHERE message_type = 'broadcast' ORDER BY sent_at DESC`
    );
    return rows;
  },

  // שליחת הודעה פרטית
  async sendPrivateMessage(senderId, receiverId, text) {
    await db.query(
      `INSERT INTO messages (sender_id, receiver_id, message_text, message_type) VALUES (?, ?, ?, 'private')`,
      [senderId, receiverId, text]
    );
  },

  // שליפת הודעות פרטיות למשתמש מסוים
  async fetchPrivateMessages(userId) {
    const [rows] = await db.query(
      `SELECT * FROM messages WHERE receiver_id = ? AND message_type = 'private' ORDER BY sent_at DESC`,
      [userId]
    );
    return rows;
  },

  // שליפת הודעות פרטיות למשתמש מסוים (כולל שם השולח, תואם first_name/last_name/email בלבד)
  async fetchPrivateMessagesWithSender(userId) {
    const [rows] = await db.query(
      `SELECT m.*, CONCAT(u.first_name, ' ', u.last_name) AS sender_name, u.email AS sender_email
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.receiver_id = ? AND m.message_type = 'private'
       ORDER BY m.sent_at DESC`,
      [userId]
    );
    return rows;
  },

  // עדכון סטטוס קריאה
  async markMessageAsRead(messageId) {
    await db.query(
      `UPDATE messages SET is_read = TRUE WHERE id = ?`,
      [messageId]
    );
  },

  // שליחת הודעת עדכון חוג
  async sendClassUpdate(senderId, receiverId, text) {
    await db.query(
      `INSERT INTO messages (sender_id, receiver_id, message_text, message_type) VALUES (?, ?, ?, 'class_update')`,
      [senderId, receiverId, text]
    );
  },

  // שליפת הודעות עדכון חוג למשתמש
  async fetchClassUpdates(userId) {
    const [rows] = await db.query(
      `SELECT * FROM messages WHERE receiver_id = ? AND message_type = 'class_update' ORDER BY sent_at DESC`,
      [userId]
    );
    return rows;
  },

  // עדכון הודעה שיווקית
  async updateBroadcastMessage(id, subject, text) {
    const messageText = subject + '\n' + text;
    await db.query(
      `UPDATE messages SET message_text = ? WHERE id = ? AND message_type = 'broadcast'`,
      [messageText, id]
    );
  },

  // מחיקת הודעה שיווקית
  async deleteBroadcastMessage(id) {
    await db.query(
      `DELETE FROM messages WHERE id = ? AND message_type = 'broadcast'`,
      [id]
    );
  },

  // שליפת הודעות פרטיות שנשלחו ע"י משתמש מסוים
  async fetchSentPrivateMessages(senderId) {
    const [rows] = await db.query(
      `SELECT * FROM messages WHERE sender_id = ? AND message_type = 'private' ORDER BY sent_at DESC`,
      [senderId]
    );
    return rows;
  },

  // שליפת הודעות פרטיות שנשלחו ע"י משתמש מסוים (כולל שם הנמען)
  async fetchSentPrivateMessagesWithReceiverName(senderId) {
    const [rows] = await db.query(
      `SELECT m.*, CONCAT(u.first_name, ' ', u.last_name) AS receiver_name, u.email AS receiver_email
       FROM messages m
       LEFT JOIN users u ON m.receiver_id = u.id
       WHERE m.sender_id = ? AND m.message_type = 'private'
       ORDER BY m.sent_at DESC`,
      [senderId]
    );
    return rows;
  }
};

export default messageService;
