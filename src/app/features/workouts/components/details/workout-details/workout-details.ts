import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../../../../core/services/workout.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-workout-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-details.html',
  styleUrl: './workout-details.scss',
})
export class WorkoutDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);
  private readonly authService = inject(AuthService);
  readonly location = inject(Location);

  readonly workout = this.workoutService.currentWorkout;
  readonly loading = this.workoutService.loading;

  selectedDifficulty = signal<string>('Medium');
  plannedDuration = signal<number>(60);
  isStarting = signal<boolean>(false);
  startSuccess = signal<boolean>(false);
  startError = signal<string | null>(null);

  difficulties = ['Beginner', 'Easy', 'Medium', 'Hard', 'Advanced'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workoutService.getWorkoutById(id).subscribe();
    }
  }

  goBack() {
    this.location.back();
  }

  openVideo() {
    const videoUrl = this.workout()?.videoUrl;
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  }

  startWorkout() {
    const workoutId = this.workout()?.id;
    if (!workoutId) return;

    if (!this.authService.isAuthenticated()) {
      this.startError.set('Please login to start workout');
      return;
    }

    this.isStarting.set(true);
    this.startError.set(null);
    this.workoutService.startWorkout(
      Number(workoutId),
      this.selectedDifficulty(),
      this.plannedDuration()
    ).subscribe({
      next: (response) => {
        this.isStarting.set(false);
        this.startSuccess.set(true);
        const sessionId = response?.data?.sessionId;
        if (sessionId) {
            this.router.navigate(['/workouts/session', sessionId]);
        } else {
            setTimeout(() => this.startSuccess.set(false), 3000);
        }
      },
      error: (err) => {
        this.isStarting.set(false);
        this.startError.set(err?.error?.message || err?.message || 'Failed to start workout');
      }
    });
  }
}
