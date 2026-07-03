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

const easternEmpire476 = feature([
  [[18, 45], [31, 45], [42, 40], [43, 32], [35, 28], [25, 31], [19, 36], [18, 45]],
])

const postFourthCrusadeFragments = feature([
  box(26, 38, 31, 42),
  box(36, 39, 41, 42),
  box(20, 37, 24, 40),
])

const constantinopleRemnant = feature([
  box(28.4, 40.75, 29.35, 41.25),
])

sourceCatalog['Byzantine Empire'] = {
  title: 'Byzantine Empire',
  url: 'https://en.wikipedia.org/wiki/Byzantine_Empire',
  kind: 'reference',
  note: 'Eastern Roman / Byzantine continuity and contraction context after the western imperial collapse.',
}

sourceCatalog['Deposition of Romulus Augustulus'] = {
  title: 'Deposition of Romulus Augustulus',
  url: 'https://en.wikipedia.org/wiki/Deposition_of_Romulus_Augustulus',
  kind: 'event chronology',
  note: '476 western imperial endpoint marker.',
}

sourceCatalog['Fourth Crusade'] = {
  title: 'Fourth Crusade',
  url: 'https://en.wikipedia.org/wiki/Fourth_Crusade',
  kind: 'event chronology',
  note: '1204 sack and fragmentation marker for late Byzantine territorial collapse.',
}

const roman = (empires as readonly Empire[]).find((empire) => empire.id === 'roman')

if (roman) {
  const sourceList = roman.sources as string[]
  for (const source of ['Byzantine Empire', 'Deposition of Romulus Augustulus', 'Fourth Crusade', 'Fall of Constantinople']) {
    if (!sourceList.includes(source)) sourceList.push(source)
  }

  const events = roman.events as HistoricalEvent[]
  const additions: HistoricalEvent[] = [
    { id: 'romulus-476', year: 476, title: 'Western emperor deposed', type: 'decline', location: { lat: 44.49, lon: 11.34 }, source: 'Deposition of Romulus Augustulus', summary: 'Odoacer deposes Romulus Augustulus; the western imperial court disappears while eastern Roman rule continues from Constantinople.' },
    { id: 'fourth-crusade-1204', year: 1204, title: 'Fourth Crusade sacks Constantinople', type: 'war', location: { lat: 41.008, lon: 28.978 }, source: 'Fourth Crusade', summary: 'Crusader capture of Constantinople shatters Byzantine territorial continuity and creates successor fragments.' },
    { id: 'constantinople-1453-roman', year: 1453, title: 'Constantinople falls', type: 'battle', location: { lat: 41.008, lon: 28.978 }, source: 'Fall of Constantinople', summary: 'Ottoman conquest ends the remaining Byzantine imperial state and closes the Roman timeline in the east.' },
  ]
  for (const event of additions) if (!events.some((item) => item.id === event.id)) events.push(event)
  events.sort((left, right) => left.year - right.year)

  const snapshots = roman.snapshots as EmpireSnapshot[]
  const additionsByYear: EmpireSnapshot[] = [
    {
      year: 476,
      label: 'Eastern empire survives',
      extent: easternEmpire476,
      note: 'The western court has collapsed, but the eastern Roman state remains centred on Constantinople.',
      claim: 'This frame removes the western administrative sphere and follows the surviving eastern imperial state.',
      change: 'After 395, the map contracts to the eastern empire, making the 476 western collapse visible without implying Rome as a whole ended at that moment.',
      geometry: 'Simplified eastern Roman administrative envelope after western collapse.',
      geometryMethod: 'Hand-drawn administrative sketch derived from Byzantine/Roman chronology sources.',
      geometrySource: 'Byzantine Empire',
      provenanceLabel: 'admin sketch',
      sourceQuality: 'schematic',
      uncertainty: 'medium',
      confidence: 'medium',
      source: 'Deposition of Romulus Augustulus',
      scale: 395,
      layer: 'administrative',
    },
    {
      year: 1204,
      label: 'Crusader fragmentation',
      extent: postFourthCrusadeFragments,
      note: 'The Fourth Crusade breaks Byzantine control into successor fragments and Latin occupation zones.',
      claim: 'This is a fragmentation frame, not a complete successor-state atlas.',
      change: 'The eastern imperial fill breaks into smaller fragments around the Aegean and Anatolia to show how far the post-1204 order reduced Constantinople-centred authority.',
      geometry: 'Simplified late Byzantine/successor-fragment sketch.',
      geometryMethod: 'Hand-drawn fragmentation sketch keyed to the Fourth Crusade marker.',
      geometrySource: 'Fourth Crusade',
      provenanceLabel: 'fragment sketch',
      sourceQuality: 'schematic',
      uncertainty: 'high',
      confidence: 'low',
      source: 'Fourth Crusade',
      scale: 520,
      layer: 'administrative',
    },
    {
      year: 1453,
      label: 'Constantinople falls',
      extent: constantinopleRemnant,
      note: 'By 1453 the surviving imperial geography has narrowed to Constantinople before Ottoman conquest.',
      claim: 'The endpoint is shown as a tiny Constantinople remnant so the Roman timeline has a clear eastern close.',
      change: 'The map contracts from fragmentary eastern Roman zones to the city-scale endpoint, closing the sequence at the Ottoman capture of Constantinople.',
      geometry: 'City-scale schematic remnant around Constantinople.',
      geometryMethod: 'Hand-drawn endpoint marker derived from the Fall of Constantinople chronology.',
      geometrySource: 'Fall of Constantinople',
      provenanceLabel: 'city remnant sketch',
      sourceQuality: 'schematic',
      uncertainty: 'high',
      confidence: 'medium',
      source: 'Fall of Constantinople',
      scale: 700,
      layer: 'administrative',
    },
  ]

  for (const addition of additionsByYear) {
    if (!snapshots.some((snapshot) => snapshot.year === addition.year && snapshot.label === addition.label)) snapshots.push(addition)
  }
  snapshots.sort((left, right) => left.year - right.year)
}
