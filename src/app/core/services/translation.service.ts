import { Injectable, signal, computed } from '@angular/core';

export interface Translations {
  [lang: string]: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly _currentLang = signal<string>('en');
  readonly isRTL = computed(() => this._currentLang() === 'ar');
  readonly currentLang = this._currentLang.asReadonly();

  private translations: Translations = {
    en: {
      'app.title': 'Super Fitness',
      'nav.dashboard': 'Dashboard',
      'nav.workouts': 'Workouts',
      'nav.progress': 'Progress',
      'nav.nutrition': 'Nutrition',
      'common.logout': 'Logout',
      'common.login': 'Login',
    },
    ar: {
      'app.title': 'اللياقة المتفوقة',
      'nav.dashboard': 'لوحة التحكم',
      'nav.workouts': 'التمارين',
      'nav.progress': 'التقدم',
      'nav.nutrition': 'التغذية',
      'common.logout': 'تسجيل الخروج',
      'common.login': 'تسجيل الدخول',
    }
  };

  constructor() {
    this.loadStoredLanguage();
  }

  private loadStoredLanguage(): void {
    const storedLang = localStorage.getItem('language');
    if (storedLang === 'en' || storedLang === 'ar') {
      this.setLanguage(storedLang);
    }
  }

  setLanguage(lang: string): void {
    this._currentLang.set(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }

  t(key: string): string {
    return this.translations[this._currentLang()]?.[key] || key;
  }

  toggleLanguage(): void {
    this.setLanguage(this._currentLang() === 'en' ? 'ar' : 'en');
  }
}