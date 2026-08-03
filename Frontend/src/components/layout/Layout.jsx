import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {/* Mobile Top Header Bar */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, var(--blue), var(--cyan))', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900, color: 'white', flexShrink: 0,
          }}>P</div>
          <div style={{ fontWeight: 850, fontSize: 16, color: 'var(--text-h)' }}>PrepTrack</div>
        </div>
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="mobile-drawer-backdrop" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

