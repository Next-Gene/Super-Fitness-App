import { Component, inject, signal, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  private currentLang = signal('en');

  readonly isMenuOpen = signal(false);
  readonly isUserMenuOpen = signal(false);

  readonly isAuth = this.authService.isAuthenticated;
  readonly userData = this.authService.currentUser;

  readonly profileImageUrl = computed(() => {
    const user = this.userData();
    if (!user) return null;
    let url = user.profilePictureUrl || (user as any)?.profileImageUrl || null;
    if (url && typeof url === 'string' && !url.startsWith('http') && !url.includes('localhost')) {
      url = 'http://localhost:8088/' + url.replace(/^\/+/, '');
    }
    return url;
  });

  constructor() {}

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleLanguage(): void {
    this.currentLang.update(v => v === 'en' ? 'ar' : 'en');
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen.set(false);
    this.router.navigate(['/auth/login']);
  }

  getCurrentLang(): string {
    return this.currentLang();
  }

  closeMenus(): void {
    this.isMenuOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  ngOnDestroy(): void {}
}