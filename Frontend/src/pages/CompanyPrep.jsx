import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { companies } from '../data';

export default function CompanyPrep() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Company Prep</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Targeted prep for top Indian IT companies. Know the pattern, crack the round.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {companies.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => navigate(`/company-prep/${c.id}`)}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10, background: `${c.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, color: c.color,
              }}>{c.logo}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.pattern}</div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Interview Rounds</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.rounds.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue-glow)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{r}</span>
                    {i < c.rounds.length - 1 && <span style={{ color: 'var(--border)' }}>→</span>}
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/company-prep/${c.id}`); }}
            >
              View Prep Guide <ArrowRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
