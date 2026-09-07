/**
 * Sport Network - Cycling-Specific Data
 *
 * Defines metrics and data points specific to cycling activities.
 */

export interface CyclingData {
  /** Average power in watts */
  averagePowerWatts?: number;
  /** Normalized power in watts */
  normalizedPowerWatts?: number;
  /** Maximum power in watts */
  maxPowerWatts?: number;

  /** Functional Threshold Power (FTP) in watts */
  ftpWatts?: number;

  /** Average cadence in RPM */
  averageCadenceRpm?: number;
  /** Maximum cadence in RPM */
  maxCadenceRpm?: number;

  /** Average speed in km/h */
  averageSpeedKph?: number;
  /** Maximum speed in km/h */
  maxSpeedKph?: number;

  /** Elevation gain in meters */
  elevationGainMeters?: number;
  /** Elevation loss in meters */
  elevationLossMeters?: number;

  /** Training Stress Score (TSS) */
  trainingStressScore?: number;

  /** Intensity Factor (IF) */
  intensityFactor?: number;

  /** Left/right power balance (%) */
  powerBalanceLeft?: number; // percentage, 0-100
  powerBalanceRight?: number; // percentage, 0-100

  /** Pedal smoothness (%) */
  pedalSmoothnessPercent?: number;

  /** Torque effectiveness (%) */
  torqueEffectivenessPercent?: number;
}