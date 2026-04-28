import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface UserFitnessStats {
  userId: string;
  bmr: number;
  tdee: number;
  calorieTarget: number;
  bmi: number;
  status: string;
}

export interface FitnessGoalRequest {
  userId: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  activityLevel: number;
  goal: number;
}

@Injectable({
  providedIn: 'root'
})
export class FitnessService implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly destroy$ = new Subject<void>();

  private readonly _fitnessStats = signal<UserFitnessStats | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly fitnessStats = this._fitnessStats.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  calculateFitness(data: FitnessGoalRequest): Observable<UserFitnessStats> {
    this._loading.set(true);
    this._error.set(null);

    return this.api.post<{ data: UserFitnessStats }>('/fitness-calculator', data).pipe(
      tap(response => {
        this._fitnessStats.set(response.data || null);
        this._loading.set(false);
      }),
      map(response => response.data as UserFitnessStats),
      catchError(err => {
        this._error.set(err.message || 'Failed to calculate fitness');
        this._loading.set(false);
        throw err;
      })
    );
  }

  updateFitness(userId: string, data: Omit<FitnessGoalRequest, 'userId'>): Observable<UserFitnessStats> {
    this._loading.set(true);
    this._error.set(null);

    const payload = { ...data, userId };
    return this.api.put<{ data: UserFitnessStats }>(`/fitness-calculator/${userId}`, payload).pipe(
      tap(response => {
        this._fitnessStats.set(response.data || null);
        this._loading.set(false);
      }),
      map(response => response.data as UserFitnessStats),
      catchError(err => {
        this._error.set(err.message || 'Failed to update fitness');
        this._loading.set(false);
        throw err;
      })
    );
  }

  getSuggestions(userId: string): Observable<any> {
    this._loading.set(true);
    this._error.set(null);

    return this.api.get<any>(`/fitness-calculator/suggestions/${userId}`).pipe(
      tap(response => {
        this._loading.set(false);
      }),
      catchError(err => {
        this._error.set(err.message || 'Failed to get suggestions');
        this._loading.set(false);
        throw err;
      })
    );
  }

  clearStats(): void {
    this._fitnessStats.set(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}