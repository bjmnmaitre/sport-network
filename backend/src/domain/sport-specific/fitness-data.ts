/**
 * Sport Network - Fitness-Specific Data
 *
 * Defines metrics and data points specific to fitness/gym activities.
 */

export interface FitnessData {
  /** Total workout duration in seconds (already in ActivityMetrics) */
  /** Type of workout: strength, hiit, circuit, etc. */
  workoutType?: string;

  /** Estimated one-rep max for major lifts (if applicable) */
  estimatedOneRepMax?: {
    benchPressKg?: number;
    squatKg?: number;
    deadliftKg?: number;
    overheadPressKg?: number;
  };

  /** Total volume load (sets * reps * weight) */
  volumeLoadKg?: number;

  /** Average heart rate during workout */
  averageHeartRate?: number;
  /** Max heart rate during workout */
  maxHeartRate?: number;

  /** Calories burned */
  calories?: number;

  /** Number of exercises performed */
  exerciseCount?: number;

  /** Training impulse (TRIMP) or similar metric */
  trainingImpulse?: number;

  /** Perceived exertion (Borg 6-20 or 1-10) */
  perceivedExertion?: number;

  /** Notes on form, fatigue, etc. */
  notes?: string;

  /** Equipment used */
  equipmentUsed?: string[];

  /** Workout rating (1-5 stars or 1-10) */
  rating?: number;
}