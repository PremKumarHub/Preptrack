import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LayoutDashboard, BookOpen, MessageSquare, Building2, User, Zap, Sun, Moon, LogOut } from 'lucide-react';
import { clearSession, getStoredUser } from '../../services/api';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tracks', icon: Zap, label: 'My Track' },
  { to: '/questions', icon: BookOpen, label: 'Questions' },
  { to: '/ai-interview', icon: MessageSquare, label: 'AI Interview' },
  { to: '/company-prep', icon: Building2, label: 'Company Prep' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || null } catch { return null }
  });

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) document.documentElement.setAttribute('data-theme', stored);
  }, []);

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Local storage can be unavailable in restricted browser modes.
    }
    setTheme(next);
  }

  return (
    <aside className="sidebar-shell">
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, background: 'linear-gradient(135deg, var(--blue), var(--cyan))', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: 'white', flexShrink: 0,
          }}>P</div>
          <div>
            <div style={{ fontWeight: 850, fontSize: 16 }}>PrepTrack</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>IT Interview Prep</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'column' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-ghost"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            style={{ padding: '8px 10px', fontSize: 13, flex: 1, justifyContent: 'center' }}
          >
            { (theme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) === 'dark' ? <Sun size={14} /> : <Moon size={14} /> }
            <span style={{ marginLeft: 8 }}>{(theme || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button
            className="btn btn-ghost"
            title="Logout"
            aria-label="Logout"
            onClick={() => { clearSession(); navigate('/auth'); }}
            style={{ padding: '8px 10px' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
          borderRadius: 8, cursor: 'pointer', background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>{user?.name?.[0]?.toUpperCase() || 'P'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Prem'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(user?.role || 'mern').toUpperCase()} Track</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
