import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { mockQuestions } from '../data';
import { api, getStoredUser, roleLabels } from '../services/api';

const topicsDefinition = {
  mern: [
    { name: 'React', difficulty: 'Medium' },
    { name: 'Node.js', difficulty: 'Medium' },
    { name: 'Express', difficulty: 'Medium' },
    { name: 'MongoDB', difficulty: 'Medium' },
    { name: 'Aptitude', difficulty: 'Medium' },
    { name: 'HR & Behavioral', difficulty: 'Easy' },
  ],
  java: [
    { name: 'Java Core', difficulty: 'Easy' },
    { name: 'Collections', difficulty: 'Medium' },
    { name: 'Spring Boot', difficulty: 'Medium' },
    { name: 'Aptitude', difficulty: 'Medium' },
    { name: 'HR & Behavioral', difficulty: 'Easy' },
  ],
  python: [
    { name: 'Python Basics', difficulty: 'Easy' },
    { name: 'Decorators', difficulty: 'Medium' },
    { name: 'Django & FastAPI', difficulty: 'Medium' },
    { name: 'Machine Learning', difficulty: 'Medium' },
    { name: 'Aptitude', difficulty: 'Medium' },
    { name: 'HR & Behavioral', difficulty: 'Easy' },
  ],
  data: [
    { name: 'SQL', difficulty: 'Easy' },
    { name: 'Pandas', difficulty: 'Medium' },
    { name: 'Statistics', difficulty: 'Medium' },
    { name: 'Aptitude', difficulty: 'Medium' },
    { name: 'HR & Behavioral', difficulty: 'Easy' },
  ],
  devops: [
    { name: 'Containers', difficulty: 'Medium' },
    { name: 'CI/CD', difficulty: 'Medium' },
    { name: 'Git', difficulty: 'Medium' },
    { name: 'Cloud', difficulty: 'Easy' },
    { name: 'Aptitude', difficulty: 'Medium' },
    { name: 'HR & Behavioral', difficulty: 'Easy' },
  ],
  frontend: [
    { name: 'HTML & CSS', difficulty: 'Easy' },
    { name: 'JavaScript', difficulty: 'Medium' },
    { name: 'React', difficulty: 'Medium' },
    { name: 'Aptitude', difficulty: 'Medium' },
    { name: 'HR & Behavioral', difficulty: 'Easy' },
  ],
};

const matchQuestionToTopic = (qTopic, roleTopicName) => {
  const qt = (qTopic || '').toLowerCase();
  const rt = (roleTopicName || '').toLowerCase();
  if (rt === 'hr & behavioral') {
    return /behavioral|motivation|introduction|career/i.test(qt) || qt === 'hr';
  }
  if (rt === 'django & fastapi') {
    return /django|fastapi/i.test(qt);
  }
  return qt.includes(rt) || rt.includes(qt);
};

export default function Tracks() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = user?.role || 'mern';
    Promise.all([
      api.questions(role).catch(() => ({ questions: [] })),
      api.progress().catch(() => null),
    ])
      .then(([questionsRes, progressRes]) => {
        const qList = questionsRes.questions?.length
          ? questionsRes.questions
          : [
              ...(mockQuestions[role] || []),
              ...(mockQuestions.hr || []),
              ...(mockQuestions.aptitude || []),
            ].map((q, i) => ({
              _id: q.id || String(i),
              question: q.q,
              topic: q.topic,
              difficulty: q.difficulty,
              role: q.role,
            }));
        setQuestions(qList);
        setProgress(progressRes);
      })
      .finally(() => setLoading(false));
  }, [user?.role]);

  const activeRole = user?.role || 'mern';
  const roleLabel = roleLabels[activeRole] || 'MERN Stack Developer';

  const doneSet = useMemo(() => {
    return new Set(
      (progress?.records || [])
        .filter((r) => r.done && r.questionId?._id)
        .map((r) => String(r.questionId._id))
    );
  }, [progress]);

  const topicProgress = useMemo(() => {
    const topicsDef = topicsDefinition[activeRole] || topicsDefinition.mern;
    return topicsDef.map((tDef) => {
      const matched = questions.filter((q) => matchQuestionToTopic(q.topic || '', tDef.name));
      const doneCount = matched.filter((q) => doneSet.has(String(q._id))).length;
      return {
        name: tDef.name,
        difficulty: tDef.difficulty,
        questions: matched.length,
        done: doneCount,
      };
    });
  }, [questions, activeRole, doneSet]);

  const totalDone = useMemo(() => topicProgress.reduce((sum, topic) => sum + topic.done, 0), [topicProgress]);
  const totalQuestions = useMemo(() => topicProgress.reduce((sum, topic) => sum + topic.questions, 0), [topicProgress]);
  const totalPercent = useMemo(() => totalQuestions ? Math.round((totalDone / totalQuestions) * 100) : 0, [totalDone, totalQuestions]);

  const handleTopicClick = (topicName) => {
    navigate(`/questions?topic=${encodeURIComponent(topicName)}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
        Loading roadmap track details...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 850, marginBottom: 6 }}>My Track</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your structured {roleLabel} preparation roadmap.</p>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontWeight: 850, fontSize: 18, color: 'var(--text-h)' }}>{roleLabel}</div>
          <span className="badge badge-blue">{totalPercent}% Complete</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${totalPercent}%`, background: 'linear-gradient(90deg, var(--blue), var(--cyan))' }} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>{totalDone} of {totalQuestions} questions completed</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {topicProgress.map((topic, index) => {
          const percent = topic.questions ? Math.round((topic.done / topic.questions) * 100) : 0;
          const completed = topic.done >= topic.questions && topic.questions > 0;
          const locked = index > 4 && topicProgress[index - 1].done === 0;

          return (
            <div key={topic.name} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', opacity: locked ? 0.55 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 200px', minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: completed ? 'var(--green-glow)' : topic.done > 0 ? 'var(--blue-glow)' : 'rgba(148,163,184,0.08)', border: `2px solid ${completed ? 'var(--green)' : topic.done > 0 ? 'var(--blue)' : 'var(--border)'}`, display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--text-h)', flexShrink: 0 }}>
                  {completed ? <CheckCircle2 size={20} color="var(--green)" /> : locked ? <Lock size={16} color="var(--text-muted)" /> : index + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 750, fontSize: 15, color: 'var(--text-h)' }}>{topic.name}</span>
                    <span className={`badge ${topic.difficulty === 'Easy' ? 'badge-green' : topic.difficulty === 'Hard' ? 'badge-red' : 'badge-blue'}`}>{topic.difficulty}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percent}%`, background: completed ? 'var(--green)' : 'var(--blue)' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{topic.done}/{topic.questions} questions · {topic.questions * 3} min</div>
                </div>
              </div>
              <button
                className={`btn ${completed ? 'btn-outline' : 'btn-primary'}`}
                style={{ fontSize: 13, padding: '8px 14px', flexShrink: 0, marginLeft: 'auto' }}
                onClick={() => handleTopicClick(topic.name)}
                disabled={locked}
              >
                {completed ? 'Review' : topic.done > 0 ? 'Continue' : 'Start'} <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
