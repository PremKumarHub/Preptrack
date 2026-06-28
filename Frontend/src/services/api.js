const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'preptrack_token';
const USER_KEY = 'preptrack_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  questions: (role) => request(`/questions/${role}`),
  markDone: (questionId, done = true) => request('/progress/mark', {
    method: 'POST',
    body: JSON.stringify({ questionId, done }),
  }),
  progress: (userId = 'me') => request(`/progress/${userId}`),
  feedback: (payload) => request('/interview/feedback', { method: 'POST', body: JSON.stringify(payload) }),
  saveInterviewSession: (payload) => request('/interview/session/save', { method: 'POST', body: JSON.stringify(payload) }),
  interviewSessions: (userId = 'me') => request(`/interview/sessions/${userId}`),
  companies: () => request('/companies'),
  company: (id) => request(`/companies/${id}`),
  companyQuestions: (id, role) => request(`/companies/${id}/questions${role ? `?role=${encodeURIComponent(role)}` : ''}`),
};

export const roleLabels = {
  mern: 'MERN Stack Developer',
  java: 'Java Developer',
  python: 'Python Developer',
  frontend: 'Frontend Developer',
  data: 'Data Analyst',
  hr: 'HR Round',
};
