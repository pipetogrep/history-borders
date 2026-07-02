export interface Coordinates {
  readonly lat: number
  readonly lon: number
}

export interface KeyLocation extends Coordinates {
  readonly name: string
  readonly note: string
}

export interface HistoricalEvent {
  readonly year: number
  readonly title: string
  readonly type: 'war' | 'expansion' | 'capital' | 'decline'
  readonly summary: string
  readonly location?: Coordinates
}

export interface EmpireSnapshot {
  readonly year: number
  readonly label: string
  readonly extent: GeoJSON.Feature<GeoJSON.MultiPolygon>
  readonly note: string
}

export interface Empire {
  readonly id: string
  readonly name: string
  readonly colour: string
  readonly period: string
  readonly headline: string
  readonly caveat: string
  readonly sources: readonly string[]
  readonly locations: readonly KeyLocation[]
  readonly events: readonly HistoricalEvent[]
  readonly snapshots: readonly EmpireSnapshot[]
}
