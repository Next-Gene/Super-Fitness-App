import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User, LoginResponse, RegisterRequest } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiUrl = 'http://localhost:8088/api/auth';

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    userName: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '123456789',
    profilePictureUrl: '',
    createdAt: new Date().toISOString(),
    isActive: true
  };

  const mockLoginResponse: LoginResponse = {
    success: true,
    token: 'fake-token',
    refreshToken: 'fake-refresh-token',
    userId: '1',
    userName: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    profileImageUrl: '',
    roles: ['User']
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Login Flow', () => {
    it('should successfully login and persist user data', () => {
      const credentials = { email: 'test@example.com', password: 'password' };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockLoginResponse);
        expect(service.isAuthenticated()).toBeTrue();
        expect(localStorage.getItem('access_token')).toBe(mockLoginResponse.token);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockLoginResponse);
    });

    it('should handle login failure and set error state', () => {
      const credentials = { email: 'wrong@example.com', password: 'wrong' };
      const errorMsg = 'Invalid credentials';

      service.login(credentials).subscribe({
        next: () => fail('Login should have failed'),
        error: (err) => {
          expect(err.status).toBe(401);
          service.error.subscribe(msg => expect(msg).toBe(errorMsg));
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush({ error: errorMsg }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Registration Flow', () => {
    it('should register a new user', () => {
      const registerData: RegisterRequest = { 
        email: 'new@example.com', 
        password: 'password', 
        firstName: 'New',
        lastName: 'User',
        height: 180,
        weight: 75,
        age: 25,
        gender: 'male',
        activtyLevel: 'active',
        goal: 'muscle-gain'
      };

      service.register(registerData).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockLoginResponse);
    });
  });

  describe('Token Management', () => {
    it('should refresh token successfully', () => {
      // Manually set refresh token in internal state using bracket notation
      (service as any)['refreshTokenSubject'].next('old-refresh-token');

      service.refreshToken().subscribe(response => {
        expect(response.token).toBe('new-token');
        expect(localStorage.getItem('access_token')).toBe('new-token');
      });

      const req = httpMock.expectOne(`${apiUrl}/refresh-token`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, data: { ...mockLoginResponse, token: 'new-token' } });
    });
  });

  describe('Logout Flow', () => {
    it('should clear all data and navigate to login', () => {
      spyOn(router, 'navigate');
      localStorage.setItem('access_token', 'token');
      (service as any)['tokenSubject'].next('token');

      service.logout();

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      req.flush({});

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('Password Management', () => {
    it('should send forget password request', () => {
      const email = 'test@example.com';

      service.forgetPassword(email).subscribe(res => {
        expect(res.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/forget-password`);
      req.flush({ success: true, message: 'Sent' });
    });

    it('should verify OTP', () => {
      service.verifyOtp('test@example.com', '123456').subscribe(res => {
        expect(res.success).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/verify-otp`);
      req.flush({ success: true });
    });
  });
});
