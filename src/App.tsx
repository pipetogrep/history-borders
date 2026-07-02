import { useMemo, useState } from 'react'
import { BookOpen, Crosshair, Map, Search } from 'lucide-react'
import './App.css'
import { HistoryGlobe } from './components/HistoryGlobe'
import { empires } from './data/empires'
import type { EmpireSnapshot, HistoricalEvent, KeyLocation } from './types/history'

type InspectorItem =
  | { readonly kind: 'event'; readonly value: HistoricalEvent }
  | { readonly kind: 'location'; readonly value: KeyLocation }

function formatYear(year: number): string { return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE` }

function closestSnapshotIndex(snapshots: readonly EmpireSnapshot[], year: number): number {
  return snapshots.reduce((best, snapshot, index) => Math.abs(snapshot.year - year) < Math.abs(snapshots[best].year - year) ? index : best, 0)
}

function App(): React.JSX.Element {
  const [empireId, setEmpireId] = useState(empires[0].id)
  const selectedEmpire = useMemo(() => empires.find((empire) => empire.id === empireId) ?? empires[0], [empireId])
  const [snapshotIndex, setSnapshotIndex] = useState(1)
  const [showEvents, setShowEvents] = useState(true)
  const [showLocations, setShowLocations] = useState(true)
  const [inspectorItem, setInspectorItem] = useState<InspectorItem | null>(null)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)

  const snapshot = selectedEmpire.snapshots[Math.min(snapshotIndex, selectedEmpire.snapshots.length - 1)]
  const visibleEvents = selectedEmpire.events.filter((event) => event.year <= snapshot.year)
  const activeEvent = selectedEmpire.events.find((event) => event.id === activeEventId) ?? null

  function selectEmpire(nextEmpireId: string): void {
    setEmpireId(nextEmpireId)
    setSnapshotIndex(1)
    setInspectorItem(null)
    setActiveEventId(null)
  }

  function selectSnapshot(nextIndex: number): void {
    setSnapshotIndex(nextIndex)
    setActiveEventId(null)
    setInspectorItem(null)
  }

  function selectEvent(event: HistoricalEvent): void {
    setActiveEventId(event.id)
    setSnapshotIndex(closestSnapshotIndex(selectedEmpire.snapshots, event.year))
    setInspectorItem({ kind: 'event', value: event })
  }

  return (
    <main>
      <section className="hero-shell" id="top">
        <nav className="topbar" aria-label="Primary">
          <a className="brand" href="#top" aria-label="history-borders home"><span className="brand-mark">hb</span><span>history-borders</span></a>
          <a href="#explore">Explore</a>
        </nav>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Historical borders, battles, and power</p>
            <h1>See empires as moving systems, not static maps.</h1>
            <p className="lede">Follow territorial change through dated snapshots. Scrub the timeline, jump to battles, and watch the globe re-centre around the event that changed the map.</p>
          </div>
          <div className="hero-card" aria-label="Dataset summary">
            <Map />
            <h2>{empires.length} empires · {empires.reduce((total, empire) => total + empire.events.length, 0)} events</h2>
            <p>Early prototype data now focuses on battles, capitals, expansion points, and historically legible transitions.</p>
          </div>
        </div>
      </section>

      <section className="controls-shell" id="explore" aria-label="Explorer controls">
        <div>
          <p className="eyebrow">Choose a polity</p>
          <div className="empire-tabs" role="tablist" aria-label="Choose an empire">
            {empires.map((empire) => (
              <button key={empire.id} type="button" role="tab" aria-selected={empire.id === selectedEmpire.id} className={empire.id === selectedEmpire.id ? 'active' : ''} onClick={() => selectEmpire(empire.id)} style={{ '--accent': empire.colour } as React.CSSProperties}>{empire.name}</button>
            ))}
          </div>
        </div>
        <div className="toggles" aria-label="Map layer toggles">
          <label><input type="checkbox" checked={showEvents} onChange={(event) => setShowEvents(event.target.checked)} /> Battles & events</label>
          <label><input type="checkbox" checked={showLocations} onChange={(event) => setShowLocations(event.target.checked)} /> Places</label>
        </div>
      </section>

      <HistoryGlobe empire={selectedEmpire} snapshot={snapshot} activeEvent={activeEvent} visibleEvents={visibleEvents} showEvents={showEvents} showLocations={showLocations} onSelectEvent={selectEvent} onSelectLocation={(location) => setInspectorItem({ kind: 'location', value: location })} />

      <section className="timeline-shell" aria-label="Time controls">
        <div className="timeline-head">
          <div><p className="eyebrow">Timeline controls map state</p><h2>{selectedEmpire.name}</h2></div>
          <p>{selectedEmpire.period}</p>
        </div>
        <input type="range" min="0" max={selectedEmpire.snapshots.length - 1} step="1" value={snapshotIndex} onChange={(event) => selectSnapshot(Number(event.target.value))} aria-label="Choose historical snapshot" />
        <div className="timeline-labels">{selectedEmpire.snapshots.map((item) => <span key={item.year}>{formatYear(item.year)}</span>)}</div>
        <div className="event-rail" aria-label="Jump to event">
          {selectedEmpire.events.map((event) => (
            <button key={event.id} type="button" className={activeEventId === event.id ? 'active' : ''} onClick={() => selectEvent(event)}>
              <span>{formatYear(event.year)}</span>{event.title}
            </button>
          ))}
        </div>
      </section>

      <section className="details-grid">
        <article className="empire-brief">
          <p className="eyebrow">Interpretation</p>
          <h2>{selectedEmpire.headline}</h2>
          <p>{selectedEmpire.caveat}</p>
          <div className="source-list">{selectedEmpire.sources.map((source) => <span key={source}><BookOpen size={14} /> {source}</span>)}</div>
        </article>
        <aside className="inspector" aria-live="polite">
          <p className="eyebrow">Selected detail</p>
          {inspectorItem ? inspectorItem.kind === 'event' ? (
            <><Crosshair /><h2>{inspectorItem.value.title}</h2><p className="year">{formatYear(inspectorItem.value.year)} · {inspectorItem.value.type}</p><p>{inspectorItem.value.summary}</p></>
          ) : (
            <><Search /><h2>{inspectorItem.value.name}</h2><p>{inspectorItem.value.note}</p></>
          ) : (
            <><Search /><h2>Select a battle or place.</h2><p>The timeline, globe and inspector are linked. Pick an event below the map to jump to its moment and location.</p></>
          )}
        </aside>
      </section>
    </main>
  )
}

export default App
