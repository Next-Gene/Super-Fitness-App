import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { tap, catchError, takeUntil, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = environment.baseUrl;
  private readonly destroy$ = new Subject<void>();

  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _lastUpdated = signal<Date | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();

  private handleError(endpoint: string, err: unknown): Observable<never> {
    const message = err instanceof HttpErrorResponse
      ? err.error?.message || err.error?.error || err.message || `Request failed for ${endpoint}`
      : err instanceof Error
        ? err.message
        : 'Unknown error occurred';
    this._error.set(message);
    return throwError(() => err);
  }

  private handleRequest<T>(endpoint: string, observable: Observable<T>): Observable<T> {
    this._loading.set(true);
    this._error.set(null);

    return observable.pipe(
      tap(() => this._lastUpdated.set(new Date())),
      catchError(err => this.handleError(endpoint, err)),
      finalize(() => this._loading.set(false)),
      takeUntil(this.destroy$)
    );
  }

  get<T>(endpoint: string, params?: { [key: string]: string | number | boolean }): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }

    return this.handleRequest(
      endpoint,
      this.http.get<T>(`${this.BASE_URL}${endpoint}`, { params: httpParams })
    );
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.handleRequest(
      endpoint,
      this.http.post<T>(`${this.BASE_URL}${endpoint}`, body)
    );
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.handleRequest(
      endpoint,
      this.http.put<T>(`${this.BASE_URL}${endpoint}`, body)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.handleRequest(
      endpoint,
      this.http.delete<T>(`${this.BASE_URL}${endpoint}`)
    );
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.handleRequest(
      endpoint,
      this.http.patch<T>(`${this.BASE_URL}${endpoint}`, body)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}