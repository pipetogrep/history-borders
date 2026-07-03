import { empires } from './empires.ts'
import { sourceCatalog } from './sources.ts'
import type { Empire, EmpireSnapshot, HistoricalEvent } from '../types/history.ts'

function multiPolygon(points: readonly (readonly [number, number])[]): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  const first = points[0]
  const last = points[points.length - 1]
  const closed = first[0] === last[0] && first[1] === last[1] ? points : [...points, first]
  return { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[closed.map(([lon, lat]) => [lon, lat])]] } }
}

sourceCatalog['Armistice of Mudros'] = {
  title: 'Armistice of Mudros',
  url: 'https://en.wikipedia.org/wiki/Armistice_of_Mudros',
  kind: 'treaty',
  note: '1918 armistice marker for occupation, partition pressure and imperial collapse.',
}

sourceCatalog['Treaty of Sèvres'] = {
  title: 'Treaty of Sèvres',
  url: 'https://en.wikipedia.org/wiki/Treaty_of_S%C3%A8vres',
  kind: 'treaty',
  note: 'Unratified postwar partition proposal; useful as a cautionary non-final border frame.',
}

sourceCatalog['Turkish War of Independence'] = {
  title: 'Turkish War of Independence',
  url: 'https://en.wikipedia.org/wiki/Turkish_War_of_Independence',
  kind: 'event chronology',
  note: 'Conflict and negotiation context between Ottoman defeat and Lausanne.',
}

sourceCatalog['Treaty of Lausanne'] = {
  title: 'Treaty of Lausanne',
  url: 'https://en.wikipedia.org/wiki/Treaty_of_Lausanne',
  kind: 'treaty',
  note: '1923 recognised settlement replacing Sèvres and framing modern Turkey.',
}

const ottoman = (empires as readonly Empire[]).find((empire) => empire.id === 'ottoman')

if (ottoman) {
  const sourceList = ottoman.sources as string[]
  for (const source of ['Armistice of Mudros', 'Treaty of Sèvres', 'Turkish War of Independence', 'Treaty of Lausanne']) {
    if (!sourceList.includes(source)) sourceList.push(source)
  }

  const events = ottoman.events as HistoricalEvent[]
  const additions: HistoricalEvent[] = [
    { id: 'mudros-1918', year: 1918, title: 'Armistice of Mudros', type: 'treaty', location: { lat: 39.83, lon: 26.07 }, source: 'Armistice of Mudros', summary: 'The Ottoman defeat in World War I opens the empire to Allied occupation and partition pressure.' },
    { id: 'sevres-1920', year: 1920, title: 'Treaty of Sèvres', type: 'treaty', location: { lat: 48.82, lon: 2.21 }, source: 'Treaty of Sèvres', summary: 'A proposed partition settlement shows how far the postwar order might have reduced Ottoman sovereignty, but it is not the final recognised frame.' },
    { id: 'war-independence', year: 1921, title: 'Turkish War of Independence', type: 'war', location: { lat: 39.92, lon: 32.85 }, source: 'Turkish War of Independence', summary: 'The nationalist movement centred on Ankara contests occupation and the Sèvres settlement.' },
    { id: 'lausanne-1923', year: 1923, title: 'Treaty of Lausanne', type: 'treaty', location: { lat: 46.52, lon: 6.63 }, source: 'Treaty of Lausanne', summary: 'Lausanne replaces Sèvres and recognises the sovereignty and borders of the new Turkish state.' },
  ]
  for (const event of additions) if (!events.some((item) => item.id === event.id)) events.push(event)
  events.sort((left, right) => left.year - right.year)

  const snapshots = ottoman.snapshots as EmpireSnapshot[]
  if (!snapshots.some((snapshot) => snapshot.year === 1923 && snapshot.label === 'Post-Ottoman republic')) {
    snapshots.push({
      year: 1923,
      label: 'Post-Ottoman republic',
      extent: multiPolygon([[26, 42], [45, 42], [45, 36], [36, 35], [29, 36], [26, 39], [26, 42]]),
      countryNames: ['Turkey'],
      note: 'Lausanne replaces the imperial frame with the recognised borders of the Turkish republic.',
      claim: 'The post-Ottoman settlement narrows the map from a multi-continent empire to a recognised Anatolian and eastern Thracian state.',
      change: 'The overlay switches from late imperial provinces to the recognised modern Turkish state, making imperial collapse and state formation visible as separate frames.',
      geometry: 'Recognised modern state outline where available.',
      geometryMethod: 'Natural Earth country polygon linked by country name with simplified fallback.',
      geometrySource: 'Natural Earth countries 110m',
      provenanceLabel: 'Natural Earth',
      sourceQuality: 'atlas-derived',
      uncertainty: 'low',
      confidence: 'high',
      source: 'Treaty of Lausanne',
      scale: 520,
      layer: 'recognised',
    })
  }
  snapshots.sort((left, right) => left.year - right.year)
}
