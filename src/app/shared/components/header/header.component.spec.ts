import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideRouter } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { signal } from '@angular/core';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const tSpy = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      isDarkMode: signal(false)
    });
    const aSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated: signal(true),
      currentUser: signal({ firstName: 'John', userName: 'jdoe', email: 'john@example.com' })
    });

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: tSpy },
        { provide: AuthService, useValue: aSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    themeServiceSpy = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user name when authenticated', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.user-name-desktop')?.textContent).toContain('John');
  });

  it('should toggle user menu on click', () => {
    expect(component.isUserMenuOpen()).toBeFalse();
    component.toggleUserMenu();
    expect(component.isUserMenuOpen()).toBeTrue();
    component.toggleUserMenu();
    expect(component.isUserMenuOpen()).toBeFalse();
  });

  it('should call themeService.toggleTheme when theme button clicked', () => {
    const themeBtn = fixture.nativeElement.querySelector('.theme-btn');
    themeBtn.click();
    expect(themeServiceSpy.toggleTheme).toHaveBeenCalled();
  });

  it('should call authService.logout and navigate when logout clicked', () => {
    component.toggleUserMenu();
    fixture.detectChanges();
    
    const logoutBtn = fixture.nativeElement.querySelector('.logout-item');
    logoutBtn.click();
    
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should show login button when not authenticated', () => {
    (authServiceSpy as any).isAuthenticated.set(false);
    fixture.detectChanges();
    
    const loginBtn = fixture.nativeElement.querySelector('.login-btn');
    expect(loginBtn).toBeTruthy();
  });
});
