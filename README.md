# Speed Reader

Distraction-free RSVP speed reader built with a modular, Docker-first setup.

## Quickstart (Docker)

```bash
docker compose up --build
```

Frontend: http://localhost:3000

Optional backend (sessions API):

```bash
docker compose --profile backend up --build
```

Backend: http://localhost:8000

Note: the backend stores sessions in memory only (ephemeral by design).

## Local dev (frontend)

```bash
cd frontend
npm install
npm run dev
```

## Tests (frontend)

```bash
cd frontend
npm test
```

## Health checks

- Frontend: `GET /api/health`
- Backend: `GET /health`
