import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';
import { api, getStoredUser } from '../services/api';
import { companies as fallbackCompanies } from '../data';

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [company, setCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fallback = fallbackCompanies.find((c) => c.id === companyId);
    if (fallback) setCompany(fallback);

    Promise.all([
      api.company(companyId).catch(() => ({ company: fallback })),
      api.companyQuestions(companyId, user?.role).catch(() => ({ questions: [] })),
    ])
      .then(([companyRes, questionsRes]) => {
        setCompany(companyRes.company || fallback);
        setQuestions(questionsRes.questions || []);
      })
      .catch(() => setError('Could not load company prep data.'))
      .finally(() => setLoading(false));
  }, [companyId, user?.role]);

  if (loading) {
    return <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading company prep guide...</div>;
  }

  if (!company) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <p>Company not found.</p>
        <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/company-prep')}>
          <ArrowLeft size={14} /> Back to Company Prep
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-ghost" style={{ marginBottom: 20, fontSize: 13, padding: '6px 12px' }} onClick={() => navigate('/company-prep')}>
        <ArrowLeft size={14} /> All Companies
      </button>

      <div className="card" style={{ marginBottom: 24, background: `linear-gradient(135deg, ${company.color}18, transparent)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: `${company.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: company.color }}>
            {company.logo}
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{company.name} Prep Guide</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{company.pattern}</p>
          </div>
        </div>

        {company.focus && (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
            <strong>Focus:</strong> {company.focus}
          </p>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Interview Rounds</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {company.rounds.map((round, i) => (
              <span key={round} className="badge badge-blue">{i + 1}. {round}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/ai-interview')}>
            <MessageSquare size={14} /> Start AI Mock Interview
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/questions')}>
            Practice All Questions <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Company-Specific Questions</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {questions.length} curated questions for {company.name} ({user?.role || 'mern'} track)
        </p>
      </div>

      {error && <div className="card" style={{ marginBottom: 16, color: 'var(--orange)', fontSize: 14 }}>{error}</div>}

      {questions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          No company-specific questions seeded yet. Run <code>npm run seed</code> in the Backend folder.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q) => (
            <div key={q._id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <CheckCircle2 size={18} color="var(--blue)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{q.question}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className="badge badge-blue">{q.topic}</span>
                    <span className={`badge ${q.difficulty === 'Easy' ? 'badge-green' : q.difficulty === 'Hard' ? 'badge-red' : 'badge-blue'}`}>{q.difficulty}</span>
                  </div>
                  {q.hint && (
                    <div style={{ padding: '10px 12px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: q.practiceUrl ? 10 : 0 }}>
                      <strong>Hint:</strong> {q.hint}
                    </div>
                  )}
                  {q.practiceUrl && (
                    <a 
                      href={q.practiceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline" 
                      style={{ width: 'fit-content', fontSize: 12, padding: '5px 10px', gap: 6, color: 'var(--orange)', borderColor: 'var(--orange)' }}
                    >
                      <ExternalLink size={12} /> Practice on External Platform
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
