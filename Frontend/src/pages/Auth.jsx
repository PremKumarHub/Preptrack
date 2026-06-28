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
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr minmax(340px, 420px)', background: 'var(--bg-base)' }}>
      <section style={{ padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 620 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: 24 }}>P</div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.08, marginBottom: 18 }}>Build interview momentum every day.</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.7 }}>
            Save your progress, unlock your track, and use AI feedback when the backend is running.
          </p>
        </div>
      </section>

      <section style={{ padding: 32, display: 'flex', alignItems: 'center' }}>
        <form onSubmit={submit} className="card" style={{ width: '100%', padding: 24 }}>
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
              </select>
            </label>
          )}

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 8 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login to PrepTrack' : 'Create account'} <ArrowRight size={15} />
          </button>
        </form>
      </section>
    </div>
  );
}
