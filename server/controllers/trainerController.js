// server/controllers/trainerController.js
import * as trainerService from '../services/trainerService.js';

export async function getTrainerDashboardSummary(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const summary = await trainerService.getTrainerDashboardSummary(trainerId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

export async function getUpcomingClasses(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const classes = await trainerService.getUpcomingClasses(trainerId);
    res.json(classes);
  } catch (err) {
    next(err);
  }
}

export async function getRecentMessages(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const messages = await trainerService.getRecentMessages(trainerId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

export async function fetchTraineesByTrainerId(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const trainees = await trainerService.fetchTraineesByTrainerId(trainerId);
    res.json(trainees);
  } catch (err) {
    next(err);
  }
}

export async function sendMessagesToTrainees(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const { traineeIds, messageText } = req.body;
    if (!Array.isArray(traineeIds) || !messageText) {
      return res.status(400).json({ error: 'חובה לציין רשימת מתאמנים ותוכן הודעה' });
    }
    await trainerService.sendMessagesToTrainees(trainerId, traineeIds, messageText);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function getSentMessages(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const messages = await trainerService.getSentMessages(trainerId);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

export async function sendMessageToClass(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const { classId, messageText } = req.body;
    if (!classId || !messageText) {
      return res.status(400).json({ error: 'חובה לציין חוג ותוכן הודעה' });
    }
    await trainerService.sendMessageToClass(trainerId, classId, messageText);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function sendMessageToAdmin(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const { messageText } = req.body;
    if (!messageText) {
      return res.status(400).json({ error: 'חובה למלא תוכן הודעה' });
    }
    await trainerService.sendMessageToAdmin(trainerId, messageText);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function createClassByTrainer(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const classData = { ...req.body, trainer_id: trainerId };
    const classId = await import('../services/classService.js').then(m => m.createClass(classData));
    res.status(201).json({ message: 'Class created successfully', classId });
  } catch (err) {
    next(err);
  }
}

// סטטיסטיקות למאמן
export async function getAttendanceSummary(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const summary = await trainerService.getAttendanceSummary(trainerId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

export async function getStatsPerTrainee(req, res, next) {
  try {
    const trainerId = parseInt(req.params.trainerId);
    const stats = await trainerService.getStatsPerTrainee(trainerId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
