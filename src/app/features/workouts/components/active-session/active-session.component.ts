import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../../../core/services/workout.service';

@Component({
  selector: 'app-active-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-session.component.html',
  styleUrl: './active-session.component.scss'
})
export class ActiveSessionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);

  sessionId = signal<string>('');
  session = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Timer state
  timerInterval: any;
  elapsedSeconds = signal<number>(0);
  formattedTime = signal<string>('00:00');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sessionId.set(id);
      this.loadSession(id);
      this.startTimer();
    } else {
      this.error.set('Invalid Session ID');
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  loadSession(id: string) {
    this.workoutService.getWorkoutSession(id).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.session.set(res.data);
        } else {
          this.error.set('Failed to load session data.');
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Failed to load session');
        this.loading.set(false);
      }
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(s => s + 1);
      this.updateFormattedTime();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  updateFormattedTime() {
    const totalSeconds = this.elapsedSeconds();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    this.formattedTime.set(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }

  getCompletedCount(): number {
    if (!this.session()?.exercises) return 0;
    return this.session().exercises.filter((e: any) => e.completed).length;
  }

  getProgressPercentage(): number {
    if (!this.session()?.exercises || this.session().exercises.length === 0) return 0;
    const completed = this.getCompletedCount();
    return (completed / this.session().exercises.length) * 100;
  }

  getDifficultyClass(): string {
    const difficulty = this.session()?.difficulty?.toLowerCase();
    switch (difficulty) {
      case 'beginner': return 'beginner';
      case 'easy': return 'easy';
      case 'medium': return 'medium';
      case 'hard': return 'hard';
      default: return 'easy';
    }
  }

  toggleExerciseComplete(exercise: any) {
    exercise.completed = !exercise.completed;
  }

  finishWorkout() {
    this.stopTimer();
    this.loading.set(true);

    const durationMinutes = Math.max(1, Math.floor(this.elapsedSeconds() / 60));
    
    // Naive calorie calculation based on duration and difficulty
    const difficultyMultiplier = this.session()?.difficulty === 'Hard' ? 10 : (this.session()?.difficulty === 'Easy' ? 5 : 7);
    const caloriesBurned = durationMinutes * difficultyMultiplier;

    this.workoutService.completeWorkoutSession(this.sessionId(), durationMinutes, caloriesBurned).subscribe({
      next: () => {
        // Wait for RabbitMQ event to be processed by ProgressTrackingService
        setTimeout(() => {
          this.loading.set(false);
          this.router.navigate(['/dashboard'], { queryParams: { refresh: new Date().getTime() } });
        }, 1500);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Failed to complete session');
        this.loading.set(false);
      }
    });
  }
}
