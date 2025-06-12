// routes/roomRoutes.js
import express from 'express';
import * as roomController from '../controllers/roomController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { validate, createRoomSchema, updateRoomSchema } from '../middleware/validationMiddleware.js'; // נצטרך סכימות ולידציה

const router = express.Router();

// נתיבי ניהול חדרים (למנהלים בלבד)
router.post('/', verifyToken, isAdmin, validate(createRoomSchema), roomController.createRoom);
router.get('/', verifyToken, isAdmin, roomController.getAllRooms); // אולי גם מאמנים צריכים לראות חדרים? תלוי במודל העסקי.
router.get('/:id', verifyToken, isAdmin, roomController.getRoomById);
router.put('/:id', verifyToken, isAdmin, validate(updateRoomSchema), roomController.updateRoom);
router.delete('/:id', verifyToken, isAdmin, roomController.deleteRoom);

export default router;