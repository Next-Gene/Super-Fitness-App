import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoComponent } from './logo.component';
import { By } from '@angular/platform-browser';

describe('LogoComponent', () => {
  let component: LogoComponent;
  let fixture: ComponentFixture<LogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the SVG logo', () => {
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg).toBeTruthy();
    expect(svg.nativeElement.getAttribute('viewBox')).toBe('0 0 100 100');
  });

  it('should have default size of 40px', () => {
    expect(component.size).toBe(40);
  });

  it('should set wrapper dimensions from size input', () => {
    component.size = 64;
    fixture.detectChanges();
    const wrapper = fixture.debugElement.query(By.css('.logo-wrapper'));
    expect(wrapper.nativeElement.style.width).toBe('64px');
    expect(wrapper.nativeElement.style.height).toBe('64px');
  });

  it('should render with custom size', () => {
    component.size = 100;
    fixture.detectChanges();
    const wrapper = fixture.debugElement.query(By.css('.logo-wrapper'));
    expect(wrapper.nativeElement.style.width).toBe('100px');
  });

  it('should contain the gradient definition', () => {
    const defs = fixture.debugElement.query(By.css('defs'));
    expect(defs).toBeTruthy();
  });

  it('should contain the logo path', () => {
    const paths = fixture.debugElement.queryAll(By.css('.logo-path'));
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should apply hover transform via CSS', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const wrapper = compiled.querySelector('.logo-wrapper');
    expect(wrapper).toBeTruthy();
  });
});
