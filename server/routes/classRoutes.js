// routes/classRoutes.js
import express from 'express';
import * as classController from '../controllers/classController.js';
import { verifyToken, isAdmin, isTrainer, isTrainee } from '../middleware/authMiddleware.js';
import { validate, createClassSchema, updateClassSchema } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, isAdmin, validate(createClassSchema), classController.createClass);
router.get('/', verifyToken, classController.getAllClasses);
router.get('/my-registrations', verifyToken, isTrainee, classController.getRegisteredClassesForUser);
router.get('/:id', verifyToken, classController.getClassById);
router.put('/:id', verifyToken, isAdmin, validate(updateClassSchema), classController.updateClass);
router.delete('/:id', verifyToken, isAdmin, classController.deleteClass);
router.post('/:classId/register', verifyToken, isTrainee, classController.registerUserForClass);
router.delete('/:classId/unregister', verifyToken, isTrainee, classController.unregisterFromClass);
router.get('/:classId/registrations', verifyToken, isTrainer, classController.getClassRegistrations);
// Adding a new route for trainer dashboard
// router.get('/trainer/:trainerId/dashboard', verifyToken, isTrainer, (req, res) => {
//     // Example response, replace with actual logic
//     res.json({ message: `Dashboard data for trainer ${req.params.trainerId}` });
// });


export default router;