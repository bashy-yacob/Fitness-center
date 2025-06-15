import * as traineeService from '../../services/traineeService.js';
import { AppError } from '../../middleware/errorMiddleware.js';

export async function getTraineeDashboard(req, res, next) {
    try {
        // וידוא שהמשתמש מנסה לגשת למידע שלו
        if (req.user.id !== parseInt(req.params.traineeId) && req.user.user_type !== 'admin') {
            throw new AppError('אין הרשאה לצפות במידע זה', 403);
        }

        const dashboardData = await traineeService.getTraineeDashboard(req.params.traineeId);
        
        res.status(200).json({
            status: 'success',
            data: {
                ...dashboardData,
                user: {
                    id: req.user.id,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name,
                    email: req.user.email
                }
            }
        });
    } catch (error) {
        next(error);
    }
}
