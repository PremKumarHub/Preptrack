import Progress from '../models/Progress.js';
import Question from '../models/Question.js';
import Session from '../models/Session.js';

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateStreak(records) {
  const days = new Set(records.map((item) => startOfDay(item.timestamp).toISOString()));
  let streak = 0;
  const cursor = startOfDay(new Date());

  while (days.has(cursor.toISOString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function markQuestion(req, res, next) {
  try {
    const { questionId, done = true } = req.body;
    if (!questionId) {
      return res.status(400).json({ message: 'questionId is required' });
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, questionId },
      { done, timestamp: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ progress });
  } catch (error) {
    next(error);
  }
}

export async function getProgress(req, res, next) {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    if (String(userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only read your own progress' });
    }

    const records = await Progress.find({ userId, done: true }).populate('questionId');
    const totalQuestions = await Question.countDocuments({ role: req.user.role });
    const doneCount = records.length;

    const topicMap = new Map();
    records.forEach((record) => {
      const question = record.questionId;
      if (!question) return;
      const current = topicMap.get(question.topic) || { topic: question.topic, done: 0 };
      current.done += 1;
      topicMap.set(question.topic, current);
    });

    const dailyStart = startOfDay(new Date());
    const dailyDone = records.filter((record) => record.timestamp >= dailyStart).length;

    const sessions = await Session.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const sessionCount = await Session.countDocuments({ userId });
    const avgInterviewScore = sessions.length
      ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length)
      : 0;
    const lastSession = sessions[0] || null;

    res.json({
      doneCount,
      totalQuestions,
      readiness: totalQuestions ? Math.round((doneCount / totalQuestions) * 100) : 0,
      streak: calculateStreak(records),
      dailyGoal: { target: 10, done: dailyDone },
      topics: Array.from(topicMap.values()),
      records,
      sessions: sessions.slice(0, 5),
      sessionCount,
      avgInterviewScore,
      lastSessionScore: lastSession?.score ?? null,
      user: { name: req.user.name, role: req.user.role, email: req.user.email },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStreak(_req, res) {
  res.json({ ok: true, message: 'Login streak is calculated from completed question activity.' });
}
