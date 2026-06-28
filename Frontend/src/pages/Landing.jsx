import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Bot, Building2, CheckCircle2, Sparkles } from 'lucide-react';
import { companies, roles } from '../data';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-mark">P</div>
          <div>
            <div style={{ fontWeight: 850, color: 'var(--text-h)' }}>PrepTrack</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fresher interview prep</div>
          </div>
        </div>
        <div className="landing-nav-links">
          <a href="#roles">Roles</a>
          <a href="#workflow">Workflow</a>
          <a href="#companies">Companies</a>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/auth')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            Start Free <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="badge badge-blue" style={{ width: 'fit-content', marginBottom: 18 }}>
              <Sparkles size={13} /> Built for Indian IT freshers
            </div>
            <h1>Prepare for your first IT interview with a focused daily system.</h1>
            <p>
              Role tracks, curated questions, company rounds, and AI feedback in one professional preparation workspace.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
              <button className="btn btn-primary" style={{ padding: '13px 22px' }} onClick={() => navigate('/auth')}>
                Create free account <ArrowRight size={16} />
              </button>
              <button className="btn btn-outline" style={{ padding: '13px 22px' }} onClick={() => navigate('/dashboard')}>
                View dashboard
              </button>
            </div>
          </div>

          <div className="hero-preview" aria-label="PrepTrack dashboard preview">
            <div className="preview-header">
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Readiness Score</div>
                <div style={{ fontSize: 34, fontWeight: 850, color: 'var(--text-h)' }}>68%</div>
              </div>
              <span className="badge badge-green">+12% this week</span>
            </div>
            <div className="preview-grid">
              <div className="preview-tile">
                <BarChart3 size={18} color="var(--blue)" />
                <strong>47</strong>
                <span>questions done</span>
              </div>
              <div className="preview-tile">
                <Bot size={18} color="var(--cyan)" />
                <strong>5</strong>
                <span>mock rounds</span>
              </div>
              <div className="preview-tile">
                <Building2 size={18} color="var(--orange)" />
                <strong>6</strong>
                <span>company plans</span>
              </div>
            </div>
            {['React Core Concepts', 'Node.js & Express', 'Authentication with JWT'].map((item, index) => (
              <div key={item} className="preview-row">
                <CheckCircle2 size={16} color={index === 0 ? 'var(--green)' : 'var(--blue)'} />
                <span>{item}</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${82 - index * 18}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-stats">
          {[
            ['5,000+', 'Interview questions'],
            ['12', 'Role tracks'],
            ['AI', 'Answer feedback'],
            ['50+', 'Company patterns'],
          ].map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section id="roles" className="landing-section">
          <div className="section-heading">
            <h2>Choose your track</h2>
            <p>Each path keeps topics, question practice, and target companies connected.</p>
          </div>
          <div className="role-grid">
            {roles.map((role) => (
              <button key={role.id} className="role-card card" onClick={() => navigate('/auth')}>
                <span style={{ background: `${role.color}22`, color: role.color }}>{role.icon}</span>
                <div>
                  <strong>{role.label}</strong>
                  <p>{role.topics} topics · {role.questions} questions</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section id="workflow" className="landing-section">
          <div className="workflow-grid">
            {[
              ['01', 'Pick your role', 'Start with a MERN, Java, Python, Frontend, Data, or DevOps roadmap.'],
              ['02', 'Practice daily', 'Filter questions by topic and difficulty, then mark progress as you complete them.'],
              ['03', 'Interview with AI', 'Answer technical or HR questions and get immediate scoring with improvement points.'],
            ].map(([step, title, text]) => (
              <div key={step} className="card workflow-card">
                <span>{step}</span>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="companies" className="landing-section">
          <div className="section-heading">
            <h2>Company prep modules</h2>
            <p>Round patterns for common fresher hiring pipelines.</p>
          </div>
          <div className="company-strip">
            {companies.map((company) => (
              <div key={company.id} className="card">
                <strong>{company.name}</strong>
                <span>{company.pattern}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
