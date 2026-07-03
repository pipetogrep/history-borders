# history-borders

Interactive historical geography prototype: a rotatable globe for exploring how empires, recognised borders, occupation/control layers, battles, treaties, capitals, and state-formation events changed over time.

Live deployment: <https://history-borders.lightwait.workers.dev>

## What it does now

- Orthographic D3 globe with mouse/touch drag rotation and wheel zoom.
- Globe-first editorial UI with a light natural-earth palette, restrained typography, and the track selector kept deliberately low-prominence.
- Timeline tightly coupled to the map: previous/current/next transition cards explain what changed between snapshots.
- Animated timeline transitions: the prior layer briefly remains as a fading ghost beneath the new layer, with a before → after cue.
- Chronology band positions events and map snapshots on the same year axis; clicking an event tick drives both the nearest map snapshot and the detail inspector.
- Event rail and map markers stay coherent: selecting any event keeps it visible and inspectable even when it is not exactly on the active snapshot year.
- Track coverage includes Rome, Mongols, British Empire, United States, Ottoman Empire, Russia/Ukraine, Bosnia/Yugoslavia, and Abbasid Caliphate.
- Russia/Ukraine uses explicit recognised-border vs occupation/control semantics and dated modern assessment sources.
- Bosnia/Yugoslavia track covers Habsburg administration, Yugoslav state formation, independence, war, and Dayton.
- Snapshot evidence exposes claim, change, layer type, geometry method/source, uncertainty, confidence, and source links.
- Recognised modern outlines can use Natural Earth country geometry instead of hand-drawn extents.
- In-map legend, provenance badges, marker labels, and methodology copy explain layer/marker semantics without hiding caveats.

## Stack

- Vite
- React
- TypeScript
- D3 geo projections
- TopoJSON / Natural Earth 1:110m country geometry
- Static curated data, designed to evolve into Cloudflare Workers + D1 + R2

## Verification

Run the core gates:

```bash
pnpm install
pnpm run validate:data
pnpm run build
pnpm run lint
```

Browser verification scripts expect Vite on `http://127.0.0.1:5173` and Chromium at `/usr/bin/chromium`:

```bash
pnpm exec vite --host 127.0.0.1 --port 5173
pnpm run verify:browser
```

`verify:browser` covers responsive overflow, mobile map-first ordering, map legend semantics, every event selection across every track, modern-conflict provenance, event detail rendering, methodology copy, globe drag rotation, animated layer transitions, and the chronology band.

Production verification checks the Cloudflare Workers deployment directly:

```bash
pnpm run verify:live
```

That script opens `https://history-borders.lightwait.workers.dev` in Chromium, selects the United States track, clicks the Louisiana Purchase chronology tick, verifies the map and inspector update together, checks desktop/mobile overflow, and captures `/workspace/agent/history-borders-live-workers.png`.

## Data standard

This is a claim browser, not a cadastral atlas. Every snapshot must declare:

- the historical claim being shown;
- the timeline change represented;
- the semantic layer type (`recognised`, `control`, `imperial`, `administrative`, or `influence`);
- the geometry method and geometry source;
- geometry uncertainty and interpretive confidence;
- a source quality label and a source key present in `src/data/sources.ts`.

Every event must also carry a source key. `pnpm run validate:data` fails if those invariants are broken.

## Known limitations / next milestones

- Many pre-modern extents remain interpretive hand-drawn envelopes. They are labelled as such, but should be replaced with source-backed per-track GeoJSON.
- Source catalog still leans heavily on reference pages for early iteration; the next credibility pass should add academic atlases, primary treaties, and Wikidata revision metadata.
- Timeline currently steps through curated snapshots rather than continuous interpolated historical geometry.
- The live Workers deployment is verified, but the project still needs stronger CI/status reporting exposed back on GitHub commits.
