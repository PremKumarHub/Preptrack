import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { api, saveSession } from '../services/api';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'mern' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = mode === 'register' ? form : { email: form.email, password: form.password };
      const session = mode === 'register' ? await api.register(payload) : await api.login(payload);
      saveSession(session);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-base)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 420, width: '100%', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, margin: '0 auto 16px' }}>P</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}>PrepTrack Workspace</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
          Save your progress, unlock your track, and practice with instant AI feedback.
        </p>
      </div>

      <form onSubmit={submit} className="card" style={{ maxWidth: 420, width: '100%', padding: '24px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            <button type="button" className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode('login')}>
              <LogIn size={15} /> Login
            </button>
            <button type="button" className={`btn ${mode === 'register' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMode('register')}>
              <UserPlus size={15} /> Register
            </button>
          </div>

          {mode === 'register' && (
            <label className="field-label">
              Name
              <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Prem Kumar" required />
            </label>
          )}

          <label className="field-label">
            Email
            <input className="field-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </label>

          <label className="field-label">
            Password
            <input className="field-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" required minLength={6} />
          </label>

          {mode === 'register' && (
            <label className="field-label">
              Track
              <select className="field-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="mern">MERN Stack</option>
                <option value="java">Java Developer</option>
                <option value="python">Python Developer</option>
                <option value="frontend">Frontend Developer</option>
                <option value="data">Data Analyst</option>
                <option value="devops">DevOps Engineer</option>
              </select>
            </label>
          )}

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 8 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login to PrepTrack' : 'Create account'} <ArrowRight size={15} />
          </button>
        </form>
    </div>
  );
}
