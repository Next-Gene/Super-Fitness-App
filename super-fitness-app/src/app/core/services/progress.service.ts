import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Progress, ProgressUpdate, ProgressStats, ProgressRecord } from '../models';

export interface ProgressDashboard {
  userId: string;
  period: string;
  workoutsCompleted: number;
  totalCaloriesBurned: number;
  totalWorkoutMinutes: number;
  weightHistory: { date: string; weight: number }[];
  workoutHistory: any[];
  weeklyGoal: number;
  currentStreak: number;
}

export interface WorkoutLogRequest {
  userId: string;
  sessionId?: string;
  workoutId: string;
  durationMinutes: number;
  caloriesBurned: number;
  rating?: number;
  performedAt?: string;
  clientRequestId?: string;
}

export interface WeightLogRequest {
  userId: string;
  weightKg: number;
  loggedAt?: string;
  clientRequestId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  private readonly _progressRecords = signal<ProgressRecord[]>([]);
  private readonly _recentWorkouts = signal<any[]>([]);
  private readonly _stats = signal<ProgressStats | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly progressRecords = this._progressRecords.asReadonly();
  readonly recentWorkouts = this._recentWorkouts.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  getProgressHistory(): Observable<ProgressRecord[]> {
    this._loading.set(true);
    const user = this.authService.getUser();
    const userId = user?.id;

    if (!userId) {
      this._loading.set(false);
      return of([]);
    }

    return this.api.get<any>(`/progress?userId=${userId}&period=weekly`).pipe(
      tap(response => {
        if (response?.data) {
          const records: ProgressRecord[] = [];
          
          if (response.data.weightHistory && Array.isArray(response.data.weightHistory)) {
            response.data.weightHistory.forEach((item: any) => {
              records.push({
                id: item.date || Math.random().toString(),
                date: item.date,
                weight: item.weight,
                bodyFat: undefined,
                notes: undefined
              });
            });
          }
          
          this._progressRecords.set(records.reverse());
        } else {
          this._progressRecords.set([]);
        }
      }),
      map(response => {
        if (response?.data?.weightHistory) {
          return response.data.weightHistory.map((item: any, index: number) => ({
            id: item.date || index.toString(),
            date: item.date,
            weight: item.weight,
            bodyFat: undefined,
            notes: undefined
          })).reverse();
        }
        return [];
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return of([]);
      }),
      tap(() => this._loading.set(false))
    );
  }

  addProgress(data: { weight?: number; bodyFat?: number; notes?: string }): Observable<ProgressRecord> {
    this._loading.set(true);
    const user = this.authService.getUser();
    const userId = user?.id;

    if (!userId || !data.weight) {
      this._loading.set(false);
      return of({ id: '', date: new Date().toISOString(), weight: data.weight || 0 });
    }

    const request: WeightLogRequest = {
      userId: userId,
      weightKg: data.weight,
      loggedAt: new Date().toISOString(),
      clientRequestId: Math.random().toString(36).substring(7)
    };

    return this.api.post<any>('/progress/weight', request).pipe(
      tap(response => {
        const current = this._progressRecords();
        const newRecord: ProgressRecord = {
          id: response?.id || Math.random().toString(),
          date: new Date().toISOString(),
          weight: data.weight || 0,
          bodyFat: data.bodyFat,
          notes: data.notes
        };
        this._progressRecords.set([newRecord, ...current]);
      }),
      map(response => ({
        id: response?.id || Math.random().toString(),
        date: new Date().toISOString(),
        weight: data.weight || 0,
        bodyFat: data.bodyFat,
        notes: data.notes
      })),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return of({ id: '', date: new Date().toISOString(), weight: data.weight || 0 });
      }),
      tap(() => this._loading.set(false))
    );
  }

  logWorkout(data: WorkoutLogRequest): Observable<any> {
    if (!data.clientRequestId) {
      data.clientRequestId = Math.random().toString(36).substring(7);
    }
    return this.api.post<any>('/progress/workouts', data).pipe(
      catchError(err => {
        this._error.set(err.message);
        throw err;
      })
    );
  }

  getProgressStats(): Observable<ProgressStats> {
    this._loading.set(true);
    const user = this.authService.getUser();
    const userId = user?.id;

    if (!userId) {
      this._loading.set(false);
      return of({
        totalWorkouts: 0,
        totalCalories: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        averageDuration: 0
      });
    }

    return this.api.get<any>(`/progress?userId=${userId}&period=weekly`).pipe(
      tap(response => {
        if (response?.data) {
          this._stats.set({
            totalWorkouts: response.data.statistics?.totalWorkouts || 0,
            totalCalories: response.data.statistics?.totalCaloriesBurned || 0,
            currentStreak: response.data.statistics?.currentStreak || 0,
            longestStreak: response.data.statistics?.longestStreak || 0,
            weeklyWorkouts: response.data.statistics?.totalWorkouts || 0,
            monthlyWorkouts: response.data.statistics?.totalWorkouts || 0,
            averageDuration: response.data.statistics?.totalWorkoutMinutes || 0
          });

          if (response.data.recentWorkouts) {
            this._recentWorkouts.set(response.data.recentWorkouts.map((r: any) => ({
              id: r.id,
              name: 'Workout Session', // Placeholder since name isn't in Progress service
              duration: r.durationMinutes,
              calories: r.caloriesBurned,
              performedAt: r.performedAt,
              category: 'fitness'
            })));
          }
        }
      }),
      map(response => ({
        totalWorkouts: response?.data?.statistics?.totalWorkouts || 0,
        totalCalories: response?.data?.statistics?.totalCaloriesBurned || 0,
        currentStreak: response?.data?.statistics?.currentStreak || 0,
        longestStreak: response?.data?.statistics?.longestStreak || 0,
        weeklyWorkouts: response?.data?.statistics?.totalWorkouts || 0,
        monthlyWorkouts: response?.data?.statistics?.totalWorkouts || 0,
        averageDuration: 0
      })),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return of({
          totalWorkouts: 0,
          totalCalories: 0,
          currentStreak: 0,
          longestStreak: 0,
          weeklyWorkouts: 0,
          monthlyWorkouts: 0,
          averageDuration: 0
        });
      }),
      tap(() => this._loading.set(false))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}