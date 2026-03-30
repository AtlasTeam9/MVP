# Code coverage

## Backend

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

### Frontend + backend

Dalla root del progetto:

```bash
cp .env.example .env
docker compose up --build
```

- frontend: `http://localhost:8080`
- backend: `http://localhost:8000`

Per modificare porte e percorsi visionare il file .env dopo averlo copiato da .env.example
