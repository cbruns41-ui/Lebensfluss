# Lebensfluss

Progressive Web App für Gewohnheiten, Budget, Wellness, Essensplanung und Wochenreflexion — auf Deutsch, datenschutzfreundlich mit lokaler Datenspeicherung.

## Features

- **Life Score** — Gesamtüberblick aus Gewohnheiten, Wellness, Budget, Fokus und Reflexion
- **Gewohnheiten** — Tägliche Routinen mit Streaks und Erinnerungen
- **Budget** — Einnahmen, Ausgaben, Daueraufträge, CSV-Import
- **Meal Prep & Einkauf** — Wochenplan, Rezepte, automatische Einkaufsliste
- **Wellness** — Wasser, Stimmung, Schlaf
- **Sonntags-Ritual & Wochenreview** — Geführter Wochenstart
- **PWA** — Installierbar auf dem Handy mit Offline-Unterstützung

## Entwicklung

```bash
npm install
npm run dev
```

Öffne http://localhost:5173

### Umgebungsvariablen

Kopiere `.env.example` nach `.env.local`:

```env
VITE_POCKETBASE_URL=/pb          # lokal mit Docker
VITE_APP_URL=http://localhost:5173
VITE_STRIPE_ENABLED=false
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

- **Frontend:** [Vercel](https://vercel.com) — siehe `vercel.json` und `deploy/vercel.env.example`
- **API (PocketBase):** Hetzner VPS — siehe `deploy/docker-compose.api.yml`

```bash
npm run icons    # PWA-Icons neu generieren
```

## Admin

News und Support verwalten unter `/admin` (nach Login mit Admin-Zugang).

## Technik

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- PocketBase (optional, für Abo, Support, News)
- Stripe (optional, für Bezahlung)