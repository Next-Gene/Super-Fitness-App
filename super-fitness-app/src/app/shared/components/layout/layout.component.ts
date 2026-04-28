import { Component, inject, signal, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="layout-container">
  <header class="header">
    <a routerLink="/dashboard" class="logo">
      <span class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6.5 6.5h11v11h-11z"/>
          <path d="M6.5 6.5L17.5 17.5"/>
          <path d="M6.5 17.5L17.5 6.5"/>
        </svg>
      </span>
      <span class="logo-text">SuperFitness</span>
    </a>

    <nav class="nav">
      <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
      <a routerLink="/workouts" routerLinkActive="active" class="nav-link">Workouts</a>
      <a routerLink="/progress" routerLinkActive="active" class="nav-link">Progress</a>
      <a routerLink="/nutrition" routerLinkActive="active" class="nav-link">Nutrition</a>
    </nav>

    <div class="header-actions">
      <div class="user-menu" *ngIf="isAuth()">
        <button (click)="toggleUserMenu()" class="user-btn">
          <span class="avatar">{{ userInitial() }}</span>
        </button>
        <div class="dropdown" *ngIf="isUserMenuOpen()">
          <a routerLink="/profile" class="dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </a>
          <button (click)="logout()" class="dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="main-content">
    <router-outlet />
  </main>
</div>
  `,
styles: [`
  .layout-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: rgba(26, 26, 46, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    z-index: 100;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
  }

  .logo-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #e94560, #ff6b6b);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-icon svg {
    width: 20px;
    height: 20px;
    color: #fff;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
  }

  .nav {
    display: flex;
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    color: #a0a0a0;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .nav-link:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .nav-link.active {
    color: #e94560;
    background: rgba(233, 69, 96, 0.1);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-menu {
    position: relative;
  }

  .user-btn {
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #e94560, #ff6b6b);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.3s ease;
  }

  .user-btn:hover .avatar {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(233, 69, 96, 0.4);
  }

  .dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0.5rem;
    min-width: 180px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    text-align: left;
    color: #a0a0a0;
    text-decoration: none;
    font-size: 0.875rem;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .dropdown-item svg {
    width: 18px;
    height: 18px;
  }

  .dropdown-item:hover {
    background: rgba(233, 69, 96, 0.1);
    color: #e94560;
  }

  .main-content {
    padding-top: 64px;
    min-height: 100vh;
  }
  `]
})
export class LayoutComponent implements OnDestroy {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  readonly isMenuOpen = signal(false);
  readonly isUserMenuOpen = signal(false);

  readonly isAuth = computed(() => !!this.authService.getToken());
  userData = signal<User | null>(this.authService.getUser());

  isDarkMode() {
    return this.themeService.isDarkMode();
  }

  userInitial() {
    const user = this.userData();
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.userName) return user.userName[0].toUpperCase();
    return 'U';
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {}
}