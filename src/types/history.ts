export interface Coordinates {
  readonly lat: number
  readonly lon: number
}

export interface KeyLocation extends Coordinates {
  readonly name: string
  readonly note: string
}

export interface HistoricalEvent {
  readonly id: string
  readonly year: number
  readonly title: string
  readonly type: 'battle' | 'war' | 'expansion' | 'capital' | 'treaty' | 'decline'
  readonly summary: string
  readonly location: Coordinates
  readonly source?: string
}

export interface EmpireSnapshot {
  readonly year: number
  readonly label: string
  readonly extent: GeoJSON.Feature<GeoJSON.MultiPolygon>
  readonly countryNames?: readonly string[]
  readonly note: string
  readonly claim?: string
  readonly change?: string
  readonly geometry?: string
  readonly geometryMethod?: string
  readonly geometrySource?: string
  readonly uncertainty?: 'low' | 'medium' | 'high'
  readonly confidence?: 'high' | 'medium' | 'low'
  readonly source?: string
  readonly scale?: number
  readonly layer: 'recognised' | 'control' | 'imperial' | 'administrative' | 'influence'
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
