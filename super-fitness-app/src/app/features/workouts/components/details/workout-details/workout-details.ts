import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WorkoutService } from '../../../../../core/services/workout.service';

@Component({
  selector: 'app-workout-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './workout-details.html',
  styleUrl: './workout-details.scss',
})
export class WorkoutDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly workoutService = inject(WorkoutService);
  readonly location = inject(Location);

  readonly workout = this.workoutService.currentWorkout;
  readonly loading = this.workoutService.loading;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workoutService.getWorkoutById(id).subscribe();
    }
  }

  goBack() {
    this.location.back();
  }
}
