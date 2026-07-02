# history-borders

Interactive historical geography prototype: animated globe overlays showing how empires, wars, capitals, and borders changed over time.

## Stack

- Vite
- React
- TypeScript
- D3 geo projections
- Static seed data, designed to evolve into Cloudflare Pages Functions + D1 + R2

## MVP verification

- `pnpm run build` passes
- Desktop and tablet screenshots captured with Chromium/Puppeteer
- No browser console errors during verification

## Data note

The initial empire boundaries are simplified/stylised overlays intended for product validation. The roadmap is to import source-backed data from Wikipedia/Wikidata APIs with revision/source metadata and review before publication.
