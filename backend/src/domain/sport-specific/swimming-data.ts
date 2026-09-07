/**
 * Sport Network - Swimming-Specific Data
 *
 * Defines metrics and data points specific to swimming activities.
 */

export interface SwimmingData {
  /** Average pace in seconds per 100 meters */
  averagePaceSp100m?: number;
  /** Best pace in seconds per 100 meters */
  bestPaceSp100m?: number;

  /** Total distance in meters (optional, already in ActivityMetrics) */
  distanceMeters?: number;

  /** Stroke count (total) */
  strokeCount?: number;
  /** Average strokes per length */
  averageStrokesPerLength?: number;
  /** Strokes per minute (cadence) */
  averageStrokesPerMinute?: number;

  /** Pool length in meters (for pool swimming) */
  poolLengthMeters?: number;
  /** Open water flag */
  openWater?: boolean;

  /** SWOLF score (stroke count + time for one length) */
  swolf?: number;

  /** Heart rate data */
  averageHeartRate?: number;
  maxHeartRate?: number;

  /** Calories burned */
  calories?: number;

  /** Distance per stroke in meters */
  distancePerStrokeM?: number;

  /** Stroke rate in strokes per minute */
  strokeRateSpm?: number;
}