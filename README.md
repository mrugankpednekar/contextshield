# ContextShield

ContextShield is an LLM proxy that redacts PII/secrets before prompts reach an upstream model. It ships as a FastAPI backend plus a Next.js dashboard/playground to visualize detections, tweak YAML policies, and demo the service.

## What you get
- **Proxy API** – `/v1/chat/completions` drop-in for OpenAI/Groq with regex + entropy detection, optional Presidio NER, enforcement/observe modes, and request/response logging.
- **Demo endpoints** – `/demo/submit` for redaction previews, plus `/demo/complete` that calls Groq with your (optional) API key so you can see sanitized model output directly in the playground.
- **Live dashboard** – Next.js app with playground, charts, events feed, and policy editor.
- **Policy engine** – YAML per tenant with presets, ner/entropy toggles, and redaction strategies.
- **Storage hooks** – SQLAlchemy models for Postgres plus in-memory event buffer for the UI demo.

## Prereqs
- Python 3.11+
- Node.js 20+
- (Optional) Docker + docker compose v2

## Backend setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd backend
uvicorn backend.app:app --reload
```
Environment variables live in `backend/.env` (sample included). With the Groq swap set `GROQ_API_KEY` (base URL defaults to `https://api.groq.com/openai/v1`).

## Frontend setup
```bash
cd web
npm install
npm run dev
```
Set `NEXT_PUBLIC_API_BASE` (and `API_BASE` for server-side routes) to your FastAPI origin, e.g. `http://localhost:8000`.

### Playground tips
- From the hero section, pick a Groq model (mixtral, llama3, etc.) and optionally paste your key—the UI falls back to the server key if you leave it blank.
- The “Redact only” button shows sanitized prompts; “Redact + call model” hits the `/demo/complete` endpoint so you can inspect the cleaned prompt and the Groq completion side by side.

## Docker & compose
A ready-to-run stack is available:
```bash
docker compose up --build
```
This starts Postgres, the FastAPI API on `:8000`, and Next.js on `:3000`.

## Project layout
```
context_shield/
├─ backend/
│  ├─ app.py                # FastAPI bootstrap
│  ├─ routers/              # proxy, demo, audit, policy, health
│  ├─ pii/                  # detectors, redactor, policy loader
│  ├─ store/                # SQLAlchemy models + in-memory events
│  └─ utils/                # misc helpers (luhn, sse, ws)
├─ web/
│  ├─ app/                  # Next.js App Router pages + API routes
│  ├─ components/           # UI primitives (nav, charts, diff, etc.)
│  ├─ lib/                  # API helpers, SSE utils
│  └─ styles/               # Tailwind globals
├─ docker-compose.yml
└─ README.md
```

## Testing & linting
- Backend: add tests under `backend/tests` and run with `pytest` (requirements already include pytest via `pyproject` optional extras).
- Frontend: `npm run lint` (ESLint) and `npm run build` for a production check. These commands already pass in this scaffold.

## Next steps
- Swap the in-memory `store.events` for real Postgres persistence + SSE/WebSocket streaming to the dashboard.
- Add API key auth + per-tenant rate limiting before exposing the proxy publicly.
- Bring in Monaco editor + YAML validation schema for richer policy UX.
