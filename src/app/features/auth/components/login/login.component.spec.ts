import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../../core/services/auth.service';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    router = jasmine.createSpyObj('Router', ['navigate'], {
      createUrlTree: () => ({}) as any,
      serializeUrl: () => '',
      events: new BehaviorSubject<any>(null),
      getCurrentNavigation: () => null
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize the form', () => {
    // Assert
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should show error when form is invalid and submitted', () => {
    // Act
    component.onSubmit();
    fixture.detectChanges();

    // Assert
    const emailError = fixture.debugElement.query(By.css('.error-text'));
    expect(emailError).toBeTruthy();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login when form is valid', () => {
    // Arrange
    const credentials = { email: 'test@example.com', password: 'password123' };
    component.loginForm.setValue({ ...credentials, rememberMe: false });
    authService.login.and.returnValue(of({ 
      success: true, 
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      userId: '1',
      userName: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      fullName: 'Test User',
      roles: ['User']
    } as any));

    // Act
    component.onSubmit();

    // Assert
    expect(authService.login).toHaveBeenCalledWith({ ...credentials, rememberMe: false });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle login error correctly', () => {
    // Arrange
    component.loginForm.setValue({ email: 'test@example.com', password: 'password123', rememberMe: false });
    authService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));

    // Act
    component.onSubmit();
    fixture.detectChanges();

    // Assert
    expect(component.error()).toBe('Invalid credentials');
    const errorMessage = fixture.debugElement.query(By.css('.error-message'));
    expect(errorMessage.nativeElement.textContent).toContain('Invalid credentials');
  });

  it('should toggle password visibility', () => {
    // Arrange
    const passwordInput = fixture.debugElement.query(By.css('#password')).nativeElement;
    expect(passwordInput.type).toBe('password');

    // Act
    const toggleBtn = fixture.debugElement.query(By.css('.toggle-password'));
    toggleBtn.triggerEventHandler('click', null);
    fixture.detectChanges();

    // Assert
    expect(passwordInput.type).toBe('text');
    expect(component.showPassword()).toBeTrue();
  });
});
