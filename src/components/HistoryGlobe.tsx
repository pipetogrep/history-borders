import { useEffect, useMemo, useRef, useState } from 'react'
import { geoCentroid, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { select } from 'd3-selection'
import { zoom, type D3ZoomEvent } from 'd3-zoom'
import { feature } from 'topojson-client'
import type { Arc, GeometryObject, Topology } from 'topojson-specification'
import type { Empire, EmpireSnapshot, HistoricalEvent, KeyLocation } from '../types/history'

interface WorldAtlasTopology {
  readonly type: 'Topology'
  readonly objects: {
    readonly countries: GeometryObject
  }
  readonly arcs: Arc[]
}

interface HistoryGlobeProps {
  readonly empire: Empire
  readonly snapshot: EmpireSnapshot
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

export function HistoryGlobe({ empire, snapshot, showEvents, showLocations, onSelectEvent, onSelectLocation }: HistoryGlobeProps): React.JSX.Element {
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
      if (!cancelled && isFeatureCollection(converted)) {
        setWorld(converted)
      }
    }
    void loadWorld()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const centroid = geoCentroid(snapshot.extent)
    if (Number.isFinite(centroid[0]) && Number.isFinite(centroid[1])) {
      setRotation([-centroid[0], -centroid[1], 0])
    }
  }, [snapshot])

  useEffect(() => {
    if (!svgRef.current) return
    const behaviour = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 2.4])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        setScale(initialScale * event.transform.k)
      })
    select(svgRef.current).call(behaviour)
  }, [])

  const projection = useMemo(() => geoOrthographic().scale(scale).translate([width / 2, height / 2]).rotate(rotation).clipAngle(90), [rotation, scale])
  const path = useMemo(() => geoPath(projection), [projection])

  const visibleEvents = empire.events.filter((event) => event.year <= snapshot.year && event.location)
  const timelineEvents = empire.events.filter((event) => Math.abs(event.year - snapshot.year) <= 130 || event.year <= snapshot.year)

  function rotateBy(delta: number): void {
    setRotation(([lambda, phi, gamma]) => [lambda + delta, phi, gamma])
  }

  return (
    <section className="globe-panel" aria-label="Historical globe visualisation">
      <div className="globe-stage">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${empire.name} around ${formatYear(snapshot.year)}`}>
          <defs>
            <radialGradient id="ocean" cx="38%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#1f8ed6" />
              <stop offset="55%" stopColor="#075985" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx={width / 2} cy={height / 2} r={scale} fill="url(#ocean)" className="ocean" />
          <path d={path(geoGraticule10()) ?? undefined} className="graticule" />
          {world?.features.map((country, index) => (
            <path key={index} d={path(country) ?? undefined} className="country" />
          ))}
          <path d={path(snapshot.extent) ?? undefined} className="empire-extent" style={{ '--empire-colour': empire.colour } as React.CSSProperties} />
        </svg>
        {showLocations && empire.locations.map((location) => {
          const projected = projection([location.lon, location.lat])
          if (!projected) return null
          return (
            <button
              key={location.name}
              type="button"
              className="map-marker location-marker"
              style={{ left: `${(projected[0] / width) * 100}%`, top: `${(projected[1] / height) * 100}%` }}
              onClick={() => onSelectLocation(location)}
              aria-label={`Inspect ${location.name}`}
            >
              <span />
            </button>
          )
        })}
        {showEvents && visibleEvents.map((event) => {
          if (!event.location) return null
          const projected = projection([event.location.lon, event.location.lat])
          if (!projected) return null
          return (
            <button
              key={`${event.year}-${event.title}`}
              type="button"
              className={`map-marker event-marker ${event.type}`}
              style={{ left: `${(projected[0] / width) * 100}%`, top: `${(projected[1] / height) * 100}%` }}
              onClick={() => onSelectEvent(event)}
              aria-label={`Inspect ${event.title}`}
            >
              <span />
            </button>
          )
        })}

        <div className="globe-actions" aria-label="Globe controls">
          <button type="button" onClick={() => rotateBy(-18)}>Rotate west</button>
          <button type="button" onClick={() => rotateBy(18)}>Rotate east</button>
        </div>
      </div>
      <aside className="snapshot-card">
        <span className="eyebrow">Snapshot</span>
        <h2>{snapshot.label}</h2>
        <p className="year">{formatYear(snapshot.year)}</p>
        <p>{snapshot.note}</p>
        <div className="event-list">
          {timelineEvents.slice(-4).map((event) => (
            <button key={`${event.year}-${event.title}`} type="button" onClick={() => onSelectEvent(event)}>
              <span>{formatYear(event.year)}</span>
              {event.title}
            </button>
          ))}
        </div>
      </aside>
    </section>
  )
}
