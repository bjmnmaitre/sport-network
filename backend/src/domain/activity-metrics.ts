/**
 * Sport Network - Activity Metrics
 *
 * Defines the common metrics that apply across different sports.
 * These are the generic measurements that can be recorded for any activity.
 */

export interface ActivityMetrics {
  /** Duration of the activity in seconds */
  durationSeconds: number;

  /** Distance covered in meters (for distance-based sports) */
  distanceMeters?: number;

  /** Estimated calories burned */
  calories?: number;

  /** Average heart rate in beats per minute */
  averageHeartRate?: number;

  /** Maximum heart rate in beats per minute */
  maxHeartRate?: number;

  /** Elevation gain in meters */
  elevationGainMeters?: number;

  /** Elevation loss in meters */
  elevationLossMeters?: number;

  /** Training effect or impact (0-5 scale, optional) */
  trainingEffect?: number;

  /** Perceived exertion (6-20 Borg scale or 1-10 scale, optional) */
  perceivedExertion?: number;

  /** Notes or free-form observations about the activity */
  notes?: string;

  /** Weather conditions during the activity */
  weather?: {
    temperatureCelsius?: number;
    precipitationMm?: number;
    windSpeedKph?: number;
    humidityPercent?: number;
  };
}