import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Crosshair, Search } from 'lucide-react'
import './App.css'
import { HistoryGlobe } from './components/HistoryGlobe'
import { empires } from './data/empires'
import { getSourceInfo } from './data/sources'
import type { EmpireSnapshot, HistoricalEvent, KeyLocation } from './types/history'

type InspectorItem =
  | { readonly kind: 'event'; readonly value: HistoricalEvent }
  | { readonly kind: 'location'; readonly value: KeyLocation }

function formatYear(year: number): string { return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE` }

function closestSnapshotIndex(snapshots: readonly EmpireSnapshot[], year: number): number {
  return snapshots.reduce((best, snapshot, index) => Math.abs(snapshot.year - year) < Math.abs(snapshots[best].year - year) ? index : best, 0)
}

function eventImplication(event: HistoricalEvent, currentSnapshot: EmpireSnapshot): string {
  if (event.type === 'battle' || event.type === 'war') return 'Military event: use it as a territorial-pressure marker, not proof that the whole highlighted region changed hands that year.'
  if (event.type === 'treaty') return 'Diplomatic/legal event: this is the kind of moment that can redraw recognised borders or formal administration.'
  if (event.type === 'expansion') return 'Expansion marker: the nearest map snapshot shows the broader territorial consequence around this date.'
  if (event.type === 'decline') return 'Contraction marker: compare this point with earlier ticks to see where authority or control has narrowed.'
  return 'Context marker for the selected map snapshot: ' + currentSnapshot.label + '.'
}

function sourceDateLine(sourceKey: string | undefined): string | null {
  if (!sourceKey) return null
  const info = getSourceInfo(sourceKey)
  if (!info) return null
  const dates = [info.asOf ? `data as of ${info.asOf}` : null, info.publishedAt ? `published ${info.publishedAt}` : null, info.accessedAt ? `accessed ${info.accessedAt}` : null].filter(Boolean)
  return dates.length > 0 ? dates.join(' · ') : null
}

function layerLabel(layer: EmpireSnapshot['layer']): string {
  if (layer === 'recognised') return 'legal border'
  if (layer === 'control') return 'control estimate'
  if (layer === 'administrative') return 'administrative sketch'
  if (layer === 'influence') return 'influence sketch'
  return 'schematic extent'
}

function App(): React.JSX.Element {
  const [empireId, setEmpireId] = useState(empires[0].id)
  const selectedEmpire = useMemo(() => empires.find((empire) => empire.id === empireId) ?? empires[0], [empireId])
  const [snapshotIndex, setSnapshotIndex] = useState(1)
  const [showEvents, setShowEvents] = useState(true)
  const [showLocations, setShowLocations] = useState(true)
  const [inspectorItem, setInspectorItem] = useState<InspectorItem | null>(null)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const snapshot = selectedEmpire.snapshots[Math.min(snapshotIndex, selectedEmpire.snapshots.length - 1)]
  const activeEvent = selectedEmpire.events.find((event) => event.id === activeEventId) ?? null
  const visibleEvents = selectedEmpire.events.filter((event) => event.year <= snapshot.year || event.id === activeEventId)
  const canStepBackward = snapshotIndex > 0
  const canStepForward = snapshotIndex < selectedEmpire.snapshots.length - 1
  const previousSnapshot = canStepBackward ? selectedEmpire.snapshots[snapshotIndex - 1] : null
  const nextSnapshot = canStepForward ? selectedEmpire.snapshots[snapshotIndex + 1] : null
  const inspectedEvent = inspectorItem?.kind === 'event' ? inspectorItem.value : null
  const eventSnapshotOffset = inspectedEvent && inspectedEvent.year !== snapshot.year

  useEffect(() => {
    if (!isPlaying) return undefined
    const interval = window.setInterval(() => {
      setSnapshotIndex((current) => current >= selectedEmpire.snapshots.length - 1 ? 0 : current + 1)
      setActiveEventId(null)
      setInspectorItem(null)
    }, 1700)
    return () => window.clearInterval(interval)
  }, [isPlaying, selectedEmpire.snapshots.length])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return
      if (event.key === 'ArrowLeft') { event.preventDefault(); stepSnapshot(-1) }
      if (event.key === 'ArrowRight') { event.preventDefault(); stepSnapshot(1) }
      if (event.key === ' ') { event.preventDefault(); setIsPlaying((playing) => !playing) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

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
    setIsPlaying(false)
  }

  function stepSnapshot(direction: -1 | 1): void {
    setSnapshotIndex((current) => Math.max(0, Math.min(selectedEmpire.snapshots.length - 1, current + direction)))
    setActiveEventId(null)
    setInspectorItem(null)
    setIsPlaying(false)
  }

  function selectEvent(event: HistoricalEvent): void {
    setActiveEventId(event.id)
    setSnapshotIndex(closestSnapshotIndex(selectedEmpire.snapshots, event.year))
    setInspectorItem({ kind: 'event', value: event })
    setIsPlaying(false)
  }

  return (
    <main className="app-shell">
      <section className="map-workspace" id="explore">
        <header className="app-bar">
          <a className="brand" href="#explore" aria-label="history-borders home"><span className="brand-mark">hb</span><span>history-borders</span></a>
          <div className="top-controls" aria-label="Map layer toggles">
            <button type="button" onClick={() => stepSnapshot(-1)} disabled={!canStepBackward}>←</button>
            <button type="button" onClick={() => setIsPlaying((playing) => !playing)}>{isPlaying ? 'pause' : 'play'}</button>
            <button type="button" onClick={() => stepSnapshot(1)} disabled={!canStepForward}>→</button>
            <label><input type="checkbox" checked={showEvents} onChange={(event) => setShowEvents(event.target.checked)} /> events</label>
            <label><input type="checkbox" checked={showLocations} onChange={(event) => setShowLocations(event.target.checked)} /> places</label>
          </div>
        </header>

        <aside className="left-rail" aria-label="Choose a historical track">
          <p className="eyebrow">Tracks</p>
          <div className="empire-tabs" role="tablist" aria-label="Choose an empire or state formation track">
            {empires.map((empire) => (
              <button key={empire.id} type="button" role="tab" aria-selected={empire.id === selectedEmpire.id} className={empire.id === selectedEmpire.id ? 'active' : ''} onClick={() => selectEmpire(empire.id)} style={{ '--accent': empire.colour } as React.CSSProperties}>
                <span>{empire.name}</span>
                <small>{empire.period}</small>
              </button>
            ))}
          </div>
        </aside>

        <HistoryGlobe empire={selectedEmpire} snapshot={snapshot} activeEvent={activeEvent} visibleEvents={visibleEvents} showEvents={showEvents} showLocations={showLocations} onSelectEvent={selectEvent} onSelectLocation={(location) => setInspectorItem({ kind: 'location', value: location })} />

        <section className="timeline-shell" aria-label="Time controls">
          <div className="timeline-head">
            <div><p className="eyebrow">{formatYear(snapshot.year)}</p><h1>{selectedEmpire.name}: {snapshot.label}</h1></div>
            <p>{snapshot.note}</p>
          </div>
          <input type="range" min="0" max={selectedEmpire.snapshots.length - 1} step="1" value={snapshotIndex} onChange={(event) => selectSnapshot(Number(event.target.value))} aria-label="Choose historical snapshot" />
          <div className="timeline-labels">{selectedEmpire.snapshots.map((item) => <span key={item.year}>{formatYear(item.year)}</span>)}</div>
          <div className="transition-strip" aria-label="Map transition context">
            <button type="button" onClick={() => stepSnapshot(-1)} disabled={!previousSnapshot}>
              <span>Previous layer</span>
              <strong>{previousSnapshot ? `${formatYear(previousSnapshot.year)} · ${previousSnapshot.label}` : 'Start of track'}</strong>
              <small>{previousSnapshot?.claim ?? 'No earlier snapshot for this track.'}</small>
            </button>
            <article>
              <span>Map change now</span>
              <strong>{layerLabel(snapshot.layer)}</strong>
              <p>{snapshot.change}</p>
            </article>
            <button type="button" onClick={() => stepSnapshot(1)} disabled={!nextSnapshot}>
              <span>Next layer</span>
              <strong>{nextSnapshot ? `${formatYear(nextSnapshot.year)} · ${nextSnapshot.label}` : 'End of track'}</strong>
              <small>{nextSnapshot?.change ?? 'No later snapshot for this track.'}</small>
            </button>
          </div>
          <div className="event-rail" aria-label="Jump to event">
            {selectedEmpire.events.map((event) => (
              <button key={event.id} type="button" className={activeEventId === event.id ? 'active' : ''} onClick={() => selectEvent(event)}>
                <span>{formatYear(event.year)}</span>{event.title}
              </button>
            ))}
          </div>
        </section>
      </section>

      <section className="details-grid">
        <article className="empire-brief">
          <p className="eyebrow">Interpretation</p>
          <h2>{selectedEmpire.headline}</h2>
          <p>{selectedEmpire.caveat}</p>
          <div className="source-list">{selectedEmpire.sources.map((source) => {
            const info = getSourceInfo(source)
            return info ? <a key={source} href={info.url} target="_blank" rel="noreferrer"><BookOpen size={14} /> {info.title}</a> : <span key={source}><BookOpen size={14} /> {source}</span>
          })}</div>
        </article>
        <aside className="inspector" aria-live="polite">
          <p className="eyebrow">Selected detail</p>
          {inspectorItem ? inspectorItem.kind === 'event' ? (
            <><Crosshair /><h2>{inspectorItem.value.title}</h2><p className="year">{formatYear(inspectorItem.value.year)} · {inspectorItem.value.type}</p><p>{inspectorItem.value.summary}</p>{eventSnapshotOffset && <p className="temporal-note">Nearest map snapshot: {formatYear(snapshot.year)}. The event marker is evidence/context; the filled layer is not a claim that the whole region changed in {formatYear(inspectorItem.value.year)}.</p>}<dl className="event-facts"><div><dt>Map relation</dt><dd>{eventImplication(inspectorItem.value, snapshot)}</dd></div><div><dt>Snapshot claim</dt><dd>{snapshot.claim ?? snapshot.note}</dd></div><div><dt>Layer type</dt><dd>{layerLabel(snapshot.layer)}</dd></div><div><dt>Location</dt><dd>{inspectorItem.value.location.lat.toFixed(2)}, {inspectorItem.value.location.lon.toFixed(2)}</dd></div><div><dt>Current layer</dt><dd>{selectedEmpire.name} · {snapshot.label} · {formatYear(snapshot.year)}{snapshot.confidence ? ` · ${snapshot.confidence} confidence` : ''}</dd></div></dl>{inspectorItem.value.source && (() => {
              const info = getSourceInfo(inspectorItem.value.source)
              const dateLine = sourceDateLine(inspectorItem.value.source)
              return info ? <div className="source-card"><p className="eyebrow">Source</p><a href={info.url} target="_blank" rel="noreferrer">{info.title}</a><p>{info.kind} · {info.note}{dateLine ? ` · ${dateLine}` : ''}</p></div> : <p className="source-note">Source: {inspectorItem.value.source}</p>
            })()}</>
          ) : (
            <><Search /><h2>{inspectorItem.value.name}</h2><p>{inspectorItem.value.note}</p></>
          ) : (
            <><Search /><h2>No selection</h2><p>Click a timeline event, battle marker, or place marker to inspect the historical claim behind the map.</p></>
          )}
        </aside>
      </section>

      <section className="methodology-panel" aria-labelledby="methodology-title">
        <div>
          <p className="eyebrow">Methodology</p>
          <h2 id="methodology-title">Sketch map first. Legal border only when the data says so.</h2>
          <p>Each filled layer declares what claim it represents, why the timeline changed there, and how approximate the geometry is. Modern conflict layers separate source publication dates from the underlying “as of” control date.</p>
        </div>
        <dl>
          <div><dt>Recognised borders</dt><dd>Shown when a treaty/state-formation claim is the main object, e.g. U.S. 1783 or Ukraine 1991.</dd></div>
          <div><dt>Control overlays</dt><dd>Used for wars and occupation; these are explicitly not recognition maps.</dd></div>
          <div><dt>Geometry quality</dt><dd>Still stylised. The next data milestone is replacing hand-drawn extents with source-backed GeoJSON per track.</dd></div>
          <div><dt>Source freshness</dt><dd>Modern-conflict sources carry publication/access dates; historical references are treated as starting points, not final authority.</dd></div>
        </dl>
      </section>
    </main>
  )
}

export default App
