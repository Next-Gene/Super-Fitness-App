import { Component, inject, signal, OnDestroy, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  private readonly router = inject(Router);
  readonly translation = inject(TranslationService);
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  readonly isMenuOpen = signal(false);
  readonly isUserMenuOpen = signal(false);

  readonly isAuth = this.authService.isAuthenticated;
  readonly userData = this.authService.currentUser;

  readonly profileImageUrl = computed(() => {
    const user = this.userData();
    if (!user) return null;
    let url = user.profilePictureUrl || (user as any).profileImageUrl || null;
    if (url && typeof url === 'string') {
      url = url.replace('authenticationservice:8080', 'localhost:8088');
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
    this.translation.toggleLanguage();
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen.set(false);
  }

  getCurrentLang(): string {
    return this.translation.getCurrentLang();
  }

  closeMenus(): void {
    this.isMenuOpen.set(false);
    this.isUserMenuOpen.set(false);
  }

  ngOnDestroy(): void {}
}