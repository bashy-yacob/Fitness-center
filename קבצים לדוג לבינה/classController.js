// controllers/classController.js
import * as classService from '../services/classService.js';
import { AppError } from '../middleware/errorMiddleware.js';

export async function createClass(req, res, next) {
    try {
        const classId = await classService.createClass(req.body);
        res.status(201).json({ message: 'Class created successfully', classId });
    } catch (error) {
        next(error);
    }
}

export async function getClassById(req, res, next) {
    try {
        const { id } = req.params;
        const gymClass = await classService.getClassById(id);
        if (!gymClass) {
            throw new AppError('Class not found', 404);
        }
        res.status(200).json(gymClass);
    } catch (error) {
        next(error);
    }
}

export async function getAllClasses(req, res, next) {
    try {
        const classes = await classService.getAllClasses();
        res.status(200).json(classes);
    } catch (error) {
        next(error);
    }
}

export async function updateClass(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await classService.updateClass(id, req.body);
        if (!updated) {
            throw new AppError('Failed to update class or class not found', 400);
        }
        res.status(200).json({ message: 'Class updated successfully' });
    } catch (error) {
        next(error);
    }
}

export async function deleteClass(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await classService.deleteClass(id);
        if (!deleted) {
            throw new AppError('Failed to delete class or class not found', 400);
        }
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        next(error);
    }
}

export async function registerForClass(req, res, next) {
    try {
        const { classId } = req.params;
        // req.userId מגיע מה-verifyToken middleware
        const registrationId = await classService.registerForClass(req.userId, classId);
        res.status(201).json({ message: 'Successfully registered for class', registrationId });
    } catch (error) {
        next(error);
    }
}

export async function unregisterFromClass(req, res, next) {
    try {
        const { classId } = req.params;
        const unregistered = await classService.unregisterFromClass(req.userId, classId);
        if (!unregistered) {
            throw new AppError('Failed to unregister from class or not registered', 400);
        }
        res.status(200).json({ message: 'Successfully unregistered from class' });
    } catch (error) {
        next(error);
    }
}

export async function getClassRegistrations(req, res, next) {
    try {
        const { classId } = req.params;
        const registrations = await classService.getClassRegistrations(classId);
        res.status(200).json(registrations);
    } catch (error) {
        next(error);
    }
}

export async function registerUserForClass(req, res, next) {
    try {
    
        const classId = req.params.classId; 

        const traineeId = req.user.id; 

        // התנאי הזה עדיין חשוב, למקרה שמשהו ישתבש בעתיד
        if (!classId || !traineeId) {
            // טכנית, לא אמורים להגיע לכאן יותר עם הפלט שראינו
            return res.status(400).json({ message: 'Class ID and User ID are required.' });
        }

        const registrationId = await classService.registerForClass(traineeId, classId);

        res.status(201).json({
            message: 'Successfully registered for the class',
            registrationId
        });
    } catch (error) {
        next(error);
    }
}