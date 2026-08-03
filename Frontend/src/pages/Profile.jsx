import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, MessageSquare, Target } from 'lucide-react';
import { api, getStoredUser, roleLabels } from '../services/api';

export default function Profile() {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeRole, setActiveRole] = useState(user?.role || 'mern');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [roleStatus, setRoleStatus] = useState('');

  const changeRole = async (newRole) => {
    setUpdatingRole(true);
    setRoleStatus('');
    try {
      const res = await api.updateRole(newRole);
      const updatedUser = { ...user, role: res.user.role };
      localStorage.setItem('preptrack_user', JSON.stringify(updatedUser));
      setActiveRole(res.user.role);
      setRoleStatus('Track successfully updated! Reloading...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setRoleStatus(`Error: ${err.message}`);
    } finally {
      setUpdatingRole(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.progress().catch(() => null),
      api.interviewSessions().catch(() => ({ sessions: [] })),
    ]).then(([progressData, sessionData]) => {
      setProgress(progressData);
      setSessions(sessionData?.sessions || []);
    });
  }, []);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const roleLabel = roleLabels[user?.role] || user?.role || 'MERN Stack';

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your progress overview and interview history.</p>
      </div>

      <div className="card" style={{ maxWidth: 560, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white', flexShrink: 0 }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{user?.name || 'User'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            <Mail size={13} /> {user?.email || '—'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <span className="badge badge-blue">{roleLabel}</span>
            <span className="badge badge-green">Active</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Change Active Track</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="field-input"
            value={activeRole}
            onChange={(e) => changeRole(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', margin: 0, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none' }}
            disabled={updatingRole}
          >
            <option value="mern">MERN Stack</option>
            <option value="java">Java Developer</option>
            <option value="python">Python Developer</option>
            <option value="frontend">Frontend Developer</option>
            <option value="data">Data Analyst</option>
            <option value="devops">DevOps Engineer</option>
          </select>
        </div>
        {roleStatus && <div style={{ fontSize: 13, color: 'var(--blue)', marginTop: 8, fontWeight: 500 }}>{roleStatus}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, maxWidth: 560, marginBottom: 28 }}>
        {[
          { label: 'Questions Done', value: progress?.doneCount ?? '—' },
          { label: 'Mock Interviews', value: progress?.sessionCount ?? sessions.length ?? '—' },
          { label: 'Day Streak', value: progress?.streak != null ? `${progress.streak} 🔥` : '—' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue)' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ maxWidth: 720, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Target size={16} color="var(--blue)" />
          <span style={{ fontWeight: 800, fontSize: 16 }}>Performance Summary</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Readiness Score</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)' }}>{progress?.readiness ?? 0}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Avg Interview Score</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--purple)' }}>{progress?.avgInterviewScore ?? '—'}%</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={16} color="var(--purple)" />
            <span style={{ fontWeight: 800, fontSize: 16 }}>Recent Interview Sessions</span>
          </div>
          <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => navigate('/ai-interview')}>
            New Interview
          </button>
        </div>

        {sessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No saved sessions yet. Complete an AI mock interview to track your progress.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.slice(0, 5).map((session) => (
              <div key={session._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{session.role} · {session.round}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Calendar size={12} /> {new Date(session.createdAt).toLocaleDateString('en-IN')}
                    · {session.answers?.length || 0} questions
                  </div>
                </div>
                <span className={`badge ${session.score >= 70 ? 'badge-green' : session.score >= 50 ? 'badge-blue' : 'badge-orange'}`}>{session.score}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
