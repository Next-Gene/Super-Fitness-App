import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { WorkoutDetailsComponent } from './workout-details';
import { WorkoutService } from '../../../../../core/services/workout.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Workout } from '../../../../../core/models';
import { By } from '@angular/platform-browser';

const mockWorkout: Workout = {
  id: '1', name: 'Upper Body Power', description: 'Intense upper body session',
  category: 'strength', difficulty: 'advanced', duration: 60, caloriesBurned: 500,
  exercises: [
    { id: 'e1', name: 'Bench Press', description: 'Chest exercise', sets: 4, reps: 10, duration: 0, restTime: 60, muscleGroup: 'chest', equipment: ['barbell'] },
    { id: 'e2', name: 'Pull Ups', description: 'Back exercise', sets: 3, reps: 8, duration: 0, restTime: 90, muscleGroup: 'back', equipment: ['pullup bar'] }
  ],
  imageUrl: '/img/upper.jpg', rating: 4.5, isPremium: false,
  videoUrl: 'https://example.com/video', workoutPlanId: 1
};

describe('WorkoutDetailsComponent', () => {
  let component: WorkoutDetailsComponent;
  let fixture: ComponentFixture<WorkoutDetailsComponent>;
  let workoutServiceSpy: jasmine.SpyObj<WorkoutService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: any;

  beforeEach(async () => {
    routeSpy = { snapshot: { paramMap: { get: () => '1' } } };
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const wSpy = jasmine.createSpyObj('WorkoutService', ['getWorkoutById', 'startWorkout'], {
      currentWorkout: signal(mockWorkout),
      loading: signal(false)
    });
    const aSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    wSpy.getWorkoutById.and.returnValue(of(mockWorkout));
    wSpy.startWorkout.and.returnValue(of({ data: { sessionId: 'session-123' } }));
    aSpy.isAuthenticated.and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [WorkoutDetailsComponent, FormsModule],
      providers: [
        provideRouter([]),
        { provide: WorkoutService, useValue: wSpy },
        { provide: AuthService, useValue: aSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutDetailsComponent);
    component = fixture.componentInstance;
    workoutServiceSpy = TestBed.inject(WorkoutService) as jasmine.SpyObj<WorkoutService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch workout details on init', () => {
    expect(workoutServiceSpy.getWorkoutById).toHaveBeenCalledWith('1');
  });

  it('should populate workout signal', () => {
    expect(component.workout()?.name).toBe('Upper Body Power');
    expect(component.workout()?.description).toBe('Intense upper body session');
  });

  it('should display workout name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.header-content h1')?.textContent?.trim()).toBe('Upper Body Power');
  });

  it('should display workout description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.description')?.textContent?.trim()).toBe('Intense upper body session');
  });

  it('should display workout category badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.workout-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe('strength');
  });

  it('should display difficulty', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const difficultyEl = compiled.querySelector('.meta-item .value.difficulty');
    expect(difficultyEl?.textContent?.trim()).toBe('advanced');
  });

  it('should display duration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const metaValues = compiled.querySelectorAll('.meta-item .value');
    expect(metaValues[1].textContent?.trim()).toBe('60 mins');
  });

  it('should display calories burned', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const metaValues = compiled.querySelectorAll('.meta-item .value');
    expect(metaValues[2].textContent?.trim()).toBe('500 kcal');
  });

  it('should display exercises list', () => {
    const cards = fixture.debugElement.queryAll(By.css('.exercise-card'));
    expect(cards.length).toBe(2);
  });

  it('should display exercise names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const names = compiled.querySelectorAll('.ex-details h3');
    expect(names[0].textContent?.trim()).toBe('Bench Press');
    expect(names[1].textContent?.trim()).toBe('Pull Ups');
  });

  it('should display exercise sets', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stats = compiled.querySelectorAll('.ex-stats .stat');
    expect(stats[0].textContent).toContain('4 Sets');
  });

  it('should display exercise reps', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stats = compiled.querySelectorAll('.ex-stats .stat');
    expect(stats[1].textContent).toContain('10 Reps');
  });

  it('should display exercise rest time', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stats = compiled.querySelectorAll('.ex-stats .stat');
    expect(stats[2].textContent).toContain('60s Rest');
  });

  it('should display video link when videoUrl exists', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const videoLink = compiled.querySelector('.video-link');
    expect(videoLink).toBeTruthy();
    expect(videoLink?.textContent).toContain('Watch Workout Video');
  });

  it('should not display video section when no videoUrl', () => {
    (workoutServiceSpy as any).currentWorkout.set({ ...mockWorkout, videoUrl: undefined });
    fixture.detectChanges();
    const videoSection = fixture.debugElement.query(By.css('.video-section'));
    expect(videoSection).toBeFalsy();
  });

  it('should open video in new tab when clicked', () => {
    spyOn(window, 'open');
    component.openVideo();
    expect(window.open).toHaveBeenCalledWith('https://example.com/video', '_blank');
  });

  it('should display difficulty selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('select');
    expect(select).toBeTruthy();
  });

  it('should display duration input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('input[type="number"]');
    expect(input).toBeTruthy();
  });

  it('should display start workout button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('.btn-start');
    expect(btn).toBeTruthy();
    expect(btn?.textContent?.trim()).toBe('Start Workout');
  });

  it('should start workout when authenticated', () => {
    component.startWorkout();
    expect(workoutServiceSpy.startWorkout).toHaveBeenCalledWith(1, 'Medium', 60);
  });

  it('should navigate to session page after starting workout', fakeAsync(() => {
    component.startWorkout();
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/workouts/session', 'session-123']);
  }));

  it('should not start workout when not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    component.startWorkout();
    expect(workoutServiceSpy.startWorkout).not.toHaveBeenCalled();
    expect(component.startError()).toBe('Please login to start workout');
  });

  it('should not start workout when workout ID is missing', () => {
    (workoutServiceSpy as any).currentWorkout.set(null);
    fixture.detectChanges();
    component.startWorkout();
    expect(workoutServiceSpy.startWorkout).not.toHaveBeenCalled();
  });

  it('should handle start workout error', () => {
    workoutServiceSpy.startWorkout.and.returnValue(throwError(() => ({
      error: { message: 'Session conflict' },
      message: 'HTTP Error'
    })));
    component.startWorkout();
    expect(component.startError()).toBe('Session conflict');
  });

  it('should set starting state during workout start', () => {
    const startSubject = new Subject();
    workoutServiceSpy.startWorkout.and.returnValue(startSubject.asObservable());
    component.startWorkout();
    expect(component.isStarting()).toBeTrue();
    startSubject.next({ data: { sessionId: 's1' } });
  });

  it('should display workout plan section when workoutPlanId exists', () => {
    const planSection = fixture.debugElement.query(By.css('.workout-plan-section'));
    expect(planSection).toBeTruthy();
  });

  it('should not display workout plan when no workoutPlanId', () => {
    (workoutServiceSpy as any).currentWorkout.set({ ...mockWorkout, workoutPlanId: undefined });
    fixture.detectChanges();
    const planSection = fixture.debugElement.query(By.css('.workout-plan-section'));
    expect(planSection).toBeFalsy();
  });

  it('should display plan number', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const planTitle = compiled.querySelector('.plan-details h4');
    expect(planTitle?.textContent?.trim()).toBe('Plan #1');
  });

  it('should go back when back button is clicked', () => {
    const backBtn = fixture.debugElement.query(By.css('.back-btn'));
    backBtn.triggerEventHandler('click', null);
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should display loading spinner when loading', () => {
    (workoutServiceSpy as any).loading.set(true);
    (workoutServiceSpy as any).currentWorkout.set(null);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('should display empty state when workout not found', () => {
    (workoutServiceSpy as any).loading.set(false);
    (workoutServiceSpy as any).currentWorkout.set(null);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.querySelector('p')?.textContent?.trim()).toContain('Workout not found');
  });

  it('should allow changing selected difficulty', () => {
    component.selectedDifficulty.set('Hard');
    expect(component.selectedDifficulty()).toBe('Hard');
  });

  it('should allow changing planned duration', () => {
    component.plannedDuration.set(90);
    expect(component.plannedDuration()).toBe(90);
  });

  it('should have difficulty options available', () => {
    expect(component.difficulties).toEqual(['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced']);
  });

  it('should display exercises section when exercises exist', () => {
    const exercisesSection = fixture.debugElement.query(By.css('.exercises-section'));
    expect(exercisesSection).toBeTruthy();
    expect(exercisesSection.nativeElement.querySelector('h2')?.textContent?.trim()).toBe('Exercises');
  });

  it('should not display exercises section when no exercises', () => {
    (workoutServiceSpy as any).currentWorkout.set({ ...mockWorkout, exercises: [] });
    fixture.detectChanges();
    const exercisesSection = fixture.debugElement.query(By.css('.exercises-section'));
    expect(exercisesSection).toBeFalsy();
  });

  it('should display exercise numbers', () => {
    const numbers = fixture.debugElement.queryAll(By.css('.ex-number'));
    expect(numbers[0].nativeElement.textContent?.trim()).toBe('1');
    expect(numbers[1].nativeElement.textContent?.trim()).toBe('2');
  });

  it('should not fetch details when route param is missing', () => {
    routeSpy = { snapshot: { paramMap: { get: () => null } } };
    TestBed.resetTestingModule();

    const wSpy2 = jasmine.createSpyObj('WorkoutService', ['getWorkoutById', 'startWorkout'], {
      currentWorkout: signal(null), loading: signal(false)
    });
    const aSpy2 = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    aSpy2.isAuthenticated.and.returnValue(true);

    TestBed.configureTestingModule({
      imports: [WorkoutDetailsComponent, FormsModule],
      providers: [
        provideRouter([]),
        { provide: WorkoutService, useValue: wSpy2 },
        { provide: AuthService, useValue: aSpy2 },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    const fixture2 = TestBed.createComponent(WorkoutDetailsComponent);
    fixture2.detectChanges();

    expect(wSpy2.getWorkoutById).not.toHaveBeenCalled();
  });

  it('should display starting state text on button', () => {
    component.isStarting.set(true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-start');
    expect(btn.textContent?.trim()).toBe('Starting...');
  });

  it('should display success message after starting', fakeAsync(() => {
    component.startWorkout();
    tick();
    expect(component.startSuccess()).toBeTrue();
  }));
});
