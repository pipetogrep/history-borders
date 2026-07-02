import { useMemo, useState } from 'react'
import { BookOpen, Database, GitBranch, Layers3, Play, ShieldAlert } from 'lucide-react'
import './App.css'
import { HistoryGlobe } from './components/HistoryGlobe'
import { empires } from './data/empires'
import type { EmpireSnapshot, HistoricalEvent, KeyLocation } from './types/history'

type InspectorItem =
  | { readonly kind: 'event'; readonly value: HistoricalEvent }
  | { readonly kind: 'location'; readonly value: KeyLocation }

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
}

function App(): React.JSX.Element {
  const [empireId, setEmpireId] = useState(empires[0].id)
  const selectedEmpire = useMemo(() => empires.find((empire) => empire.id === empireId) ?? empires[0], [empireId])
  const [snapshotIndex, setSnapshotIndex] = useState(1)
  const [showEvents, setShowEvents] = useState(true)
  const [showLocations, setShowLocations] = useState(true)
  const [inspectorItem, setInspectorItem] = useState<InspectorItem | null>(null)

  const snapshot: EmpireSnapshot = selectedEmpire.snapshots[Math.min(snapshotIndex, selectedEmpire.snapshots.length - 1)]

  function selectEmpire(nextEmpireId: string): void {
    setEmpireId(nextEmpireId)
    setSnapshotIndex(1)
    setInspectorItem(null)
  }

  return (
    <main>
      <section className="hero-shell">
        <nav className="topbar" aria-label="Primary">
          <a className="brand" href="#top" aria-label="history-borders home">
            <span className="brand-mark">hb</span>
            <span>history-borders</span>
          </a>
          <a href="#method">Method</a>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Animated historical geography</p>
            <h1>Watch borders and empires move across time.</h1>
            <p className="lede">
              Explore simplified empire overlays, key wars, capitals, and source-backed notes on a globe built for historical curiosity — not static textbook maps.
            </p>
            <div className="hero-actions">
              <a href="#explore" className="primary-action"><Play size={18} /> Explore the prototype</a>
              <a href="#roadmap" className="secondary-action"><Database size={18} /> Data roadmap</a>
            </div>
          </div>
          <div className="hero-card" aria-label="Prototype status">
            <Layers3 />
            <h2>MVP dataset</h2>
            <p>5 empires · 15 time snapshots · wars, capitals, and source notes.</p>
            <span>Cloudflare Pages ready</span>
          </div>
        </div>
      </section>

      <section className="controls-shell" id="explore" aria-label="Explorer controls">
        <div>
          <p className="eyebrow">Empire</p>
          <div className="empire-tabs" role="tablist" aria-label="Choose an empire">
            {empires.map((empire) => (
              <button
                key={empire.id}
                type="button"
                role="tab"
                aria-selected={empire.id === selectedEmpire.id}
                className={empire.id === selectedEmpire.id ? 'active' : ''}
                onClick={() => selectEmpire(empire.id)}
                style={{ '--accent': empire.colour } as React.CSSProperties}
              >
                {empire.name}
              </button>
            ))}
          </div>
        </div>
        <div className="toggles" aria-label="Map layer toggles">
          <label><input type="checkbox" checked={showEvents} onChange={(event) => setShowEvents(event.target.checked)} /> Wars & events</label>
          <label><input type="checkbox" checked={showLocations} onChange={(event) => setShowLocations(event.target.checked)} /> Key locations</label>
        </div>
      </section>

      <HistoryGlobe
        empire={selectedEmpire}
        snapshot={snapshot}
        showEvents={showEvents}
        showLocations={showLocations}
        onSelectEvent={(event) => setInspectorItem({ kind: 'event', value: event })}
        onSelectLocation={(location) => setInspectorItem({ kind: 'location', value: location })}
      />

      <section className="timeline-shell" aria-label="Time controls">
        <div className="timeline-head">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>{selectedEmpire.name}</h2>
          </div>
          <p>{selectedEmpire.period}</p>
        </div>
        <input
          type="range"
          min="0"
          max={selectedEmpire.snapshots.length - 1}
          step="1"
          value={snapshotIndex}
          onChange={(event) => setSnapshotIndex(Number(event.target.value))}
          aria-label="Choose historical snapshot"
        />
        <div className="timeline-labels">
          {selectedEmpire.snapshots.map((item) => <span key={item.year}>{formatYear(item.year)}</span>)}
        </div>
      </section>

      <section className="details-grid">
        <article className="empire-brief">
          <p className="eyebrow">Context</p>
          <h2>{selectedEmpire.headline}</h2>
          <p>{selectedEmpire.caveat}</p>
          <div className="source-list">
            {selectedEmpire.sources.map((source) => <span key={source}><BookOpen size={14} /> {source}</span>)}
          </div>
        </article>
        <aside className="inspector" aria-live="polite">
          <p className="eyebrow">Inspector</p>
          {inspectorItem ? (
            inspectorItem.kind === 'event' ? (
              <>
                <h2>{inspectorItem.value.title}</h2>
                <p className="year">{formatYear(inspectorItem.value.year)} · {inspectorItem.value.type}</p>
                <p>{inspectorItem.value.summary}</p>
              </>
            ) : (
              <>
                <h2>{inspectorItem.value.name}</h2>
                <p>{inspectorItem.value.note}</p>
              </>
            )
          ) : (
            <>
              <h2>Click a marker or event.</h2>
              <p>Use the globe markers and timeline event list to inspect historical details.</p>
            </>
          )}
        </aside>
      </section>

      <section className="method" id="method">
        <div>
          <ShieldAlert />
          <h2>Verifiable by design</h2>
          <p>
            The prototype separates visual territory overlays from historical claims. Border geometry starts as labelled approximations; future imports should carry source URLs, Wikidata IDs, and revision metadata before publication.
          </p>
        </div>
        <div id="roadmap">
          <GitBranch />
          <h2>Cloudflare-native roadmap</h2>
          <p>
            Static data works for v1. Next: Cloudflare D1 for entities/events, R2 for GeoJSON/topology files, and Pages Functions for searchable historical datasets and Wikipedia/Wikidata ingestion queues.
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
