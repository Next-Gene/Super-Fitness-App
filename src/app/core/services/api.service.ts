import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, interval } from 'rxjs';
import { tap, map, catchError, takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly BASE_URL = 'http://localhost:8088/api';
  private readonly destroy$ = new Subject<void>();

  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastUpdated = signal<Date | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  get<T>(endpoint: string, params?: { [key: string]: string }): Observable<T> {
    this._loading.set(true);
    this._error.set(null);

    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }

    return this.http.get<T>(`${this.BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    }).pipe(
      tap({
        next: () => this._lastUpdated.set(new Date()),
        error: (err) => this._error.set(err.message || 'Request failed')
      }),
      finalize(() => this._loading.set(false)),
      takeUntil(this.destroy$),
      catchError(err => {
        this._error.set(err.message || 'Request failed');
        throw err;
      })
    );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<T>(`${this.BASE_URL}${endpoint}`, body, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap({
        next: () => this._lastUpdated.set(new Date()),
        error: (err) => this._error.set(err.message || 'Request failed')
      }),
      finalize(() => this._loading.set(false)),
      takeUntil(this.destroy$),
      catchError(err => {
        this._error.set(err.message || 'Request failed');
        throw err;
      })
    );
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.put<T>(`${this.BASE_URL}${endpoint}`, body, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap({
        next: () => this._lastUpdated.set(new Date()),
        error: (err) => this._error.set(err.message || 'Request failed')
      }),
      finalize(() => this._loading.set(false)),
      takeUntil(this.destroy$),
      catchError(err => {
        this._error.set(err.message || 'Request failed');
        throw err;
      })
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<T>(`${this.BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap({
        next: () => this._lastUpdated.set(new Date()),
        error: (err) => this._error.set(err.message || 'Request failed')
      }),
      finalize(() => this._loading.set(false)),
      takeUntil(this.destroy$),
      catchError(err => {
        this._error.set(err.message || 'Request failed');
        throw err;
      })
    );
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.patch<T>(`${this.BASE_URL}${endpoint}`, body, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap({
        next: () => this._lastUpdated.set(new Date()),
        error: (err) => this._error.set(err.message || 'Request failed')
      }),
      finalize(() => this._loading.set(false)),
      takeUntil(this.destroy$),
      catchError(err => {
        this._error.set(err.message || 'Request failed');
        throw err;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}