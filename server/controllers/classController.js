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
        // אם המשתמש מחובר (ויש לו טוקן), ניקח את ה-ID שלו. אם לא, traineeId יהיה null.
        const traineeId = req.user ? req.user.id : null;
        const classes = await classService.getAllClasses(traineeId);
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

// controllers/classController.js - הוסף את הפונקציה הבאה לקובץ

export async function getRegisteredClassesForUser(req, res, next) {
    try {
        // מזהה המשתמש נלקח מהטוקן המפוענח, שהוצב ב-req.user
        const traineeId = req.user.id; 
        const classes = await classService.getRegisteredClassesForUser(traineeId);
        res.status(200).json(classes);
    } catch (error) {
        next(error);
    }
}
export async function payAndRegisterForClass(req, res, next) {
    try {
        const classId = parseInt(req.params.classId, 10);
        const traineeId = req.user.id;

        // בדוק תקינות קלט בסיסית לפני קריאה לשירות
        if (isNaN(classId)) {
            throw new AppError('Invalid Class ID provided.', 400);
        }

        const result = await classService.processRegistrationWithPayment(traineeId, classId);

        res.status(201).json({
            message: 'Successfully registered and payment processed.',
            data: result
        });
    } catch (error) {
        // העבר את השגיאה ל-middleware המרכזי
        next(error);
    }
}
