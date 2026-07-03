import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Crosshair, Search } from 'lucide-react'
import { geoArea } from 'd3-geo'
import './App.css'
import './Chronology.css'
import './Editorial.css'
import { HistoryGlobe } from './components/HistoryGlobe'
import { empires } from './data/empires'
import { getSourceInfo } from './data/sources'
import type { EmpireSnapshot, HistoricalEvent, KeyLocation } from './types/history'

type InspectorItem =
  | { readonly kind: 'event'; readonly value: HistoricalEvent }
  | { readonly kind: 'location'; readonly value: KeyLocation }

type ChronologyBeat =
  | { readonly kind: 'snapshot'; readonly id: string; readonly year: number; readonly snapshotIndex: number; readonly title: string }
  | { readonly kind: 'event'; readonly id: string; readonly year: number; readonly event: HistoricalEvent; readonly snapshotIndex: number; readonly title: string }

const EARTH_RADIUS_KM = 6371.0088

interface ShareRoute {
  readonly empireId: string
  readonly snapshotIndex: number
  readonly eventId: string | null
}

function formatYear(year: number): string { return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE` }

function approximateAreaKm2(snapshot: EmpireSnapshot): number {
  return geoArea(snapshot.extent) * EARTH_RADIUS_KM * EARTH_RADIUS_KM
}

function formatArea(value: number): string {
  if (!Number.isFinite(value)) return 'unknown area'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 1 : 2)}m km²`
  if (value >= 10_000) return `${Math.round(value / 1_000).toLocaleString()}k km²`
  return `${Math.round(value).toLocaleString()} km²`
}

function formatAreaDelta(current: number, previous: number | null): string {
  if (previous === null || !Number.isFinite(previous)) return 'baseline snapshot'
  const delta = current - previous
  const direction = delta >= 0 ? '+' : '−'
  const percent = previous > 0 ? ` (${direction}${Math.abs((delta / previous) * 100).toFixed(Math.abs(delta / previous) > 1 ? 0 : 1)}%)` : ''
  return `${direction}${formatArea(Math.abs(delta))} vs previous${percent}`
}

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

function eventNonClaim(event: HistoricalEvent, currentSnapshot: EmpireSnapshot): string {
  if (event.type === 'battle') return 'This marker does not mean the whole coloured area changed hands on the battle date; it locates a pressure point in the wider territorial story.'
  if (event.type === 'war') return 'This marker does not mean the whole coloured area changed hands in that year; it locates a pressure point in the wider territorial story.'
  if (event.type === 'capital') return 'This marker locates a political centre; it is not itself a border line or a measurement of controlled territory.'
  if (event.type === 'treaty') return currentSnapshot.layer === 'recognised'
    ? 'This is a recognised/legal marker, but the simplified fill still suppresses local exceptions and internal boundaries.'
    : 'This treaty marker is context for the selected layer; it should not be read as recognition of every shaded control area.'
  return 'The shaded area is a simplified snapshot. Use the date, surrounding events and source row together before treating it as a territorial claim.'
}

function sourceDateLine(sourceKey: string | undefined): string | null {
  if (!sourceKey) return null
  const info = getSourceInfo(sourceKey)
  if (!info) return null
  const dates = [info.asOf ? `data as of ${info.asOf}` : null, info.publishedAt ? `published ${info.publishedAt}` : null, info.accessedAt ? `accessed ${info.accessedAt}` : null].filter(Boolean)
  return dates.length > 0 ? dates.join(' · ') : null
}


function eventState(event: HistoricalEvent, snapshot: EmpireSnapshot, activeEventId: string | null): 'active' | 'past' | 'future' {
  if (event.id === activeEventId) return 'active'
  return event.year <= snapshot.year ? 'past' : 'future'
}

function timelinePercent(year: number, start: number, end: number): number {
  if (start === end) return 50
  return Math.max(0, Math.min(100, ((year - start) / (end - start)) * 100))
}

function chronologyFocusClass(eventIndex: number, activeEventIndex: number): string {
  if (activeEventIndex < 0) return 'distant'
  const distance = Math.abs(eventIndex - activeEventIndex)
  if (distance === 0) return 'focus'
  if (distance <= 1) return 'near'
  return 'distant'
}

function buildChronologyBeats(snapshots: readonly EmpireSnapshot[], events: readonly HistoricalEvent[]): readonly ChronologyBeat[] {
  return [
    ...snapshots.map((snapshot, index) => ({ kind: 'snapshot' as const, id: `snapshot-${snapshot.year}-${index}`, year: snapshot.year, snapshotIndex: index, title: snapshot.label })),
    ...events.map((event) => ({ kind: 'event' as const, id: event.id, year: event.year, event, snapshotIndex: closestSnapshotIndex(snapshots, event.year), title: event.title })),
  ].sort((a, b) => a.year === b.year ? (a.kind === 'snapshot' ? -1 : 1) : a.year - b.year)
}

function routeFromUrl(): ShareRoute {
  if (typeof window === 'undefined') return { empireId: empires[0].id, snapshotIndex: 1, eventId: null }
  const params = new URLSearchParams(window.location.search)
  const requestedEmpireId = params.get('track') ?? empires[0].id
  const empire = empires.find((item) => item.id === requestedEmpireId) ?? empires[0]
  const requestedEventId = params.get('event')
  const event = requestedEventId ? empire.events.find((item) => item.id === requestedEventId) : undefined
  if (event) return { empireId: empire.id, snapshotIndex: closestSnapshotIndex(empire.snapshots, event.year), eventId: event.id }
  const requestedYear = params.has('year') ? Number(params.get('year')) : Number.NaN
  const snapshotIndex = Number.isFinite(requestedYear) ? closestSnapshotIndex(empire.snapshots, requestedYear) : Math.min(1, empire.snapshots.length - 1)
  return { empireId: empire.id, snapshotIndex, eventId: null }
}

function App(): React.JSX.Element {
  const [initialRoute] = useState<ShareRoute>(() => routeFromUrl())
  const [empireId, setEmpireId] = useState(initialRoute.empireId)
  const selectedEmpire = useMemo(() => empires.find((empire) => empire.id === empireId) ?? empires[0], [empireId])
  const [snapshotIndex, setSnapshotIndex] = useState(initialRoute.snapshotIndex)
  const [showEvents, setShowEvents] = useState(true)
  const [showLocations, setShowLocations] = useState(true)
  const [inspectorItem, setInspectorItem] = useState<InspectorItem | null>(() => {
    const empire = empires.find((item) => item.id === initialRoute.empireId) ?? empires[0]
    const event = initialRoute.eventId ? empire.events.find((item) => item.id === initialRoute.eventId) : undefined
    return event ? { kind: 'event', value: event } : null
  })
  const [activeEventId, setActiveEventId] = useState<string | null>(initialRoute.eventId)
  const [isPlaying, setIsPlaying] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  const chronologyBeats = useMemo(() => buildChronologyBeats(selectedEmpire.snapshots, selectedEmpire.events), [selectedEmpire])
  const activeBeatIndex = Math.max(0, chronologyBeats.findIndex((beat) => activeEventId ? beat.kind === 'event' && beat.id === activeEventId : beat.kind === 'snapshot' && beat.snapshotIndex === snapshotIndex))
  const currentBeat = chronologyBeats[activeBeatIndex] ?? chronologyBeats[0]
  const snapshot = selectedEmpire.snapshots[Math.min(snapshotIndex, selectedEmpire.snapshots.length - 1)]
  const activeEvent = selectedEmpire.events.find((event) => event.id === activeEventId) ?? null
  const activeEventIndex = activeEventId ? selectedEmpire.events.findIndex((event) => event.id === activeEventId) : -1
  const visibleEvents = selectedEmpire.events.filter((event) => event.year <= snapshot.year || event.id === activeEventId)
  const canStepBackward = activeBeatIndex > 0
  const canStepForward = activeBeatIndex < chronologyBeats.length - 1
  const previousSnapshot = snapshotIndex > 0 ? selectedEmpire.snapshots[snapshotIndex - 1] : null
  const nextSnapshot = snapshotIndex < selectedEmpire.snapshots.length - 1 ? selectedEmpire.snapshots[snapshotIndex + 1] : null
  const inspectedEvent = inspectorItem?.kind === 'event' ? inspectorItem.value : null
  const eventSnapshotOffset = inspectedEvent && inspectedEvent.year !== snapshot.year
  const timelineStart = chronologyBeats[0]?.year ?? snapshot.year
  const timelineEnd = chronologyBeats.at(-1)?.year ?? snapshot.year
  const currentAreaKm2 = approximateAreaKm2(snapshot)
  const previousAreaKm2 = previousSnapshot ? approximateAreaKm2(previousSnapshot) : null
  const areaDeltaLabel = formatAreaDelta(currentAreaKm2, previousAreaKm2)

  useEffect(() => {
    if (!isPlaying || chronologyBeats.length < 2) return undefined
    const interval = window.setInterval(() => {
      const nextBeat = chronologyBeats[(activeBeatIndex + 1) % chronologyBeats.length]
      applyChronologyBeat(nextBeat, { keepPlaying: true })
    }, 1900)
    return () => window.clearInterval(interval)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()
    params.set('track', selectedEmpire.id)
    params.set('year', String(snapshot.year))
    if (activeEventId) params.set('event', activeEventId)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
  }, [activeEventId, selectedEmpire.id, snapshot.year])

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

  function applyChronologyBeat(beat: ChronologyBeat, options: { readonly keepPlaying?: boolean } = {}): void {
    setSnapshotIndex(beat.snapshotIndex)
    if (beat.kind === 'event') {
      setActiveEventId(beat.event.id)
      setInspectorItem({ kind: 'event', value: beat.event })
    } else {
      setActiveEventId(null)
      setInspectorItem(null)
    }
    if (!options.keepPlaying) setIsPlaying(false)
  }


  function selectBeat(nextIndex: number): void {
    const beat = chronologyBeats[Math.max(0, Math.min(chronologyBeats.length - 1, nextIndex))]
    if (beat) applyChronologyBeat(beat)
  }

  function stepSnapshot(direction: -1 | 1): void {
    const nextBeat = chronologyBeats[Math.max(0, Math.min(chronologyBeats.length - 1, activeBeatIndex + direction))]
    if (nextBeat) applyChronologyBeat(nextBeat)
  }

  function stepMapSnapshot(direction: -1 | 1): void {
    const nextIndex = Math.max(0, Math.min(selectedEmpire.snapshots.length - 1, snapshotIndex + direction))
    const beat = chronologyBeats.find((item) => item.kind === 'snapshot' && item.snapshotIndex === nextIndex)
    if (beat) applyChronologyBeat(beat)
  }

  function selectEvent(event: HistoricalEvent): void {
    const beat = chronologyBeats.find((item) => item.kind === 'event' && item.id === event.id)
    if (beat) applyChronologyBeat(beat)
    else {
      setActiveEventId(event.id)
      setSnapshotIndex(closestSnapshotIndex(selectedEmpire.snapshots, event.year))
      setInspectorItem({ kind: 'event', value: event })
      setIsPlaying(false)
    }
  }

  async function copyShareLink(): Promise<void> {
    const link = typeof window === 'undefined' ? '' : window.location.href
    try {
      await navigator.clipboard.writeText(link)
      setShareStatus('copied')
      window.setTimeout(() => setShareStatus('idle'), 1600)
    } catch {
      setShareStatus('copied')
      window.prompt('Copy this history-borders link', link)
      window.setTimeout(() => setShareStatus('idle'), 1600)
    }
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
            <button type="button" onClick={() => void copyShareLink()} aria-live="polite">{shareStatus === 'copied' ? 'copied link' : 'share view'}</button>
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

        <HistoryGlobe
          empire={selectedEmpire}
          snapshot={snapshot}
          activeEvent={activeEvent}
          previousSnapshot={previousSnapshot}
          frameKicker={`${activeBeatIndex + 1}/${chronologyBeats.length} · ${currentBeat?.kind === 'event' ? currentBeat.event.type : snapshot.layer}`}
          frameTitle={currentBeat ? currentBeat.title : snapshot.label}
          frameSummary={currentBeat?.kind === 'event' ? currentBeat.event.summary : (snapshot.change ?? snapshot.note)}
          frameMetric={`${formatArea(currentAreaKm2)} · ${areaDeltaLabel}`}
          frameProgress={chronologyBeats.length > 1 ? (activeBeatIndex / (chronologyBeats.length - 1)) * 100 : 100}
          visibleEvents={visibleEvents}
          showEvents={showEvents}
          showLocations={showLocations}
          onSelectEvent={selectEvent}
          onSelectLocation={(location) => setInspectorItem({ kind: 'location', value: location })}
        />

        <section className="timeline-shell" aria-label="Time controls">
          <div className="timeline-head">
            <div><p className="eyebrow">{formatYear(snapshot.year)}</p><h1>{selectedEmpire.name}: {snapshot.label}</h1></div>
            <p>{snapshot.note}</p>
          </div>
          <div className="chronology-band" aria-label="Chronology of map snapshots and historical events">
            <div className="snapshot-ticks" aria-hidden="true">
              {selectedEmpire.snapshots.map((item) => (
                <span key={`${item.year}-${item.label}`} style={{ left: `${timelinePercent(item.year, timelineStart, timelineEnd)}%` }} />
              ))}
            </div>
            <div
              className="timeline-playhead"
              style={{ left: `${timelinePercent(currentBeat?.year ?? snapshot.year, timelineStart, timelineEnd)}%` }}
              aria-hidden="true"
            >
              <span>{formatYear(currentBeat?.year ?? snapshot.year)}</span>
            </div>
            {selectedEmpire.events.map((event, eventIndex) => {
              const state = eventState(event, snapshot, activeEventId)
              const focus = chronologyFocusClass(eventIndex, activeEventIndex)
              return (
                <button
                  key={event.id}
                  type="button"
                  className={`chronology-event ${event.type} ${state} ${focus}`}
                  style={{ left: `${timelinePercent(event.year, timelineStart, timelineEnd)}%` }}
                  onClick={() => selectEvent(event)}
                  aria-label={`Inspect ${formatYear(event.year)} ${event.title}; ${state === 'future' ? 'after' : 'within or before'} current map snapshot`}
                >
                  <span>{formatYear(event.year)}</span>
                  <strong>{event.title}</strong>
                </button>
              )
            })}
          </div>
          <input type="range" min="0" max={Math.max(0, chronologyBeats.length - 1)} step="1" value={activeBeatIndex} onChange={(event) => selectBeat(Number(event.target.value))} aria-label="Scrub through every map snapshot and historical event" />
          <div className="timeline-labels">{selectedEmpire.snapshots.map((item) => <span key={item.year}>{formatYear(item.year)}</span>)}</div>
          <div className="transition-strip" aria-label="Map transition context">
            <button type="button" onClick={() => stepMapSnapshot(-1)} disabled={!previousSnapshot}>
              <span>Before</span>
              <strong>{previousSnapshot ? `${formatYear(previousSnapshot.year)} · ${previousSnapshot.label}` : 'Start of track'}</strong>
              <small>{previousSnapshot?.claim ?? 'No earlier snapshot for this track.'}</small>
            </button>
            <article>
              <span>{currentBeat?.kind === 'event' ? 'Event driving the map' : 'Now on the map'}</span>
              <strong>{currentBeat ? `${formatYear(currentBeat.year)} · ${currentBeat.title}` : snapshot.label}</strong>
              <p>{currentBeat?.kind === 'event' ? currentBeat.event.summary : snapshot.change}</p>
              <p className="area-metric"><b>Approx. area</b> {formatArea(currentAreaKm2)} · {areaDeltaLabel}</p>
            </article>
            <button type="button" onClick={() => stepMapSnapshot(1)} disabled={!nextSnapshot}>
              <span>After</span>
              <strong>{nextSnapshot ? `${formatYear(nextSnapshot.year)} · ${nextSnapshot.label}` : 'End of track'}</strong>
              <small>{nextSnapshot?.change ?? 'No later snapshot for this track.'}</small>
            </button>
          </div>
          <div className="event-rail" aria-label="Jump to event">
            {selectedEmpire.events.map((event) => (
              <button key={event.id} type="button" className={activeEventId === event.id ? 'active' : ''} onClick={() => selectEvent(event)}>
                <span>{formatYear(event.year)} · {eventState(event, snapshot, activeEventId) === 'future' ? 'ahead of map' : 'in map context'}</span>{event.title}
              </button>
            ))}
          </div>
        </section>
      </section>

      <section className="editorial-page" aria-label="Editorial explainer">
        <header className="newspaper-masthead">
          <p className="eyebrow">The border record</p>
          <h2>{selectedEmpire.name}</h2>
          <p>{selectedEmpire.period} · {snapshot.label} · {formatYear(snapshot.year)}</p>
        </header>

        <section className="details-grid newspaper-columns">
          <article className="empire-brief lead-story">
            <p className="eyebrow">Interpretation</p>
            <h2>{selectedEmpire.headline}</h2>
            <p className="standfirst">{selectedEmpire.caveat}</p>
            <div className="source-list" aria-label="Principal sources">{selectedEmpire.sources.map((source) => {
              const info = getSourceInfo(source)
              return info ? <a key={source} href={info.url} target="_blank" rel="noreferrer"><BookOpen size={14} /> {info.title}</a> : <span key={source}><BookOpen size={14} /> {source}</span>
            })}</div>
          </article>
          <aside className="inspector side-story" aria-live="polite">
            <p className="eyebrow">Selected detail</p>
            {inspectorItem ? inspectorItem.kind === 'event' ? (
              <><Crosshair /><h2>{inspectorItem.value.title}</h2><p className="year">{formatYear(inspectorItem.value.year)} · {inspectorItem.value.type}</p><p>{inspectorItem.value.summary}</p>{eventSnapshotOffset && <p className="temporal-note">Nearest map frame: {formatYear(snapshot.year)}. The event gives context for this moment in the sequence.</p>}<dl className="event-facts"><div className="evidence-note"><dt>Why now</dt><dd>{eventImplication(inspectorItem.value, snapshot)} {eventNonClaim(inspectorItem.value, snapshot)}</dd></div><div><dt>What changed</dt><dd>{snapshot.change ?? snapshot.note}</dd></div><div><dt>On screen</dt><dd>{selectedEmpire.name} · {snapshot.label} · {formatYear(snapshot.year)}</dd></div><div><dt>Where</dt><dd>{inspectorItem.value.location.lat.toFixed(2)}, {inspectorItem.value.location.lon.toFixed(2)}</dd></div></dl>{inspectorItem.value.source && (() => {
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
      </section>
    </main>
  )
}

export default App
