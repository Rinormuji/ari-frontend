# Ari Real Estate Frontend

Frontend-i publik dhe paneli administrativ për Ari Real Estate, i ndërtuar me React 19, Vite dhe Tailwind CSS.

## Kërkesat

- Node.js 20 ose më i ri
- Backend-i Ari API për rrjedhat që kërkojnë të dhëna ose autentikim

## Konfigurimi lokal

```bash
npm ci
npm run dev
```

Në development, kërkesat `/api` kalojnë te `http://localhost:3007` përmes proxy-t të Vite.

## Variablat e ambientit

| Variabla | Përshkrimi |
| --- | --- |
| `VITE_API_BASE_URL` | Origjina e backend-it pa `/api`, p.sh. `https://api.domaini-final.com` |
| `VITE_SITE_URL` | Origjina finale e frontend-it, p.sh. `https://www.domaini-final.com` |

Kur variabla është bosh, frontend-i përdor `/api` në të njëjtën origjinë. Vlerat `VITE_*` janë publike dhe përfshihen në bundle; mos vendosni sekrete në to.

## Quality gate

```bash
npm run check
```

Komanda ekzekuton lint-in, testet dhe build-in e prodhimit. Deployment-i në Vercel përdor të njëjtën komandë dhe dështon nëse ndonjë hap nuk kalon.

Komandat individuale:

```bash
npm run lint
npm run test
npm run build
npm run preview
```

## Deployment në Vercel

Projekti konfigurohet nga `vercel.json`:

- instalim deterministik me `npm ci`;
- quality gate me `npm run check`;
- output në `dist`;
- SPA fallback për React Router;
- security headers dhe cache afatgjatë për asetet e versionuara.

Deployment-i ndalet automatikisht nëse `VITE_API_BASE_URL` ose `VITE_SITE_URL` mungon në Vercel. Gjatë build-it, `VITE_SITE_URL` përdoret për `robots.txt` dhe `sitemap.xml`.

### Production dhe domain

Repo-ja nuk hardkodon domain. Përdorni `www` si domain kanonik dhe `api` si subdomain të backend-it, p.sh. `www.domaini-final.com` dhe `api.domaini-final.com`.

1. Importoni repository-n në Vercel dhe lini framework-un `Vite`.
2. Shtoni `VITE_API_BASE_URL` dhe `VITE_SITE_URL` në Production, Preview dhe Development. API URL duhet të jetë origjina HTTPS pa `/api`.
3. Në Vercel, shtoni `www.domaini-final.com` si production domain dhe domain-in pa `www` si redirect domain.
4. Te DNS provider-i, vendosni rekordet që Vercel shfaq në ekranin Domains. Mos kopjoni vlera DNS nga dokumente të vjetra; target-i mund të ndryshojë.
5. Në backend vendosni `APP_FRONTEND_URL=https://www.domaini-final.com` dhe `APP_CORS_ALLOWED_ORIGINS=https://www.domaini-final.com`.
6. Pas deploy-it kontrolloni `/`, `/properties`, një URL të thellë të pronës, login/logout dhe panelin admin.

GitHub Actions ekzekuton `npm run check` për çdo pull request dhe push në `main`. Vercel duhet të mbetet deployment provider; GitHub workflow është quality gate dhe nuk ruan token deploy-i.
