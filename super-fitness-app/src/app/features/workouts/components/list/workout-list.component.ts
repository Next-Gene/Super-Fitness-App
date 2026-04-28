import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../../../core/services/workout.service';
import { Workout, WorkoutCategory, Difficulty } from '../../../../core/models';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './workout-list.component.html',
  styleUrl: './workout-list.component.scss'
})
export class WorkoutListComponent implements OnInit, OnDestroy {
  readonly workoutService = inject(WorkoutService);

  readonly workouts = this.workoutService.workouts;
  readonly pagination = this.workoutService.pagination;
  readonly isLoading = this.workoutService.loading;

  searchQuery = '';
  selectedCategory: WorkoutCategory | '' = '';
  selectedDifficulty: Difficulty | '' = '';

  showCreateForm = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  createSuccess = signal<boolean>(false);

  newWorkout = signal({
    name: '',
    description: '',
    caloriesBurn: 500,
    isPremium: false,
    rating: 4.5,
    durationInMinutes: 60,
    difficulty: 'Medium',
    category: 'Strength',
    workoutPlanId: 1
  });

  readonly categories: { value: string; label: string }[] = [
    { value: '', label: 'All Categories' },
    { value: 'strength', label: 'Strength' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'hiit', label: 'HIIT' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'balance', label: 'Balance' },
    { value: 'recovery', label: 'Recovery' }
  ];

  readonly difficulties = ['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced'];

  private readonly filteredWorkouts = signal<Workout[]>([]);

  get displayWorkouts(): Workout[] {
    return this.filteredWorkouts().length > 0 ? this.filteredWorkouts() : this.workouts();
  }

  ngOnInit(): void {
    this.loadWorkouts();
  }

  loadWorkouts(page: number = 1): void {
    this.workoutService.getWorkouts(
      this.selectedCategory || undefined,
      this.selectedDifficulty || undefined,
      page
    ).subscribe();
  }

  nextPage(): void {
    const pageState = this.pagination();
    if (pageState.hasNext) {
      this.loadWorkouts(pageState.page + 1);
    }
  }

  prevPage(): void {
    const pageState = this.pagination();
    if (pageState.hasPrevious) {
      this.loadWorkouts(pageState.page - 1);
    }
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase();
    if (!query) {
      this.filteredWorkouts.set([]);
      this.loadWorkouts();
    } else {
      const filtered = this.workouts().filter(w => 
        w.name.toLowerCase().includes(query) || 
        w.description.toLowerCase().includes(query)
      );
      this.filteredWorkouts.set(filtered);
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v);
  }

  createWorkout(): void {
    const data = this.newWorkout();
    if (!data.name || !data.category) return;

    this.isCreating.set(true);
    this.workoutService.createWorkout(data).subscribe({
      next: () => {
        this.isCreating.set(false);
        this.createSuccess.set(true);
        this.showCreateForm.set(false);
        this.loadWorkouts();
        setTimeout(() => this.createSuccess.set(false), 3000);
      },
      error: () => {
        this.isCreating.set(false);
      }
    });
  }

  ngOnDestroy(): void {}
}