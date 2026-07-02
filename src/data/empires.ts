import type { Empire } from '../types/history'

function box(west: number, south: number, east: number, north: number): GeoJSON.Polygon {
  return {
    type: 'Polygon',
    coordinates: [[
      [west, south],
      [west, north],
      [east, north],
      [east, south],
      [west, south],
    ]],
  }
}

function multi(polygons: readonly GeoJSON.Polygon[]): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: polygons.map((polygon) => polygon.coordinates),
    },
  }
}

export const empires: readonly Empire[] = [
  {
    id: 'roman',
    name: 'Roman Empire',
    colour: '#f97316',
    period: '27 BCE–476 CE / 1453 CE in the east',
    headline: 'A Mediterranean power system that expanded from Italy into Europe, North Africa, and the Near East.',
    caveat: 'Borders are simplified to show broad influence zones around selected dates, not province-level GIS boundaries.',
    sources: ['Wikipedia: Roman Empire', 'Wikipedia: Pax Romana', 'Wikipedia: Crisis of the Third Century'],
    locations: [
      { name: 'Rome', lat: 41.9028, lon: 12.4964, note: 'Imperial centre and symbolic capital.' },
      { name: 'Carthage', lat: 36.8065, lon: 10.1815, note: 'Strategic North African city after the Punic Wars.' },
      { name: 'Constantinople', lat: 41.0082, lon: 28.9784, note: 'Eastern capital from the fourth century.' },
    ],
    events: [
      { year: -27, title: 'Augustus consolidates power', type: 'capital', summary: 'The Principate begins after decades of civil war.', location: { lat: 41.9028, lon: 12.4964 } },
      { year: 117, title: 'Maximum territorial extent', type: 'expansion', summary: 'Under Trajan, Roman control reaches its widest conventional extent.' },
      { year: 376, title: 'Gothic migrations', type: 'war', summary: 'Pressure on the Danube frontier accelerates imperial instability.' },
    ],
    snapshots: [
      { year: -27, label: 'Augustan core', extent: multi([box(-8, 35, 31, 49), box(7, 30, 31, 36)]), note: 'Mediterranean core after the Republic becomes the Principate.' },
      { year: 117, label: 'Trajanic high point', extent: multi([box(-9, 31, 42, 56), box(-6, 24, 36, 37), box(34, 29, 51, 42)]), note: 'Simplified view of Roman territory at/near its maximum extent.' },
      { year: 395, label: 'Divided empire', extent: multi([box(-8, 32, 19, 52), box(19, 28, 43, 47)]), note: 'West and East increasingly governed as separate imperial systems.' },
    ],
  },
  {
    id: 'mongol',
    name: 'Mongol Empire',
    colour: '#22c55e',
    period: '1206–1368',
    headline: 'The largest contiguous land empire, expanding from the Mongolian steppe across Eurasia.',
    caveat: 'The overlay merges rapidly changing conquests and successor khanates into broad snapshots.',
    sources: ['Wikipedia: Mongol Empire', 'Wikipedia: Mongol invasions and conquests'],
    locations: [
      { name: 'Karakorum', lat: 47.1975, lon: 102.8238, note: 'Imperial capital under Ögedei Khan.' },
      { name: 'Samarkand', lat: 39.6542, lon: 66.9597, note: 'Key Silk Road city under Mongol rule.' },
      { name: 'Khanbaliq', lat: 39.9042, lon: 116.4074, note: 'Yuan capital at modern Beijing.' },
    ],
    events: [
      { year: 1206, title: 'Temüjin becomes Genghis Khan', type: 'capital', summary: 'Mongol tribes unify and begin outward expansion.' },
      { year: 1219, title: 'Khwarezmian campaign', type: 'war', summary: 'The empire breaks into Central Asia and Persia.' },
      { year: 1279, title: 'Yuan conquest of Song China', type: 'expansion', summary: 'Kublai Khan completes conquest of the Southern Song.' },
    ],
    snapshots: [
      { year: 1206, label: 'Steppe unification', extent: multi([box(87, 42, 122, 55)]), note: 'Mongolian heartland at imperial formation.' },
      { year: 1227, label: 'Genghis Khan’s conquests', extent: multi([box(50, 30, 122, 55)]), note: 'Expansion across Central Asia and northern China.' },
      { year: 1279, label: 'Eurasian high point', extent: multi([box(25, 30, 132, 58), box(70, 20, 122, 42)]), note: 'Broad map of Mongol/Yuan and related khanate reach.' },
    ],
  },
  {
    id: 'british',
    name: 'British Empire',
    colour: '#38bdf8',
    period: 'c.1583–1997',
    headline: 'A maritime empire spanning colonies, protectorates, trade routes, and settler states.',
    caveat: 'Global possessions are shown as stylised regional clusters rather than exact colonial boundaries.',
    sources: ['Wikipedia: British Empire', 'Wikipedia: Territorial evolution of the British Empire'],
    locations: [
      { name: 'London', lat: 51.5072, lon: -0.1276, note: 'Imperial metropole and financial centre.' },
      { name: 'Calcutta', lat: 22.5726, lon: 88.3639, note: 'Capital of British India until 1911.' },
      { name: 'Cape Town', lat: -33.9249, lon: 18.4241, note: 'Strategic port on the Cape route.' },
    ],
    events: [
      { year: 1600, title: 'East India Company chartered', type: 'expansion', summary: 'Commercial empire-building accelerates in Asia.' },
      { year: 1763, title: 'Seven Years’ War settlement', type: 'war', summary: 'Britain gains major territories from France.' },
      { year: 1922, title: 'Largest territorial extent', type: 'expansion', summary: 'The empire covers roughly a quarter of the world’s land area.' },
    ],
    snapshots: [
      { year: 1700, label: 'Atlantic footholds', extent: multi([box(-85, 25, -55, 50), box(-12, 49, 2, 59), box(72, 8, 91, 25)]), note: 'Early colonies and trading positions.' },
      { year: 1858, label: 'Victorian empire', extent: multi([box(-130, 25, -55, 60), box(68, 6, 92, 35), box(110, -45, 155, -10), box(16, -35, 34, -22)]), note: 'India, Canada, Australia, and strategic maritime nodes.' },
      { year: 1922, label: 'Imperial peak', extent: multi([box(-140, 20, -50, 70), box(-10, 49, 2, 60), box(-20, -35, 52, 35), box(60, 5, 105, 35), box(110, -46, 178, -10)]), note: 'Simplified view of the empire near its post-WWI territorial maximum.' },
    ],
  },
  {
    id: 'ottoman',
    name: 'Ottoman Empire',
    colour: '#e11d48',
    period: '1299–1922',
    headline: 'An empire connecting Anatolia, the Balkans, the Levant, North Africa, and the Black Sea world.',
    caveat: 'Snapshots simplify vassalage, suzerainty, and frontier zones.',
    sources: ['Wikipedia: Ottoman Empire', 'Wikipedia: Ottoman wars in Europe'],
    locations: [
      { name: 'Istanbul', lat: 41.0082, lon: 28.9784, note: 'Capital after the conquest of Constantinople in 1453.' },
      { name: 'Cairo', lat: 30.0444, lon: 31.2357, note: 'Major provincial centre after 1517.' },
      { name: 'Vienna', lat: 48.2082, lon: 16.3738, note: 'Symbolic frontier city during Ottoman-Habsburg wars.' },
    ],
    events: [
      { year: 1453, title: 'Conquest of Constantinople', type: 'war', summary: 'The Ottomans capture the Byzantine capital.', location: { lat: 41.0082, lon: 28.9784 } },
      { year: 1526, title: 'Battle of Mohács', type: 'war', summary: 'Ottoman power expands into Hungary.' },
      { year: 1683, title: 'Second siege of Vienna', type: 'war', summary: 'A major failed campaign marks a shift in European momentum.' },
    ],
    snapshots: [
      { year: 1453, label: 'Anatolia and Balkans', extent: multi([box(19, 36, 42, 46)]), note: 'Core territory around the conquest of Constantinople.' },
      { year: 1566, label: 'Suleiman’s reach', extent: multi([box(14, 30, 48, 49), box(25, 15, 43, 32), box(10, 28, 35, 38)]), note: 'Broad view near the empire’s classical high point.' },
      { year: 1914, label: 'Late empire', extent: multi([box(26, 30, 48, 42)]), note: 'Reduced territory before the First World War settlement.' },
    ],
  },
  {
    id: 'abbasid',
    name: 'Abbasid Caliphate',
    colour: '#a78bfa',
    period: '750–1258',
    headline: 'A caliphal empire centred on Baghdad, linking the Mediterranean, Mesopotamia, Persia, and beyond.',
    caveat: 'Political authority and cultural influence are compressed into simple spatial overlays.',
    sources: ['Wikipedia: Abbasid Caliphate', 'Wikipedia: Islamic Golden Age'],
    locations: [
      { name: 'Baghdad', lat: 33.3152, lon: 44.3661, note: 'Founded in 762 and became the Abbasid capital.' },
      { name: 'Damascus', lat: 33.5138, lon: 36.2765, note: 'Former Umayyad capital, important in early Islamic history.' },
      { name: 'Cordoba', lat: 37.8882, lon: -4.7794, note: 'A western Islamic power centre outside Abbasid rule.' },
    ],
    events: [
      { year: 750, title: 'Abbasid Revolution', type: 'expansion', summary: 'The Abbasids overthrow the Umayyads and claim the caliphate.' },
      { year: 762, title: 'Baghdad founded', type: 'capital', summary: 'The round city becomes a centre of governance and learning.' },
      { year: 1258, title: 'Mongol sack of Baghdad', type: 'decline', summary: 'The Mongol conquest ends the Abbasid caliphate in Baghdad.' },
    ],
    snapshots: [
      { year: 750, label: 'Revolutionary state', extent: multi([box(30, 15, 75, 42), box(-8, 20, 36, 38)]), note: 'Early takeover of much of the former Umayyad realm.' },
      { year: 850, label: 'Golden Age network', extent: multi([box(-10, 15, 80, 43)]), note: 'A broad cultural and political sphere centred on Baghdad.' },
      { year: 1100, label: 'Fragmented authority', extent: multi([box(35, 25, 60, 40)]), note: 'Caliphal authority narrows amid regional dynasties.' },
    ],
  },
]

export const allYears = Array.from(new Set(empires.flatMap((empire) => empire.snapshots.map((snapshot) => snapshot.year)))).sort((a, b) => a - b)
