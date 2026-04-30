import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
<div class="register-container">
  <div class="register-background">
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
  </div>

  <div class="register-card">
    <div class="logo-section">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6.5 6.5h11v11h-11z"/>
          <path d="M6.5 6.5L17.5 17.5"/>
          <path d="M6.5 17.5L17.5 6.5"/>
        </svg>
      </div>
      <h1>Create Account</h1>
      <p>Start your fitness journey</p>
    </div>

    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <div class="form-row">
        <div class="form-group">
          <label>First Name</label>
          <input type="text" formControlName="firstName" placeholder="John">
        </div>
        <div class="form-group">
          <label>Last Name</label>
          <input type="text" formControlName="lastName" placeholder="Doe">
        </div>
      </div>

      <div class="form-group">
        <label>Email</label>
        <input type="email" formControlName="email" placeholder="john@example.com">
      </div>

      <div class="form-group">
        <label>Password</label>
        <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Min 6 characters">
      </div>

      <div class="form-group">
        <label>Phone Number</label>
        <input type="text" formControlName="phoneNumber" placeholder="01012345678">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Height (cm)</label>
          <input type="number" formControlName="height" placeholder="175">
        </div>
        <div class="form-group">
          <label>Weight (kg)</label>
          <input type="number" formControlName="weight" placeholder="70">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Age</label>
          <input type="number" formControlName="age" placeholder="25">
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select formControlName="gender">
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Activity Level</label>
        <select formControlName="activtyLevel">
          <option value="">Select</option>
          <option value="Sedentary">Sedentary</option>
          <option value="Light">Light</option>
          <option value="Moderate">Moderate</option>
          <option value="Active">Active</option>
          <option value="VeryActive">Very Active</option>
        </select>
      </div>

      <div class="form-group">
        <label>Goal</label>
        <select formControlName="goal">
          <option value="">Select</option>
          <option value="LoseWeight">Lose Weight</option>
          <option value="GainWeight">Gain Weight</option>
          <option value="GetFitter">Get Fitter</option>
          <option value="BuildMuscle">Build Muscle</option>
        </select>
      </div>

      <div *ngIf="error()" class="error-message">
        {{ error() }}
      </div>

      <button type="submit" [disabled]="isLoading()" class="btn-primary">
        {{ isLoading() ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>

    <p class="login-link">
      Already have an account? 
      <a routerLink="/auth/login">Sign In</a>
    </p>
  </div>
</div>
  `,
  styles: [`
  .register-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    padding: 1rem;
    position: relative;
    overflow: hidden;
  }

  .register-background {
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

  .register-card {
    width: 100%;
    max-width: 520px;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 10;
    max-height: 90vh;
    overflow-y: auto;
  }

  .logo-section {
    text-align: center;
    margin-bottom: 1rem;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #e94560, #ff6b6b);
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 10px 30px rgba(233, 69, 96, 0.3);
  }

  .logo-section h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.25rem;
  }

  .logo-section p {
    color: #a0a0a0;
    font-size: 0.8rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-group label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: #d1d5db;
    margin-bottom: 0.25rem;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #fff;
    font-size: 0.85rem;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #e94560;
    background: rgba(255, 255, 255, 0.1);
  }

  .form-group input::placeholder {
    color: #6b7280;
  }

  .form-group select {
    cursor: pointer;
  }

  .form-group select option {
    background: #1a1a2e;
    color: #fff;
  }

  .error-message {
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .btn-primary {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #e94560, #ff6b6b);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 0.9rem;
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

  .login-link {
    text-align: center;
    margin-top: 1rem;
    color: #a0a0a0;
    font-size: 0.8rem;
  }

  .login-link a {
    color: #e94560;
    font-weight: 500;
    text-decoration: none;
    margin-left: 0.25rem;
  }

  .login-link a:hover {
    text-decoration: underline;
  }
  `]
})
export class RegisterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  readonly registerForm: FormGroup;
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  constructor() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''],
      height: ['', [Validators.required]],
      weight: ['', [Validators.required]],
      age: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      activtyLevel: ['', [Validators.required]],
      goal: ['', [Validators.required]]
    });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.message || 'Registration failed');
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  ngOnDestroy(): void {}
}