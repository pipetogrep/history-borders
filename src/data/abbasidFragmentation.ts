import { empires } from './empires.ts'
import { sourceCatalog } from './sources.ts'
import type { Empire, EmpireSnapshot, HistoricalEvent } from '../types/history.ts'

function multiPolygon(points: readonly (readonly [number, number])[]): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  const first = points[0]
  const last = points[points.length - 1]
  const closed = first[0] === last[0] && first[1] === last[1] ? points : [...points, first]
  return { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: [[closed.map(([lon, lat]) => [lon, lat])]] } }
}

sourceCatalog['Buyid dynasty'] = {
  title: 'Buyid dynasty',
  url: 'https://en.wikipedia.org/wiki/Buyid_dynasty',
  kind: 'event chronology',
  note: 'Marker for the tenth-century shift from caliphal rule to emir-controlled Baghdad.',
}

sourceCatalog['Seljuk Empire'] = {
  title: 'Seljuk Empire',
  url: 'https://en.wikipedia.org/wiki/Seljuk_Empire',
  kind: 'reference',
  note: 'Context for Seljuk military-political authority around the Abbasid caliphate.',
}

const abbasid = (empires as readonly Empire[]).find((empire) => empire.id === 'abbasid')

if (abbasid) {
  const sourceList = abbasid.sources as string[]
  for (const source of ['Battle of Talas', 'Anarchy at Samarra', 'Buyid dynasty', 'Seljuk Empire']) {
    if (!sourceList.includes(source)) {
      const siegeIndex = sourceList.indexOf('Siege of Baghdad')
      sourceList.splice(siegeIndex === -1 ? sourceList.length : siegeIndex, 0, source)
    }
  }

  const events = abbasid.events as HistoricalEvent[]
  const additions: HistoricalEvent[] = [
    { id: 'buyid-baghdad', year: 945, title: 'Buyid emirs enter Baghdad', type: 'decline', location: { lat: 33.315, lon: 44.366 }, source: 'Buyid dynasty', summary: 'Buyid rulers take control in Baghdad while Abbasid caliphs retain symbolic religious authority.' },
    { id: 'seljuk-baghdad', year: 1055, title: 'Seljuks enter Baghdad', type: 'war', location: { lat: 33.315, lon: 44.366 }, source: 'Seljuk Empire', summary: 'Seljuk power replaces Buyid dominance, leaving the caliphate politically dependent but still symbolically important.' },
  ]
  for (const event of additions) if (!events.some((item) => item.id === event.id)) events.push(event)
  events.sort((left, right) => left.year - right.year)

  const snapshots = abbasid.snapshots as EmpireSnapshot[]
  if (!snapshots.some((snapshot) => snapshot.year === 1258 && snapshot.label === 'Baghdad falls')) {
    snapshots.push({
      year: 1258,
      label: 'Baghdad falls',
      extent: multiPolygon([[42, 37], [47, 37], [48, 32], [45, 29], [42, 31], [42, 37]]),
      note: 'Mongol forces take Baghdad and end the Abbasid caliphate as a territorial power there.',
      claim: 'By this point the broad caliphal world has already fragmented into successor dynasties and military patrons.',
      change: 'The map contracts from a regional Iraqi core to a small Baghdad-centred remnant, separating cultural memory from effective territorial authority.',
      geometry: 'Schematic Baghdad/Iraqi-core remnant; not a modern state border.',
      geometryMethod: 'Hand-drawn low-confidence remnant envelope tied to the fall of Baghdad marker.',
      geometrySource: 'Siege of Baghdad',
      provenanceLabel: 'schematic remnant',
      sourceQuality: 'schematic',
      uncertainty: 'high',
      confidence: 'low',
      source: 'Siege of Baghdad',
      scale: 620,
      layer: 'administrative',
    })
  }
  snapshots.sort((left, right) => left.year - right.year)
}
