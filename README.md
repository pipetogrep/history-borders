# history-borders

Interactive historical geography prototype: a rotatable globe for exploring how empires, recognised borders, occupation/control layers, battles, treaties, capitals, and state-formation events changed over time.

## What it does now

- Orthographic D3 globe with mouse/touch drag rotation and wheel zoom.
- Timeline tightly coupled to the map: previous/current/next transition cards explain what changed between snapshots.
- Event rail and map markers stay coherent: clicking any timeline event selects the nearest map snapshot while keeping that event visible and inspectable.
- Track coverage includes Rome, Mongols, British Empire, United States, Ottoman Empire, Russia/Ukraine, Bosnia/Yugoslavia, and Abbasid Caliphate.
- Russia/Ukraine uses explicit recognised-border vs occupation/control semantics and dated modern assessment sources.
- Bosnia/Yugoslavia track covers Habsburg administration, Yugoslav state formation, independence, war, and Dayton.
- Snapshot evidence exposes claim, change, layer type, geometry method/source, uncertainty, confidence, and source links.
- Recognised modern outlines can use Natural Earth country geometry instead of hand-drawn extents.
- In-map legend and marker labels explain layer/marker semantics without relying on the methodology panel.
- Minimal dark cartographic visual system tuned for clarity rather than default “AI SaaS” styling.

## Stack

- Vite
- React
- TypeScript
- D3 geo projections
- TopoJSON / Natural Earth 1:110m country geometry
- Static curated data, designed to evolve into Cloudflare Pages Functions + D1 + R2

## Verification

Run the core gates:

```bash
pnpm install
pnpm run validate:data
pnpm run build
```

Browser verification scripts expect Vite on `http://127.0.0.1:5173` and Chromium at `/usr/bin/chromium`:

```bash
pnpm exec vite --host 127.0.0.1 --port 5173
node verify.mjs
node mobile-verify.mjs
node legend-verify.mjs
node event-coherence-verify.mjs
node evidence-verify.mjs
node click-verify.mjs
node methodology-verify.mjs
node drag-verify.mjs
node transition-verify.mjs
```

These checks cover responsive overflow, mobile map-first ordering, map legend semantics, every event selection across every track, modern-conflict provenance, event detail rendering, methodology copy, globe drag rotation, and timeline transition controls.

## Data standard

This is a claim browser, not a cadastral atlas. Every snapshot must declare:

- the historical claim being shown;
- the timeline change represented;
- the semantic layer type (`recognised`, `control`, `imperial`, `administrative`, or `influence`);
- the geometry method and geometry source;
- geometry uncertainty and interpretive confidence;
- a source key present in `src/data/sources.ts`.

Every event must also carry a source key. `pnpm run validate:data` fails if those invariants are broken.

## Known limitations / next milestones

- Many pre-modern extents remain interpretive hand-drawn envelopes. They are now labelled as such, but should be replaced with source-backed per-track GeoJSON.
- Source catalog still leans heavily on reference pages for early iteration; the next credibility pass should add academic atlases, primary treaties, and Wikidata revision metadata.
- Timeline currently steps through curated snapshots rather than continuous interpolated historical geometry.
- Cloudflare Pages CI/CD is expected to deploy from GitHub `main`; local verification is ahead of the currently published remote until the latest commits are pushed.
