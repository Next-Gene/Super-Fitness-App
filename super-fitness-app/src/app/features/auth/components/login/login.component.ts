import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="login-container">
  <div class="login-background">
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
  </div>

  <div class="login-card">
    <div class="logo-section">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6.5 6.5h11v11h-11z"/>
          <path d="M6.5 6.5L17.5 17.5"/>
          <path d="M6.5 17.5L17.5 6.5"/>
        </svg>
      </div>
      <h1>SuperFitness</h1>
      <p>Your fitness journey starts here</p>
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" formControlName="email" 
          placeholder="Enter your email"
          [class.error]="f['email'].touched && f['email'].invalid">
        <span *ngIf="f['email'].touched && f['email'].errors?.['required']" class="error-text">Email is required</span>
        <span *ngIf="f['email'].touched && f['email'].errors?.['email']" class="error-text">Please enter a valid email</span>
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input [type]="showPassword() ? 'text' : 'password'" id="password" formControlName="password" 
          placeholder="Enter your password"
          [class.error]="f['password'].touched && f['password'].invalid">
        <span *ngIf="f['password'].touched && f['password'].errors?.['required']" class="error-text">Password is required</span>
        <span *ngIf="f['password'].touched && f['password'].errors?.['minlength']" class="error-text">Password must be at least 6 characters</span>
      </div>

      <div *ngIf="error()" class="error-message">
        {{ error() }}
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" formControlName="rememberMe">
          <span>Remember me</span>
        </label>
      </div>

      <button type="submit" [disabled]="isLoading()" class="btn-primary">
        {{ isLoading() ? 'Loading...' : 'Sign In' }}
      </button>

      <div class="forgot-link">
        <a routerLink="/auth/forgot-password">Forgot Password?</a>
      </div>
    </form>

    <p class="register-link">
      Don't have an account? 
      <a routerLink="/auth/register">Register</a>
    </p>
  </div>
</div>
  `,
  styles: [`
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    position: relative;
    overflow: hidden;
  }

  .login-background {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;
  }

  .shape-1 {
    width: 400px;
    height: 400px;
    background: #e94560;
    top: -100px;
    right: -100px;
  }

  .shape-2 {
    width: 400px;
    height: 400px;
    background: #0f3460;
    bottom: -100px;
    left: -100px;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 10;
  }

  .logo-section {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #e94560, #ff6b6b);
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 10px 30px rgba(233, 69, 96, 0.3);
  }

  .logo-section h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .logo-section p {
    color: #a0a0a0;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #d1d5db;
    margin-bottom: 0.5rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: #e94560;
    background: rgba(255, 255, 255, 0.1);
  }

  .form-group input.error {
    border-color: #ef4444;
  }

  .form-group input::placeholder {
    color: #6b7280;
  }

  .checkbox-group {
    margin-bottom: 1.25rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #a0a0a0;
    font-size: 0.875rem;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #e94560;
    cursor: pointer;
  }

  .error-text {
    display: block;
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .error-message {
    padding: 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .btn-primary {
    width: 100%;
    padding: 0.875rem;
    background: linear-gradient(135deg, #e94560, #ff6b6b);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 0.5rem;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(233, 69, 96, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .register-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #a0a0a0;
  }

  .register-link a {
    color: #e94560;
    font-weight: 500;
    text-decoration: none;
    margin-left: 0.5rem;
  }

  .register-link a:hover {
    text-decoration: underline;
  }

  .forgot-link {
    text-align: center;
    margin-top: 1rem;
  }

  .forgot-link a {
    color: #9ca3af;
    font-size: 0.875rem;
    text-decoration: none;
  }

  .forgot-link a:hover {
    color: #e94560;
  }
  `]
})
export class LoginComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);

  readonly loginForm: FormGroup;
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  returnUrl = '/dashboard';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.message || 'Login failed');
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  ngOnDestroy(): void {}
}