# Tweet Copilot Frontend

## Environment

Create `frontend/.env.local` from `frontend/.env.example`.

### Development

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Production (Vercel)

Set this environment variable in Vercel:

```bash
NEXT_PUBLIC_API_URL=https://tweet-copilot-backend.onrender.com
```

## Run

```bash
npm install
npm run dev
```
