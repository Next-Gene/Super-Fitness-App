import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    localStorage.clear();
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'refreshToken', 'logout']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Authorization header if token exists', () => {
    authServiceSpy.getToken.and.returnValue('fake-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
  });

  it('should handle 401 error and try to refresh token', () => {
    localStorage.setItem('refresh_token', 'valid-refresh-token');
    authServiceSpy.getToken.and.returnValue('expired-token');
    authServiceSpy.refreshToken.and.returnValue(of({ token: 'new-token' } as any));

    httpClient.get('/api/secure').subscribe();

    const firstReq = httpMock.expectOne('/api/secure');
    firstReq.error(new ProgressEvent('error'), { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.refreshToken).toHaveBeenCalled();

    const secondReq = httpMock.expectOne('/api/secure');
    expect(secondReq.request.headers.get('Authorization')).toBe('Bearer new-token');
  });

  it('should logout if token refresh fails', () => {
    localStorage.setItem('refresh_token', 'valid-refresh-token');
    authServiceSpy.getToken.and.returnValue('expired-token');
    authServiceSpy.refreshToken.and.returnValue(throwError(() => new Error('Refresh failed')));

    httpClient.get('/api/secure').subscribe({
      error: () => {
        expect(authServiceSpy.logout).toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne('/api/secure');
    req.error(new ProgressEvent('error'), { status: 401 });
  });

  it('should logout immediately if no refresh token exists on 401', () => {
    authServiceSpy.getToken.and.returnValue('expired-token');

    httpClient.get('/api/secure').subscribe({
      error: () => {
        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(authServiceSpy.refreshToken).not.toHaveBeenCalled();
      }
    });

    const req = httpMock.expectOne('/api/secure');
    req.error(new ProgressEvent('error'), { status: 401 });
  });
});
