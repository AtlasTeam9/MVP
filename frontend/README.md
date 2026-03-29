# React + Vite

### Per far funzoinare il frontend:

1. Scaricare gli ultimi commit dalla repository remota
2. Eseguire i seguenti comandi da terminale (da dentro la cartella /frontend):

- npm install (oppure npm i)
- npm run dev

3. Aprire il link che compare nel terminale

## Docker Compose

Dalla cartella `frontend`:

```bash
docker compose up --build
```

Il frontend viene servito su `http://localhost:8080`.

Per puntarlo a un backend su una porta diversa:

```bash
BACKEND_PORT=18000 docker compose up --build
```

Per cambiare porta:

```bash
FRONTEND_PORT=18080 docker compose up --build
```
