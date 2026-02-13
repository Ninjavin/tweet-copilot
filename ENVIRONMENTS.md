# Dev / Production Environment Setup

This repo supports:
- Frontend production URL: `https://tweet-copilot.vercel.app`
- Backend production URL: `https://tweet-copilot-backend.onrender.com`

## 1) Backend (Render + local)

Use `backend/.env.example` as the template.

### Local `backend/.env`

```bash
GEMINI_API_KEY=...
OPENAI_API_KEY=...
GROQ_API_KEY=...
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://tweet-copilot.vercel.app
```

### Render environment variables

```bash
GEMINI_API_KEY=...
OPENAI_API_KEY=...
GROQ_API_KEY=...
ALLOWED_ORIGINS=https://tweet-copilot.vercel.app
```

## 2) Frontend (Vercel + local)

Use `frontend/.env.example` as the template.

### Local `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Vercel environment variable

```bash
NEXT_PUBLIC_API_URL=https://tweet-copilot-backend.onrender.com
```

## 3) Expected behavior

- Local frontend calls local backend.
- Production frontend calls Render backend.
- Backend CORS only allows origins you define in `ALLOWED_ORIGINS`.
