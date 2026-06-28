import Session from '../models/Session.js';
import { getInterviewFeedback } from '../services/grokService.js';

export async function feedback(req, res, next) {
  try {
    const { question, answer, role = req.user.role, round = 'technical' } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'question and answer are required' });
    }

    const result = await getInterviewFeedback({ question, answer, role, round });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function saveSession(req, res, next) {
  try {
    const { role, round, score, answers = [] } = req.body;
    if (!role || !round) {
      return res.status(400).json({ message: 'role and round are required' });
    }

    const session = await Session.create({
      userId: req.user._id,
      role,
      round,
      score,
      answers,
    });

    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
}

export async function getSessions(req, res, next) {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    if (String(userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only read your own sessions' });
    }

    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
}
