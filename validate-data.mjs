import { readFileSync } from 'node:fs'
import { empires } from './src/data/empires.ts'
import { sourceCatalog } from './src/data/sources.ts'
import './src/data/bosniaDepth.ts'
import './src/data/ottomanAftermath.ts'
import './src/data/abbasidFragmentation.ts'
import './src/data/britishDecolonisation.ts'
import './src/data/romanAftermath.ts'
import './src/data/mongolFragmentation.ts'

const world = JSON.parse(readFileSync(new URL('./public/countries-110m.json', import.meta.url), 'utf8'))
const worldCountryNames = new Set(world.objects.countries.geometries.map((geometry) => geometry.properties?.name).filter(Boolean))
const requiredSnapshotFields = ['claim', 'change', 'geometry', 'geometryMethod', 'geometrySource', 'uncertainty', 'confidence', 'source', 'layer']
const allowedLayers = new Set(['recognised', 'control', 'imperial', 'administrative', 'influence'])
const allowedUncertainty = new Set(['low', 'medium', 'high'])
const errors = []
const seenIds = new Set()

for (const empire of empires) {
  if (seenIds.has(empire.id)) errors.push(`Duplicate track id: ${empire.id}`)
  seenIds.add(empire.id)

  for (const source of empire.sources) {
    if (!sourceCatalog[source]) errors.push(`${empire.name}: missing track source "${source}"`)
  }

  for (const event of empire.events) {
    if (!event.source) errors.push(`${empire.name} / ${event.title}: missing event source`)
    if (event.source && !sourceCatalog[event.source]) errors.push(`${empire.name} / ${event.title}: missing event source "${event.source}"`)
    if (!Number.isFinite(event.location.lat) || !Number.isFinite(event.location.lon)) errors.push(`${empire.name} / ${event.title}: invalid event coordinates`)
  }

  for (const snapshot of empire.snapshots) {
    for (const field of requiredSnapshotFields) {
      if (!snapshot[field]) errors.push(`${empire.name} / ${snapshot.label}: missing snapshot ${field}`)
    }
    if (snapshot.source && !sourceCatalog[snapshot.source]) errors.push(`${empire.name} / ${snapshot.label}: missing snapshot source "${snapshot.source}"`)
    if (snapshot.geometrySource && !sourceCatalog[snapshot.geometrySource]) errors.push(`${empire.name} / ${snapshot.label}: missing geometry source "${snapshot.geometrySource}"`)
    if (snapshot.extent.geometry.type !== 'MultiPolygon') errors.push(`${empire.name} / ${snapshot.label}: extent must be MultiPolygon`)
    if (!allowedLayers.has(snapshot.layer)) errors.push(`${empire.name} / ${snapshot.label}: invalid layer "${snapshot.layer}"`)
    if (!allowedUncertainty.has(snapshot.uncertainty)) errors.push(`${empire.name} / ${snapshot.label}: invalid uncertainty "${snapshot.uncertainty}"`)
    for (const countryName of snapshot.countryNames ?? []) {
      if (!worldCountryNames.has(countryName)) errors.push(`${empire.name} / ${snapshot.label}: unknown Natural Earth country "${countryName}"`)
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(JSON.stringify({
  tracks: empires.length,
  snapshots: empires.reduce((sum, empire) => sum + empire.snapshots.length, 0),
  sources: Object.keys(sourceCatalog).length,
  naturalEarthLinkedSnapshots: empires.flatMap((empire) => empire.snapshots).filter((snapshot) => snapshot.countryNames?.length).length,
}, null, 2))
