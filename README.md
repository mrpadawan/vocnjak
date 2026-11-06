# Voćnjak — community website

Interactive community site for the village Voćnjak (Loznica, Serbia): attractions, a 3D map of the
village, history, and FK Luk (results, fixtures, table).

React 19 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · React Three Fiber.
Languages: Serbian Latin (default), Serbian Cyrillic, English.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # fetches football data, typechecks, builds into dist/
npm run preview      # serve the production build locally
```

## Deploy

`dist/` is a static site — host it anywhere (Netlify, Cloudflare Pages, Vercel, GitHub Pages, nginx).

- Build command: `npm run build` · Publish directory: `dist` · Node ≥ 20.
- `public/_headers` sets security and cache headers (understood by Netlify and Cloudflare Pages; copy the
  rules into your server config otherwise).
- **Football data is fetched at build time.** Every build runs `scripts/fetch-football.mjs`, which reads
  FK Luk's page on srbijasport.net and writes `src/data/football.generated.json`. To keep it fresh,
  trigger a rebuild on a schedule (Netlify build hook / Cloudflare deploy hook / GitHub Actions `cron`,
  e.g. every morning and on Saturday evening). If srbijasport.net is down, the build keeps the last JSON.
- Before launch, set the real Facebook / Instagram addresses in `src/data/links.ts`, and add a social
  preview image (`og:image`) and your domain (`og:url`, `canonical`) in `index.html`.

## Structure

```
scripts/fetch-football.mjs   srbijasport.net → src/data/football.generated.json
src/
  data/
    geo.ts                   REAL_M: place positions (metres from AS Perić, read from Google Maps),
                             projection into the 3D valley, roads, Google Maps links
    places.ts                attractions + everyday places (single source for cards, pins, modal)
    about.ts                 "O selu": geography, family origins, history timeline, administration, census
    football.ts              typed view of the generated football JSON
    links.ts                 Loznica / weather / Facebook / Instagram URLs
  lib/                       i18n (Latin ↔ Cyrillic transliteration), strings.ts (all UI copy), theme
  components/
    IntroGate + SplashScreen animated intro and iris-wipe reveal
    Navbar, Hero, Attractions, Directory, About, FootballClub, ExternalLinks, Footer
    map/                     VillageMap (UI) + VillageScene (R3F): terrain, props, markers, camera rig
```

## Editing content

- **Copy**: `src/lib/strings.ts` and `src/data/*.ts` — write Serbian (Latin) and English; Cyrillic is automatic.
  Names that must stay Latin (brands) are listed in `PROTECTED` in `src/lib/i18n.tsx`.
- **Places on the map**: `REAL_M` in `src/data/geo.ts`. Positions were read from Google Maps screenshots
  (±30–100 m). *Approximate*: school, Market Goca, Eurogril 5, Caffe Anegdota, Gavrić elektro,
  church, FDQ. *Illustrative*: orchard, lookout (not real places).
- **3D scale**: the village centre is magnified and the outskirts compressed (see top of `geo.ts`).

## Third-party services

Google Fonts, Open-Meteo (temperature chip), srbijasport.net (build time only) and Google Maps (only when
the "Google map" tab is opened). Mention them in a privacy notice if your jurisdiction requires it.
