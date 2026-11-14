export interface DailyWeather {
  date: string; t2mMeanC: number | null; t2mMaxC: number | null; t2mMinC: number | null;
  precipitationMm: number | null; surfaceShortwaveRadiationMjM2: number | null;
  rootZoneWetnessFraction: number | null; topLayerWetnessFraction: number | null;
}
export interface WeatherSeries {
  source: 'NASA_POWER' | 'MOCK';
  location: { id: string; name: string; latitude: number; longitude: number };
  units: { temperature: '°C'; precipitation: 'mm/day'; radiation: 'MJ/m²/day'; wetness: 'fraction' };
  daily: DailyWeather[]; retrievedAt: string;
}