## Hugin

Hugin er en applikasjon for fysisk mottak av aviser.

### Lokalt oppsett
For å kjøre lokalt må du sette de nødvendige miljøvariablene:
```bash
cp .env.example .env.local
```

| Variabelnavn                 | Standardverdi                | Beskrivelse                                                                                                                 |
|------------------------------|------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| NEXT_PUBLIC_BASE_PATH        | /hugin                       | Base path for applikasjonen                                                                                                 |
| CATALOGUE_API_PATH           | http://localhost:8087/bikube | Sti til [katalog APIet ](https://github.com/NationalLibraryOfNorway/bikube)<br/>Må starte med `http://` eller `https://`    |
| DATABASE_URL                 |                              | URL til databasen (se mer info i eget avsnitt under)                                                                        |
| KEYCLOAK_TEKST_URL           |                              | Url til keycloak-tekst (inkl. realm om open-idconnect, eks. https://mysite.com/authn/realms/myRealm/protocol/openid-connect |
| KEYCLOAK_TEKST_CLIENT_ID     |                              | Client ID i keycloak-tekst                                                                                                  | 
| KEYCLOAK_TEKST_CLIENT_SECRET |                              | Client secret i keycloak-tekst                                                                                              |

Deretter må du kjøre følgende kommandoer:
```bash
npm install
npm prisma generate # (eller 'npx prisma generate', eller bare 'prisma generate' hvis du har prisma installert globalt)
npm run dev
```
Applikasjonen finner du nå i nettleseren på [http://localhost:3000/hugin](http://localhost:3000/hugin).

OBS! Hvis du skal utvikle Hugin etter det har vært database-endringer (som er oppdatert i schema.prisma på branchen du jobber på), må du også kjøre `prisma generate` for at din lokale prisma-instans skal ta inn de nye endringene.
Anbefales å sette opp en egen database-instans lokalt hvis man vil unngå å "crashe" med de som styrer i stage.

#### Database URL
Database URL må inkludere brukernavn, passord og schema. eks `postgres://username:password@localhost:5432/db?schema=hugin`.

Det anbefales å sette `connection_limit` og `pool_timeout`, eks `postgres://username:password@localhost:5432/db?schema=hugin&connection_limit=3&pool_timeout=10`.
Disse verdiene er satt i stage i skrivende stund.
Dette for å unngå å bruke alle tikoblinger som er tilgjengelig, som tar lang tid. 
Vi vil heller gi en tilbakemelding på at ting ikke fungerer etter å ha prøvd en stund.

Kort forklart; `connection_limit` sier hvor mange forskjellige tilkoblinger i 'poolen' som prisma prøver å få tilkobling gjennom.
`pool_timeout` sier hvor lenge prisma skal vente på en enkelt tilkobling før den gir opp.
Dette vil si at med innstillingene som er satt, så vil det prøves i maks 30 sekunder totalt før prisma gir opp og lager error.
Default timeout er bare 10 sek, men default connection limit er 0, som vil si alle prisma klarer å finne.
Mer info på [prisma docs](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool).

#### Lokal utvikling med database-endringer
For å lage ting hvor man må endre på databasen anbefaler vi å først sette opp en lokal postgres-instans.

For å laste endringer fra databasen til applikasjonen, må man legge inn DATABASE_URL rett i `.env` (ikke `.env.local`!). 
Kjør så `prisma db pull` for å lage nytt schema.prisma, og `prisma generate` for å laste skjemaet inn i prisma klienten.
