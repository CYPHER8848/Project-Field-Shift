/**
 * Region-specific agricultural calendars for Project Field Shift.
 * 
 * Agronomic Sources & References:
 * 1. Punjab (Central Plain Zone - PAU Ludhiana Benchmark):
 *    - Source: Punjab Agricultural University (PAU) Package of Practices for Kharif and Rabi Crops;
 *      Punjab Preservation of Subsoil Water Act (2009); ICAR-CRIDA Contingency Plan for Ludhiana.
 *    - Kharif window: Weeks 22–42 (~June 1 to October 21). Paddy nursery/puddling preparation begins
 *      in week 22, legal transplanting opens week 24, harvesting concludes week 42.
 *    - Rabi window: Weeks 43–16 (~October 22 to April 21). Wheat and chickpea sowing in weeks 43–45,
 *      physiological maturity and harvest in weeks 14–16.
 *    - Zaid window: Weeks 17–21 (~April 22 to May 31). Summer fallow / green manure.
 *
 * 2. Karnataka (Northern Transition Zone - UAS Dharwad Benchmark):
 *    - Source: University of Agricultural Sciences (UAS) Dharwad Package of Practices;
 *      ICAR-CRIDA NICRA District Agricultural Contingency Plan for Dharwad (2013).
 *    - Kharif window: Weeks 24–41 (~June 11 to October 14). Sowing triggered by Southwest monsoon onset;
 *      harvest concludes October.
 *    - Rabi window: Weeks 42–10 (~October 15 to March 11). Sown on residual moisture in mid-to-late October;
 *      Bengal gram (chickpea) harvested in February/March.
 *    - Zaid/Summer window: Weeks 11–23 (~March 12 to June 10). Dry hot fallow.
 *
 * Note on Assumed Dates:
 * - Weekly boundaries represent regional modal intervals rounded to standard ISO calendar weeks.
 * - Actual farm-level field operations vary by ±2 weeks depending on annual monsoon onset dates.
 * - Other regions (e.g. Iowa, Kenya) do not currently have cited regional calendars or crop traits
 *   in the repository and are treated as unsupported in Phase 1.
 */

export type SupportedRegionId = 'punjab' | 'karnataka';

export interface SeasonalWindow {
  season: 'kharif' | 'rabi' | 'zaid';
  startWeek: number;
  endWeek: number;
  description: string;
}

export interface RegionalCalendar {
  regionId: string;
  regionName: string;
  description: string;
  seasons: SeasonalWindow[];
}

export const SUPPORTED_REGIONAL_CALENDARS: Record<SupportedRegionId, RegionalCalendar> = {
  punjab: {
    regionId: 'punjab',
    regionName: 'Punjab, India',
    description: 'Central Punjab Indo-Gangetic plain (Ludhiana benchmark). Intensive canal/tubewell irrigated cereal-cereal belt.',
    seasons: [
      { season: 'kharif', startWeek: 22, endWeek: 42, description: 'Monsoon season: Rice transplanting to October harvest.' },
      { season: 'rabi', startWeek: 43, endWeek: 16, description: 'Winter season: Wheat / Chickpea sowing in Nov, harvest in April.' },
      { season: 'zaid', startWeek: 17, endWeek: 21, description: 'Summer fallow / short legume window.' },
    ],
  },
  karnataka: {
    regionId: 'karnataka',
    regionName: 'Karnataka, India',
    description: 'Northern Transition Zone (Dharwad benchmark). Semi-arid rain-fed pulse and cereal systems.',
    seasons: [
      { season: 'kharif', startWeek: 24, endWeek: 41, description: 'Southwest monsoon: Sowing mid-June, harvest October.' },
      { season: 'rabi', startWeek: 42, endWeek: 10, description: 'Post-monsoon winter: Sowing late October, harvest February/March.' },
      { season: 'zaid', startWeek: 11, endWeek: 23, description: 'Pre-monsoon summer dry period.' },
    ],
  },
};

export class UnsupportedRegionError extends Error {
  constructor(region: string) {
    super(
      `Unsupported region: '${region}'. Phase 1 simulation currently supports verified calendars for: 'punjab' and 'karnataka'. ` +
      `Iowa and Kenya/Sahel do not yet have verified regional crop traits or calendars committed to the repository. ` +
      `Provide a custom 'regionalCalendar' in simulation options or use a supported region.`
    );
    this.name = 'UnsupportedRegionError';
  }
}

/**
 * Normalize and retrieve regional calendar.
 */
export function getRegionalCalendar(
  regionInput?: string,
  customCalendar?: RegionalCalendar
): RegionalCalendar {
  if (customCalendar) {
    return customCalendar;
  }

  const raw = (regionInput || 'punjab').trim().toLowerCase();
  
  if (raw === 'punjab' || raw.includes('punjab')) {
    return SUPPORTED_REGIONAL_CALENDARS.punjab;
  }
  if (raw === 'karnataka' || raw.includes('karnataka')) {
    return SUPPORTED_REGIONAL_CALENDARS.karnataka;
  }

  throw new UnsupportedRegionError(regionInput || 'unknown');
}

/**
 * Determine active season for a given calendar week in a regional calendar.
 */
export function getSeasonForWeek(
  week: number,
  calendar: RegionalCalendar
): 'kharif' | 'rabi' | 'zaid' {
  for (const window of calendar.seasons) {
    if (window.startWeek <= window.endWeek) {
      if (week >= window.startWeek && week <= window.endWeek) {
        return window.season;
      }
    } else {
      // Wraps around new year (e.g. Rabi week 43 to week 16)
      if (week >= window.startWeek || week <= window.endWeek) {
        return window.season;
      }
    }
  }
  return 'zaid'; // Default to fallow/zaid if unassigned
}
