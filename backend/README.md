# Backend

## Sviluppo locale

- `uv sync`: crea il `.venv` e installa le librerie
- selezionate l'interprete Python del `.venv`
- `uvicorn app.main:app --reload`: avvia il backend
- aprite `http://localhost:8000/docs` per testare le API
- `pytest`: esegue tutti i test
- `pytest -m unit`: esegue solo i test di unità
- `pytest -m integration`: esegue solo i test di integrazione

## Deploy con Docker Compose

Dalla cartella `backend`:

```bash
docker compose up --build
```
`CORS_ORIGINS` e una lista separata da virgole degli origin consentiti. Se non viene impostata, il backend accetta richieste da qualsiasi origin.
