import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly user = this.authService.currentUser;

  readonly stats = signal({
    totalWorkouts: 12,
    totalCalories: 2400,
    currentStreak: 5,
    weeklyWorkouts: 4
  });

  readonly recentWorkouts = signal([
    { id: '1', name: 'Morning HIIT', duration: 30, calories: 350, category: 'hiit' },
    { id: '2', name: 'Full Body Strength', duration: 45, calories: 420, category: 'strength' },
    { id: '3', name: 'Cardio Blast', duration: 25, calories: 280, category: 'cardio' }
  ]);

  ngOnInit(): void {}

  getInitials(): string {
    const user = this.user();
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user?.userName?.[0]?.toUpperCase() || 'U';
  }
}