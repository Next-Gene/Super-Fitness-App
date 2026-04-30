import { Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  private readonly themeSubject = new BehaviorSubject<Theme>('dark');
  private readonly destroy$ = new Subject<void>();

  private readonly _theme = signal<Theme>('dark');
  private readonly _isDark = signal<boolean>(true);

  readonly theme = this._theme.asReadonly();
  readonly isDark = this._isDark.asReadonly();

  readonly isDarkMode = computed(() => this._isDark());

  constructor() {
    this.loadStoredTheme();
    this.applyTheme();
  }

  private loadStoredTheme(): void {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      this._theme.set(storedTheme);
      this._isDark.set(storedTheme === 'dark');
      this.themeSubject.next(storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  private applyTheme(): void {
    effect(() => {
      const isDark = this._isDark();
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this._isDark.set(theme === 'dark');
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    const newTheme = this._theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  getTheme(): Theme {
    return this._theme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}