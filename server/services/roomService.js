// services/roomService.js
import pool from '../config/db.js';
import BaseService from './BaseService.js';

// שירות CRUD גנרי לטבלת rooms
const roomService = new BaseService('rooms', pool);

export default roomService;