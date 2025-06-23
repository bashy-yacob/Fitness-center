// controllers/userController.js
import * as userService from '../services/userService.js';
import { AppError } from '../middleware/errorMiddleware.js'; // ייבוא AppError לטיפול בשגיאות מותאמות אישית


export async function getAttendedClasses(req, res, next) {
    try {
        const userId = req.params.userId;
        const count = await userService.getAttendedClassesCount(userId);
        res.json({ count: count });
    } catch (error) {
        next(error);
    }
}

export async function getActiveSubscription(req, res, next) {
    try {
        const userId = req.params.userId;
        const subscription = await userService.getActiveSubscription(userId);
        if (!subscription) {
          return res.status(404).json({ message: 'No active subscription found.' });
        }
        res.json(subscription);
    } catch (error) {
        next(error);
    }
}
// יצירת משתמש (דרך אדמין) - שימוש בפונקציית הרישום הקיימת או פונקציה ייעודית
// לצורך הפשטות נשתמש כרגע בפונקציה מ-authService, אך בדרך כלל היית רוצה הפרדה ברורה יותר
// או פונקציית יצירה ב-userService ללא קשר ללוגיקת אוטנטיקציה.
// לשם הדוגמה, נציג פונקציית CRUD נפרדת.
export async function createUserByAdmin(req, res, next) {
    try {
        // נשתמש בפונקציה הקיימת createUser (או נבצע לוגיקה מורחבת כאן)
        const userId = await userService.createUser(req.body);
        // אם יש סיסמה, נשמור אותה בטבלת user_credentials
        if (req.body.password) {
            await userService.saveUserCredentials(userId, req.body.password);
        }
        // יצירת פרופיל מתאמן/מאמן אם צריך
        if (req.body.user_type === 'trainee') {
            await userService.createTraineeProfile(userId, req.body.date_of_birth, req.body.gender);
        }
        if (req.body.user_type === 'trainer') {
            await userService.createTrainerProfile(userId, req.body.specialization, req.body.bio || '');
        }
        res.status(201).json({ message: 'User created successfully by admin', userId });
    } catch (error) {
        next(error);
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

export async function getAllUsersMinimal(req, res, next) {
    console.log('DEBUG: getAllUsersMinimal called by user', req.user);
    try {
        const users = await userService.getAllUsersMinimal();
        const myId = req.user.id;
        const myType = req.user.user_type;
        let filtered;
        if (myType === 'admin') {
            filtered = users.filter(u => u.id !== myId);
        } else if (myType === 'trainee') {
            filtered = users.filter(u => u.id !== myId && (u.user_type === 'admin' || u.user_type === 'trainer'));
        } else if (myType === 'trainer') {
            filtered = users.filter(u => u.id !== myId && (u.user_type === 'admin' || u.user_type === 'trainee'));
        } else {
            filtered = [];
        }
        console.log('DEBUG: filtered users for minimal:', filtered);
        res.status(200).json(filtered);
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

// קבלת משתמשים לפי סוג (user_type)
export async function getUsersByType(req, res, next) {
    try {
        const { type } = req.query;
        const users = await userService.getUsersByType(type);
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}