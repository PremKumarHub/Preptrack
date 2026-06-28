import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, ExternalLink } from 'lucide-react';
import { mockQuestions } from '../data';
import { api, getStoredUser } from '../services/api';

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export default function Questions() {
  const [openId, setOpenId] = useState(null);
  const [diffFilter, setDiffFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
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

  const allQuestions = useMemo(() => {
    if (serverQuestions.length) {
      return serverQuestions.map((item) => ({
        id: item._id,
        q: item.question,
        topic: item.topic,
        difficulty: item.difficulty,
        hint: item.hint,
        practiceUrl: item.practiceUrl,
      }));
    }

    const role = getStoredUser()?.role || 'mern';
    return [...(mockQuestions[role] || []), ...mockQuestions.hr];
  }, [serverQuestions]);

  const availableTopics = useMemo(() => {
    const set = new Set(allQuestions.map((q) => q.topic));
    return ['All', ...Array.from(set)];
  }, [allQuestions]);

  const filtered = allQuestions.filter((q) =>
    (diffFilter === 'All' || q.difficulty === diffFilter) &&
    (topicFilter === 'All' || q.topic === topicFilter)
  );

  const toggleDone = async (questionId) => {
    const nextDone = !done.has(questionId);
    setDone((prev) => {
      const next = new Set(prev);
      nextDone ? next.add(questionId) : next.delete(questionId);
      return next;
    });

    if (serverQuestions.length) {
      try {
        await api.markDone(questionId, nextDone);
      } catch {
        setStatus('Saved locally. Backend progress update failed.');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Question Bank</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Practice topic-wise interview questions with hints and answers.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {availableTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setTopicFilter(topic)}
              className={`btn ${topicFilter === topic ? 'btn-outline' : 'btn-ghost'}`}
              style={{ padding: '7px 16px', fontSize: 13 }}
            >
              {topic}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 14, alignSelf: 'center' }}>
          {filtered.length} questions · {done.size} done{status ? ` · ${status}` : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((q, idx) => {
          const uid = String(q.id || `fallback-${idx}`);
          const isOpen = openId === uid;

          return (
            <div key={uid} className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s', ...(isOpen ? { borderColor: 'var(--blue)' } : {}) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setOpenId(isOpen ? null : uid)}>
                <div style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{q.q}</div>
                <span className="badge badge-blue" style={{ flexShrink: 0 }}>{q.topic}</span>
                <span className={`badge ${q.difficulty === 'Easy' ? 'badge-green' : q.difficulty === 'Hard' ? 'badge-red' : 'badge-blue'}`} style={{ flexShrink: 0 }}>{q.difficulty}</span>
                <button
                  aria-label="Mark question done"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleDone(uid);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <CheckCircle2 size={18} color={done.has(uid) ? 'var(--green)' : 'var(--border)'} />
                </button>
                {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
              </div>

              {isOpen && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ padding: '12px 14px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    <strong>Hint:</strong> {q.hint}
                  </div>
                  {q.practiceUrl && (
                    <a 
                      href={q.practiceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-outline" 
                      style={{ width: 'fit-content', fontSize: 12, padding: '6px 12px', marginBottom: 12, gap: 6, color: 'var(--orange)', borderColor: 'var(--orange)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={13} /> Practice on External Platform
                    </a>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Use the check button to track your progress.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
