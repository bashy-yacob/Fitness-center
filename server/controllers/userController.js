// controllers/userController.js
import * as userService from '../services/userService.js';
import { AppError } from '../middleware/errorMiddleware.js'; // ייבוא AppError לטיפול בשגיאות מותאמות אישית

// יצירת משתמש (דרך אדמין) - שימוש בפונקציית הרישום הקיימת או פונקציה ייעודית
// לצורך הפשטות נשתמש כרגע בפונקציה מ-authService, אך בדרך כלל היית רוצה הפרדה ברורה יותר
// או פונקציית יצירה ב-userService ללא קשר ללוגיקת אוטנטיקציה.
// לשם הדוגמה, נציג פונקציית CRUD נפרדת.
export async function createUserByAdmin(req, res, next) {
    try {
        // שימו לב: כאן אין צורך להצפין סיסמה שוב, זה קורה ב-userService
        const newUser = await userService.createUserAdmin(req.body); // פונקציה חדשה שתיצור ב-userService
        res.status(201).json({ message: 'User created successfully by admin', user: newUser });
    } catch (error) {
        next(error); // העברת השגיאה ל-middleware לטיפול בשגיאות
    }
}


export async function getAllUsers(req, res, next) {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

export async function getUserById(req, res, next) {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        if (!user) {
            throw new AppError('User not found', 404); // שימוש ב-AppError
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await userService.updateUser(id, req.body);
        if (!updated) {
            throw new AppError('Failed to update user or user not found', 400);
        }
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        next(error);
    }
}

export async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await userService.deleteUser(id);
        if (!deleted) {
            throw new AppError('Failed to delete user or user not found', 400);
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
}

/**
 * קבלת פרטי המשתמש המחובר
 */
export async function getMe(req, res, next) {
    try {
        // req.user.id מגיע מהטוקן
        const user = await userService.getUserById(req.user.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

/**
 * עדכון פרטי המשתמש המחובר
 */
export async function updateMe(req, res, next) {
    try {
        const userId = req.user.id;
        const userData = req.body;

        // חשוב למנוע ממשתמש רגיל לשנות את תפקידו או להפוך את עצמו לאדמין
        delete userData.user_type;
        delete userData.id; // למנוע שינוי ID

        const updated = await userService.updateUser(userId, userData);
        if (!updated) {
            throw new AppError('Failed to update user profile', 400);
        }
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
}

export async function uploadProfilePicture(req, res, next) {
    try {
        if (!req.file) {
            throw new AppError('No file uploaded.', 400);
        }

        const userId = req.user.id;
        // req.file.filename הוא השם הייחודי ש-multer יצר
        const pictureUrl = req.file.filename; 

        await userService.updateUserProfilePicture(userId, pictureUrl);

        res.status(200).json({ 
            message: 'Profile picture updated successfully',
            profile_picture_url: pictureUrl 
        });
    } catch (error) {
        next(error);
    }
}