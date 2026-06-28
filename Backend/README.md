# PrepTrack Backend

Express + MongoDB API for the PrepTrack interview preparation app.

## Setup

```bash
cd Backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

The API runs on `http://localhost:5000` by default.

## AI Interview Feedback

Add `GROK_API_KEY` in `.env` to enable real AI evaluation during mock interviews.

| Key prefix | Provider | Endpoint (auto-detected) |
|------------|----------|--------------------------|
| `gsk_` | Groq Cloud | `https://api.groq.com/openai/v1` |
| `xai-` | xAI Grok | `https://api.x.ai/v1` |

Optional overrides:

```env
AI_PROVIDER=groq
AI_MODEL=llama-3.3-70b-versatile
AI_BASE_URL=
```

Without a valid API key, the interview endpoint returns deterministic local fallback feedback so the frontend still works during development.

## API Routes

- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user (JWT required)
- `GET /api/questions/:role` — Questions by role
- `POST /api/progress/mark` — Mark question done/undone
- `GET /api/progress/:userId` — Progress stats (`me` supported)
- `POST /api/interview/feedback` — AI answer evaluation
- `POST /api/interview/session/save` — Save mock interview session
- `GET /api/interview/sessions/:userId` — Interview history
- `GET /api/companies` — List companies
- `GET /api/companies/:id` — Company details
- `GET /api/companies/:id/questions` — Company-specific questions
