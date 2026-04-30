import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { WorkoutService } from '../../../core/services/workout.service';
import { ProgressService } from '../../../core/services/progress.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let workoutServiceSpy: jasmine.SpyObj<WorkoutService>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;

  beforeEach(async () => {
    const wSpy = jasmine.createSpyObj('WorkoutService', ['getWorkouts', 'getWorkoutById'], {
      workouts: signal([]),
      loading: signal(false)
    });
    const pSpy = jasmine.createSpyObj('ProgressService', ['getProgressStats', 'getProgressHistory'], {
      stats: signal({ totalWorkouts: 10, totalCalories: 5000, currentStreak: 5, weeklyWorkouts: 2 }),
      recentWorkouts: signal([]),
      loading: signal(false)
    });
    const aSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: signal({ firstName: 'John', lastName: 'Doe', userName: 'jdoe' })
    });

    wSpy.getWorkouts.and.returnValue(of([]));
    wSpy.getWorkoutById.and.returnValue(of({ id: '1', name: 'Test' }));
    pSpy.getProgressStats.and.returnValue(of({
      totalWorkouts: 10,
      totalCalories: 5000,
      currentStreak: 5,
      longestStreak: 5,
      weeklyWorkouts: 2,
      monthlyWorkouts: 8,
      averageDuration: 30
    }));
    pSpy.getProgressHistory.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: WorkoutService, useValue: wSpy },
        { provide: ProgressService, useValue: pSpy },
        { provide: AuthService, useValue: aSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    workoutServiceSpy = TestBed.inject(WorkoutService) as jasmine.SpyObj<WorkoutService>;
    progressServiceSpy = TestBed.inject(ProgressService) as jasmine.SpyObj<ProgressService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user greeting', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.welcome-text h1')?.textContent).toContain('John');
  });

  it('should display correct stats from progress service', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = compiled.querySelectorAll('.stat-value');
    expect(statValues[0].textContent).toContain('5,000'); // Total Calories (first card)
    expect(statValues[1].textContent).toContain('10'); // Total Workouts (second card)
  });

  it('should show empty state when no workouts available', () => {
    (workoutServiceSpy as any).workouts.set([]);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.no-workouts');
    expect(emptyState).toBeTruthy();
  });
});
