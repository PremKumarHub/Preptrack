import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Flame, MessageSquare, Target, TrendingUp } from 'lucide-react';
import { topicsByRole } from '../data';
import { api, getStoredUser, roleLabels } from '../services/api';

const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${color}18`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Icon size={19} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 25, fontWeight: 850, color: 'var(--text-h)' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    api.progress().then(setProgress).catch(() => setProgress(null));
  }, []);

  const roleKey = user?.role || 'mern';
  const roleLabel = roleLabels[roleKey] || 'MERN Stack Developer';
  const topics = topicsByRole.mern;

  const doneCount = progress?.doneCount ?? topics.reduce((sum, t) => sum + t.done, 0);
  const totalQuestions = progress?.totalQuestions ?? topics.reduce((sum, t) => sum + t.questions, 0);
  const percent = progress?.readiness ?? Math.round((doneCount / totalQuestions) * 100);
  const streak = progress?.streak ?? 0;
  const sessionCount = progress?.sessionCount ?? 0;
  const avgScore = progress?.avgInterviewScore ?? progress?.lastSessionScore ?? 0;
  const dailyDone = progress?.dailyGoal?.done ?? 0;
  const dailyTarget = progress?.dailyGoal?.target ?? 10;
  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}`;

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 850, marginBottom: 4 }}>{greeting}, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{today}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/ai-interview')}>
          <MessageSquare size={15} /> Start AI Interview
        </button>
      </div>

      <div className="metric-grid" style={{ marginBottom: 22 }}>
        <StatCard icon={BookOpen} label="Questions Done" value={doneCount} sub={`of ${totalQuestions} in ${roleLabel}`} color="var(--blue)" />
        <StatCard icon={MessageSquare} label="Mock Interviews" value={sessionCount} sub={avgScore ? `Avg score: ${avgScore}%` : 'Start your first session'} color="var(--purple)" />
        <StatCard icon={Flame} label="Day Streak" value={streak} sub={streak > 0 ? 'Keep the habit alive' : 'Complete a question today'} color="var(--orange)" />
        <StatCard icon={TrendingUp} label="Readiness Score" value={`${percent}%`} sub={`${dailyDone}/${dailyTarget} daily goal`} color="var(--green)" />
      </div>

      <div className="content-grid" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Active Track</div>
              <div style={{ fontWeight: 850, fontSize: 18, color: 'var(--text-h)' }}>{roleLabel}</div>
            </div>
            <span className="badge badge-blue">{percent}% Complete</span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 18 }}>
            <div className="progress-fill" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, var(--blue), var(--cyan))' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(progress?.topics?.length ? progress.topics.slice(0, 5).map((t) => ({ name: t.topic, done: t.done, questions: t.done + 5 })) : topics.slice(0, 5)).map((topic) => (
              <div key={topic.name} style={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) 86px', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: topic.done >= topic.questions ? 'var(--green)' : topic.done > 0 ? 'var(--blue-glow)' : 'var(--border)', border: topic.done > 0 && topic.done < topic.questions ? '2px solid var(--blue)' : 'none', display: 'grid', placeItems: 'center' }}>
                  {topic.done >= topic.questions && <CheckCircle2 size={13} color="white" />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h)' }}>{topic.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{topic.done}/{topic.questions} done</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (topic.done / topic.questions) * 100)}%`, background: topic.done >= topic.questions ? 'var(--green)' : 'var(--blue)' }} />
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-outline" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={() => navigate('/tracks')}>
            View Full Track <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Target size={16} color="var(--orange)" />
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-h)' }}>Today&apos;s Goal</span>
              <span className="badge badge-orange" style={{ marginLeft: 'auto' }}>{dailyDone} / {dailyTarget} done</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: 12 }}>
              <div className="progress-fill" style={{ width: `${Math.min(100, (dailyDone / dailyTarget) * 100)}%`, background: 'var(--orange)' }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {dailyDone >= dailyTarget ? 'Daily goal complete! Great work.' : `${dailyTarget - dailyDone} more questions to complete today\u2019s goal.`}
            </p>
            <button className="btn btn-outline" style={{ marginTop: 12, width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={() => navigate('/questions')}>
              Continue Practicing
            </button>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(79,140,255,0.16), rgba(34,211,238,0.08))', borderColor: 'var(--accent-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <MessageSquare size={16} color="var(--cyan)" />
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-h)' }}>AI Mock Interview</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>Practice technical or HR rounds and get instant AI feedback powered by Grok/Groq.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} onClick={() => navigate('/ai-interview')}>
                Technical
              </button>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }} onClick={() => navigate('/ai-interview')}>
                HR
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-h)' }}>Recommended for Today</div>
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => navigate('/questions')}>View All</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { q: 'Explain the Virtual DOM in React and how it improves performance.', topic: 'React', diff: 'Medium', color: 'var(--blue)' },
            { q: 'What is middleware in Express.js? Give a real-world use case.', topic: 'Node.js', diff: 'Easy', color: 'var(--green)' },
            { q: 'How does JWT authentication work? Explain the full flow.', topic: 'Auth', diff: 'Medium', color: 'var(--blue)' },
          ].map((item) => (
            <button key={item.q} style={{ display: 'grid', gridTemplateColumns: '8px minmax(0, 1fr) auto auto 16px', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'rgba(148,163,184,0.06)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text)' }} onClick={() => navigate('/questions')}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color }} />
              <span style={{ fontSize: 14, textAlign: 'left' }}>{item.q}</span>
              <span className="badge badge-blue">{item.topic}</span>
              <span className={`badge ${item.diff === 'Easy' ? 'badge-green' : 'badge-blue'}`}>{item.diff}</span>
              <ArrowRight size={14} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
