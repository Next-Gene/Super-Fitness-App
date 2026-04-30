import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../../core/services/auth.service';
import { of, throwError, Subject } from 'rxjs';
import { signal } from '@angular/core';
import { User } from '../../../../core/models';
import { By } from '@angular/platform-browser';

const mockUser: User = {
  id: '1', email: 'john@example.com', userName: 'johndoe',
  firstName: 'John', lastName: 'Doe', phoneNumber: '+1234567890',
  createdAt: '2026-01-01', isActive: true
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let updateProfileSubject: Subject<User>;
  let changePasswordSubject: Subject<{ success: boolean }>;

  beforeEach(async () => {
    updateProfileSubject = new Subject<User>();
    changePasswordSubject = new Subject<{ success: boolean }>();

    const aSpy = jasmine.createSpyObj('AuthService', ['getUserInfo', 'updateProfile', 'changePassword'], {
      currentUser: signal(mockUser)
    });

    aSpy.getUserInfo.and.returnValue(of({
      ...mockUser, roles: ['User'], goal: 'BuildMuscle', activtyLevel: 'Active',
      weight: 80, height: 180
    }));
    aSpy.updateProfile.and.callFake(() => updateProfileSubject.asObservable());
    aSpy.changePassword.and.callFake(() => changePasswordSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [{ provide: AuthService, useValue: aSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize both forms', () => {
    expect(component.profileForm).toBeDefined();
    expect(component.passwordForm).toBeDefined();
    expect(component.profileForm.contains('firstName')).toBeTrue();
    expect(component.profileForm.contains('lastName')).toBeTrue();
    expect(component.profileForm.contains('phoneNumber')).toBeTrue();
    expect(component.passwordForm.contains('currentPassword')).toBeTrue();
    expect(component.passwordForm.contains('newPassword')).toBeTrue();
    expect(component.passwordForm.contains('confirmPassword')).toBeTrue();
  });

  it('should load user profile on init', () => {
    expect(authServiceSpy.getUserInfo).toHaveBeenCalled();
  });

  it('should patch form with user data after loading profile', fakeAsync(() => {
    tick();
    expect(component.profileForm.get('firstName')?.value).toBe('John');
    expect(component.profileForm.get('lastName')?.value).toBe('Doe');
    expect(component.profileForm.get('phoneNumber')?.value).toBe('+1234567890');
  }));

  it('should display user name in header', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.profile-info h1')?.textContent?.trim()).toBe('John Doe');
  }));

  it('should display user email in header', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.profile-info p')?.textContent?.trim()).toBe('john@example.com');
  }));

  it('should generate correct initials from user name', () => {
    expect(component.getInitials()).toBe('JD');
  });

  it('should fallback to username first letter when no firstName/lastName', () => {
    (authServiceSpy as any).currentUser.set({ ...mockUser, firstName: null, lastName: null });
    fixture.detectChanges();
    expect(component.getInitials()).toBe('J');
  });

  it('should display role badge', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const roleBadge = fixture.nativeElement.querySelector('.role-badge');
    expect(roleBadge).toBeTruthy();
    expect(roleBadge.textContent?.trim()).toBe('User');
  }));

  it('should switch to profile tab', () => {
    component.activeTab.set('password');
    fixture.detectChanges();
    const profileBtn = fixture.debugElement.queryAll(By.css('.profile-tabs button'))[0];
    profileBtn.triggerEventHandler('click', null);
    expect(component.activeTab()).toBe('profile');
  });

  it('should switch to password tab', () => {
    component.activeTab.set('profile');
    fixture.detectChanges();
    const passwordBtn = fixture.debugElement.queryAll(By.css('.profile-tabs button'))[1];
    passwordBtn.triggerEventHandler('click', null);
    expect(component.activeTab()).toBe('password');
  });

  it('should show profile form when profile tab is active', () => {
    component.activeTab.set('profile');
    fixture.detectChanges();
    const profileForm = fixture.debugElement.query(By.css('.profile-form'));
    expect(profileForm).toBeTruthy();
  });

  it('should show password form when password tab is active', () => {
    component.activeTab.set('password');
    fixture.detectChanges();
    const passwordForm = fixture.debugElement.query(By.css('.password-form'));
    expect(passwordForm).toBeTruthy();
  });

  it('should validate required fields in profile form', () => {
    const firstNameControl = component.profileForm.get('firstName');
    firstNameControl?.setValue('');
    expect(firstNameControl?.valid).toBeFalse();
  });

  it('should validate required fields in password form', () => {
    const currentControl = component.passwordForm.get('currentPassword');
    currentControl?.setValue('');
    expect(currentControl?.valid).toBeFalse();
  });

  it('should validate minimum length for password fields', () => {
    const newPassControl = component.passwordForm.get('newPassword');
    newPassControl?.setValue('12');
    expect(newPassControl?.valid).toBeFalse();
  });

  it('should save profile with valid data', fakeAsync(() => {
    tick();
    component.profileForm.patchValue({ firstName: 'Jane', lastName: 'Smith' });
    component.saveProfile();
    tick();
    expect(authServiceSpy.updateProfile).toHaveBeenCalled();
    updateProfileSubject.next(mockUser);
    tick();
    expect(component.successMessage()).toBe('Profile updated successfully!');
  }));

  it('should not save profile when form is invalid', () => {
    component.profileForm.patchValue({ firstName: '' });
    component.saveProfile();
    expect(authServiceSpy.updateProfile).not.toHaveBeenCalled();
    expect(component.profileForm.get('firstName')?.touched).toBeTrue();
  });

  it('should handle profile save error', fakeAsync(() => {
    tick();
    component.profileForm.patchValue({ firstName: 'Jane' });
    component.saveProfile();
    tick();
    updateProfileSubject.error(new Error('Server error'));
    tick();
    expect(component.error()).toBe('Server error');
  }));

  it('should change password with matching passwords', fakeAsync(() => {
    tick();
    component.activeTab.set('password');
    fixture.detectChanges();
    component.passwordForm.setValue({
      currentPassword: 'old123',
      newPassword: 'new123',
      confirmPassword: 'new123'
    });
    component.changePassword();
    tick();
    expect(authServiceSpy.changePassword).toHaveBeenCalledWith('old123', 'new123');
    changePasswordSubject.next({ success: true });
    tick();
  }));

  it('should reject password change when passwords do not match', () => {
    component.passwordForm.setValue({
      currentPassword: 'old123',
      newPassword: 'new123',
      confirmPassword: 'different'
    });
    component.changePassword();
    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
    expect(component.passwordError()).toBe('New passwords do not match');
  });

  it('should not change password when form is invalid', () => {
    component.passwordForm.setValue({
      currentPassword: '',
      newPassword: 'new123',
      confirmPassword: 'new123'
    });
    component.changePassword();
    expect(authServiceSpy.changePassword).not.toHaveBeenCalled();
    expect(component.passwordForm.get('currentPassword')?.touched).toBeTrue();
  });

  it('should handle password change error', fakeAsync(() => {
    tick();
    component.passwordForm.setValue({
      currentPassword: 'old123',
      newPassword: 'new123',
      confirmPassword: 'new123'
    });
    component.changePassword();
    tick();
    changePasswordSubject.error(new Error('Wrong password'));
    tick();
    expect(component.passwordError()).toBe('Wrong password');
  }));

  it('should handle password change success', fakeAsync(() => {
    tick();
    component.passwordForm.setValue({
      currentPassword: 'old123',
      newPassword: 'new123',
      confirmPassword: 'new123'
    });
    component.changePassword();
    tick();
    changePasswordSubject.next({ success: true });
    tick();
    expect(component.passwordSuccess()).toBe('Password changed successfully!');
    expect(component.passwordForm.get('currentPassword')?.value).toBeNull();
  }));

  it('should toggle current password visibility', () => {
    component.activeTab.set('password');
    fixture.detectChanges();
    expect(component.showCurrentPassword()).toBeFalse();
    component.showCurrentPassword.set(true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('[formControlName="currentPassword"]'));
    expect(input.nativeElement.type).toBe('text');
  });

  it('should toggle new password visibility', () => {
    component.activeTab.set('password');
    fixture.detectChanges();
    expect(component.showNewPassword()).toBeFalse();
    component.showNewPassword.set(true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('[formControlName="newPassword"]'));
    expect(input.nativeElement.type).toBe('text');
  });

  it('should toggle confirm password visibility', () => {
    component.activeTab.set('password');
    fixture.detectChanges();
    expect(component.showConfirmPassword()).toBeFalse();
    component.showConfirmPassword.set(true);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('[formControlName="confirmPassword"]'));
    expect(input.nativeElement.type).toBe('text');
  });

  it('should show loading state during profile save', fakeAsync(() => {
    tick();
    component.profileForm.patchValue({ firstName: 'Jane' });
    component.saveProfile();
    expect(component.isLoading()).toBeTrue();
    updateProfileSubject.next(mockUser);
    tick();
    expect(component.isLoading()).toBeFalse();
  }));

  it('should show loading state during password change', fakeAsync(() => {
    tick();
    component.passwordForm.setValue({
      currentPassword: 'old123',
      newPassword: 'new123',
      confirmPassword: 'new123'
    });
    component.changePassword();
    expect(component.isPasswordLoading()).toBeTrue();
    changePasswordSubject.next({ success: true });
    tick();
    expect(component.isPasswordLoading()).toBeFalse();
  }));

  it('should auto-dismiss success message after 3 seconds', fakeAsync(() => {
    tick();
    component.profileForm.patchValue({ firstName: 'Jane' });
    component.saveProfile();
    updateProfileSubject.next(mockUser);
    tick(2500);
    expect(component.successMessage()).toBe('Profile updated successfully!');
    tick(1000);
    expect(component.successMessage()).toBeNull();
  }));

  it('should handle file selection for avatar upload', fakeAsync(() => {
    tick();
    const file = new File(['test'], 'avatar.png', { type: 'image/png' });
    const input = fixture.debugElement.query(By.css('input[type="file"]'));
    input.triggerEventHandler('change', { target: { files: [file] } });
    tick();
    updateProfileSubject.next(mockUser);
    tick();
    expect(authServiceSpy.updateProfile).toHaveBeenCalled();
  }));

  it('should get empty avatar URL when no profile picture', () => {
    expect(component.getAvatarUrl()).toBe('');
  });
});
