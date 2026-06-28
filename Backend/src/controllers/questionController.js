import Question from '../models/Question.js';

export async function getQuestionsByRole(req, res, next) {
  try {
    const questions = await Question.find({ role: req.params.role.toLowerCase() }).sort({
      topic: 1,
      difficulty: 1,
      createdAt: 1,
    });
    res.json({ questions });
  } catch (error) {
    next(error);
  }
}

export async function getQuestionsByRoleAndTopic(req, res, next) {
  try {
    const questions = await Question.find({
      role: req.params.role.toLowerCase(),
      topic: new RegExp(`^${req.params.topic}$`, 'i'),
    }).sort({ difficulty: 1, createdAt: 1 });
    res.json({ questions });
  } catch (error) {
    next(error);
  }
}
