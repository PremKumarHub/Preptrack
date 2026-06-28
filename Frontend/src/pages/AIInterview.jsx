import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bot, CheckCircle2, Clock, RotateCcw, Save, Send, User } from 'lucide-react';
import { mockQuestions } from '../data';
import { api, getStoredUser, getToken } from '../services/api';

const rounds = [
  { id: 'technical', label: 'Technical', icon: 'TR' },
  { id: 'hr', label: 'HR Round', icon: 'HR' },
  { id: 'project', label: 'Project Explanation', icon: 'PR' },
];

const roleOptions = [
  { label: 'MERN Stack', value: 'mern' },
  { label: 'Java Developer', value: 'java' },
  { label: 'Python Developer', value: 'python' },
  { label: 'Frontend Dev', value: 'frontend' },
  { label: 'Data Analyst', value: 'data' },
];

const feedbackFor = (answer) => {
  const len = answer.trim().split(/\s+/).filter(Boolean).length;
  if (len < 10) return { score: 30, strengths: ['Attempted an answer'], improvements: ['Answer too brief', 'Add more detail and examples', 'Use STAR method for structure'] };
  if (len < 30) return { score: 58, strengths: ['Covered the basics'], improvements: ['Add a real code example', 'Mention edge cases or alternatives'] };
  return { score: 78, strengths: ['Good explanation overall', 'Mentioned key concepts'], improvements: ['Could improve: add a concrete code snippet'] };
};

export default function AIInterview() {
  const user = getStoredUser();
  const [selectedRound, setSelectedRound] = useState('technical');
  const [selectedRole, setSelectedRole] = useState(user?.role || 'mern');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [backendQuestions, setBackendQuestions] = useState([]);
  const messagesEnd = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user?.role) return;
    const role = selectedRound === 'hr' ? 'hr' : user.role;
    api.questions(role).then((data) => {
      if (data.questions?.length) setBackendQuestions(data.questions);
    }).catch(() => {});
  }, [user?.role, selectedRound]);

  const questions = (() => {
    if (backendQuestions.length) {
      return backendQuestions.map((q) => ({
        q: q.question,
        topic: q.topic,
        difficulty: q.difficulty,
        hint: q.hint,
      }));
    }
    return selectedRound === 'hr' ? mockQuestions.hr : mockQuestions.mern;
  })();

  useEffect(() => {
    if (started) timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [started]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const roleLabel = roleOptions.find((r) => r.value === selectedRole)?.label || selectedRole;

  const startInterview = () => {
    setStarted(true);
    setCompleted(false);
    setSaved(false);
    setSessionAnswers([]);
    setMessages([{ role: 'ai', text: `Hi! I'm PrepBot, your AI interviewer for today's ${selectedRound} round.\n\nQ1/${questions.length}: ${questions[0].q}` }]);
    setFeedback(null);
    setQIndex(0);
    setTimer(0);
  };

  const sendAnswer = async () => {
    if (!input.trim() || loading || completed) return;

    const answer = input;
    const currentQuestion = questions[qIndex];
    setMessages((prev) => [...prev, { role: 'user', text: answer }]);
    setInput('');
    setLoading(true);

    try {
      const result = getToken()
        ? await api.feedback({ question: currentQuestion.q, answer, role: roleLabel, round: selectedRound })
        : feedbackFor(answer);

      const normalized = {
        score: result.score,
        strengths: result.strengths || (result.points ? [result.points[0]] : []),
        improvements: result.improvements || (result.points ? result.points.slice(1) : []),
      };

      setSessionAnswers((prev) => [...prev, {
        question: currentQuestion.q,
        answer,
        score: normalized.score,
        feedback: [...normalized.strengths, ...normalized.improvements],
      }]);

      const nextIdx = qIndex + 1;
      const isLast = nextIdx >= questions.length;
      const allScores = [...sessionAnswers, { score: normalized.score }];
      const roundAvg = Math.round(allScores.reduce((s, a) => s + a.score, 0) / allScores.length);

      const aiText = isLast
        ? `Great effort! You completed this round with an average score of ${roundAvg}%.\n\nReview your feedback and save the session to track progress.`
        : `Thanks for your answer.\n\nQ${nextIdx + 1}/${questions.length}: ${questions[nextIdx].q}`;

      setFeedback(normalized);
      setMessages((prev) => [...prev, { role: 'ai', text: aiText }]);
      if (isLast) {
        setCompleted(true);
      } else {
        setQIndex(nextIdx);
      }
    } catch {
      const localFeedback = feedbackFor(answer);
      setFeedback(localFeedback);
      setMessages((prev) => [...prev, { role: 'ai', text: `I could not reach the AI service, so I used local feedback.\n\nTip: ${currentQuestion.hint}` }]);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async () => {
    if (!getToken() || sessionAnswers.length === 0) return;
    setSaving(true);
    try {
      const avgScore = Math.round(sessionAnswers.reduce((s, a) => s + a.score, 0) / sessionAnswers.length);
      await api.saveInterviewSession({
        role: roleLabel,
        round: selectedRound,
        score: avgScore,
        answers: sessionAnswers,
      });
      setSaved(true);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Could not save session. Please try again.' }]);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStarted(false);
    setMessages([]);
    setQIndex(0);
    setFeedback(null);
    setTimer(0);
    setSessionAnswers([]);
    setCompleted(false);
    setSaved(false);
    clearInterval(timerRef.current);
  };

  const avgScore = sessionAnswers.length
    ? Math.round(sessionAnswers.reduce((s, a) => s + a.score, 0) / sessionAnswers.length)
    : 0;

  if (!started) {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>AI Mock Interview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Practice with PrepBot and get instant AI-powered answer feedback.</p>
        </div>

        <div className="card" style={{ maxWidth: 620 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>Set up your interview session</h3>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>SELECT ROLE</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {roleOptions.map((role) => (
                <button key={role.value} onClick={() => setSelectedRole(role.value)} className={`btn ${selectedRole === role.value ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 13 }}>
                  {role.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>SELECT ROUND TYPE</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {rounds.map((round) => (
                <button key={round.id} onClick={() => setSelectedRound(round.id)} className={`btn ${selectedRound === round.id ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, justifyContent: 'center', padding: '14px 12px' }}>
                  <span>{round.icon}</span> {round.label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }} onClick={startInterview}>
            Start Interview Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>AI Mock Interview</h1>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <span className="badge badge-blue">{roleLabel}</span>
            <span className="badge badge-purple">{rounds.find((r) => r.id === selectedRound)?.label}</span>
            {completed && <span className="badge badge-green">Complete</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
            <Clock size={14} /> {formatTime(timer)}
          </div>
          <span className="badge badge-green">Q {Math.min(qIndex + 1, questions.length)} / {questions.length}</span>
          {completed && getToken() && (
            <button className="btn btn-primary" style={{ fontSize: 13, padding: '7px 14px' }} onClick={saveSession} disabled={saving || saved}>
              <Save size={13} /> {saved ? 'Saved' : saving ? 'Saving...' : 'Save Session'}
            </button>
          )}
          <button className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }} onClick={reset}>
            <RotateCcw size={13} /> New Session
          </button>
        </div>
      </div>

      {completed && (
        <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(79,140,255,0.08))', borderColor: 'var(--green)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Session Complete</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                {sessionAnswers.length} questions · Average score: {avgScore}% · Duration: {formatTime(timer)}
              </div>
            </div>
            {getToken() && !saved && (
              <button className="btn btn-primary" onClick={saveSession} disabled={saving}>
                <Save size={14} /> {saving ? 'Saving...' : 'Save to History'}
              </button>
            )}
            {saved && <span className="badge badge-green">Session saved to your profile</span>}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, height: 'calc(100vh - 260px)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>PrepBot</div>
              <div style={{ fontSize: 11, color: getToken() ? 'var(--green)' : 'var(--orange)' }}>
                {getToken() ? 'AI feedback enabled' : 'Login for AI feedback'}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: msg.role === 'ai' ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {msg.role === 'ai' ? <Bot size={13} color="white" /> : <User size={13} color="var(--text-secondary)" />}
                </div>
                <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: 12, fontSize: 14, lineHeight: 1.6, background: msg.role === 'ai' ? 'var(--bg-base)' : 'var(--blue)', color: msg.role === 'ai' ? 'var(--text-primary)' : 'white', border: msg.role === 'ai' ? '1px solid var(--border)' : 'none', whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div style={{ padding: '12px 16px', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 12, width: 'fit-content', fontSize: 13 }}>AI is evaluating your answer...</div>}
            <div ref={messagesEnd} />
          </div>

          <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAnswer()}
              placeholder={completed ? 'Session complete — start a new session' : 'Type your answer here...'}
              disabled={completed}
              style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none', opacity: completed ? 0.6 : 1 }}
            />
            <button className="btn btn-primary" style={{ padding: '10px 16px' }} onClick={sendAnswer} disabled={!input.trim() || loading || completed}>
              <Send size={15} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Answer Score</div>
            {feedback ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', flexShrink: 0, background: `conic-gradient(var(--blue) ${feedback.score * 3.6}deg, var(--border) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>{feedback.score}%</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{feedback.score >= 70 ? 'Good Answer' : feedback.score >= 50 ? 'Needs Work' : 'Too Brief'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI evaluation based on clarity, depth, and accuracy</div>
                  </div>
                </div>
                {feedback.strengths?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>Strengths</div>
                    {feedback.strengths.map((point, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, marginBottom: 6 }}>
                        <CheckCircle2 size={14} color="var(--green)" style={{ marginTop: 1, flexShrink: 0 }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}
                {feedback.improvements?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)', marginBottom: 8 }}>Improvements</div>
                    {feedback.improvements.map((point, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, marginBottom: 6 }}>
                        <AlertCircle size={14} color="var(--orange)" style={{ marginTop: 1, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 14 }}>Answer a question to see AI feedback</div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Current Question</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{questions[Math.min(qIndex, questions.length - 1)]?.q}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-blue">{questions[Math.min(qIndex, questions.length - 1)]?.topic}</span>
              <span className={`badge ${questions[Math.min(qIndex, questions.length - 1)]?.difficulty === 'Easy' ? 'badge-green' : questions[Math.min(qIndex, questions.length - 1)]?.difficulty === 'Hard' ? 'badge-red' : 'badge-blue'}`}>{questions[Math.min(qIndex, questions.length - 1)]?.difficulty}</span>
            </div>
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong>Hint:</strong> {questions[Math.min(qIndex, questions.length - 1)]?.hint}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Session Progress</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {questions.map((_, i) => (
                <div key={i} style={{ height: 6, flex: 1, borderRadius: 3, background: i < sessionAnswers.length ? 'var(--green)' : i === qIndex && !completed ? 'var(--blue)' : 'var(--border)' }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{sessionAnswers.length} of {questions.length} answered</div>
          </div>
        </div>
      </div>
    </div>
  );
}
