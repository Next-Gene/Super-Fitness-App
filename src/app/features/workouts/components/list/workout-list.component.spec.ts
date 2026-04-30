import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../../../../core/services/workout.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Workout } from '../../../../core/models';
import { By } from '@angular/platform-browser';

const mockWorkouts: Workout[] = [
  {
    id: '1', name: 'Upper Body Power', description: 'Intense upper body session',
    category: 'strength', difficulty: 'advanced', duration: 60, caloriesBurned: 500,
    exercises: [], imageUrl: '/img/upper.jpg', rating: 4.5, isPremium: false
  },
  {
    id: '2', name: 'Morning Cardio', description: 'Light cardio to start the day',
    category: 'cardio', difficulty: 'beginner', duration: 30, caloriesBurned: 250,
    exercises: [], imageUrl: '/img/cardio.jpg', rating: 4.0, isPremium: false,
    videoUrl: 'https://example.com/video'
  },
  {
    id: '3', name: 'HIIT Blast', description: 'High intensity interval training',
    category: 'hiit', difficulty: 'advanced', duration: 45, caloriesBurned: 600,
    exercises: [], imageUrl: '/img/hiit.jpg', rating: 5.0, isPremium: true
  }
];

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;
  let workoutServiceSpy: jasmine.SpyObj<WorkoutService>;

  beforeEach(async () => {
    const wSpy = jasmine.createSpyObj('WorkoutService', ['getWorkouts', 'createWorkout'], {
      workouts: signal(mockWorkouts),
      loading: signal(false),
      pagination: signal({ page: 1, totalPages: 3, hasNext: true, hasPrevious: false })
    });

    wSpy.getWorkouts.and.returnValue(of(mockWorkouts));
    wSpy.createWorkout.and.returnValue(of({ success: true, data: { id: '4' } }));

    await TestBed.configureTestingModule({
      imports: [WorkoutListComponent, FormsModule],
      providers: [
        provideRouter([]),
        { provide: WorkoutService, useValue: wSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutListComponent);
    component = fixture.componentInstance;
    workoutServiceSpy = TestBed.inject(WorkoutService) as jasmine.SpyObj<WorkoutService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load workouts on init', () => {
    expect(workoutServiceSpy.getWorkouts).toHaveBeenCalled();
  });

  it('should display page header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-header h1')?.textContent?.trim()).toBe('Workouts');
  });

  it('should display workout cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('.workout-card'));
    expect(cards.length).toBe(3);
  });

  it('should display workout names in cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const names = compiled.querySelectorAll('.workout-body h3');
    expect(names[0].textContent?.trim()).toBe('Upper Body Power');
    expect(names[1].textContent?.trim()).toBe('Morning Cardio');
    expect(names[2].textContent?.trim()).toBe('HIIT Blast');
  });

  it('should display workout descriptions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const descs = compiled.querySelectorAll('.workout-body p');
    expect(descs[0].textContent?.trim()).toBe('Intense upper body session');
  });

  it('should display difficulty badges', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const badges = compiled.querySelectorAll('.difficulty');
    expect(badges[0].textContent?.trim()).toBe('advanced');
  });

  it('should display duration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const durations = compiled.querySelectorAll('.duration');
    expect(durations[0].textContent).toContain('60');
  });

  it('should display category badges', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categoryBadges = compiled.querySelectorAll('.category-badge');
    expect(categoryBadges[0].textContent?.trim()).toBe('strength');
  });

  it('should have create workout button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const btn = compiled.querySelector('.add-new-btn');
    expect(btn).toBeTruthy();
    expect(btn?.textContent?.trim()).toContain('Create Workout');
  });

  it('should toggle create form visibility', () => {
    expect(component.showCreateForm()).toBeFalse();
    component.toggleCreateForm();
    expect(component.showCreateForm()).toBeTrue();
    component.toggleCreateForm();
    expect(component.showCreateForm()).toBeFalse();
  });

  it('should display create form when toggled', () => {
    component.toggleCreateForm();
    fixture.detectChanges();
    const formContainer = fixture.debugElement.query(By.css('.create-form-container'));
    expect(formContainer).toBeTruthy();
  });

  it('should hide filters when create form is visible', () => {
    component.toggleCreateForm();
    fixture.detectChanges();
    const filtersBar = fixture.debugElement.query(By.css('.filters-bar'));
    expect(filtersBar).toBeFalsy();
  });

  it('should show filters when create form is hidden', () => {
    const filtersBar = fixture.debugElement.query(By.css('.filters-bar'));
    expect(filtersBar).toBeTruthy();
  });

  it('should filter workouts by search query', () => {
    component.searchQuery = 'cardio';
    component.onSearch();
    fixture.detectChanges();
    expect(component.displayWorkouts.length).toBe(1);
    expect(component.displayWorkouts[0].name).toBe('Morning Cardio');
  });

  it('should clear filter when search query is empty', () => {
    component.searchQuery = 'cardio';
    component.onSearch();
    component.searchQuery = '';
    component.onSearch();
    expect(component.displayWorkouts.length).toBe(3);
  });

  it('should search by name and description', () => {
    component.searchQuery = 'intense';
    component.onSearch();
    expect(component.displayWorkouts.length).toBe(1);
    expect(component.displayWorkouts[0].name).toBe('Upper Body Power');
  });

  it('should load workouts when category filter changes', () => {
    component.selectedCategory = 'strength';
    component.loadWorkouts();
    expect(workoutServiceSpy.getWorkouts).toHaveBeenCalledWith('strength', undefined, 1);
  });

  it('should load workouts when difficulty filter changes', () => {
    component.selectedDifficulty = 'Hard' as any;
    component.loadWorkouts();
    expect(workoutServiceSpy.getWorkouts).toHaveBeenCalledWith(undefined, 'Hard', 1);
  });

  it('should go to next page when hasNext is true', () => {
    component.nextPage();
    expect(workoutServiceSpy.getWorkouts).toHaveBeenCalledWith(undefined, undefined, 2);
  });

  it('should not go to next page when no next page', () => {
    (workoutServiceSpy as any).pagination.set({ page: 3, totalPages: 3, hasNext: false, hasPrevious: true });
    fixture.detectChanges();
    component.nextPage();
    expect(workoutServiceSpy.getWorkouts).toHaveBeenCalledTimes(1);
  });

  it('should go to previous page when hasPrevious is true', () => {
    (workoutServiceSpy as any).pagination.set({ page: 2, totalPages: 3, hasNext: true, hasPrevious: true });
    fixture.detectChanges();
    component.prevPage();
    expect(workoutServiceSpy.getWorkouts).toHaveBeenCalledWith(undefined, undefined, 1);
  });

  it('should not go to previous page on first page', () => {
    component.prevPage();
    expect(workoutServiceSpy.getWorkouts).toHaveBeenCalledTimes(1);
  });

  it('should display pagination when totalPages > 1', () => {
    const pagination = fixture.debugElement.query(By.css('.pagination-controls'));
    expect(pagination).toBeTruthy();
  });

  it('should display current page info', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const pageInfo = compiled.querySelector('.page-info');
    expect(pageInfo?.textContent?.trim()).toContain('Page 1');
  });

  it('should create workout with valid data', fakeAsync(() => {
    component.toggleCreateForm();
    fixture.detectChanges();
    component.newWorkout.set({
      ...component.newWorkout(),
      name: 'New Workout',
      category: 'Strength',
      description: 'Test',
      difficulty: 'Medium',
      durationInMinutes: 30,
      caloriesBurn: 200,
      rating: 4.0,
      isPremium: false,
      workoutPlanId: 1
    });
    component.createWorkout();
    tick();
    expect(workoutServiceSpy.createWorkout).toHaveBeenCalled();
    expect(component.createSuccess()).toBeTrue();
  }));

  it('should not create workout without name', () => {
    component.newWorkout.set({
      ...component.newWorkout(),
      name: '',
      category: 'Strength'
    });
    component.createWorkout();
    expect(workoutServiceSpy.createWorkout).not.toHaveBeenCalled();
  });

  it('should not create workout without category', () => {
    component.newWorkout.set({
      ...component.newWorkout(),
      name: 'Test',
      category: ''
    });
    component.createWorkout();
    expect(workoutServiceSpy.createWorkout).not.toHaveBeenCalled();
  });

  it('should handle create workout error', fakeAsync(() => {
    workoutServiceSpy.createWorkout.and.returnValue(throwError(() => new Error('Failed')));
    component.toggleCreateForm();
    fixture.detectChanges();
    component.newWorkout.set({
      ...component.newWorkout(),
      name: 'New Workout',
      category: 'Strength'
    });
    component.createWorkout();
    tick();
    expect(component.isCreating()).toBeFalse();
  }));

  it('should show success message after creating workout', fakeAsync(() => {
    component.toggleCreateForm();
    fixture.detectChanges();
    component.newWorkout.set({
      ...component.newWorkout(),
      name: 'New Workout',
      category: 'Strength'
    });
    component.createWorkout();
    tick();
    expect(component.createSuccess()).toBeTrue();
  }));

  it('should auto-dismiss success message after 3 seconds', fakeAsync(() => {
    component.toggleCreateForm();
    fixture.detectChanges();
    component.newWorkout.set({
      ...component.newWorkout(),
      name: 'New Workout',
      category: 'Strength'
    });
    component.createWorkout();
    tick(2500);
    expect(component.createSuccess()).toBeTrue();
    tick(1000);
    expect(component.createSuccess()).toBeFalse();
  }));

  it('should open video URL in new tab', () => {
    spyOn(window, 'open');
    const event = { preventDefault: () => {}, stopPropagation: () => {} } as Event;
    component.openVideo(event, 'https://example.com');
    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('should not open video when URL is undefined', () => {
    spyOn(window, 'open');
    const event = { preventDefault: () => {}, stopPropagation: () => {} } as Event;
    component.openVideo(event, undefined);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should display play icon for workouts with video', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const playIcons = compiled.querySelectorAll('.play-icon');
    expect(playIcons.length).toBe(1);
  });

  it('should display empty state when service returns no workouts', () => {
    (workoutServiceSpy as any).workouts.set([]);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should have category filter options', () => {
    expect(component.categories.length).toBe(7);
    expect(component.categories[0].label).toBe('All Categories');
    expect(component.categories[1].label).toBe('Strength');
  });

  it('should have difficulty filter options', () => {
    expect(component.difficulties).toEqual(['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced']);
  });

  it('should display calorie stats on cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = compiled.querySelectorAll('.stat .value');
    expect(statValues[0].textContent?.trim()).toBe('500');
  });

  it('should display exercise count on cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = compiled.querySelectorAll('.stat .value');
    expect(statValues[1].textContent?.trim()).toBe('0');
  });

  it('should display View Details button on cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const startBtns = compiled.querySelectorAll('.start-btn');
    expect(startBtns.length).toBeGreaterThan(0);
    expect(startBtns[0].textContent?.trim()).toBe('View Details');
  });
});
