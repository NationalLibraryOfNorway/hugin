## Hugin

Hugin er en applikasjon for fysisk mottak av aviser.

### Lokalt oppsett
For å kjøre lokalt må du sette de nødvendige miljøvariablene:
```bash
cp .env.example .env.local
```

| Variabelnavn           | Standardverdi                        | Beskrivelse                                                                                                                                   |
|------------------------|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| NEXT_PUBLIC_BASE_PATH  | /hugin                               | Base path for applikasjonen                                                                                                                   |
| CATALOGUE_API_PATH     | http://localhost:8087/bikube         | Sti til [katalog APIet ](https://github.com/NationalLibraryOfNorway/bikube)<br/>Må starte med http:// eller https://                          |
| KEYCLOAK_CLIENT_ID     | _N/A_                                | Klient ID                                                                                                                                     |
| KEYCLOAK_CLIENT_SECRET | _N/A_                                | Klienthemmelighet                                                                                                                             |
| KEYCLOAK_ISSUER        | _N/A_                                | Utsteder-URI. Må inneholde realm, f.eks: https://my-keycloak-domain.com/realms/My_Realm                                                       |
| NEXTAUTH_URL           | http://localhost:3000/hugin/api/auth | URL til siden, f.eks. http://localhost:3000. Når man bruker basePath må man spesifisere hele API-routen: http://localhost:3000/hugin/api/auth |
| NEXTAUTH_SECRET        | _N/A_                                | Kan genereres med `openssl rand -base64 32`                                                                                                   |

Deretter kan du kjøre følgende kommandoer:
```bash
npm install
npm run dev
```
Applikasjonen finner du nå i nettleseren på [http://localhost:3000/hugin](http://localhost:3000/hugin).