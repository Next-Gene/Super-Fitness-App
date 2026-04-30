import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  user = this.authService.currentUser;
  activeTab = signal<'profile' | 'password'>('profile');
  
  isLoading = signal(false);
  isPasswordLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);
  
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  userRoles: string[] = [];

  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [''],
      goal: [''],
      activtyLevel: [''],
      weight: [''],
      height: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }

    this.authService.getUserInfo().subscribe({
      next: (userData: User) => {
        const userObj = userData as unknown as { roles?: string[]; goal?: string; activtyLevel?: string; weight?: number; height?: number };
        this.userRoles = userObj.roles || [];
        this.profileForm.patchValue({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumber: userData.phoneNumber || '',
          goal: userObj.goal || '',
          activtyLevel: userObj.activtyLevel || '',
          weight: userObj.weight || '',
          height: userObj.height || ''
        });
      },
      error: () => {}
    });
  }

  getInitials(): string {
    const user = this.user();
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user?.userName?.[0]?.toUpperCase() || 'U';
  }

  getAvatarUrl(): string {
    const user = this.user();
    let url = user?.profilePictureUrl || (user as any)?.profileImageUrl;
    if (url) {
      if (!url.startsWith('http')) {
        url = 'http://localhost:8088/' + url.replace(/^\/+/, '');
      }
      return `url(${url})`;
    }
    return '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('ProfileImage', file);
      
      Object.keys(this.profileForm.value).forEach(key => {
        if (this.profileForm.value[key]) {
          formData.append(key, this.profileForm.value[key]);
        }
      });

      this.isLoading.set(true);
      this.authService.updateProfile(formData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Profile picture updated!');
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.error.set(err.message || 'Failed to upload image');
        }
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const formData = new FormData();
    Object.keys(this.profileForm.value).forEach(key => {
      if (this.profileForm.value[key]) {
        formData.append(key, this.profileForm.value[key]);
      }
    });

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Profile updated successfully!');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.error.set(err.message || 'Failed to update profile');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.passwordError.set('New passwords do not match');
      return;
    }

    this.isPasswordLoading.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isPasswordLoading.set(false);
        this.passwordSuccess.set('Password changed successfully!');
        this.passwordForm.reset();
        setTimeout(() => this.passwordSuccess.set(null), 3000);
      },
      error: (err: Error) => {
        this.isPasswordLoading.set(false);
        this.passwordError.set(err.message || 'Failed to change password');
      }
    });
  }
}