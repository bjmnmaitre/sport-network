/**
 * Sport Network - Sport Types and Location Definitions
 *
 * Defines the core sport types and location value objects used throughout
 * the activity tracking system.
 */

export enum SportType {
  RUNNING = 'RUNNING',
  CYCLING = 'CYCLING',
  FITNESS = 'FITNESS',
  SWIMMING = 'SWIMMING',
  TRAIL = 'TRAIL',
  FOOTBALL = 'FOOTBALL',
  BASKETBALL = 'BASKETBALL',
  VOLLEYBALL = 'VOLLEYBALL',
  TENNIS = 'TENNIS',
  YOGA = 'YOGA',
  HIKING = 'HIKING',
  // Extensible - new sports can be added without modifying core entities
}

/**
 * Sport values as exposed by the public API contract (lowercase).
 *
 * Derived from SportType rather than duplicated: adding a sport to the enum
 * exposes it through the API automatically, so the two vocabularies cannot
 * drift apart.
 */
export const SPORT_API_VALUES: string[] = Object.values(SportType).map(v => v.toLowerCase());

/**
 * Convert an API contract value (lowercase) into the domain enum.
 * @param value The lowercase sport value received from a client
 * @returns The matching SportType
 * @throws Error if the value is not a known sport
 */
export function toSportType(value: string): SportType {
  const match = Object.values(SportType).find(sport => sport.toLowerCase() === value);
  if (!match) {
    throw new Error(
      `Unknown sport type: "${value}". Expected one of: ${SPORT_API_VALUES.join(', ')}`,
    );
  }
  return match;
}

/**
 * Convert the domain enum into its API contract representation (lowercase).
 * @param sport The domain sport type
 * @returns The lowercase value exposed to clients
 */
export function toApiSportType(sport: SportType): string {
  return sport.toLowerCase();
}

/**
 * Geographic coordinates
 */
export interface LatLng {
  latitude: number;  // -90 to 90
  longitude: number; // -180 to 180
}

/**
 * Location value object - can represent different types of locations
 * depending on the sport/activity type
 */
export interface Location {
  /** Named location (e.g., "Central Park", "Guy Gautier Pool") */
  name?: string;

  /** Address for geocoding */
  address?: string;

  /** GPS coordinates */
  coordinates?: LatLng;

  /** For route-based activities (running, cycling) */
  route?: LatLng[];

  /** Venue/facility ID for structured locations */
  venueId?: string;

  /** Indoor/outdoor flag */
  indoor?: boolean;
}