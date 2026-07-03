import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { geoCentroid, geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Arc, GeometryObject, Topology } from 'topojson-specification'
import './HistoryGlobe.css'
import type { Empire, EmpireSnapshot, HistoricalEvent, KeyLocation } from '../types/history'

interface WorldAtlasTopology {
  readonly type: 'Topology'
  readonly objects: { readonly countries: GeometryObject }
  readonly arcs: Arc[]
}

interface HistoryGlobeProps {
  readonly empire: Empire
  readonly snapshot: EmpireSnapshot
  readonly activeEvent: HistoricalEvent | null
  readonly previousSnapshot: EmpireSnapshot | null
  readonly frameKicker: string
  readonly frameTitle: string
  readonly frameSummary: string
  readonly frameMetric: string
  readonly frameProgress: number
  readonly visibleEvents: readonly HistoricalEvent[]
  readonly showEvents: boolean
  readonly showLocations: boolean
  readonly onSelectEvent: (event: HistoricalEvent) => void
  readonly onSelectLocation: (location: KeyLocation) => void
}

interface TransitionGhost {
  readonly key: string
  readonly geometry: GeoJSON.Feature | GeoJSON.FeatureCollection
  readonly layer: EmpireSnapshot['layer']
  readonly uncertainty: EmpireSnapshot['uncertainty']
  readonly colour: string
  readonly label: string
  readonly year: number
}

interface RenderedSnapshot {
  readonly key: string
  readonly empireId: string
  readonly geometry: GeoJSON.Feature | GeoJSON.FeatureCollection
  readonly layer: EmpireSnapshot['layer']
  readonly uncertainty: EmpireSnapshot['uncertainty']
  readonly colour: string
  readonly label: string
  readonly year: number
}

const width = 760
const height = 640
const initialScale = 285

function isFeatureCollection(value: unknown): value is GeoJSON.FeatureCollection {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'FeatureCollection'
}

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`
}

function isVisible(rotation: readonly [number, number, number], lon: number, lat: number): boolean {
  const centre: [number, number] = [-rotation[0], -rotation[1]]
  return geoDistance([lon, lat], centre) < Math.PI / 2
}

function layerLabel(layer: EmpireSnapshot['layer']): string {
  if (layer === 'recognised') return 'legal border'
  if (layer === 'control') return 'control estimate'
  if (layer === 'administrative') return 'administrative sketch'
  if (layer === 'influence') return 'influence sketch'
  return 'schematic extent'
}

export function HistoryGlobe({ empire, snapshot, activeEvent, previousSnapshot, frameKicker, frameTitle, frameSummary, frameMetric, frameProgress, visibleEvents, showEvents, showLocations, onSelectEvent, onSelectLocation }: HistoryGlobeProps): React.JSX.Element {
  const [world, setWorld] = useState<GeoJSON.FeatureCollection | null>(null)
  const [rotation, setRotation] = useState<[number, number, number]>([-12, -18, 0])
  const [scale, setScale] = useState(initialScale)
  const [manualView, setManualView] = useState(false)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<{ readonly x: number; readonly y: number; readonly rotation: [number, number, number] } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const previousEmpireId = useRef(empire.id)
  const previousActiveEventId = useRef(activeEvent?.id ?? null)
  const previousRenderedSnapshot = useRef<RenderedSnapshot | null>(null)
  const [transitionGhost, setTransitionGhost] = useState<TransitionGhost | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadWorld(): Promise<void> {
      const response = await fetch('/countries-110m.json')
      const topology = (await response.json()) as Topology<{ readonly countries: GeometryObject }> & WorldAtlasTopology
      const converted = feature(topology, topology.objects.countries)
      if (!cancelled && isFeatureCollection(converted)) setWorld(converted)
    }
    void loadWorld()
    return () => { cancelled = true }
  }, [])

  const projection = useMemo(() => geoOrthographic().scale(scale).translate([width / 2, height / 2]).rotate(rotation).clipAngle(90), [rotation, scale])
  const path = useMemo(() => geoPath(projection), [projection])
  const listedEvents = visibleEvents.slice(-5)
  const resolveSnapshotGeometry = useCallback((targetSnapshot: EmpireSnapshot): GeoJSON.Feature | GeoJSON.FeatureCollection => {
    if (!world || !targetSnapshot.countryNames?.length) return targetSnapshot.extent
    const selected = world.features.filter((country) => {
      const name = typeof country.properties?.name === 'string' ? country.properties.name : null
      return name ? targetSnapshot.countryNames?.includes(name) : false
    })
    return selected.length > 0 ? { type: 'FeatureCollection', features: selected } : targetSnapshot.extent
  }, [world])
  const snapshotGeometry = useMemo<GeoJSON.Feature | GeoJSON.FeatureCollection>(() => resolveSnapshotGeometry(snapshot), [resolveSnapshotGeometry, snapshot])
  const previousSnapshotGeometry = useMemo<GeoJSON.Feature | GeoJSON.FeatureCollection | null>(() => previousSnapshot ? resolveSnapshotGeometry(previousSnapshot) : null, [previousSnapshot, resolveSnapshotGeometry])
  const recognisedBaseline = useMemo(() => {
    if (snapshot.layer !== 'control') return null
    const candidates = empire.snapshots.filter((item) => item.layer === 'recognised' && item.year <= snapshot.year)
    const baseline = candidates.at(-1)
    return baseline ? { snapshot: baseline, geometry: resolveSnapshotGeometry(baseline) } : null
  }, [empire.snapshots, resolveSnapshotGeometry, snapshot])

  useEffect(() => {
    const key = `${empire.id}-${snapshot.year}-${snapshot.label}`
    const previous = previousRenderedSnapshot.current
    if (previous && previous.key !== key && previous.empireId === empire.id) {
      setTransitionGhost({ key: previous.key, geometry: previous.geometry, layer: previous.layer, uncertainty: previous.uncertainty, colour: previous.colour, label: previous.label, year: previous.year })
      const timeout = window.setTimeout(() => setTransitionGhost((current) => current?.key === previous.key ? null : current), 1050)
      previousRenderedSnapshot.current = { key, empireId: empire.id, geometry: snapshotGeometry, layer: snapshot.layer, uncertainty: snapshot.uncertainty, colour: empire.colour, label: snapshot.label, year: snapshot.year }
      return () => window.clearTimeout(timeout)
    }
    if (previous?.empireId !== empire.id) setTransitionGhost(null)
    previousRenderedSnapshot.current = { key, empireId: empire.id, geometry: snapshotGeometry, layer: snapshot.layer, uncertainty: snapshot.uncertainty, colour: empire.colour, label: snapshot.label, year: snapshot.year }
    return undefined
  }, [empire.id, empire.colour, snapshot.year, snapshot.label, snapshot.layer, snapshot.uncertainty, snapshotGeometry])

  function fitCurrentLayer(): void {
    const target = activeEvent ? [activeEvent.location.lon, activeEvent.location.lat] : geoCentroid(snapshotGeometry)
    if (Number.isFinite(target[0]) && Number.isFinite(target[1])) setRotation([-target[0], -target[1], 0])
    setScale(snapshot.scale ?? initialScale)
    setManualView(false)
  }

  function resetView(): void {
    setRotation([-12, -18, 0])
    setScale(initialScale)
    setManualView(false)
  }

  useEffect(() => {
    const activeEventId = activeEvent?.id ?? null
    const empireChanged = previousEmpireId.current !== empire.id
    const eventChanged = previousActiveEventId.current !== activeEventId
    previousEmpireId.current = empire.id
    previousActiveEventId.current = activeEventId
    if (!manualView || empireChanged || eventChanged) fitCurrentLayer()
    else setScale((current) => snapshot.scale ?? current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empire.id, snapshot, snapshotGeometry, activeEvent?.id])
  const layerClass = `layer-${snapshot.layer}`
  const uncertaintyClass = `uncertainty-${snapshot.uncertainty ?? 'medium'}`
  const eventThreadPath = visibleEvents
    .filter((event) => isVisible(rotation, event.location.lon, event.location.lat))
    .map((event) => projection([event.location.lon, event.location.lat]))
    .filter((point): point is [number, number] => Boolean(point))
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')

  function rotateBy(delta: number): void {
    setManualView(true)
    setRotation(([lambda, phi, gamma]) => [lambda + delta, phi, gamma])
  }

  function startDrag(clientX: number, clientY: number): void {
    dragRef.current = { x: clientX, y: clientY, rotation }
    setIsDragging(true)
    setManualView(true)
  }

  function updateDrag(clientX: number, clientY: number): void {
    const drag = dragRef.current
    if (!drag) return
    const sensitivity = 0.22 * (initialScale / scale)
    const nextLambda = drag.rotation[0] + (clientX - drag.x) * sensitivity
    const nextPhi = Math.max(-78, Math.min(78, drag.rotation[1] - (clientY - drag.y) * sensitivity))
    setRotation([nextLambda, nextPhi, drag.rotation[2]])
  }

  function stopDrag(): void {
    dragRef.current = null
    setIsDragging(false)
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>): void {
    event.currentTarget.setPointerCapture(event.pointerId)
    startDrag(event.clientX, event.clientY)
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>): void { updateDrag(event.clientX, event.clientY) }

  function handlePointerUp(event: React.PointerEvent<SVGSVGElement>): void {
    stopDrag()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function handleWheel(event: React.WheelEvent<SVGSVGElement>): void {
    event.preventDefault()
    const direction = event.deltaY > 0 ? -1 : 1
    setManualView(true)
    setScale((current) => Math.max(initialScale * 0.82, Math.min(initialScale * 2.3, current + direction * 18)))
  }

  return (
    <section className="globe-panel" aria-label="Historical globe visualisation">
      <div className={`globe-stage ${isDragging ? 'is-dragging' : ''}`}>
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${empire.name} around ${formatYear(snapshot.year)}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onLostPointerCapture={handlePointerUp} onWheel={handleWheel}>
          <defs>
            <radialGradient id="ocean" cx="38%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#edf6f2" />
              <stop offset="58%" stopColor="#d9e8e4" />
              <stop offset="100%" stopColor="#a9c7c4" />
            </radialGradient>
          </defs>
          <circle cx={width / 2} cy={height / 2} r={scale} fill="url(#ocean)" className="ocean" />
          <circle cx={width / 2} cy={height / 2} r={scale - 0.5} className="globe-hit-area" />
          <path d={path(geoGraticule10()) ?? undefined} className="graticule" />
          {world && (
            <clipPath id="landClip">
              {world.features.map((country, index) => <path key={index} d={path(country) ?? undefined} />)}
            </clipPath>
          )}
          {world?.features.map((country, index) => <path key={index} d={path(country) ?? undefined} className="country" />)}
          {recognisedBaseline && (
            <path
              key={`baseline-${empire.id}-${recognisedBaseline.snapshot.year}`}
              d={path(recognisedBaseline.geometry) ?? undefined}
              className="recognised-baseline"
              clipPath="url(#landClip)"
              aria-label={`Recognised border baseline ${recognisedBaseline.snapshot.label} ${formatYear(recognisedBaseline.snapshot.year)}`}
            />
          )}
          {previousSnapshot && previousSnapshotGeometry && (
            <path
              key={`previous-outline-${empire.id}-${previousSnapshot.year}`}
              d={path(previousSnapshotGeometry) ?? undefined}
              className={`previous-frame-outline layer-${previousSnapshot.layer} uncertainty-${previousSnapshot.uncertainty ?? 'medium'}`}
              clipPath="url(#landClip)"
              aria-label={`Previous comparison frame ${previousSnapshot.label} ${formatYear(previousSnapshot.year)}`}
            />
          )}
          {transitionGhost && (
            <path
              key={`ghost-${transitionGhost.key}`}
              d={path(transitionGhost.geometry) ?? undefined}
              className={`empire-extent empire-land empire-previous layer-${transitionGhost.layer} uncertainty-${transitionGhost.uncertainty ?? 'medium'}`}
              clipPath="url(#landClip)"
              style={{ '--empire-colour': transitionGhost.colour } as React.CSSProperties}
              aria-label={`Previous layer ${transitionGhost.label} ${formatYear(transitionGhost.year)}`}
            />
          )}
          <path key={`water-${empire.id}-${snapshot.year}`} d={path(snapshotGeometry) ?? undefined} className={`empire-extent empire-waterline ${layerClass} ${uncertaintyClass}`} style={{ '--empire-colour': empire.colour } as React.CSSProperties} />
          <path key={`land-${empire.id}-${snapshot.year}`} d={path(snapshotGeometry) ?? undefined} className={`empire-extent empire-land empire-current ${layerClass} ${uncertaintyClass}`} clipPath="url(#landClip)" style={{ '--empire-colour': empire.colour } as React.CSSProperties} />
          {eventThreadPath && <path d={eventThreadPath} className="event-thread" aria-label="Projected sequence of visible historical events" />}
        </svg>

        {showLocations && empire.locations.map((location) => {
          if (!isVisible(rotation, location.lon, location.lat)) return null
          const projected = projection([location.lon, location.lat])
          if (!projected) return null
          return <button key={location.name} type="button" className="map-marker location-marker" data-label={location.name} style={{ left: `${(projected[0] / width) * 100}%`, top: `${(projected[1] / height) * 100}%` }} onClick={() => onSelectLocation(location)} aria-label={`Inspect ${location.name}`}><span /></button>
        })}
        {showEvents && visibleEvents.map((event) => {
          if (!isVisible(rotation, event.location.lon, event.location.lat)) return null
          const projected = projection([event.location.lon, event.location.lat])
          if (!projected) return null
          const active = activeEvent?.id === event.id
          return <button key={event.id} type="button" className={`map-marker event-marker ${event.type} ${active ? 'active' : ''}`} data-label={`${formatYear(event.year)} · ${event.title}`} style={{ left: `${(projected[0] / width) * 100}%`, top: `${(projected[1] / height) * 100}%` }} onClick={() => onSelectEvent(event)} aria-label={`Inspect ${event.title}`}><span /></button>
        })}

        <div className="globe-hint">drag globe · scroll to zoom</div>
        <div className="frame-readout" aria-label="Current historical frame">
          <div className="frame-readout-top"><span>{frameKicker}</span><span>{formatYear(snapshot.year)}</span></div>
          <strong>{frameTitle}</strong>
          <p>{frameSummary}</p>
          <div className="frame-meter" aria-hidden="true"><span style={{ width: `${frameProgress}%` }} /></div>
          <small>{frameMetric}</small>
        </div>
        {transitionGhost && (
          <div className="transition-cue" aria-live="polite">
            <span>{formatYear(transitionGhost.year)} · {transitionGhost.label}</span>
            <strong>→</strong>
            <span>{formatYear(snapshot.year)} · {snapshot.label}</span>
          </div>
        )}
        <div className="map-legend" aria-label="Map legend">
          {previousSnapshot && <div><span className="legend-line previous" /> previous frame</div>}
          {recognisedBaseline && <div><span className="legend-line baseline" /> recognised border baseline</div>}
          <div><span className={`legend-swatch layer-${snapshot.layer}`} /> <strong>{layerLabel(snapshot.layer)}</strong></div>
          <div><span className="legend-dot event" /> event</div>
          <div><span className="legend-dot conflict" /> battle / war</div>
          <div><span className="legend-dot place" /> place</div>
        </div>
        <div className="globe-actions" aria-label="Globe controls">
          <button type="button" onClick={() => rotateBy(-18)} aria-label="Rotate globe west">←</button>
          <button type="button" onClick={() => rotateBy(18)} aria-label="Rotate globe east">→</button>
          <button type="button" onClick={fitCurrentLayer}>fit</button>
          <button type="button" onClick={resetView}>home</button>
        </div>
      </div>
      <aside className="snapshot-card" style={{ '--empire-colour': empire.colour } as React.CSSProperties}>
        <span className="eyebrow">{formatYear(snapshot.year)}</span>
        <h2>{snapshot.label}</h2>
        <p>{snapshot.note}</p>
        {activeEvent && (
          <div className="active-event-card">
            <span>{formatYear(activeEvent.year)} · {activeEvent.type}</span>
            <strong>{activeEvent.title}</strong>
            <p>{activeEvent.summary}</p>
          </div>
        )}
        <div className="event-list">
          {listedEvents.map((event) => (
            <button key={event.id} type="button" className={activeEvent?.id === event.id ? 'active' : ''} onClick={() => onSelectEvent(event)}>
              <span>{formatYear(event.year} · {event.type}</span>{event.title}
            </button>
          ))}
        </div>
      </aside>
    </section>
  )
}
