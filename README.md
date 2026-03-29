# Code coverage

[![codecov](https://codecov.io/github/AtlasTeam9/MVP/graph/badge.svg?token=KXBGN88XAD)](https://codecov.io/github/AtlasTeam9/MVP)

# MVP

Repository contenente l'MVP del capitolato C1 di Ingegneria del Software 2025/26, proposto da Bluewind Srl

## Docker Compose

### Solo backend

Dalla cartella `backend`:

```bash
cp .env.example .env
docker compose up --build
```

Backend disponibile su `http://localhost:8000`.

Per cambiare la cartella dati usata dal container, modificate `BACKEND_DATA_DIR` nel file [backend/.env.example](/home/mites/Dev/Personal/MVP_vero/backend/.env.example) dopo averlo copiato in `backend/.env`. Di default usa `./data`. Se scegliete un percorso diverso, create prima la cartella e assicuratevi che sia scrivibile dal vostro utente.

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
cp .env.example .env
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

Per cambiare la cartella dati del backend da `.env`, impostate `BACKEND_DATA_DIR`. Se non la impostate, viene usata `./backend/data`. Se scegliete un percorso diverso, create prima la cartella e assicuratevi che sia scrivibile dal vostro utente.
