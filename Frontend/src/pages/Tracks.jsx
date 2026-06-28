import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { topicsByRole } from '../data';
import { api, getStoredUser, roleLabels } from '../services/api';

export default function Tracks() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    api.progress().then(setProgress).catch(() => setProgress(null));
  }, []);

  const topics = topicsByRole.mern;
  const roleLabel = roleLabels[user?.role] || 'MERN Stack Developer';

  const topicProgress = topics.map((topic) => {
    const backendTopic = progress?.topics?.find((t) => t.topic === topic.name);
    const done = backendTopic?.done ?? topic.done;
    return { ...topic, done };
  });

  const totalDone = progress?.doneCount ?? topicProgress.reduce((sum, topic) => sum + topic.done, 0);
  const totalQuestions = progress?.totalQuestions ?? topicProgress.reduce((sum, topic) => sum + topic.questions, 0);
  const totalPercent = progress?.readiness ?? Math.round((totalDone / totalQuestions) * 100);

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
          const percent = Math.round((topic.done / topic.questions) * 100);
          const completed = topic.done >= topic.questions;
          const locked = index > 4 && topicProgress[index - 1].done === 0;

          return (
            <div key={topic.name} className="card" style={{ display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr) auto', alignItems: 'center', gap: 16, opacity: locked ? 0.55 : 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: completed ? 'var(--green-glow)' : topic.done > 0 ? 'var(--blue-glow)' : 'rgba(148,163,184,0.08)', border: `2px solid ${completed ? 'var(--green)' : topic.done > 0 ? 'var(--blue)' : 'var(--border)'}`, display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--text-h)' }}>
                {completed ? <CheckCircle2 size={20} color="var(--green)" /> : locked ? <Lock size={16} color="var(--text-muted)" /> : index + 1}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                  <span style={{ fontWeight: 750, fontSize: 15, color: 'var(--text-h)' }}>{topic.name}</span>
                  <span className={`badge ${topic.difficulty === 'Easy' ? 'badge-green' : topic.difficulty === 'Hard' ? 'badge-red' : 'badge-blue'}`}>{topic.difficulty}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percent}%`, background: completed ? 'var(--green)' : 'var(--blue)' }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{topic.done}/{topic.questions} questions · {topic.questions * 3} min</div>
              </div>
              <button className={`btn ${completed ? 'btn-outline' : 'btn-primary'}`} style={{ fontSize: 13, padding: '8px 14px' }} onClick={() => navigate('/questions')} disabled={locked}>
                {completed ? 'Review' : topic.done > 0 ? 'Continue' : 'Start'} <ArrowRight size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
