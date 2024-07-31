## Hugin

Hugin er en applikasjon for fysisk mottak av aviser.

### Lokalt oppsett
For å kjøre lokalt må du sette de nødvendige miljøvariablene:
```bash
cp .env.example .env.local
```

| Variabelnavn          | Standardverdi                | Beskrivelse                                                                                                                   |
|-----------------------|------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| NEXT_PUBLIC_BASE_PATH | /hugin                       | Base path for applikasjonen                                                                                                   |
| CATALOGUE_API_PATH    | http://localhost:8087/bikube | Sti til [katalog APIet ](https://github.com/NationalLibraryOfNorway/bikube)<br/>Må starte med `http://` eller `https://`      |
| DATABASE_URL          | ''                           | URL til databasen (inkludert brukernavn, passord og schema. eks `postgres://username:password@localhost:5432/db?schema=hugin` |

Deretter kan du kjøre følgende kommandoer:
```bash
npm install
npm run dev
```
Applikasjonen finner du nå i nettleseren på [http://localhost:3000/hugin](http://localhost:3000/hugin).
