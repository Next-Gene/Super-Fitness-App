import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ProgressService } from '../../../core/services/progress.service';

interface WorkoutData {
  id?: string;
  name?: string;
  duration?: number;
  calories?: number;
  performedAt?: string;
  category?: string;
  imageUrl?: string;
  intensity?: string;
  performance?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly progressService = inject(ProgressService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  readonly user = this.authService.currentUser;

  readonly stats = signal({
    totalWorkouts: 0,
    totalCalories: 0,
    currentStreak: 0,
    weeklyWorkouts: 0
  });

  readonly recentWorkouts = signal<WorkoutData[]>([]);
  readonly currentPage = signal(1);
  readonly itemsPerPage = 6;
  readonly totalPages = signal(1);

  private allWorkouts: WorkoutData[] = [];

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData();
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.progressService.getProgressStats().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        if (data) {
          this.stats.set({
            totalWorkouts: data.totalWorkouts,
            totalCalories: data.totalCalories,
            currentStreak: data.currentStreak,
            weeklyWorkouts: data.weeklyWorkouts
          });
          
          const workouts = this.progressService.recentWorkouts();
          if (Array.isArray(workouts)) {
            this.allWorkouts = workouts;
            this.calculatePagination();
          }
        }
      },
      error: () => {
        this.stats.set({
          totalWorkouts: 0,
          totalCalories: 0,
          currentStreak: 0,
          weeklyWorkouts: 0
        });
        this.allWorkouts = [];
        this.calculatePagination();
      }
    });
  }

  calculatePagination(): void {
    const totalItems = this.allWorkouts.length;
    const total = Math.ceil(totalItems / this.itemsPerPage);
    this.totalPages.set(total > 0 ? total : 1);
    this.updatePaginatedWorkouts();
  }

  updatePaginatedWorkouts(): void {
    const page = this.currentPage();
    const start = (page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.recentWorkouts.set(this.allWorkouts.slice(start, end));
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.updatePaginatedWorkouts();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  getPagesArray(): number[] {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  getInitials(): string {
    const user = this.user();
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user?.userName?.[0]?.toUpperCase() || 'U';
  }

  getWorkoutIconClass(workout: WorkoutData): string {
    const category = workout?.category?.toLowerCase() || '';
    if (category.includes('hiit') || category.includes('cardio')) return 'icon-cardio';
    if (category.includes('strength') || category.includes('power')) return 'icon-strength';
    if (category.includes('yoga') || category.includes('flexibility')) return 'icon-yoga';
    return 'icon-default';
  }

  getWorkoutIconPath(workout: WorkoutData): string {
    const category = workout?.category?.toLowerCase() || '';
    if (category.includes('hiit') || category.includes('cardio')) {
      return 'M13 10V3L4 14h7v7l9-11h-7z';
    }
    if (category.includes('strength') || category.includes('power')) {
      return 'M6.5 6.5h11v11h-11z M6.5 6.5L17.5 17.5 M6.5 17.5L17.5 6.5';
    }
    if (category.includes('yoga') || category.includes('flexibility')) {
      return 'M12 2c-2 2-4 4-4 8 0 4 2 6 4 6s4-2 4-6c0-4-2-6-4-8z';
    }
    return 'M13 10V3L4 14h7v7l9-11h-7z';
  }

  getCategoryClass(workout: WorkoutData): string {
    const category = workout?.category?.toLowerCase() || '';
    if (category.includes('hiit') || category.includes('cardio')) return 'badge-cardio';
    if (category.includes('strength') || category.includes('power')) return 'badge-strength';
    if (category.includes('yoga') || category.includes('flexibility')) return 'badge-yoga';
    if (category.includes('running')) return 'badge-running';
    return 'badge-default';
  }
}
