import { Component, inject, signal, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent],
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

  readonly userInitials = computed(() => {
    const user = this.userData();
    if (!user) return 'U';
    
    if (user.firstName && user.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }
    
    return (user.userName?.charAt(0) || 'U').toUpperCase();
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