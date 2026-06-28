# PrepTrack — Complete Project Documentation

> AI-powered interview preparation platform for Indian IT freshers.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [User Journey](#4-user-journey)
5. [Architecture](#5-architecture)
6. [AI Integration](#6-ai-integration)
7. [Backend API Reference](#7-backend-api-reference)
8. [Database Models](#8-database-models)
9. [Frontend Pages](#9-frontend-pages)
10. [Setup & Run Guide](#10-setup--run-guide)
11. [Environment Variables](#11-environment-variables)
12. [Data Flow Examples](#12-data-flow-examples)

---

## 1. Project Overview

PrepTrack helps freshers prepare for IT interviews through:

- **Role-based question banks** (MERN, Java, Python, Frontend, Data Analyst)
- **AI mock interviews** with instant feedback (score, strengths, improvements)
- **Progress tracking** (questions done, streaks, readiness score)
- **Company-specific prep** (TCS, Infosys, Zoho, Wipro, Freshworks, Cognizant)
- **Session history** saved to MongoDB

### What Works Today

| Feature | Status |
|---------|--------|
| User registration & login (JWT) | ✅ Working |
| Question bank with filters | ✅ Working |
| Mark questions as done | ✅ Working |
| AI mock interview + feedback | ✅ Working (Groq/xAI) |
| Save interview sessions | ✅ Working |
| Dashboard with live stats | ✅ Working |
| Profile with session history | ✅ Working |
| Company prep guides | ✅ Working |
| Auth-protected app routes | ✅ Working |

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router 6, Lucide Icons |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB Atlas (or local MongoDB) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | Groq Cloud or xAI Grok via OpenAI-compatible SDK |

---

## 3. Folder Structure

```text
Preptrack project/
├── Frontend/
│   ├── src/
│   │   ├── components/layout/
│   │   │   ├── Layout.jsx          # Sidebar + main content shell
│   │   │   ├── Sidebar.jsx         # Navigation, theme toggle, logout
│   │   │   └── ProtectedRoute.jsx  # Redirects unauthenticated users
│   │   ├── data/index.js           # Static mock data (fallback)
│   │   ├── pages/
│   │   │   ├── Landing.jsx         # Public marketing page
│   │   │   ├── Auth.jsx            # Login / Register
│   │   │   ├── Dashboard.jsx       # Live progress dashboard
│   │   │   ├── Tracks.jsx          # Learning roadmap
│   │   │   ├── Questions.jsx       # Question bank
│   │   │   ├── AIInterview.jsx     # AI mock interview (PrepBot)
│   │   │   ├── CompanyPrep.jsx     # Company cards
│   │   │   ├── CompanyDetail.jsx   # Company-specific prep guide
│   │   │   └── Profile.jsx         # User profile + session history
│   │   ├── services/api.js         # Central API client
│   │   ├── App.jsx                 # Route definitions
│   │   └── main.jsx
│   └── package.json
│
├── Backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── questionController.js
│   │   │   ├── progressController.js
│   │   │   ├── interviewController.js
│   │   │   └── companyController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Question.js
│   │   │   ├── Progress.js
│   │   │   └── Session.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── questionRoutes.js
│   │   │   ├── progressRoutes.js
│   │   │   ├── interviewRoutes.js
│   │   │   └── companyRoutes.js
│   │   ├── services/
│   │   │   └── grokService.js      # AI feedback (Groq / xAI)
│   │   ├── seed/
│   │   │   ├── questions.js
│   │   │   └── seedQuestions.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── PROJECT_DOCUMENTATION.md        # This file
```

---

## 4. User Journey

```
1. Visit Landing Page (/)
      ↓
2. Sign Up / Login (/auth)
      → JWT stored in localStorage
      ↓
3. Dashboard (/dashboard)
      → See progress, streak, readiness score
      ↓
4. Browse Questions (/questions)
      → Filter by topic/difficulty, mark as done
      ↓
5. Start AI Interview (/ai-interview)
      → Select role + round type
      → Answer questions in chat
      → Get AI feedback (score, strengths, improvements)
      → Save session to history
      ↓
6. Company Prep (/company-prep)
      → View company-specific questions & interview pattern
      ↓
7. Profile (/profile)
      → Review stats and past interview sessions
```

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)               │
│  Landing │ Dashboard │ Questions │ AI Interview │ etc.  │
│                    api.js (HTTP client)                  │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP + JWT Bearer
┌──────────────────────────▼──────────────────────────────┐
│                 BACKEND (Express API)                    │
│  Auth │ Questions │ Progress │ Interview │ Companies    │
│                    grokService.js                        │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
        ┌──────▼──────┐            ┌───────▼────────┐
        │   MongoDB   │            │  Groq / xAI    │
        │   Atlas     │            │  AI API        │
        └─────────────┘            └────────────────┘
```

---

## 6. AI Integration

### Where AI Is Used

AI is used **exclusively in the AI Mock Interview flow**:

```
User answers question in AIInterview.jsx
      ↓
POST /api/interview/feedback
      ↓
interviewController.feedback()
      ↓
grokService.getInterviewFeedback()
      ↓
Groq Cloud OR xAI Grok API
      ↓
Returns: { score, strengths[], improvements[] }
      ↓
Displayed in feedback panel on the right
```

**File:** `Backend/src/services/grokService.js`

### Provider Auto-Detection

| API Key Prefix | Provider | Base URL | Default Model |
|----------------|----------|----------|---------------|
| `gsk_` | Groq Cloud | `api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| `xai-` | xAI Grok | `api.x.ai/v1` | `grok-2` |

### Fallback Behavior

If no API key is set or the API call fails, a **local heuristic fallback** scores answers based on word count and returns generic feedback. The interview still works offline.

### Important Note

Your current `.env` has a `gsk_` key (Groq Cloud), not an xAI key. The service now auto-detects this and routes to Groq instead of xAI.

---

## 7. Backend API Reference

All routes except `/api/auth/register`, `/api/auth/login`, and health checks require:

```
Authorization: Bearer <JWT_TOKEN>
```

### Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/auth/register` | `{ name, email, password, role }` | `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | — | `{ user }` |

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions/:role` | All questions for a role (`mern`, `hr`, etc.) |
| GET | `/api/questions/:role/:topic` | Questions filtered by topic |

### Progress

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/progress/mark` | `{ questionId, done }` | Mark question done/undone |
| GET | `/api/progress/:userId` | — | Full progress stats (`me` supported) |

**Progress response includes:**
```json
{
  "doneCount": 5,
  "totalQuestions": 12,
  "readiness": 42,
  "streak": 3,
  "dailyGoal": { "target": 10, "done": 2 },
  "topics": [{ "topic": "React", "done": 2 }],
  "sessionCount": 4,
  "avgInterviewScore": 72,
  "sessions": [...]
}
```

### Interview (AI)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/interview/feedback` | `{ question, answer, role, round }` | AI evaluation |
| POST | `/api/interview/session/save` | `{ role, round, score, answers[] }` | Save session |
| GET | `/api/interview/sessions/:userId` | — | Session history |

**Feedback response:**
```json
{
  "score": 75,
  "strengths": ["Good explanation of React"],
  "improvements": ["Add a code example", "Mention virtual DOM"]
}
```

### Companies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List all companies |
| GET | `/api/companies/:id` | Company details (tcs, zoho, etc.) |
| GET | `/api/companies/:id/questions?role=mern` | Company-specific questions |

---

## 8. Database Models

### User
```js
{ name, email, password (hashed), role, lastLoginAt, timestamps }
```

### Question
```js
{ question, topic, role, difficulty, hint, answer, companies[], timestamps }
```

### Progress
```js
{ userId, questionId, done, timestamp, timestamps }
// Unique index on (userId, questionId)
```

### Session (AI Interview History)
```js
{
  userId, role, round, score,
  answers: [{ question, answer, score, feedback[] }],
  timestamps
}
```

---

## 9. Frontend Pages

| Route | Auth Required | Backend Connected | Description |
|-------|---------------|-------------------|-------------|
| `/` | No | No | Landing page |
| `/auth` | No | Yes | Login & register |
| `/dashboard` | Yes | Yes | Live stats from progress API |
| `/tracks` | Yes | Yes | Roadmap with real progress |
| `/questions` | Yes | Yes | Question bank + mark done |
| `/ai-interview` | Yes | Yes | AI chat interview + save session |
| `/company-prep` | Yes | Partial | Company cards → detail pages |
| `/company-prep/:id` | Yes | Yes | Company guide + questions |
| `/profile` | Yes | Yes | User info + session history |

---

## 10. Setup & Run Guide

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas URI)
- Groq or xAI API key (optional, for real AI feedback)

### Backend

```bash
cd "Preptrack project/Backend"
npm install
copy .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, GROK_API_KEY
npm run seed
npm run dev
```

API: `http://localhost:5000`

### Frontend

```bash
cd "Preptrack project/Frontend"
npm install
npm run dev
```

App: `http://localhost:5173`

### Seed Data

Running `npm run seed` in Backend inserts 12 questions (MERN + HR) with company tags into MongoDB.

---

## 11. Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173

# AI (required for real feedback)
GROK_API_KEY=gsk_your_groq_key_here
# Optional overrides:
AI_PROVIDER=groq
AI_MODEL=llama-3.3-70b-versatile
```

### Frontend (optional)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 12. Data Flow Examples

### Submitting an Interview Answer

```
1. User types answer in AIInterview.jsx chat
2. Frontend: POST /api/interview/feedback
   Body: { question, answer, role: "MERN Stack", round: "technical" }
3. Backend calls grokService.getInterviewFeedback()
4. AI returns JSON: { score: 75, strengths: [...], improvements: [...] }
5. Frontend displays score ring + strengths/improvements in right panel
6. PrepBot asks next question or shows session complete
```

### Saving an Interview Session

```
1. User completes all questions
2. Clicks "Save Session"
3. Frontend: POST /api/interview/session/save
   Body: { role, round, score: 72, answers: [...] }
4. Backend saves to Session collection
5. Visible in Profile → Recent Interview Sessions
6. Dashboard mock interview count updates via progress API
```

### Company Prep Flow

```
1. User clicks company card on /company-prep
2. Navigates to /company-prep/tcs
3. Frontend: GET /api/companies/tcs + GET /api/companies/tcs/questions?role=mern
4. Shows interview rounds, focus areas, and curated questions
5. User can start AI interview or practice questions
```

---

## Quick Reference

| User Action | Page | API Called |
|-------------|------|------------|
| Register | `/auth` | POST `/api/auth/register` |
| View progress | `/dashboard` | GET `/api/progress/me` |
| Mark question done | `/questions` | POST `/api/progress/mark` |
| Get AI feedback | `/ai-interview` | POST `/api/interview/feedback` |
| Save interview | `/ai-interview` | POST `/api/interview/session/save` |
| View history | `/profile` | GET `/api/interview/sessions/me` |
| Company questions | `/company-prep/:id` | GET `/api/companies/:id/questions` |

---

*Last updated: June 2026*
