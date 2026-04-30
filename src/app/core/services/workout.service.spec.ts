import { TestBed } from '@angular/core/testing';
import { WorkoutService, PaginatedResponse, WorkoutApiResponse } from './workout.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

describe('WorkoutService', () => {
  let service: WorkoutService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockWorkoutResponse: WorkoutApiResponse = {
    id: 1,
    name: 'Test Workout',
    description: 'Test Description',
    category: 'Strength',
    difficulty: 'Intermediate',
    duration: 30,
    caloriesBurn: 300,
    rating: 4.5,
    isPremium: false
  };

  const mockPaginatedResponse: PaginatedResponse<WorkoutApiResponse> = {
    isSuccess: true,
    data: {
      items: [mockWorkoutResponse],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    }
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: signal({ id: '1', firstName: 'Test' })
    });

    TestBed.configureTestingModule({
      providers: [
        WorkoutService,
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(WorkoutService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getWorkouts', () => {
    it('should fetch and map workouts successfully', () => {
      apiServiceSpy.get.and.returnValue(of(mockPaginatedResponse));

      service.getWorkouts().subscribe(workouts => {
        expect(workouts.length).toBe(1);
        expect(workouts[0].name).toBe('Test Workout');
        expect(service.pagination().totalPages).toBe(1);
      });

      expect(apiServiceSpy.get).toHaveBeenCalledWith('/workouts', jasmine.any(Object));
    });

    it('should handle errors correctly', () => {
      const errorMsg = 'Failed to fetch workouts';
      apiServiceSpy.get.and.returnValue(throwError(() => new Error(errorMsg)));

      service.getWorkouts().subscribe({
        error: (err) => {
          expect(service.error()).toBe(errorMsg);
          expect(service.loading()).toBeFalse();
        }
      });
    });
  });

  describe('Workout Session', () => {
    it('should start a workout session', () => {
      apiServiceSpy.post.and.returnValue(of({ isSuccess: true, data: { sessionId: 123 } }));

      service.startWorkout(1).subscribe(res => {
        expect(res).toBeTruthy();
      });

      expect(apiServiceSpy.post).toHaveBeenCalledWith('/workouts/1/start', jasmine.any(Object));
    });

    it('should complete a workout session', () => {
      apiServiceSpy.post.and.returnValue(of({ isSuccess: true }));

      service.completeWorkoutSession(123, 45, 400).subscribe(res => {
        expect(res).toBeTruthy();
      });

      expect(apiServiceSpy.post).toHaveBeenCalledWith('/workouts/session/123/complete', {
        durationMinutes: 45,
        caloriesBurned: 400
      });
    });
  });
});
