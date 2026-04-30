import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActiveSessionComponent } from './active-session.component';
import { WorkoutService } from '../../../../core/services/workout.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

const mockSession = {
  workoutName: 'Upper Body Blast',
  difficulty: 'Hard',
  exercises: [
    { name: 'Bench Press', sets: 4, reps: 10, restTime: 60, completed: false },
    { name: 'Pull Ups', sets: 3, reps: 8, restTime: 90, completed: false },
    { name: 'Shoulder Press', sets: 3, reps: 12, restTime: 60, completed: false }
  ]
};

function freshSession() {
  return JSON.parse(JSON.stringify(mockSession));
}

describe('ActiveSessionComponent', () => {
  let component: ActiveSessionComponent;
  let fixture: ComponentFixture<ActiveSessionComponent>;
  let workoutServiceSpy: jasmine.SpyObj<WorkoutService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeSpy: any;

  beforeEach(async () => {
    routeSpy = { snapshot: { paramMap: { get: () => 'session-123' } } };
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const wSpy = jasmine.createSpyObj('WorkoutService', ['getWorkoutSession', 'completeWorkoutSession']);
    wSpy.getWorkoutSession.and.returnValue(of({ data: freshSession() }));
    wSpy.completeWorkoutSession.and.returnValue(of({ success: true }));

    TestBed.configureTestingModule({
      imports: [ActiveSessionComponent],
      providers: [
        provideRouter([]),
        { provide: WorkoutService, useValue: wSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveSessionComponent);
    component = fixture.componentInstance;
    workoutServiceSpy = TestBed.inject(WorkoutService) as jasmine.SpyObj<WorkoutService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set session ID from route param on init', () => {
    expect(component.sessionId()).toBe('session-123');
  });

  it('should fetch session data on init', () => {
    expect(workoutServiceSpy.getWorkoutSession).toHaveBeenCalledWith('session-123');
  });

  it('should populate session signal with API response', () => {
    expect(component.session().workoutName).toBe('Upper Body Blast');
  });

  it('should stop loading after session is loaded', () => {
    expect(component.loading()).toBeFalse();
  });

  it('should display workout title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.workout-title')?.textContent?.trim()).toBe('Upper Body Blast');
  });

  it('should display difficulty badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badge = compiled.querySelector('.difficulty-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe('Hard');
  });

  it('should display exercise list', () => {
    const cards = fixture.debugElement.queryAll(By.css('.exercise-card'));
    expect(cards.length).toBe(3);
  });

  it('should display exercise names', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const names = compiled.querySelectorAll('.exercise-name');
    expect(names[0].textContent?.trim()).toBe('Bench Press');
    expect(names[1].textContent?.trim()).toBe('Pull Ups');
    expect(names[2].textContent?.trim()).toBe('Shoulder Press');
  });

  it('should display exercise details (sets x reps)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const details = compiled.querySelectorAll('.exercise-details .detail-item');
    expect(details[0].textContent).toContain('4 Sets');
    expect(details[0].textContent).toContain('10');
  });

  it('should display rest time for each exercise', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const restItems = compiled.querySelectorAll('.exercise-details .detail-item');
    expect(restItems[restItems.length - 1].textContent).toContain('60s Rest');
  });

  it('should display completed count correctly', () => {
    component.session.set(freshSession());
    fixture.detectChanges();
    expect(component.getCompletedCount()).toBe(0);
  });

  it('should count completed exercises', () => {
    const session = component.session();
    session.exercises[0].completed = true;
    session.exercises[1].completed = true;
    component.session.set(session);
    fixture.detectChanges();
    expect(component.getCompletedCount()).toBe(2);
  });

  it('should return 0 completed when no exercises', () => {
    component.session.set({ ...mockSession, exercises: [] });
    fixture.detectChanges();
    expect(component.getCompletedCount()).toBe(0);
  });

  it('should return 0 completed when session is null', () => {
    component.session.set(null);
    fixture.detectChanges();
    expect(component.getCompletedCount()).toBe(0);
  });

  it('should calculate progress percentage correctly', () => {
    const session = freshSession();
    session.exercises[0].completed = true;
    component.session.set(session);
    fixture.detectChanges();
    expect(component.getProgressPercentage()).toBeCloseTo(33.33, 1);
  });

  it('should return 0 progress when no exercises', () => {
    component.session.set({ ...mockSession, exercises: [] });
    fixture.detectChanges();
    expect(component.getProgressPercentage()).toBe(0);
  });

  it('should return correct difficulty class', () => {
    expect(component.getDifficultyClass()).toBe('hard');
  });

  it('should return beginner difficulty class', () => {
    component.session.set({ ...mockSession, difficulty: 'Beginner' });
    fixture.detectChanges();
    expect(component.getDifficultyClass()).toBe('beginner');
  });

  it('should return easy difficulty class', () => {
    component.session.set({ ...mockSession, difficulty: 'Easy' });
    fixture.detectChanges();
    expect(component.getDifficultyClass()).toBe('easy');
  });

  it('should return medium difficulty class', () => {
    component.session.set({ ...mockSession, difficulty: 'Medium' });
    fixture.detectChanges();
    expect(component.getDifficultyClass()).toBe('medium');
  });

  it('should toggle exercise completion', () => {
    const exercise = { name: 'Test', sets: 3, reps: 10, restTime: 60, completed: false };
    component.toggleExerciseComplete(exercise);
    expect(exercise.completed).toBeTrue();
    component.toggleExerciseComplete(exercise);
    expect(exercise.completed).toBeFalse();
  });

  it('should start timer on init', () => {
    expect(component.timerInterval).toBeTruthy();
  });

  it('should update formatted time correctly', () => {
    component.elapsedSeconds.set(65);
    component.updateFormattedTime();
    expect(component.formattedTime()).toBe('01:05');
  });

  it('should format time with leading zeros', () => {
    component.elapsedSeconds.set(5);
    component.updateFormattedTime();
    expect(component.formattedTime()).toBe('00:05');
  });

  it('should stop timer on destroy', () => {
    spyOn(window, 'clearInterval');
    component.ngOnDestroy();
    expect(clearInterval).toHaveBeenCalled();
  });

  it('should complete workout and navigate to dashboard', fakeAsync(() => {
    component.elapsedSeconds.set(65);
    component.finishWorkout();
    tick(100);
    expect(workoutServiceSpy.completeWorkoutSession).toHaveBeenCalledWith('session-123', 1, jasmine.any(Number));
    tick(1600);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard'], jasmine.any(Object));
  }));

  it('should handle complete session error', fakeAsync(() => {
    workoutServiceSpy.completeWorkoutSession.and.returnValue(throwError(() => new Error('Failed')));
    component.elapsedSeconds.set(65);
    component.finishWorkout();
    tick(100);
    expect(component.error()).toBe('Failed');
    expect(component.loading()).toBeFalse();
  }));

  it('should display error when session ID is missing', () => {
    routeSpy = { snapshot: { paramMap: { get: () => null } } };
    TestBed.resetTestingModule();
    const wSpy = jasmine.createSpyObj('WorkoutService', ['getWorkoutSession', 'completeWorkoutSession']);

    TestBed.configureTestingModule({
      imports: [ActiveSessionComponent],
      providers: [
        provideRouter([]),
        { provide: WorkoutService, useValue: wSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    const fixture2 = TestBed.createComponent(ActiveSessionComponent);
    fixture2.detectChanges();
    expect(fixture2.componentInstance.error()).toBe('Invalid Session ID');
    expect(fixture2.componentInstance.loading()).toBeFalse();
  });

  it('should display error state when session load fails', () => {
    workoutServiceSpy.getWorkoutSession.and.returnValue(throwError(() => new Error('Network error')));
    TestBed.resetTestingModule();
    const wSpy = jasmine.createSpyObj('WorkoutService', ['getWorkoutSession', 'completeWorkoutSession']);
    wSpy.getWorkoutSession.and.returnValue(throwError(() => new Error('Network error')));

    TestBed.configureTestingModule({
      imports: [ActiveSessionComponent],
      providers: [
        provideRouter([]),
        { provide: WorkoutService, useValue: wSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    const fixture2 = TestBed.createComponent(ActiveSessionComponent);
    fixture2.detectChanges();
    expect(fixture2.componentInstance.error()).toBe('Network error');
  });

  it('should display loading spinner when loading', () => {
    component.loading.set(true);
    component.session.set(null);
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('.loader'));
    expect(spinner).toBeTruthy();
  });

  it('should display exercise numbers', () => {
    component.session.set(freshSession());
    fixture.detectChanges();
    const numbers = fixture.debugElement.queryAll(By.css('.exercise-number'));
    expect(numbers[0].nativeElement.textContent?.trim()).toBe('1');
    expect(numbers[1].nativeElement.textContent?.trim()).toBe('2');
    expect(numbers[2].nativeElement.textContent?.trim()).toBe('3');
  });

  it('should display action bar with complete and abort buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const completeBtn = compiled.querySelector('.btn-complete');
    const abortBtn = compiled.querySelector('.btn-abort');
    expect(completeBtn).toBeTruthy();
    expect(abortBtn).toBeTruthy();
  });

  it('should show completed checkmark on exercise when completed', () => {
    const session = component.session();
    session.exercises[0].completed = true;
    component.session.set(session);
    fixture.detectChanges();
    const firstCard = fixture.debugElement.query(By.css('.exercise-card'));
    const checkIcon = firstCard.query(By.css('.check-icon'));
    expect(checkIcon).toBeTruthy();
  });
});
