import type { Empire } from '../types/history'

type Ring = readonly [number, number][]

function polygon(points: Ring): GeoJSON.Polygon {
  const first = points[0]
  const last = points[points.length - 1]
  const closed = first[0] === last[0] && first[1] === last[1] ? points : [...points, first]
  return { type: 'Polygon', coordinates: [closed.map(([lon, lat]) => [lon, lat])] }
}

function multi(polygons: readonly GeoJSON.Polygon[]): GeoJSON.Feature<GeoJSON.MultiPolygon> {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiPolygon', coordinates: polygons.map((item) => item.coordinates) },
  }
}

const romanCore = polygon([
  [-7, 43], [0, 50], [12, 48], [20, 45], [25, 40], [25, 34], [18, 31], [8, 32], [0, 35], [-6, 37], [-7, 43],
])
const romanTrajan = polygon([
  [-8, 55], [2, 56], [15, 53], [29, 47], [42, 42], [47, 36], [43, 30], [34, 29], [25, 31], [15, 33], [5, 33], [-5, 31], [-9, 36], [-7, 45], [-8, 55],
])
const romanLateWest = polygon([[-8, 51], [5, 51], [14, 47], [18, 40], [14, 34], [4, 35], [-5, 37], [-8, 43], [-8, 51]])
const romanLateEast = polygon([[18, 45], [31, 45], [42, 40], [43, 32], [35, 28], [25, 31], [19, 36], [18, 45]])

const mongolSteppe = polygon([[88, 50], [96, 55], [112, 54], [121, 49], [116, 43], [101, 42], [90, 45], [88, 50]])
const mongol1227 = polygon([[48, 43], [60, 51], [85, 55], [111, 54], [122, 46], [113, 34], [91, 32], [68, 34], [52, 37], [48, 43]])
const mongolPeak = polygon([[25, 49], [45, 55], [73, 58], [104, 56], [126, 49], [130, 37], [119, 24], [94, 20], [69, 25], [45, 31], [29, 39], [25, 49]])

const britishAtlantic = multi([
  polygon([[-82, 45], [-72, 49], [-58, 45], [-61, 35], [-75, 31], [-84, 36], [-82, 45]]),
  polygon([[-9, 58], [1, 59], [2, 50], [-7, 49], [-9, 58]]),
  polygon([[72, 23], [89, 25], [91, 9], [75, 8], [72, 23]]),
])
const britishVictorian = multi([
  polygon([[-132, 58], [-108, 70], [-75, 65], [-54, 50], [-72, 30], [-125, 34], [-132, 58]]),
  polygon([[67, 35], [91, 34], [96, 20], [86, 7], [72, 8], [67, 22], [67, 35]]),
  polygon([[112, -10], [154, -13], [151, -42], [119, -45], [112, -27], [112, -10]]),
  polygon([[16, -23], [34, -25], [31, -35], [18, -35], [16, -23]]),
])
const britishPeak = multi([
  polygon([[-140, 62], [-112, 72], [-66, 68], [-50, 49], [-65, 24], [-128, 29], [-140, 62]]),
  polygon([[-10, 59], [2, 58], [1, 50], [-8, 49], [-10, 59]]),
  polygon([[-18, 32], [10, 35], [36, 24], [50, 5], [43, -31], [20, -35], [5, 5], [-18, 32]]),
  polygon([[60, 34], [96, 34], [105, 18], [91, 6], [68, 8], [60, 24], [60, 34]]),
  polygon([[110, -10], [178, -14], [173, -45], [118, -46], [110, -28], [110, -10]]),
])

const ottoman1453 = polygon([[19, 45], [29, 46], [41, 41], [42, 36], [35, 35], [27, 37], [20, 40], [19, 45]])
const ottoman1566 = polygon([[14, 47], [24, 49], [36, 45], [48, 38], [47, 31], [40, 26], [31, 16], [24, 22], [12, 31], [18, 40], [14, 47]])
const ottoman1914 = polygon([[26, 41], [39, 42], [48, 37], [47, 31], [39, 30], [32, 33], [27, 36], [26, 41]])

const abbasid750 = polygon([[-7, 34], [15, 37], [38, 41], [64, 39], [76, 30], [70, 18], [45, 15], [18, 21], [-5, 25], [-7, 34]])
const abbasid850 = polygon([[-9, 35], [18, 41], [47, 42], [78, 36], [83, 25], [65, 16], [35, 13], [4, 19], [-10, 28], [-9, 35]])
const abbasid1100 = polygon([[34, 38], [48, 40], [60, 35], [58, 28], [46, 25], [36, 29], [34, 38]])

export const empires: readonly Empire[] = [
  {
    id: 'roman', name: 'Roman Empire', colour: '#b77946', period: '27 BCE–476 CE / 1453 CE in the east',
    headline: 'Rome’s political geography shifted from a Mediterranean republic into an imperial system, then fractured into western and eastern centres.',
    caveat: 'Territory shapes are approximate interpretive regions. They are drawn to support exploration, not legal boundary precision.',
    sources: ['Roman Empire', 'Punic Wars', 'Battle of Actium', 'Battle of Adrianople', 'Fall of the Western Roman Empire'],
    locations: [
      { name: 'Rome', lat: 41.9028, lon: 12.4964, note: 'Imperial centre and symbolic capital.' },
      { name: 'Constantinople', lat: 41.0082, lon: 28.9784, note: 'Eastern capital from the fourth century.' },
      { name: 'Carthage', lat: 36.8065, lon: 10.1815, note: 'Key North African city after the Punic Wars.' },
    ],
    events: [
      { id: 'zama', year: -202, title: 'Battle of Zama', type: 'battle', summary: 'Roman victory over Hannibal ends the Second Punic War and reshapes western Mediterranean power.', location: { lat: 36.19, lon: 9.22 } },
      { id: 'actium', year: -31, title: 'Battle of Actium', type: 'battle', summary: 'Octavian defeats Antony and Cleopatra, clearing the path to imperial rule.', location: { lat: 38.95, lon: 20.75 } },
      { id: 'augustus', year: -27, title: 'Augustus consolidates power', type: 'capital', summary: 'The Principate begins after decades of civil war.', location: { lat: 41.9028, lon: 12.4964 } },
      { id: 'teutoburg', year: 9, title: 'Teutoburg Forest', type: 'battle', summary: 'A major Roman defeat helps define the Rhine as a long-term frontier.', location: { lat: 52.4, lon: 8.1 } },
      { id: 'trajan', year: 117, title: 'Maximum territorial extent', type: 'expansion', summary: 'Under Trajan, Rome reaches its widest conventional extent.', location: { lat: 41.9028, lon: 12.4964 } },
      { id: 'adrianople', year: 378, title: 'Battle of Adrianople', type: 'battle', summary: 'Gothic forces defeat the eastern field army, exposing deep frontier stress.', location: { lat: 41.68, lon: 26.56 } },
      { id: 'rome-410', year: 410, title: 'Sack of Rome', type: 'decline', summary: 'Visigothic forces sack Rome, a psychological shock to the western empire.', location: { lat: 41.9028, lon: 12.4964 } },
    ],
    snapshots: [
      { year: -27, label: 'Augustan settlement', extent: multi([romanCore]), note: 'The imperial system consolidates around the Mediterranean core.' },
      { year: 117, label: 'Trajanic high point', extent: multi([romanTrajan]), note: 'Rome reaches its largest conventional territorial span.' },
      { year: 395, label: 'Divided administration', extent: multi([romanLateWest, romanLateEast]), note: 'Western and eastern imperial centres govern increasingly separate systems.' },
    ],
  },
  {
    id: 'mongol', name: 'Mongol Empire', colour: '#6f8f59', period: '1206–1368',
    headline: 'Mongol expansion connected steppe warfare, siegecraft, tributary politics, and long-distance exchange across Eurasia.',
    caveat: 'Successor khanates and shifting spheres of control are simplified into broad overlays.',
    sources: ['Mongol Empire', 'Mongol invasions and conquests', 'Battle of the Kalka River', 'Siege of Baghdad'],
    locations: [
      { name: 'Karakorum', lat: 47.1975, lon: 102.8238, note: 'Imperial capital under Ögedei Khan.' },
      { name: 'Samarkand', lat: 39.6542, lon: 66.9597, note: 'Key Silk Road city under Mongol rule.' },
      { name: 'Khanbaliq', lat: 39.9042, lon: 116.4074, note: 'Yuan capital at modern Beijing.' },
    ],
    events: [
      { id: 'genghis', year: 1206, title: 'Genghis Khan proclaimed', type: 'capital', summary: 'Temüjin unifies Mongol tribes and begins imperial expansion.', location: { lat: 47.2, lon: 102.8 } },
      { id: 'khwarezm', year: 1219, title: 'Khwarezmian campaign', type: 'war', summary: 'Mongol armies push into Central Asia and Persia.', location: { lat: 41.55, lon: 60.63 } },
      { id: 'kalka', year: 1223, title: 'Battle of the Kalka River', type: 'battle', summary: 'Mongol forces defeat a coalition of Rus’ principalities and Cumans.', location: { lat: 47.3, lon: 37.6 } },
      { id: 'baghdad', year: 1258, title: 'Siege of Baghdad', type: 'battle', summary: 'Hulagu’s forces sack Baghdad, ending Abbasid rule there.', location: { lat: 33.3152, lon: 44.3661 } },
      { id: 'yamen', year: 1279, title: 'Battle of Yamen', type: 'battle', summary: 'Yuan victory completes the conquest of the Southern Song.', location: { lat: 21.82, lon: 112.77 } },
    ],
    snapshots: [
      { year: 1206, label: 'Steppe unification', extent: multi([mongolSteppe]), note: 'The Mongolian heartland is unified under Genghis Khan.' },
      { year: 1227, label: 'Western campaigns', extent: multi([mongol1227]), note: 'Conquests extend across northern China and Central Asia.' },
      { year: 1279, label: 'Eurasian system', extent: multi([mongolPeak]), note: 'The Mongol world reaches across much of Eurasia through empire and khanates.' },
    ],
  },
  {
    id: 'british', name: 'British Empire', colour: '#536f8f', period: 'c.1583–1997',
    headline: 'British power expanded through colonies, naval logistics, chartered companies, settler states, and strategic chokepoints.',
    caveat: 'The map represents possessions and spheres in stylised clusters; the real empire mixed colonies, mandates, dominions, and protectorates.',
    sources: ['British Empire', 'Seven Years’ War', 'Battle of Plassey', 'American Revolutionary War', 'Battle of Waterloo'],
    locations: [
      { name: 'London', lat: 51.5072, lon: -0.1276, note: 'Imperial metropole and financial centre.' },
      { name: 'Calcutta', lat: 22.5726, lon: 88.3639, note: 'Capital of British India until 1911.' },
      { name: 'Cape Town', lat: -33.9249, lon: 18.4241, note: 'Strategic port on the Cape route.' },
    ],
    events: [
      { id: 'eic', year: 1600, title: 'East India Company chartered', type: 'expansion', summary: 'Commercial empire-building accelerates in Asia.', location: { lat: 51.5072, lon: -0.1276 } },
      { id: 'plessy', year: 1757, title: 'Battle of Plassey', type: 'battle', summary: 'Company victory helps establish British power in Bengal.', location: { lat: 23.8, lon: 88.25 } },
      { id: 'quebec', year: 1759, title: 'Battle of Quebec', type: 'battle', summary: 'A decisive British victory in North America during the Seven Years’ War.', location: { lat: 46.81, lon: -71.21 } },
      { id: 'yorktown', year: 1781, title: 'Siege of Yorktown', type: 'battle', summary: 'British defeat helps secure American independence.', location: { lat: 37.24, lon: -76.51 } },
      { id: 'waterloo', year: 1815, title: 'Battle of Waterloo', type: 'battle', summary: 'Napoleon’s defeat reinforces Britain’s nineteenth-century strategic position.', location: { lat: 50.68, lon: 4.41 } },
      { id: 'peak', year: 1922, title: 'Territorial peak', type: 'expansion', summary: 'Post-WWI mandates bring the empire close to its maximum territorial extent.', location: { lat: 51.5072, lon: -0.1276 } },
    ],
    snapshots: [
      { year: 1700, label: 'Atlantic footholds', extent: britishAtlantic, note: 'Early colonies, ports, and trading positions shape a maritime network.' },
      { year: 1858, label: 'Company to Crown', extent: britishVictorian, note: 'After the Indian Rebellion, the British state takes direct rule in India.' },
      { year: 1922, label: 'Imperial peak', extent: britishPeak, note: 'The empire reaches its largest post-war territorial configuration.' },
    ],
  },
  {
    id: 'ottoman', name: 'Ottoman Empire', colour: '#8f5a55', period: '1299–1922',
    headline: 'Ottoman frontiers moved through Balkan, Anatolian, Arab, and Mediterranean theatres over six centuries.',
    caveat: 'Vassalage, suzerainty, and contested frontiers are simplified into interpretable zones.',
    sources: ['Ottoman Empire', 'Fall of Constantinople', 'Battle of Mohács', 'Siege of Vienna'],
    locations: [
      { name: 'Istanbul', lat: 41.0082, lon: 28.9784, note: 'Capital after the conquest of Constantinople in 1453.' },
      { name: 'Cairo', lat: 30.0444, lon: 31.2357, note: 'Major provincial centre after 1517.' },
      { name: 'Vienna', lat: 48.2082, lon: 16.3738, note: 'Symbolic frontier city during Ottoman-Habsburg wars.' },
    ],
    events: [
      { id: 'constantinople', year: 1453, title: 'Fall of Constantinople', type: 'battle', summary: 'Ottoman forces capture the Byzantine capital.', location: { lat: 41.0082, lon: 28.9784 } },
      { id: 'chaldiran', year: 1514, title: 'Battle of Chaldiran', type: 'battle', summary: 'Ottoman victory over Safavid Persia helps define the eastern frontier.', location: { lat: 39.06, lon: 44.42 } },
      { id: 'mohacs', year: 1526, title: 'Battle of Mohács', type: 'battle', summary: 'Ottoman victory transforms power in Hungary.', location: { lat: 45.99, lon: 18.68 } },
      { id: 'vienna', year: 1683, title: 'Siege of Vienna', type: 'battle', summary: 'The failed siege marks a turning point in Ottoman-Habsburg conflict.', location: { lat: 48.2082, lon: 16.3738 } },
      { id: 'balkan-wars', year: 1912, title: 'Balkan Wars', type: 'decline', summary: 'Ottoman territory in Europe contracts sharply.', location: { lat: 42.7, lon: 23.3 } },
    ],
    snapshots: [
      { year: 1453, label: 'Bosphorus empire', extent: multi([ottoman1453]), note: 'Anatolia and the Balkans are tied through the conquest of Constantinople.' },
      { year: 1566, label: 'Classical high point', extent: multi([ottoman1566]), note: 'Suleiman’s reign frames a wide Ottoman reach across three continents.' },
      { year: 1914, label: 'Late empire', extent: multi([ottoman1914]), note: 'The empire is reduced but still controls Anatolia and Arab provinces.' },
    ],
  },
  {
    id: 'abbasid', name: 'Abbasid Caliphate', colour: '#7d7565', period: '750–1258',
    headline: 'Abbasid authority centred on Baghdad but operated through provincial elites, trade networks, and changing dynastic power.',
    caveat: 'The map distinguishes broad authority from cultural influence only approximately.',
    sources: ['Abbasid Caliphate', 'Abbasid Revolution', 'Islamic Golden Age', 'Siege of Baghdad'],
    locations: [
      { name: 'Baghdad', lat: 33.3152, lon: 44.3661, note: 'Founded in 762 and became the Abbasid capital.' },
      { name: 'Damascus', lat: 33.5138, lon: 36.2765, note: 'Former Umayyad capital and early Islamic urban centre.' },
      { name: 'Samarra', lat: 34.2, lon: 43.87, note: 'Ninth-century Abbasid capital for several decades.' },
    ],
    events: [
      { id: 'revolution', year: 750, title: 'Abbasid Revolution', type: 'war', summary: 'The Abbasids overthrow the Umayyads and claim the caliphate.', location: { lat: 34.64, lon: 43.55 } },
      { id: 'baghdad-founded', year: 762, title: 'Baghdad founded', type: 'capital', summary: 'The round city becomes a centre of governance and learning.', location: { lat: 33.3152, lon: 44.3661 } },
      { id: 'talas', year: 751, title: 'Battle of Talas', type: 'battle', summary: 'Abbasid and Tang forces clash near the limits of Central Asian influence.', location: { lat: 42.52, lon: 72.24 } },
      { id: 'anarchy', year: 861, title: 'Anarchy at Samarra', type: 'decline', summary: 'Military and court politics weaken caliphal authority.', location: { lat: 34.2, lon: 43.87 } },
      { id: 'baghdad-1258', year: 1258, title: 'Sack of Baghdad', type: 'battle', summary: 'Mongol forces end the Abbasid caliphate in Baghdad.', location: { lat: 33.3152, lon: 44.3661 } },
    ],
    snapshots: [
      { year: 750, label: 'Revolutionary transfer', extent: multi([abbasid750]), note: 'Abbasid forces inherit much of the Umayyad imperial geography.' },
      { year: 850, label: 'Baghdad-centred world', extent: multi([abbasid850]), note: 'Caliphal culture and administration radiate from Iraq into a wide imperial zone.' },
      { year: 1100, label: 'Fragmented authority', extent: multi([abbasid1100]), note: 'Regional dynasties narrow direct caliphal political control.' },
    ],
  },
]
