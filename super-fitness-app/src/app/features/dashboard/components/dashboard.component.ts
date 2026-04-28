import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProgressService } from '../../../core/services/progress.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly progressService = inject(ProgressService);

  readonly user = this.authService.currentUser;

  readonly stats = signal({
    totalWorkouts: 0,
    totalCalories: 0,
    currentStreak: 0,
    weeklyWorkouts: 0
  });

  readonly recentWorkouts = this.progressService.recentWorkouts;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.progressService.getProgressStats().subscribe(data => {
      if (data) {
        this.stats.set({
          totalWorkouts: data.totalWorkouts,
          totalCalories: data.totalCalories,
          currentStreak: data.currentStreak,
          weeklyWorkouts: data.weeklyWorkouts
        });
      }
    });
  }

  getInitials(): string {
    const user = this.user();
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user?.userName?.[0]?.toUpperCase() || 'U';
  }
}