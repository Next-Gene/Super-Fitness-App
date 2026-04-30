import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="forgot-container">
  <div class="forgot-background">
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
  </div>

  <div class="forgot-card">
    <div class="logo-section">
      <div class="logo-icon">🔐</div>
      <h1>Reset Password</h1>
      <p>Enter your email to receive reset instructions</p>
    </div>

    <div *ngIf="success()" class="success-message">
      {{ successMessage() }}
    </div>

    <form *ngIf="!success()" [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input type="email" id="email" formControlName="email" 
          placeholder="Enter your email"
          [class.error]="f['email'].touched && f['email'].invalid">
        <span *ngIf="f['email'].touched && f['email'].errors?.['required']" class="error-text">Email is required</span>
        <span *ngIf="f['email'].touched && f['email'].errors?.['email']" class="error-text">Please enter a valid email</span>
      </div>

      <div *ngIf="error()" class="error-message">
        {{ error() }}
      </div>

      <button type="submit" [disabled]="isLoading()" class="btn-primary">
        {{ isLoading() ? 'Sending...' : 'Send Reset Link' }}
      </button>
    </form>

    <p class="back-link">
      <a routerLink="/auth/login">← Back to Login</a>
    </p>
  </div>
</div>
  `,
  styles: [`
  .forgot-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  .forgot-background {
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

  .forgot-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 10;
    text-align: center;
  }

  .logo-section {
    margin-bottom: 2rem;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #e94560, #ff6b6b);
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    margin-bottom: 1rem;
    box-shadow: 0 10px 30px rgba(233, 69, 96, 0.3);
  }

  .logo-section h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .logo-section p {
    color: #a0a0a0;
    font-size: 0.875rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
    text-align: left;
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
    box-sizing: border-box;
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
    text-align: left;
  }

  .success-message {
    padding: 1rem;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    color: #22c55e;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    text-align: left;
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
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(233, 69, 96, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .back-link {
    margin-top: 1.5rem;
    color: #a0a0a0;
    font-size: 0.875rem;
  }

  .back-link a {
    color: #e94560;
    text-decoration: none;
    font-weight: 500;
  }

  .back-link a:hover {
    text-decoration: underline;
  }
  `]
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly forgotForm: FormGroup;
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);
  readonly successMessage = signal('');

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.forgetPassword(this.forgotForm.value.email).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.success.set(true);
        this.successMessage.set('Password reset link has been sent to your email!');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.message || 'Failed to send reset email');
      }
    });
  }

  get f() {
    return this.forgotForm.controls;
  }
}