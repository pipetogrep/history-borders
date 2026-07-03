import { empires } from './empires.ts'
import { sourceCatalog } from './sources.ts'
import type { Empire, HistoricalEvent } from '../types/history.ts'

sourceCatalog['Siege of Sarajevo'] = {
  title: 'Siege of Sarajevo',
  url: 'https://en.wikipedia.org/wiki/Siege_of_Sarajevo',
  kind: 'event chronology',
  note: 'Capital-city siege marker; explains wartime pressure without redrawing the recognised border.',
}

sourceCatalog['Washington Agreement'] = {
  title: 'Washington Agreement',
  url: 'https://en.wikipedia.org/wiki/Washington_Agreement',
  kind: 'treaty',
  note: '1994 Bosniak-Croat federation framework leading into Dayton negotiations.',
}

const bosnia = (empires as readonly Empire[]).find((empire) => empire.id === 'bosnia-yugoslavia')

if (bosnia) {
  const sourceList = bosnia.sources as string[]
  for (const source of ['Siege of Sarajevo', 'Washington Agreement']) {
    if (!sourceList.includes(source)) {
      const daytonIndex = sourceList.indexOf('Dayton Agreement')
      sourceList.splice(daytonIndex === -1 ? sourceList.length : daytonIndex, 0, source)
    }
  }

  const events = bosnia.events as HistoricalEvent[]
  if (!events.some((event) => event.id === 'sarajevo-siege')) {
    events.push({
      id: 'sarajevo-siege',
      year: 1992,
      title: 'Siege of Sarajevo begins',
      type: 'war',
      location: { lat: 43.856, lon: 18.413 },
      source: 'Siege of Sarajevo',
      summary: 'A prolonged siege turns Bosnia’s capital into the central humanitarian and political symbol of the war.',
    })
  }

  if (!events.some((event) => event.id === 'washington-1994')) {
    events.push({
      id: 'washington-1994',
      year: 1994,
      title: 'Washington Agreement',
      type: 'treaty',
      location: { lat: 38.9072, lon: -77.0369 },
      source: 'Washington Agreement',
      summary: 'The Bosniak–Croat war ends and a federation framework reshapes negotiations before Dayton.',
    })
  }

  events.sort((left, right) => left.year - right.year)
}
