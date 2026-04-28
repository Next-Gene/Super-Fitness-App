import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Workout, WorkoutPlan, WorkoutSession, WorkoutCategory, Difficulty } from '../models';

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  message?: string;
  isSuccess: boolean;
}

export interface SingleResponse<T> {
  data: T;
  message?: string;
  isSuccess: boolean;
}

export interface WorkoutApiResponse {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  caloriesBurn: number;
  rating: number;
  isPremium: boolean;
  workoutPlanId?: number;
  exerciseCount?: number;
  imageUrl?: string;
  videoUrl?: string;
  targetMuscles?: string;
  equipmentNeeded?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly destroy$ = new Subject<void>();

  private readonly _workouts = signal<Workout[]>([]);
  private readonly _workoutPlans = signal<WorkoutPlan[]>([]);
  private readonly _currentWorkout = signal<Workout | null>(null);
  private readonly _currentSession = signal<WorkoutSession | null>(null);
  private readonly _pagination = signal<{page: number, totalPages: number, hasNext: boolean, hasPrevious: boolean}>({
    page: 1, totalPages: 1, hasNext: false, hasPrevious: false
  });
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly workouts = this._workouts.asReadonly();
  readonly workoutPlans = this._workoutPlans.asReadonly();
  readonly currentWorkout = this._currentWorkout.asReadonly();
  readonly currentSession = this._currentSession.asReadonly();
  readonly pagination = this._pagination.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  getWorkouts(category?: string, difficulty?: string, page: number = 1, pageSize: number = 20): Observable<Workout[]> {
    this._loading.set(true);
    const params: { [key: string]: string | number } = { page, pageSize };
    if (category) params['category'] = category;
    if (difficulty) params['difficulty'] = difficulty;

    return this.api.get<PaginatedResponse<WorkoutApiResponse>>('/workouts', params as any).pipe(
      tap(response => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data.items)) {
          const mappedWorkouts: Workout[] = response.data.items.map(w => this.mapWorkoutApiResponse(w));
          this._workouts.set(mappedWorkouts);
          this._pagination.set({
            page: response.data.page,
            totalPages: response.data.totalPages,
            hasNext: response.data.hasNext,
            hasPrevious: response.data.hasPrevious
          });
        } else {
          this._workouts.set([]);
        }
      }),
      map(response => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data.items)) {
          return response.data.items.map(w => this.mapWorkoutApiResponse(w));
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

  getWorkoutById(id: string): Observable<Workout> {
    this._loading.set(true);

    return this.api.get<SingleResponse<WorkoutApiResponse>>(`/workouts/${id}`).pipe(
      tap(response => {
        if (response && response.isSuccess && response.data) {
          const mapped = this.mapWorkoutApiResponse(response.data);
          this._currentWorkout.set(mapped);
        }
      }),
      map(response => this.mapWorkoutApiResponse(response.data)),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        throw err;
      }),
      tap(() => this._loading.set(false))
    );
  }

  getWorkoutsByCategory(category: string, page: number = 1, pageSize: number = 20): Observable<Workout[]> {
    this._loading.set(true);

    const params = { page, pageSize };
    return this.api.get<PaginatedResponse<WorkoutApiResponse>>(`/workouts/category/${category}`, params as any).pipe(
      tap(response => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data.items)) {
          const mappedWorkouts: Workout[] = response.data.items.map(w => this.mapWorkoutApiResponse(w));
          this._workouts.set(mappedWorkouts);
          this._pagination.set({
            page: response.data.page,
            totalPages: response.data.totalPages,
            hasNext: response.data.hasNext,
            hasPrevious: response.data.hasPrevious
          });
        } else {
          this._workouts.set([]);
        }
      }),
      map(response => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data.items)) {
          return response.data.items.map(w => this.mapWorkoutApiResponse(w));
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

  private readonly auth = inject(AuthService);

  startWorkout(workoutId: number, difficulty: string = 'Medium', plannedDuration: number = 60): Observable<any> {
    const user = this.auth.currentUser();

    if (!user) {
      this._error.set('User must be logged in to start a workout.');
      return of(null);
    }

    return this.api.post<any>(`/workouts/${workoutId}/start`, {
      difficulty,
      plannedDuration
    }).pipe(
      catchError(err => {
        this._error.set(err.message);
        throw err;
      })
    );
  }

  getWorkoutSession(sessionId: number | string): Observable<any> {
    return this.api.get<any>(`/workouts/session/${sessionId}`).pipe(
      catchError(err => {
        this._error.set(err.message);
        throw err;
      })
    );
  }

  completeWorkoutSession(sessionId: number | string, durationMinutes: number, caloriesBurned: number): Observable<any> {
    return this.api.post<any>(`/workouts/session/${sessionId}/complete`, {
      durationMinutes,
      caloriesBurned
    }).pipe(
      catchError(err => {
        this._error.set(err.message);
        throw err;
      })
    );
  }

  getWorkoutPlans(): Observable<WorkoutPlan[]> {
    this._loading.set(true);

    return this.api.get<any[]>('/workout-plans').pipe(
      tap(plans => {
        if (Array.isArray(plans)) {
          this._workoutPlans.set(plans);
        }
      }),
      map(result => Array.isArray(result) ? result : []),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return of([]);
      }),
      tap(() => this._loading.set(false))
    );
  }

  getWorkoutPlanById(id: string): Observable<WorkoutPlan> {
    this._loading.set(true);

    return this.api.get<any>(`/workout-plans/${id}`).pipe(
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        throw err;
      }),
      tap(() => this._loading.set(false))
    );
  }

  createWorkout(workoutData: any): Observable<any> {
    return this.api.post<any>('/workouts/create', workoutData).pipe(
      catchError(err => {
        this._error.set(err.message);
        throw err;
      })
    );
  }

  assignPlanToWorkout(planId: string, workoutId: string): Observable<any> {
    return this.api.post<any>(`/workout-plans/${planId}/assign-to/${workoutId}`, {}).pipe(
      catchError(err => {
        this._error.set(err.message);
        throw err;
      })
    );
  }

  private mapWorkoutApiResponse(w: WorkoutApiResponse): Workout {
    return {
      id: String(w.id),
      name: w.name,
      description: w.description,
      category: (w.category?.toLowerCase() as WorkoutCategory) || 'full-body',
      difficulty: (w.difficulty?.toLowerCase() as Difficulty) || 'intermediate',
      duration: w.duration || 0,
      caloriesBurned: w.caloriesBurn,
      exercises: [],
      imageUrl: w.imageUrl,
      rating: w.rating,
      isPremium: w.isPremium,
      workoutPlanId: w.workoutPlanId,
      videoUrl: w.videoUrl
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

function of<T>(value: T): Observable<T> {
  return new Observable(subscriber => {
    subscriber.next(value);
    subscriber.complete();
  });
}