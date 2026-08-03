import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { mockQuestions } from '../data';
import { api, getStoredUser } from '../services/api';

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
const companyOptions = ['All', 'TCS', 'Infosys', 'Zoho', 'Wipro', 'Freshworks', 'Cognizant'];

export default function Questions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const companyQuery = searchParams.get('company');
  const topicQuery = searchParams.get('topic');

  const [openId, setOpenId] = useState(null);
  const [diffFilter, setDiffFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [prevFilters, setPrevFilters] = useState({ diffFilter: 'All', topicFilter: 'All', companyFilter: 'All', search: '', companyQuery: null });

  const [done, setDone] = useState(new Set());
  const [serverQuestions, setServerQuestions] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.role) return;

    Promise.all([
      api.questions(user.role).catch(() => ({ questions: [] })),
      api.progress().catch(() => ({ records: [] })),
    ]).then(([questionsRes, progressRes]) => {
      const questions = questionsRes.questions || [];
      if (questions.length) {
        setServerQuestions(questions);
        setStatus('Live backend data');
      } else {
        setStatus('Using local practice set');
      }

      const doneIds = new Set(
        (progressRes.records || [])
          .filter((r) => r.done && r.questionId?._id)
          .map((r) => String(r.questionId._id))
      );
      if (doneIds.size) setDone(doneIds);
    });
  }, []);

  useEffect(() => {
    if (!topicQuery) return;
    setTopicFilter(topicQuery);
  }, [topicQuery]);

  const allQuestions = useMemo(() => {
    if (serverQuestions.length) {
      return serverQuestions.map((item) => ({
        id: item._id,
        q: item.question,
        topic: item.topic,
        difficulty: item.difficulty,
        hint: item.hint,
        answer: item.answer,
        externalLink: item.externalLink,
        companies: item.companies || [],
      }));
    }

    const user = getStoredUser();
    const role = user?.role || 'mern';
    const mockList = mockQuestions[role] || [];
    const mockAptitude = mockQuestions.aptitude || [];
    return [...mockList, ...mockQuestions.hr, ...mockAptitude].map(q => ({
      ...q,
      companies: q.companies || [],
    }));
  }, [serverQuestions]);

  const topics = useMemo(() => {
    const uniqueTopics = new Set(allQuestions.map(q => q.topic).filter(Boolean));
    return ['All', ...Array.from(uniqueTopics).sort()];
  }, [allQuestions]);

  const adjustedTopicFilter = topics.includes(topicFilter) ? topicFilter : 'All';

  const filtered = allQuestions.filter((q) =>
    (diffFilter === 'All' || q.difficulty === diffFilter) &&
    (adjustedTopicFilter === 'All' || q.topic === adjustedTopicFilter) &&
    (companyFilter === 'All' || q.companies.includes(companyFilter.toLowerCase())) &&
    (!companyQuery || q.companies.includes(companyQuery.toLowerCase())) &&
    (q.q.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()))
  );

  if (
    diffFilter !== prevFilters.diffFilter ||
    adjustedTopicFilter !== prevFilters.topicFilter ||
    companyFilter !== prevFilters.companyFilter ||
    search !== prevFilters.search ||
    companyQuery !== prevFilters.companyQuery
  ) {
    setPrevFilters({ diffFilter, topicFilter: adjustedTopicFilter, companyFilter, search, companyQuery });
    setPage(1);
  }

  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
      setStatus('Saved locally. Backend progress update failed.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        {companyQuery ? (
          <button 
            className="btn btn-ghost" 
            style={{ marginBottom: 12, padding: '4px 8px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => setSearchParams({})}
          >
            ← Back to All Questions
          </button>
        ) : null}
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          {companyQuery ? `${companyQuery.toUpperCase()} Practice Set` : 'Question Bank'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Practice topic-wise interview questions with hints and answers.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions or topics..."
          style={{
            flex: '1 1 200px',
            background: 'var(--bg-base)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 14px',
            color: 'var(--text-primary)',
            fontSize: 14,
            outline: 'none'
          }}
        />
        {!companyQuery && (
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none'
            }}
          >
            <option value="All">All Companies</option>
            {companyOptions.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginRight: 6 }}>Difficulty:</span>
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setDiffFilter(difficulty)}
              className={`btn ${diffFilter === difficulty ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '7px 16px', fontSize: 13 }}
            >
              {difficulty}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginRight: 6 }}>Topic:</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 4 }}>
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setTopicFilter(topic)}
                className={`btn ${adjustedTopicFilter === topic ? 'btn-outline' : 'btn-ghost'}`}
                style={{ padding: '7px 16px', fontSize: 13, whiteSpace: 'nowrap' }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
          Found {filtered.length} questions · {done.size} completed{status ? ` · ${status}` : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {paginated.map((q, idx) => {
          const uid = String(q.id || idx);
          const isOpen = openId === uid;

          return (
            <div key={uid} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s', ...(isOpen ? { borderColor: 'var(--blue)' } : {}) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }} onClick={() => setOpenId(isOpen ? null : uid)}>
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, wordBreak: 'break-word' }}>{q.q}</div>
                  {q.companies && q.companies.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {q.companies.map(c => (
                        <span key={c} className="badge" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 10, padding: '2px 6px', textTransform: 'uppercase' }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
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

      {pageCount > 1 && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, alignItems: 'center' }}>
          <button className="btn btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </button>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Page {page} of {pageCount}</span>
          <button className="btn btn-outline" onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
