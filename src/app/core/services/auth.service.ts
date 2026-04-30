import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = `${environment.baseUrl}/auth`;

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  private readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  private readonly destroy$ = new Subject<void>();

  readonly user = this.userSubject.asObservable();
  readonly token = this.tokenSubject.asObservable();
  readonly isLoading = this.loadingSubject.asObservable();
  readonly error = this.errorSubject.asObservable();

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      this.tokenSubject.next(token);
      this.userSubject.next(user);
      this.currentUser.set(user);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        const user: User = {
          id: response.userId,
          email: response.email,
          userName: response.userName,
          firstName: response.firstName,
          lastName: response.lastName,
          phoneNumber: response.phoneNumber,
          profilePictureUrl: response.profileImageUrl,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        this.tokenSubject.next(response.token);
        this.refreshTokenSubject.next(response.refreshToken);
        this.userSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        const errorMessage = error.error?.error || error.error?.message || 'Login failed';
        this.errorSubject.next(errorMessage);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<LoginResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => {
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        const errorMessage = error.error?.error || error.error?.message || 'Registration failed';
        this.errorSubject.next(errorMessage);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  logout(): void {
    const token = this.tokenSubject.value;
    
    if (token) {
      this.http.post(`${this.API_URL}/logout`, {}, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: () => this.clearAuthAndNavigate(),
        error: () => this.clearAuthAndNavigate()
      });
    } else {
      this.clearAuthAndNavigate();
    }
  }

  private clearAuthAndNavigate(): void {
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    this.userSubject.next(null);
    this.currentUser.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = this.tokenSubject.value;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.refreshTokenSubject.value;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/refresh-token`, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenSubject.next(response.data.token);
          this.refreshTokenSubject.next(response.data.refreshToken);
          localStorage.setItem('access_token', response.data.token);
          localStorage.setItem('refresh_token', response.data.refreshToken);
        }
      }),
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Token refresh failed');
        }
        return response.data;
      })
    );
  }

  forgetPassword(email: string): Observable<{ success: boolean; message: string }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<ApiResponse<any>>(`${this.API_URL}/forget-password`, { email }).pipe(
      tap(response => {
        this.loadingSubject.next(false);
      }),
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to send reset email');
        }
        return { success: true, message: response.message || 'Reset email sent' };
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Failed to send reset email');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  verifyOtp(email: string, otpCode: string): Observable<{ success: boolean }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<ApiResponse<any>>(`${this.API_URL}/verify-otp`, { email, otpCode }).pipe(
      tap(response => {
        this.loadingSubject.next(false);
      }),
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Invalid OTP');
        }
        return { success: true };
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'OTP verification failed');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  resetPassword(email: string, newPassword: string): Observable<{ success: boolean }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<ApiResponse<any>>(`${this.API_URL}/reset-password`, { email, newPassword }).pipe(
      tap(response => {
        this.loadingSubject.next(false);
      }),
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Password reset failed');
        }
        return { success: true };
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Password reset failed');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  getUserInfo(): Observable<User> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<User>(`${this.API_URL}/user-info`, { headers: this.getAuthHeaders() }).pipe(
      tap(response => {
        const userObj = response as unknown as { profileImageUrl?: string; roles?: string[]; goal?: string; activtyLevel?: string; weight?: number; height?: number; age?: number; gender?: string };
        const user: User = {
          id: response.id || (response as any).userId,
          email: response.email,
          userName: response.userName || (response as any).userName,
          firstName: response.firstName,
          lastName: response.lastName,
          phoneNumber: response.phoneNumber || (response as any).phoneNumber,
          profilePictureUrl: userObj.profileImageUrl || response.profilePictureUrl,
          createdAt: response.createdAt || new Date().toISOString(),
          isActive: true
        };
        this.userSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Failed to get user info');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean }> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.post<ApiResponse<any>>(`${this.API_URL}/change-password`, { currentPassword, newPassword }, { headers: this.getAuthHeaders() }).pipe(
      tap(response => {
        this.loadingSubject.next(false);
      }),
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Password change failed');
        }
        return { success: true };
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Password change failed');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  updateProfile(formData: FormData): Observable<User> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.put<User>(`${this.API_URL}/update-profile`, formData, { headers: this.getAuthHeaders() }).pipe(
      tap(response => {
        const user: User = {
          id: response.id || (response as any).userId,
          email: response.email,
          userName: response.userName || (response as any).userName,
          firstName: response.firstName,
          lastName: response.lastName,
          phoneNumber: response.phoneNumber,
          profilePictureUrl: (response as any).profileImageUrl || response.profilePictureUrl,
          createdAt: response.createdAt || new Date().toISOString(),
          isActive: true
        };
        this.userSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next(error.message || 'Profile update failed');
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}