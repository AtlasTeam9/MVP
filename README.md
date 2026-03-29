# Code coverage

[![codecov](https://codecov.io/github/AtlasTeam9/MVP/graph/badge.svg?token=KXBGN88XAD)](https://codecov.io/github/AtlasTeam9/MVP)

# MVP

Repository contenente l'MVP del capitolato C1 di Ingegneria del Software 2025/26, proposto da Bluewind Srl

## Docker Compose

### Solo backend

Dalla cartella `backend`:

```bash
docker compose up --build
```

Backend disponibile su `http://localhost:8000`.

### Solo frontend

Dalla cartella `frontend`:

```bash
docker compose up --build
```

Frontend disponibile su `http://localhost:8080`.

Per collegarlo a un backend su una porta diversa, sempre da frontend:

```bash
BACKEND_PORT=18000 docker compose up --build
```

Per cambiare porta:

```bash
FRONTEND_PORT=18080 docker compose up --build
```

### Frontend + backend

Dalla root del progetto:

```bash
docker compose up --build
```

- frontend: `http://localhost:8080`
- backend: `http://localhost:8000`

Se ti servono porte diverse:

```bash
BACKEND_PORT=18000 FRONTEND_PORT=18080 docker compose up --build
```

Per limitare gli origin consentiti dal backend:

```bash
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080 docker compose up --build
```
