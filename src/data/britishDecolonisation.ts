import { empires } from './empires.ts'
import { sourceCatalog } from './sources.ts'
import type { Empire, EmpireSnapshot, HistoricalEvent } from '../types/history.ts'

function closedRing(points: readonly (readonly [number, number])[]): number[][] {
  const first = points[0]
  const last = points[points.length - 1]
  const closed = first[0] === last[0] && first[1] === last[1] ? points : [...points, first]
  return closed.map(([lon, lat]) => [lon, lat])
}

function feature(polygons: readonly (readonly (readonly [number, number])[])[]): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  return { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: polygons.map((polygon) => [closedRing(polygon)]) } }
}

function box(west: number, south: number, east: number, north: number): readonly (readonly [number, number])[] {
  return [[west, north], [east, north], [east, south], [west, south], [west, north]]
}

const ukAndDominions = feature([
  box(-9, 49, 2, 59),
  box(-140, 42, -52, 72),
  box(112, -45, 154, -10),
  box(16, -35, 34, -23),
])

const lateImperialRemnants = feature([
  box(-9, 49, 2, 59),
  box(-140, 42, -52, 72),
  box(112, -45, 154, -10),
  box(16, -35, 34, -23),
  box(-6, 35, 36, 32),
  box(72, 18, 89, 28),
  box(113.7, 22.1, 114.4, 22.6),
])

const postHandoverUk = feature([
  box(-9, 49, 2, 59),
  box(-61.5, -52, -57.5, -51),
  box(-65, 17, -61, 19),
  box(-6, 36, -5, 36.4),
])

sourceCatalog['Partition of India'] = {
  title: 'Partition of India',
  url: 'https://en.wikipedia.org/wiki/Partition_of_India',
  kind: 'event chronology',
  note: '1947 British India independence and partition marker for rapid imperial contraction.',
}

sourceCatalog['Suez Crisis'] = {
  title: 'Suez Crisis',
  url: 'https://en.wikipedia.org/wiki/Suez_Crisis',
  kind: 'event chronology',
  note: '1956 geopolitical crisis often used as a marker of reduced British imperial power.',
}

sourceCatalog['Wind of Change speech'] = {
  title: 'Wind of Change speech',
  url: 'https://en.wikipedia.org/wiki/Wind_of_Change_(speech)',
  kind: 'event chronology',
  note: '1960 marker for accelerated African decolonisation in British policy.',
}

sourceCatalog['Handover of Hong Kong'] = {
  title: 'Handover of Hong Kong',
  url: 'https://en.wikipedia.org/wiki/Handover_of_Hong_Kong',
  kind: 'treaty',
  note: '1997 handover marker commonly used as the symbolic close of the British imperial era.',
}

const british = (empires as readonly Empire[]).find((empire) => empire.id === 'british')

if (british) {
  const sourceList = british.sources as string[]
  for (const source of ['Partition of India', 'Suez Crisis', 'Wind of Change speech', 'Handover of Hong Kong']) {
    if (!sourceList.includes(source)) sourceList.push(source)
  }

  const events = british.events as HistoricalEvent[]
  const additions: HistoricalEvent[] = [
    { id: 'india-partition-1947', year: 1947, title: 'India and Pakistan independent', type: 'decline', location: { lat: 28.61, lon: 77.21 }, source: 'Partition of India', summary: 'British India is partitioned into independent successor states, removing the empire’s central Asian landmass from the map.' },
    { id: 'suez-1956', year: 1956, title: 'Suez Crisis', type: 'decline', location: { lat: 30.04, lon: 31.24 }, source: 'Suez Crisis', summary: 'The failed intervention exposes the limits of postwar British power and becomes a marker for strategic contraction.' },
    { id: 'wind-change-1960', year: 1960, title: 'Wind of Change', type: 'decline', location: { lat: -33.92, lon: 18.42 }, source: 'Wind of Change speech', summary: 'Macmillan’s Cape Town speech signals acceptance that African decolonisation is accelerating.' },
    { id: 'hong-kong-1997', year: 1997, title: 'Hong Kong handover', type: 'treaty', location: { lat: 22.32, lon: 114.17 }, source: 'Handover of Hong Kong', summary: 'Hong Kong returns to Chinese sovereignty, leaving a much smaller UK-and-overseas-territories frame.' },
  ]
  for (const event of additions) if (!events.some((item) => item.id === event.id)) events.push(event)
  events.sort((left, right) => left.year - right.year)

  const snapshots = british.snapshots as EmpireSnapshot[]
  const additionsByYear: EmpireSnapshot[] = [
    {
      year: 1947,
      label: 'Partition and dominion turn',
      extent: lateImperialRemnants,
      note: 'The loss of British India makes contraction visible immediately after the imperial peak.',
      claim: 'This frame removes India as the imperial centre of gravity and keeps only a simplified late-colonial/dominion residue.',
      change: 'The overlay contracts sharply after 1922: South Asia no longer reads as British imperial territory, while dominions and remaining colonies persist as separate patches.',
      geometry: 'Simplified late-imperial residue; not a full colony-by-colony legal inventory.',
      geometryMethod: 'Hand-drawn contraction sketch tied to the 1947 independence/partition marker.',
      geometrySource: 'Partition of India',
      provenanceLabel: 'decolonisation sketch',
      sourceQuality: 'schematic',
      uncertainty: 'high',
      confidence: 'medium',
      source: 'Partition of India',
      scale: 285,
      layer: 'imperial',
    },
    {
      year: 1960,
      label: 'Wind of Change',
      extent: ukAndDominions,
      note: 'Postwar decolonisation shifts the visual story from empire to Commonwealth-era statehood.',
      claim: 'The frame keeps large dominion/commonwealth geographies as contextual residue while removing most direct imperial colouring.',
      change: 'The map contracts again as the African and Asian imperial blocks give way to independence sequences; it reads as a contraction beat, not a claim of uniform sovereignty.',
      geometry: 'Simplified decolonisation-era residue.',
      geometryMethod: 'Hand-drawn contraction sketch keyed to the 1960 Wind of Change marker.',
      geometrySource: 'Wind of Change speech',
      provenanceLabel: 'decolonisation sketch',
      sourceQuality: 'schematic',
      uncertainty: 'high',
      confidence: 'medium',
      source: 'Wind of Change speech',
      scale: 285,
      layer: 'influence',
    },
    {
      year: 1997,
      label: 'Post-imperial remnant',
      extent: postHandoverUk,
      countryNames: ['United Kingdom'],
      note: 'The Hong Kong handover leaves the United Kingdom and scattered overseas territories rather than a global empire.',
      claim: 'The final frame deliberately switches from imperial fill to recognised UK state geometry plus tiny overseas-territory cues in the fallback.',
      change: 'The sequence now has a clear end-state: the global 1922 footprint collapses to the United Kingdom after Hong Kong is handed over.',
      geometry: 'Natural Earth modern United Kingdom outline where available, with small fallback cues for selected overseas territories.',
      geometryMethod: 'Natural Earth country polygon linked by country name with simplified fallback.',
      geometrySource: 'Natural Earth countries 110m',
      provenanceLabel: 'Natural Earth',
      sourceQuality: 'atlas-derived',
      uncertainty: 'low',
      confidence: 'high',
      source: 'Handover of Hong Kong',
      scale: 430,
      layer: 'recognised',
    },
  ]

  for (const addition of additionsByYear) {
    if (!snapshots.some((snapshot) => snapshot.year === addition.year && snapshot.label === addition.label)) snapshots.push(addition)
  }
  snapshots.sort((left, right) => left.year - right.year)
}
