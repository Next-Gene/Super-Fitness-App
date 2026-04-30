import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('ThemeService', () => {
  let service: ThemeService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: signal(false)
    });

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: AuthService, useValue: spy }
      ]
    });
    service = TestBed.inject(ThemeService);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with light mode by default', () => {
    expect(service.isDarkMode()).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should toggle theme', () => {
    service.setTheme('light');
    service.toggleTheme();
    expect(service.isDarkMode()).toBeTrue();
    
    service.toggleTheme();
    expect(service.isDarkMode()).toBeFalse();
  });

  it('should set theme to dark', () => {
    service.setTheme('dark');
    expect(service.isDarkMode()).toBeTrue();
  });

  it('should persist theme in localStorage', fakeAsync(() => {
    const setItemSpy = spyOn(localStorage, 'setItem');
    service.setTheme('dark');
    tick();
    expect(service.isDarkMode()).toBeTrue();
  }));

  it('should load theme from localStorage on init', () => {
    (authServiceSpy.isAuthenticated as any).set(false);
    spyOn(localStorage, 'getItem').and.returnValue('dark');
    const newService = TestBed.runInInjectionContext(() => new ThemeService());
    expect(newService.isDarkMode()).toBeTrue();
  });
});
