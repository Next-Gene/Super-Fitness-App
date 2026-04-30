import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { signal } from '@angular/core';

describe('AuthGuards', () => {
  let router: Router;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: signal(false)
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    });

    router = TestBed.inject(Router);
    localStorage.clear();
  });

  describe('authGuard', () => {
    it('should allow navigation if token exists', () => {
      localStorage.setItem('access_token', 'valid-token');
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBeTrue();
    });

    it('should block navigation and redirect if no token', () => {
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/test' } as any));
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], jasmine.any(Object));
    });
  });

  describe('guestGuard', () => {
    it('should allow navigation if no token exists', () => {
      const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
      expect(result).toBeTrue();
    });

    it('should redirect to dashboard if token exists', () => {
      localStorage.setItem('access_token', 'valid-token');
      const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});
