# React + Vite

### Per far funzionare il frontend:

1. Scaricare gli ultimi commit dalla repository remota
2. Eseguire i seguenti comandi da terminale (da dentro la cartella /frontend):

- npm install (oppure npm i)
- npm run dev

3. Aprire il link che compare nel terminale

### Test:

1. Eseguire tutti i test una volta

- npm run test

2. Eseguire solo i test dei componenti

- npm run test -- src/components/tests --run

3. Eseguire un singolo file di test

- npm run test -- src/components/tests/CommonComponents.test.jsx --run

4. Modalità watch (si rilancia quando salvi)

- npm run test:watch

5. Interfaccia UI di Vitest

- npm run test:ui

### Coverage:

1. Coverage completa progetto

- npm run test:coverage

2. Coverage solo per i test components

- npm run test:coverage -- src/components/tests --run

3. Aprire il report HTML coverage (Windows PowerShell)

- start coverage/index.html
