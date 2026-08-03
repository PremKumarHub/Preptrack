import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { api, getStoredUser } from '../services/api';
import { companies as fallbackCompanies } from '../data';

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const [company, setCompany] = useState(() => fallbackCompanies.find((c) => c.id === companyId));
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prevCompanyId, setPrevCompanyId] = useState(companyId);
  const [openId, setOpenId] = useState(null);
  const [done, setDone] = useState(new Set());
  const [activeRoundFilter, setActiveRoundFilter] = useState(null);

  if (companyId !== prevCompanyId) {
    setPrevCompanyId(companyId);
    setCompany(fallbackCompanies.find((c) => c.id === companyId));
    setActiveRoundFilter(null);
  }

  const getQuestionRound = (q, rounds) => {
    const topic = (q.topic || '').toLowerCase();
    const role = (q.role || '').toLowerCase();

    // 1. Aptitude round check
    if (topic === 'aptitude' || role === 'aptitude') {
      return (rounds || []).find(r => /aptitude|online|written/i.test(r)) || (rounds && rounds[0]);
    }
    // 2. HR / Culture round check
    if (role === 'hr' || /intro|motivation|behavioral|career|self-awareness/i.test(topic)) {
      return (rounds || []).find(r => /hr|culture/i.test(r)) || (rounds && rounds[rounds.length - 1]);
    }
    // 3. Coding / DSA round check
    if (topic === 'dsa' || q.externalLink) {
      return (rounds || []).find(r => /coding|dsa|written|technical/i.test(r)) || (rounds && rounds[0]);
    }
    // 4. Technical / TR round check
    return (rounds || []).find(r => /tr|technical|design|saas/i.test(r)) || (rounds && rounds[0]);
  };

  const filteredQuestions = useMemo(() => {
    if (!activeRoundFilter) return questions;
    return questions.filter(q => getQuestionRound(q, company?.rounds) === activeRoundFilter);
  }, [questions, activeRoundFilter, company?.rounds]);

  const toggleDone = async (questionId) => {
    const nextDone = !done.has(questionId);
    setDone((prev) => {
      const next = new Set(prev);
      nextDone ? next.add(questionId) : next.delete(questionId);
      return next;
    });

    try {
      await api.markDone(questionId, nextDone);
    } catch {
      setError('Failed to update progress on the server.');
    }
  };

  useEffect(() => {
    const fallback = fallbackCompanies.find((c) => c.id === companyId);

    Promise.all([
      api.company(companyId).catch(() => ({ company: fallback })),
      api.companyQuestions(companyId, user?.role).catch(() => ({ questions: [] })),
      api.progress().catch(() => ({ records: [] })),
    ])
      .then(([companyRes, questionsRes, progressRes]) => {
        setCompany(companyRes.company || fallback);
        setQuestions(questionsRes.questions || []);

        const doneIds = new Set(
          (progressRes.records || [])
            .filter((r) => r.done && r.questionId?._id)
            .map((r) => String(r.questionId._id))
        );
        setDone(doneIds);
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
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Interview Rounds (Click to filter)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveRoundFilter(null)}
              className={`badge ${!activeRoundFilter ? 'badge-blue' : 'badge-ghost'}`}
              style={{ border: 'none', cursor: 'pointer', padding: '6px 12px' }}
            >
              All Rounds
            </button>
            {company.rounds.map((round, i) => {
              const isActive = activeRoundFilter === round;
              return (
                <button
                  key={round}
                  onClick={() => setActiveRoundFilter(round)}
                  className={`badge ${isActive ? 'badge-blue' : 'badge-ghost'}`}
                  style={{ border: 'none', cursor: 'pointer', padding: '6px 12px' }}
                >
                  {i + 1}. {round}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/ai-interview')}>
            <MessageSquare size={14} /> Start AI Mock Interview
          </button>
          <button className="btn btn-outline" onClick={() => navigate(`/questions?company=${company.id}`)}>
            Practice All Questions <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Company-Specific Questions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Showing {filteredQuestions.length} of {questions.length} curated questions for {company.name} ({user?.role || 'mern'} track)
          </p>
        </div>

        {error && <div className="card" style={{ marginBottom: 16, color: 'var(--orange)', fontSize: 14 }}>{error}</div>}

        {questions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
            No company-specific questions seeded yet. Run <code>npm run seed</code> in the Backend folder.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredQuestions.map((q) => {
            const uid = String(q._id);
            const isOpen = openId === uid;

            return (
              <div key={uid} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s', ...(isOpen ? { borderColor: 'var(--blue)' } : {}) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }} onClick={() => setOpenId(isOpen ? null : uid)}>
                  <div style={{ flex: '1 1 220px', fontWeight: 500, fontSize: 14, minWidth: 0, wordBreak: 'break-word' }}>{q.question}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
                    <span className="badge badge-blue">{q.topic}</span>
                    <span className={`badge ${q.difficulty === 'Easy' ? 'badge-green' : q.difficulty === 'Hard' ? 'badge-red' : 'badge-blue'}`}>{q.difficulty}</span>
                    <button
                      aria-label="Mark question done"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleDone(uid);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 4 }}
                    >
                      <CheckCircle2 size={18} color={done.has(uid) ? 'var(--green)' : 'var(--border)'} />
                    </button>
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    {q.externalLink && (
                      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                        <a
                          href={q.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{
                            fontSize: 13,
                            padding: '8px 14px',
                            textDecoration: 'none',
                            color: '#FFA116',
                            borderColor: '#FFA116',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Practice on LeetCode ↗
                        </a>
                        <button
                          className={`btn ${done.has(uid) ? 'btn-ghost' : 'btn-primary'}`}
                          style={{ fontSize: 13, padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDone(uid);
                          }}
                        >
                          {done.has(uid) ? 'Completed ✓' : 'Mark as Done'}
                        </button>
                      </div>
                    )}
                    <div style={{ padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                      <strong>Hint:</strong> {q.hint}
                    </div>
                    {q.answer && (
                      <div style={{ padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-primary)', marginBottom: 10 }}>
                        <strong>Answer:</strong> {q.answer}
                      </div>
                    )}
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Use the check button to track your progress.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
