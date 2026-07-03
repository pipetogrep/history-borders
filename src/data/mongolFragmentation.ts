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

const khanateFragments = feature([
  box(26, 44, 55, 52),
  box(44, 27, 66, 42),
  box(66, 38, 89, 51),
  box(92, 28, 124, 48),
])

const yuanSteppeRetreat = feature([
  box(96, 39, 122, 52),
  box(102, 45, 118, 55),
])

sourceCatalog['Division of the Mongol Empire'] = {
  title: 'Division of the Mongol Empire',
  url: 'https://en.wikipedia.org/wiki/Division_of_the_Mongol_Empire',
  kind: 'event chronology',
  note: 'Fragmentation of the unified empire into khanates and competing centres of authority.',
}

sourceCatalog['Kublai Khan'] = {
  title: 'Kublai Khan',
  url: 'https://en.wikipedia.org/wiki/Kublai_Khan',
  kind: 'reference',
  note: 'Yuan consolidation and imperial succession context.',
}

sourceCatalog['Red Turban Rebellions'] = {
  title: 'Red Turban Rebellions',
  url: 'https://en.wikipedia.org/wiki/Red_Turban_Rebellions',
  kind: 'event chronology',
  note: 'Fourteenth-century rebellions contributing to Yuan collapse in China.',
}

sourceCatalog['Ming conquest of Yunnan'] = {
  title: 'Ming conquest of Yunnan',
  url: 'https://en.wikipedia.org/wiki/Ming_conquest_of_Yunnan',
  kind: 'event chronology',
  note: 'Later Ming campaign against remaining Yuan-aligned power in southwest China.',
}

sourceCatalog['Yuan dynasty'] = {
  title: 'Yuan dynasty',
  url: 'https://en.wikipedia.org/wiki/Yuan_dynasty',
  kind: 'reference',
  note: 'Yuan state formation, retreat from China, and Northern Yuan continuity context.',
}

const mongol = (empires as readonly Empire[]).find((empire) => empire.id === 'mongol')

if (mongol) {
  const sourceList = mongol.sources as string[]
  for (const source of ['Division of the Mongol Empire', 'Kublai Khan', 'Red Turban Rebellions', 'Yuan dynasty']) {
    if (!sourceList.includes(source)) sourceList.push(source)
  }

  const events = mongol.events as HistoricalEvent[]
  const additions: HistoricalEvent[] = [
    { id: 'kublai-death-1294', year: 1294, title: 'Kublai Khan dies', type: 'decline', location: { lat: 39.904, lon: 116.407 }, source: 'Kublai Khan', summary: 'Kublai Khan’s death exposes the empire as a family of increasingly separate khanates rather than one command system.' },
    { id: 'khanate-fragmentation', year: 1304, title: 'Khanates acknowledge division', type: 'decline', location: { lat: 43.25, lon: 76.9 }, source: 'Division of the Mongol Empire', summary: 'The successor khanates coexist after periods of civil war, turning the high-water map into a fragmented Eurasian system.' },
    { id: 'red-turbans', year: 1351, title: 'Red Turban rebellions', type: 'war', location: { lat: 33.6, lon: 114.6 }, source: 'Red Turban Rebellions', summary: 'Large-scale rebellions undermine Yuan control across China.' },
    { id: 'yuan-1368', year: 1368, title: 'Yuan retreats from China', type: 'decline', location: { lat: 39.904, lon: 116.407 }, source: 'Yuan dynasty', summary: 'Ming forces take Dadu/Khanbaliq and the Yuan court retreats north, closing the imperial China phase of the Mongol story.' },
  ]
  for (const event of additions) if (!events.some((item) => item.id === event.id)) events.push(event)
  events.sort((left, right) => left.year - right.year)

  const snapshots = mongol.snapshots as EmpireSnapshot[]
  const additionsByYear: EmpireSnapshot[] = [
    {
      year: 1304,
      label: 'Khanate fragmentation',
      extent: khanateFragments,
      note: 'The transcontinental empire reads as competing successor khanates rather than a single command geography.',
      claim: 'This frame splits the high-water envelope into broad khanate zones to show political fragmentation, not exact administrative borders.',
      change: 'After the 1279 high-water frame, the map breaks into discrete successor regions so the timeline shows fragmentation instead of a static peak.',
      geometry: 'Simplified successor-khanate sketch.',
      geometryMethod: 'Hand-drawn fragmentation sketch derived from Mongol succession and khanate division sources.',
      geometrySource: 'Division of the Mongol Empire',
      provenanceLabel: 'fragment sketch',
      sourceQuality: 'schematic',
      uncertainty: 'high',
      confidence: 'medium',
      source: 'Division of the Mongol Empire',
      scale: 285,
      layer: 'administrative',
    },
    {
      year: 1368,
      label: 'Yuan retreat',
      extent: yuanSteppeRetreat,
      note: 'Ming victory in China pushes the Yuan court north, leaving a steppe-centred Northern Yuan continuity.',
      claim: 'This endpoint narrows the map to a northern retreat frame rather than treating the 1279 empire as still intact.',
      change: 'The map contracts from khanate-scale fragments to a steppe/Yuan retreat frame, making the 1368 endpoint visible in the same motion sequence.',
      geometry: 'Simplified Northern Yuan retreat sketch.',
      geometryMethod: 'Hand-drawn contraction sketch keyed to the Yuan retreat from Dadu/Khanbaliq.',
      geometrySource: 'Yuan dynasty',
      provenanceLabel: 'retreat sketch',
      sourceQuality: 'schematic',
      uncertainty: 'high',
      confidence: 'medium',
      source: 'Yuan dynasty',
      scale: 390,
      layer: 'administrative',
    },
  ]

  for (const addition of additionsByYear) {
    if (!snapshots.some((snapshot) => snapshot.year === addition.year && snapshot.label === addition.label)) snapshots.push(addition)
  }
  snapshots.sort((left, right) => left.year - right.year)
}
