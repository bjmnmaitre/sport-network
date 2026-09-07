/**
 * Sport Network - Sport Specific Data Types
 *
 * Defines the discriminated union for sport-specific data extensions.
 * This allows the core Activity and ActivityPlan entities to remain generic
 * while supporting sport-specific fields through a type-safe union.
 */

import { RunningData } from './sport-specific/running-data';
import { CyclingData } from './sport-specific/cycling-data';
import { SwimmingData } from './sport-specific/swimming-data';
import { FitnessData } from './sport-specific/fitness-data';
import { SportType } from './sport';

/**
 * Running specific data
 */
export interface RunningSportSpecificData {
  type: SportType.RUNNING;
  data: RunningData;
}

/**
 * Cycling specific data
 */
export interface CyclingSportSpecificData {
  type: SportType.CYCLING;
  data: CyclingData;
}

/**
 * Swimming specific data
 */
export interface SwimmingSportSpecificData {
  type: SportType.SWIMMING;
  data: SwimmingData;
}

/**
 * Fitness specific data
 */
export interface FitnessSportSpecificData {
  type: SportType.FITNESS;
  data: FitnessData;
}

/**
 * Placeholder for other sports - to be implemented as needed
 * For now, we can have a generic sport specific data for other sports
 */
export interface OtherSportSpecificData {
  type: Exclude<SportType,
    | SportType.RUNNING
    | SportType.CYCLING
    | SportType.SWIMMING
    | SportType.FITNESS>;
  data: Record<string, unknown>;
}

/**
 * Union of all sport specific data types
 */
export type SportSpecificData =
  | RunningSportSpecificData
  | CyclingSportSpecificData
  | SwimmingSportSpecificData
  | FitnessSportSpecificData
  | OtherSportSpecificData;

/**
 * Placeholder for sport specific plan data (similar structure but for plans)
 * We can reuse the same data types for plans or create plan-specific variants.
 * For simplicity, we'll use the same types for plans initially.
 */
export type SportSpecificPlanData = SportSpecificData;