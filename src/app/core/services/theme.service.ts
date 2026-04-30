import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth.service';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'super-fitness-theme';
  private readonly authService = inject(AuthService);
  
  // Internal state using signals
  private readonly _theme = signal<Theme>('light');
  
  // Public API
  readonly theme = this._theme.asReadonly();
  readonly isDarkMode = computed(() => this._theme() === 'dark');

  constructor() {
    this.initializeTheme();
    
    // Sync theme with Auth state reactively - only on transition
    let previousAuthState: boolean | undefined;
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      if (previousAuthState !== isAuthenticated) {
        previousAuthState = isAuthenticated;
        if (isAuthenticated) {
          this.setTheme('dark');
        } else {
          this.setTheme('light');
        }
      }
    });

    // Reactive effect to apply the theme class to the document root
    effect(() => {
      const currentTheme = this._theme();
      this.applyThemeToDocument(currentTheme);
      localStorage.setItem(this.STORAGE_KEY, currentTheme);
    });
  }

  private initializeTheme(): void {
    const storedTheme = localStorage.getItem(this.STORAGE_KEY) as Theme;
    const isAuthenticated = this.authService.isAuthenticated();

    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      this._theme.set(storedTheme);
    } else {
      this._theme.set(isAuthenticated ? 'dark' : 'light');
    }
  }

  private applyThemeToDocument(theme: Theme): void {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }

  toggleTheme(): void {
    this._theme.update(current => current === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }
}