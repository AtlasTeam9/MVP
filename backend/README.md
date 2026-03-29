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
cp .env.example .env
docker compose up
```

Per forzare il rebuild dell'immagine:

```bash
docker compose up --build
```

Le sessioni salvate dal backend vengono scritte nella cartella definita da `BACKEND_DATA_DIR` nel file `.env`. Se non viene impostata, il backend usa `./data`, quindi i file finiscono in `data/sessions`. Se impostate un percorso diverso, create prima la cartella e assicuratevi che sia scrivibile dal vostro utente.

Se il vostro utente Linux non usa `UID=1000` e `GID=1000`, impostate anche `UID` e `GID` nel file `.env`:

```bash
UID=1001
GID=1001
```

`CORS_ORIGINS` e una lista separata da virgole degli origin consentiti. Se non viene impostata, il backend accetta richieste da qualsiasi origin.
