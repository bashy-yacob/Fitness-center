// BaseService.js - שירות בסיסי לפעולות CRUD עם MySQL (SQL גולמי)
// שימוש: new BaseService('users', pool)

class BaseService {
  constructor(tableName, pool) {
    this.tableName = tableName;
    this.pool = pool;
  }

  async getAll() {
    const [rows] = await this.pool.query(`SELECT * FROM ${this.tableName}`);
    return rows;
  }

  async getById(id) {
    const [rows] = await this.pool.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return rows[0];
  }

  async create(data) {
    const [result] = await this.pool.query(`INSERT INTO ${this.tableName} SET ?`, [data]);
    return { id: result.insertId, ...data };
  }

  async update(id, data) {
    await this.pool.query(`UPDATE ${this.tableName} SET ? WHERE id = ?`, [data, id]);
    return this.getById(id);
  }

  async delete(id) {
    await this.pool.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return { id };
  }
}

export default BaseService;
