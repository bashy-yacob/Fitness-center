// סקריפט לאיתור ותיקון סיסמאות לא מוצפנות בטבלת user_credentials
import pool from '../config/db.js';
import { hashPassword } from '../utils/authUtils.js';

async function fixUnhashedPasswords() {
  const conn = await pool.getConnection();
  try {
    // נניח שסיסמה לא מוצפנת היא קצרה (פחות מ-30 תווים) ואין בה $2a$ (תבנית bcrypt)
    const [rows] = await conn.execute(
      `SELECT user_id, password_hash FROM user_credentials`
    );
    let fixed = 0;
    for (const row of rows) {
      if (!row.password_hash.startsWith('$2a$') && row.password_hash.length < 30) {
        // כנראה לא מוצפן
        const newHash = await hashPassword(row.password_hash);
        await conn.execute(
          'UPDATE user_credentials SET password_hash = ? WHERE user_id = ?',
          [newHash, row.user_id]
        );
        console.log(`תוקן משתמש ${row.user_id}`);
        fixed++;
      }
    }
    if (fixed === 0) {
      console.log('כל הסיסמאות מוצפנות.');
    } else {
      console.log(`תוקנו ${fixed} משתמשים.`);
    }
  } finally {
    conn.release();
  }
}

fixUnhashedPasswords().catch(console.error);
