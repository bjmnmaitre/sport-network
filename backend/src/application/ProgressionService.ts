import { Injectable } from '@nestjs/common';
import { ActivityRepository } from '../infrastructure/repository/ActivityRepository';
import { SportType } from '../domain/sport';

export interface Progression {
  userId: string;
  sportId: SportType;
  period: 'day' | 'week' | 'month' | 'year';
  periodStart: Date;
  periodEnd: Date;

  // Metrics
  activities: number;
  distance?: number;
  duration: number; // seconds
  elevation?: number;

  // Averages
  avgPace?: string;
  avgHeartRate?: number;

  // Engagement
  streakDays: number;

  // Context
  comparisonPreviousPeriod?: number; // percentage
}

@Injectable()
export class ProgressionService {
  constructor(private activityRepository: ActivityRepository) {}

  /**
   * Calculate progression for user, sport, and period
   */
  async calculateProgression(
    userId: string,
    sportType: SportType,
    period: 'day' | 'week' | 'month' | 'year',
  ): Promise<Progression> {
    const { startDate, endDate } = this.getPeriodDates(period);

    const activities = await this.activityRepository.findUserProgressionData(
      userId,
      sportType,
      startDate,
      endDate,
    );

    const metrics = this.aggregateMetrics(activities);

    // Get previous period for comparison
    const { startDate: prevStart, endDate: prevEnd } = this.getPeriodDates(period, -1);
    const previousActivities = await this.activityRepository.findUserProgressionData(
      userId,
      sportType,
      prevStart,
      prevEnd,
    );
    const previousMetrics = this.aggregateMetrics(previousActivities);

    const comparisonPercentage = previousMetrics.distance
      ? ((metrics.distance - previousMetrics.distance) / previousMetrics.distance) * 100
      : undefined;

    return {
      userId,
      sportId: sportType,
      period,
      periodStart: startDate,
      periodEnd: endDate,
      activities: activities.length,
      distance: metrics.distance,
      duration: metrics.duration,
      elevation: metrics.elevation,
      avgPace: metrics.avgPace,
      avgHeartRate: metrics.avgHeartRate,
      streakDays: this.calculateStreak(activities),
      comparisonPreviousPeriod: comparisonPercentage,
    };
  }

  /**
   * Get personal best for sport
   */
  async getPersonalBest(
    userId: string,
    sportType: SportType,
  ): Promise<{ distance: number; pace: string; date: Date } | null> {
    const activities = await this.activityRepository.findByUserAndSport(userId, sportType);

    if (activities.length === 0) return null;

    const best = activities.reduce((prev, current) => {
      const prevDistance = prev.actualMetrics?.distance || 0;
      const currentDistance = current.actualMetrics?.distance || 0;
      return currentDistance > prevDistance ? current : prev;
    });

    return {
      distance: best.actualMetrics?.distance || 0,
      pace: best.actualMetrics?.pace || 'N/A',
      date: best.actualEndTime,
    };
  }

  /**
   * Aggregate metrics from multiple activities
   */
  private aggregateMetrics(activities: any[]) {
    if (activities.length === 0) {
      return { distance: 0, duration: 0, elevation: 0, avgPace: undefined, avgHeartRate: undefined };
    }

    const distance = activities.reduce((sum, a) => sum + (a.actualMetrics?.distance || 0), 0);
    const duration = activities.reduce((sum, a) => sum + (a.actualMetrics?.duration || 0), 0);
    const elevation = activities.reduce((sum, a) => sum + (a.actualMetrics?.elevation || 0), 0);

    const avgPace = this.calculateAvgPace(distance, duration);
    const heartRates = activities
      .map(a => a.actualMetrics?.avgHeartRate)
      .filter(hr => hr);
    const avgHeartRate = heartRates.length > 0
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : undefined;

    return { distance, duration, elevation, avgPace, avgHeartRate };
  }

  /**
   * Calculate average pace from distance and duration
   */
  private calculateAvgPace(distance: number, duration: number): string {
    if (distance === 0 || duration === 0) return 'N/A';

    const paceInSeconds = (duration / distance) * 60;
    const minutes = Math.floor(paceInSeconds / 60);
    const seconds = Math.round(paceInSeconds % 60);

    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  }

  /**
   * Calculate streak of consecutive days with activities
   */
  private calculateStreak(activities: any[]): number {
    if (activities.length === 0) return 0;

    const sortedDates = activities
      .map(a => new Date(a.actualEndTime).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    let today = new Date().toDateString();

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = new Date(sortedDates[i]);
      const nextDate = new Date(sortedDates[i + 1]);
      const diffDays = (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);

      if (Math.abs(diffDays) === 1 || sortedDates[i] === today) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get period start and end dates
   */
  private getPeriodDates(
    period: 'day' | 'week' | 'month' | 'year',
    offset: number = 0,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate = new Date(now);
    let endDate = new Date(now);

    if (period === 'day') {
      startDate.setDate(startDate.getDate() + offset);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + offset);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const weekOffset = offset * 7;
      startDate.setDate(startDate.getDate() - startDate.getDay() + weekOffset);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() + offset);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + offset + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() + offset);
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setFullYear(endDate.getFullYear() + offset);
      endDate.setMonth(11);
      endDate.setDate(31);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }
}