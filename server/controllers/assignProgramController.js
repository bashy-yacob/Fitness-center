import * as traineeService from '../services/traineeService.js';

// שיוך תוכנית אימון למתאמן (POST)
export async function assignTrainingProgram(req, res, next) {
    try {
        const trainerId = parseInt(req.params.trainerId);
        const { traineeId, programId } = req.body;
        if (!traineeId || !programId) {
            return res.status(400).json({ error: 'חובה לציין מתאמן ותוכנית אימון' });
        }
        await traineeService.assignTrainingProgramToTrainee(traineeId, programId, trainerId);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}
