/**
 * Sport Network - Running-Specific Data
 *
 * Defines metrics and data points specific to running activities.
 */

export interface RunningData {
  /** Average pace in seconds per kilometer */
  averagePaceSpk?: number;

  /** Best pace in seconds per kilometer */
  bestPaceSpk?: number;

  /** Cadence (steps per minute) */
  averageCadence?: number;
  maxCadence?: number;

  /** Ground contact time in milliseconds */
  averageGroundContactTimeMs?: number;
  verticalOscillationCm?: number;

  /** Stride length in meters */
  averageStrideLengthM?: number;

  /** VO2 max estimate (if available) */
  vo2max?: number;

  /** Training load (impulse) */
  trainingLoad?: number;

  /** Elevation corrected metrics */
  gradeAdjustedPaceSpk?: number;

  /** Running dynamics (vertical ratio, etc.) */
  verticalRatioPercent?: number;

  /** Leg spring stiffness */
  legSpringStiffness?: number;

  /** Power in watts (if measured via pods or treadmill) */
  averagePowerWatts?: number;
  maxPowerWatts?: number;
}