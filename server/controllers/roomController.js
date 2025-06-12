// controllers/roomController.js
import * as roomService from '../services/roomService.js';
import { AppError } from '../middleware/errorMiddleware.js';

export async function createRoom(req, res, next) {
    try {
        const roomId = await roomService.createRoom(req.body);
        res.status(201).json({ message: 'Room created successfully', roomId });
    } catch (error) {
        next(error);
    }
}

export async function getRoomById(req, res, next) {
    try {
        const { id } = req.params;
        const room = await roomService.getRoomById(id);
        if (!room) {
            throw new AppError('Room not found', 404);
        }
        res.status(200).json(room);
    } catch (error) {
        next(error);
    }
}

export async function getAllRooms(req, res, next) {
    try {
        const rooms = await roomService.getAllRooms();
        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
}

export async function updateRoom(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await roomService.updateRoom(id, req.body);
        if (!updated) {
            throw new AppError('Failed to update room or room not found', 400);
        }
        res.status(200).json({ message: 'Room updated successfully' });
    } catch (error) {
        next(error);
    }
}

export async function deleteRoom(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await roomService.deleteRoom(id);
        if (!deleted) {
            throw new AppError('Failed to delete room or room not found', 400);
        }
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        next(error);
    }
}