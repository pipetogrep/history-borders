export interface SourceInfo {
  readonly title: string
  readonly url: string
  readonly kind: 'reference' | 'event chronology' | 'battle' | 'treaty' | 'modern assessment'
  readonly note: string
}

export const sourceCatalog: Record<string, SourceInfo> = {
  'Roman Empire': { title: 'Roman Empire', url: 'https://en.wikipedia.org/wiki/Roman_Empire', kind: 'reference', note: 'General chronology and territorial context.' },
  'Punic Wars': { title: 'Punic Wars', url: 'https://en.wikipedia.org/wiki/Punic_Wars', kind: 'event chronology', note: 'Context for Roman expansion in the western Mediterranean.' },
  'Battle of Actium': { title: 'Battle of Actium', url: 'https://en.wikipedia.org/wiki/Battle_of_Actium', kind: 'battle', note: 'Event marker for the transition from civil war to Augustan settlement.' },
  'Battle of Adrianople': { title: 'Battle of Adrianople', url: 'https://en.wikipedia.org/wiki/Battle_of_Adrianople', kind: 'battle', note: 'Event marker for late Roman frontier instability.' },
  'Fall of the Western Roman Empire': { title: 'Fall of the Western Roman Empire', url: 'https://en.wikipedia.org/wiki/Fall_of_the_Western_Roman_Empire', kind: 'event chronology', note: 'Context for western imperial contraction.' },
  'Mongol Empire': { title: 'Mongol Empire', url: 'https://en.wikipedia.org/wiki/Mongol_Empire', kind: 'reference', note: 'General chronology and territorial context.' },
  'Mongol invasions and conquests': { title: 'Mongol invasions and conquests', url: 'https://en.wikipedia.org/wiki/Mongol_invasions_and_conquests', kind: 'event chronology', note: 'Expansion chronology across Eurasia.' },
  'Battle of the Kalka River': { title: 'Battle of the Kalka River', url: 'https://en.wikipedia.org/wiki/Battle_of_the_Kalka_River', kind: 'battle', note: 'Western campaign marker.' },
  'Siege of Baghdad': { title: 'Siege of Baghdad (1258)', url: 'https://en.wikipedia.org/wiki/Siege_of_Baghdad_(1258)', kind: 'battle', note: 'Marker for Mongol-Abbasid transition.' },
  'British Empire': { title: 'British Empire', url: 'https://en.wikipedia.org/wiki/British_Empire', kind: 'reference', note: 'General chronology and imperial context.' },
  'Seven Years’ War': { title: 'Seven Years’ War', url: 'https://en.wikipedia.org/wiki/Seven_Years%27_War', kind: 'event chronology', note: 'Global war relevant to British territorial gains.' },
  'Battle of Plassey': { title: 'Battle of Plassey', url: 'https://en.wikipedia.org/wiki/Battle_of_Plassey', kind: 'battle', note: 'Bengal power transition marker.' },
  'American Revolutionary War': { title: 'American Revolutionary War', url: 'https://en.wikipedia.org/wiki/American_Revolutionary_War', kind: 'event chronology', note: 'Context for loss of the Thirteen Colonies.' },
  'Battle of Waterloo': { title: 'Battle of Waterloo', url: 'https://en.wikipedia.org/wiki/Battle_of_Waterloo', kind: 'battle', note: 'Marker for post-Napoleonic British strategic position.' },
  'United States territorial acquisitions': { title: 'United States territorial acquisitions', url: 'https://en.wikipedia.org/wiki/United_States_territorial_acquisitions', kind: 'reference', note: 'Overview of formal territorial expansion.' },
  'Treaty of Paris (1783)': { title: 'Treaty of Paris (1783)', url: 'https://en.wikipedia.org/wiki/Treaty_of_Paris_(1783)', kind: 'treaty', note: 'Recognition of U.S. independence and boundaries.' },
  'Louisiana Purchase': { title: 'Louisiana Purchase', url: 'https://en.wikipedia.org/wiki/Louisiana_Purchase', kind: 'treaty', note: 'Territorial acquisition marker.' },
  'Mexican Cession': { title: 'Mexican Cession', url: 'https://en.wikipedia.org/wiki/Mexican_Cession', kind: 'treaty', note: 'Territorial transfer after the Mexican-American War.' },
  'American Civil War': { title: 'American Civil War', url: 'https://en.wikipedia.org/wiki/American_Civil_War', kind: 'event chronology', note: 'Internal sovereignty and state power conflict context.' },
  'Ukraine independence referendum, 1991': { title: 'Ukraine independence referendum, 1991', url: 'https://en.wikipedia.org/wiki/1991_Ukrainian_independence_referendum', kind: 'treaty', note: 'Recognised independence baseline.' },
  'Budapest Memorandum': { title: 'Budapest Memorandum', url: 'https://en.wikipedia.org/wiki/Budapest_Memorandum', kind: 'treaty', note: 'Security assurances and sovereignty context.' },
  'Annexation of Crimea by the Russian Federation': { title: 'Annexation of Crimea by the Russian Federation', url: 'https://en.wikipedia.org/wiki/Annexation_of_Crimea_by_the_Russian_Federation', kind: 'event chronology', note: 'Occupation/annexation context; not recognition.' },
  'War in Donbas': { title: 'War in Donbas', url: 'https://en.wikipedia.org/wiki/War_in_Donbas', kind: 'event chronology', note: 'Eastern Ukraine control-line context.' },
  '2022 Russian invasion of Ukraine': { title: '2022 Russian invasion of Ukraine', url: 'https://en.wikipedia.org/wiki/Russian_invasion_of_Ukraine', kind: 'event chronology', note: 'Full-scale invasion context.' },
  '2022 Kherson counteroffensive': { title: '2022 Kherson counteroffensive', url: 'https://en.wikipedia.org/wiki/2022_Kherson_counteroffensive', kind: 'event chronology', note: 'Southern control-line change marker.' },
  'ISW and Russia Matters, July 1 2026': { title: 'ISW / Russia Matters, July 2026', url: 'https://understandingwar.org/research/russia-ukraine/russian-offensive-campaign-assessment-july-1-2026/', kind: 'modern assessment', note: 'Open-source current control assessment; pair with Russia Matters area estimates.' },
  'ISW assessed control of terrain July 1 2026': { title: 'ISW assessed control of terrain, July 1 2026', url: 'https://understandingwar.org/research/russia-ukraine/russian-offensive-campaign-assessment-july-1-2026/', kind: 'modern assessment', note: 'Current conflict-control source.' },
  'Russia Matters war report card July 1 2026': { title: 'Russia Matters war report card, July 1 2026', url: 'https://www.russiamatters.org/news/russia-ukraine-war-report-card/russia-ukraine-war-report-card-july-1-2026', kind: 'modern assessment', note: 'Area-control estimates for Russia-Ukraine war.' },
  'Congress of Berlin': { title: 'Congress of Berlin', url: 'https://en.wikipedia.org/wiki/Congress_of_Berlin', kind: 'treaty', note: 'Bosnian administrative transition in 1878.' },
  'Bosnian Crisis': { title: 'Bosnian Crisis', url: 'https://en.wikipedia.org/wiki/Bosnian_Crisis', kind: 'event chronology', note: '1908 annexation crisis.' },
  'Assassination of Archduke Franz Ferdinand': { title: 'Assassination of Archduke Franz Ferdinand', url: 'https://en.wikipedia.org/wiki/Assassination_of_Archduke_Franz_Ferdinand', kind: 'event chronology', note: 'Sarajevo event marker.' },
  'Creation of Yugoslavia': { title: 'Creation of Yugoslavia', url: 'https://en.wikipedia.org/wiki/Creation_of_Yugoslavia', kind: 'event chronology', note: 'South Slavic state formation.' },
  'AVNOJ': { title: 'AVNOJ', url: 'https://en.wikipedia.org/wiki/AVNOJ', kind: 'event chronology', note: 'Federal Yugoslav framework.' },
  'Bosnian independence referendum': { title: 'Bosnian independence referendum', url: 'https://en.wikipedia.org/wiki/1992_Bosnian_independence_referendum', kind: 'treaty', note: 'Independence marker.' },
  'Srebrenica genocide': { title: 'Srebrenica genocide', url: 'https://en.wikipedia.org/wiki/Srebrenica_massacre', kind: 'event chronology', note: 'War-crime marker; not a border event.' },
  'Dayton Agreement': { title: 'Dayton Agreement', url: 'https://en.wikipedia.org/wiki/Dayton_Agreement', kind: 'treaty', note: 'Post-war constitutional and boundary framework.' },
  'Ottoman Empire': { title: 'Ottoman Empire', url: 'https://en.wikipedia.org/wiki/Ottoman_Empire', kind: 'reference', note: 'General chronology and territorial context.' },
  'Fall of Constantinople': { title: 'Fall of Constantinople', url: 'https://en.wikipedia.org/wiki/Fall_of_Constantinople', kind: 'battle', note: 'Ottoman capital transition marker.' },
  'Battle of Mohács': { title: 'Battle of Mohács', url: 'https://en.wikipedia.org/wiki/Battle_of_Moh%C3%A1cs', kind: 'battle', note: 'Ottoman-Hungarian frontier transition.' },
  'Siege of Vienna': { title: 'Siege of Vienna', url: 'https://en.wikipedia.org/wiki/Battle_of_Vienna', kind: 'battle', note: 'Ottoman-Habsburg turning point.' },
  'Abbasid Caliphate': { title: 'Abbasid Caliphate', url: 'https://en.wikipedia.org/wiki/Abbasid_Caliphate', kind: 'reference', note: 'General chronology and territorial context.' },
  'Abbasid Revolution': { title: 'Abbasid Revolution', url: 'https://en.wikipedia.org/wiki/Abbasid_Revolution', kind: 'event chronology', note: 'Caliphal transition marker.' },
  'Islamic Golden Age': { title: 'Islamic Golden Age', url: 'https://en.wikipedia.org/wiki/Islamic_Golden_Age', kind: 'reference', note: 'Cultural-historical context.' },
}

export function getSourceInfo(key: string): SourceInfo | undefined {
  return sourceCatalog[key]
}
