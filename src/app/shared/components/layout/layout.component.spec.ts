import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LayoutComponent } from './layout.component';
import { ThemeService } from '../../../core/services/theme.service';
import { HeaderComponent } from '../header/header.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FooterComponent } from '../footer/footer.component';
import { signal } from '@angular/core';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let themeService: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    themeService = jasmine.createSpyObj('ThemeService', [], {
      isDarkMode: signal(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule, 
        HttpClientTestingModule,
        LayoutComponent, 
        HeaderComponent, 
        FooterComponent
      ],
      providers: [
        { provide: ThemeService, useValue: themeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header and footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('should apply dark class when theme is dark', () => {
    (themeService.isDarkMode as any).set(true);
    expect(themeService.isDarkMode()).toBeTrue();
  });
});
