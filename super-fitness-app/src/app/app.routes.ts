import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing-page.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/components/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard]
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        canActivate: [guestGuard]
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/components/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'workouts',
        loadComponent: () => import('./features/workouts/components/list/workout-list.component').then(m => m.WorkoutListComponent)
      },
      {
        path: 'workouts/session/:id',
        loadComponent: () => import('./features/workouts/components/active-session/active-session.component').then(m => m.ActiveSessionComponent)
      },
      {
        path: 'workouts/:id',
        loadComponent: () => import('./features/workouts/components/details/workout-details/workout-details').then(m => m.WorkoutDetailsComponent)
      },
      {
        path: 'progress',
        loadComponent: () => import('./features/progress/components/progress.component').then(m => m.ProgressComponent)
      },
      {
        path: 'nutrition',
        loadComponent: () => import('./features/nutrition/components/nutrition.component').then(m => m.NutritionComponent)
      },
      {
        path: 'nutrition/meals/:id',
        loadComponent: () => import('./features/nutrition/components/meal-details/meal-details.component').then(m => m.MealDetailsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];