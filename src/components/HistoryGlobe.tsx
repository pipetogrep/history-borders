import { useEffect, useMemo, useRef, useState } from 'react'
import { geoCentroid, geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { select } from 'd3-selection'
import { zoom, type D3ZoomEvent } from 'd3-zoom'
import { feature } from 'topojson-client'
import type { Arc, GeometryObject, Topology } from 'topojson-specification'
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
  readonly visibleEvents: readonly HistoricalEvent[]
  readonly showEvents: boolean
  readonly showLocations: boolean
  readonly onSelectEvent: (event: HistoricalEvent) => void
  readonly onSelectLocation: (location: KeyLocation) => void
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

export function HistoryGlobe({ empire, snapshot, activeEvent, visibleEvents, showEvents, showLocations, onSelectEvent, onSelectLocation }: HistoryGlobeProps): React.JSX.Element {
  const [world, setWorld] = useState<GeoJSON.FeatureCollection | null>(null)
  const [rotation, setRotation] = useState<[number, number, number]>([-12, -18, 0])
  const [scale, setScale] = useState(initialScale)
  const svgRef = useRef<SVGSVGElement | null>(null)

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

  useEffect(() => {
    const target = activeEvent ? [activeEvent.location.lon, activeEvent.location.lat] : geoCentroid(snapshot.extent)
    if (Number.isFinite(target[0]) && Number.isFinite(target[1])) setRotation([-target[0], -target[1], 0])
  }, [snapshot, activeEvent])

  useEffect(() => {
    if (!svgRef.current) return
    const behaviour = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.82, 2.3])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => setScale(initialScale * event.transform.k))
    select(svgRef.current).call(behaviour)
  }, [])

  const projection = useMemo(() => geoOrthographic().scale(scale).translate([width / 2, height / 2]).rotate(rotation).clipAngle(90), [rotation, scale])
  const path = useMemo(() => geoPath(projection), [projection])
  const listedEvents = visibleEvents.slice(-5)

  function rotateBy(delta: number): void { setRotation(([lambda, phi, gamma]) => [lambda + delta, phi, gamma]) }

  return (
    <section className="globe-panel" aria-label="Historical globe visualisation">
      <div className="globe-stage">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${empire.name} around ${formatYear(snapshot.year)}`}>
          <defs>
            <radialGradient id="ocean" cx="38%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#293747" />
              <stop offset="60%" stopColor="#16202b" />
              <stop offset="100%" stopColor="#0c1118" />
            </radialGradient>
            <filter id="softGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <circle cx={width / 2} cy={height / 2} r={scale} fill="url(#ocean)" className="ocean" />
          <path d={path(geoGraticule10()) ?? undefined} className="graticule" />
          {world?.features.map((country, index) => <path key={index} d={path(country) ?? undefined} className="country" />)}
          <path d={path(snapshot.extent) ?? undefined} className="empire-extent" style={{ '--empire-colour': empire.colour } as React.CSSProperties} />
        </svg>

        {showLocations && empire.locations.map((location) => {
          if (!isVisible(rotation, location.lon, location.lat)) return null
          const projected = projection([location.lon, location.lat])
          if (!projected) return null
          return <button key={location.name} type="button" className="map-marker location-marker" style={{ left: `${(projected[0] / width) * 100}%`, top: `${(projected[1] / height) * 100}%` }} onClick={() => onSelectLocation(location)} aria-label={`Inspect ${location.name}`}><span /></button>
        })}
        {showEvents && visibleEvents.map((event) => {
          if (!isVisible(rotation, event.location.lon, event.location.lat)) return null
          const projected = projection([event.location.lon, event.location.lat])
          if (!projected) return null
          const active = activeEvent?.id === event.id
          return <button key={event.id} type="button" className={`map-marker event-marker ${event.type} ${active ? 'active' : ''}`} style={{ left: `${(projected[0] / width) * 100}%`, top: `${(projected[1] / height) * 100}%` }} onClick={() => onSelectEvent(event)} aria-label={`Inspect ${event.title}`}><span /></button>
        })}

        <div className="globe-actions" aria-label="Globe controls">
          <button type="button" onClick={() => rotateBy(-18)}>Rotate west</button>
          <button type="button" onClick={() => rotateBy(18)}>Rotate east</button>
        </div>
      </div>
      <aside className="snapshot-card">
        <span className="eyebrow">{formatYear(snapshot.year)}</span>
        <h2>{snapshot.label}</h2>
        <p>{snapshot.note}</p>
        <div className="event-list">
          {listedEvents.map((event) => (
            <button key={event.id} type="button" className={activeEvent?.id === event.id ? 'active' : ''} onClick={() => onSelectEvent(event)}>
              <span>{formatYear(event.year)} · {event.type}</span>{event.title}
            </button>
          ))}
        </div>
      </aside>
    </section>
  )
}
