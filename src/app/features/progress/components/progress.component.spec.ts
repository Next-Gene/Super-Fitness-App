import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ProgressComponent } from './progress.component';
import { ProgressService } from '../../../core/services/progress.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { ProgressRecord } from '../../../core/models';
import { By } from '@angular/platform-browser';

const mockProgressRecords: ProgressRecord[] = [
  { id: '1', date: '2026-04-15', weight: 80, bodyFat: 18, notes: 'Feeling strong' },
  { id: '2', date: '2026-04-08', weight: 82, bodyFat: 19, notes: '' },
  { id: '3', date: '2026-04-01', weight: 83.5, bodyFat: 20, notes: 'Starting point' }
];

describe('ProgressComponent', () => {
  let component: ProgressComponent;
  let fixture: ComponentFixture<ProgressComponent>;
  let progressServiceSpy: jasmine.SpyObj<ProgressService>;

  beforeEach(async () => {
    const pSpy = jasmine.createSpyObj('ProgressService', ['getProgressHistory', 'addProgress'], {
      progressRecords: signal(mockProgressRecords),
      loading: signal(false)
    });

    pSpy.getProgressHistory.and.returnValue(of(mockProgressRecords));
    pSpy.addProgress.and.returnValue(of({ id: '4', date: '2026-04-20', weight: 79, bodyFat: 17 }));

    await TestBed.configureTestingModule({
      imports: [ProgressComponent, FormsModule],
      providers: [{ provide: ProgressService, useValue: pSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressComponent);
    component = fixture.componentInstance;
    progressServiceSpy = TestBed.inject(ProgressService) as jasmine.SpyObj<ProgressService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load progress history on init', () => {
    expect(progressServiceSpy.getProgressHistory).toHaveBeenCalled();
  });

  it('should display page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Your Progress');
  });

  it('should display current weight from latest record', () => {
    expect(component.getLatestWeight()).toBe(80);
  });

  it('should return 0 for weight when no records exist', () => {
    (progressServiceSpy as any).progressRecords.set([]);
    fixture.detectChanges();
    expect(component.getLatestWeight()).toBe(0);
  });

  it('should display current body fat from latest record', () => {
    expect(component.getLatestBodyFat()).toBe(18);
  });

  it('should return 0 for body fat when no records exist', () => {
    (progressServiceSpy as any).progressRecords.set([]);
    fixture.detectChanges();
    expect(component.getLatestBodyFat()).toBe(0);
  });

  it('should calculate weight change correctly (first - last)', () => {
    expect(component.getWeightChange()).toBeCloseTo(-3.5, 1);
  });

  it('should return 0 weight change with fewer than 2 records', () => {
    (progressServiceSpy as any).progressRecords.set([{ id: '1', date: '2026-01-01', weight: 80 }]);
    fixture.detectChanges();
    expect(component.getWeightChange()).toBe(0);
  });

  it('should display stats cards in the grid', () => {
    const statCards = fixture.debugElement.queryAll(By.css('.stat-card'));
    expect(statCards.length).toBe(4);
  });

  it('should display total logs count', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const statValues = compiled.querySelectorAll('.stat-value');
    expect(statValues[2].textContent?.trim()).toBe('3');
  });

  it('should display weight change with sign', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const changeValue = compiled.querySelectorAll('.stat-value')[3];
    expect(changeValue.textContent?.trim()).toContain('-3.5');
  });

  it('should display progress records in history list', () => {
    const items = fixture.debugElement.queryAll(By.css('.history-item'));
    expect(items.length).toBe(3);
  });

  it('should display record weight in history item', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstWeight = compiled.querySelector('.history-item .data-row .value');
    expect(firstWeight?.textContent?.trim()).toBe('80 kg');
  });

  it('should display record body fat when available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const bodyFatRows = compiled.querySelectorAll('.data-row .value');
    expect(bodyFatRows[1]?.textContent?.trim()).toBe('18%');
  });

  it('should display record notes when available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const notesRow = compiled.querySelector('.data-row.notes .value');
    expect(notesRow?.textContent?.trim()).toBe('Feeling strong');
  });

  it('should open add modal', () => {
    component.openAddModal();
    expect(component.showAddModal()).toBeTrue();
  });

  it('should close add modal and reset form', () => {
    component.openAddModal();
    component.newProgress.set({ weight: 85, bodyFat: 20, notes: 'test' });
    component.closeAddModal();
    expect(component.showAddModal()).toBeFalse();
    expect(component.newProgress().weight).toBeNull();
    expect(component.newProgress().bodyFat).toBeNull();
    expect(component.newProgress().notes).toBe('');
  });

  it('should save progress when weight is provided', fakeAsync(() => {
    component.openAddModal();
    component.newProgress.set({ weight: 79, bodyFat: 17, notes: 'New record' });
    component.saveProgress();
    tick();
    expect(progressServiceSpy.addProgress).toHaveBeenCalledWith({
      weight: 79, bodyFat: 17, notes: 'New record'
    });
  }));

  it('should not save progress when weight is null', () => {
    component.openAddModal();
    component.newProgress.set({ weight: null, bodyFat: 17, notes: '' });
    component.saveProgress();
    expect(progressServiceSpy.addProgress).not.toHaveBeenCalled();
  });

  it('should close modal after successful save', fakeAsync(() => {
    component.openAddModal();
    component.newProgress.set({ weight: 79, bodyFat: null, notes: '' });
    component.saveProgress();
    tick();
    expect(component.showAddModal()).toBeFalse();
  }));

  it('should display the log progress button', () => {
    const btn = fixture.debugElement.query(By.css('.add-btn'));
    expect(btn).toBeTruthy();
    expect(btn.nativeElement.textContent?.trim()).toContain('Log Progress');
  });

  it('should display the weight progress chart', () => {
    const chartCard = fixture.debugElement.query(By.css('.chart-card'));
    expect(chartCard).toBeTruthy();
    expect(chartCard.nativeElement.querySelector('h2')?.textContent?.trim()).toBe('Weight Progress');
  });

  it('should display empty state when no records exist', () => {
    (progressServiceSpy as any).progressRecords.set([]);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.querySelector('h3')?.textContent?.trim()).toBe('No progress yet');
  });

  it('should display modal overlay when modal is open', () => {
    component.openAddModal();
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(overlay).toBeTruthy();
  });

  it('should display modal header title', () => {
    component.openAddModal();
    fixture.detectChanges();
    const modalTitle = fixture.nativeElement.querySelector('.modal-header h2');
    expect(modalTitle?.textContent?.trim()).toBe('Log Progress');
  });

  it('should close modal when clicking overlay', () => {
    component.openAddModal();
    fixture.detectChanges();
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    overlay.triggerEventHandler('click', null);
    expect(component.showAddModal()).toBeFalse();
  });

  it('should display day and month from date', () => {
    expect(component.getDay('2026-04-15')).toBe('15');
    expect(component.getMonth('2026-04-15')).toContain('Apr');
  });

  it('should handle records with undefined bodyFat', () => {
    const records = [{ id: '1', date: '2026-04-15', weight: 80, bodyFat: undefined }];
    (progressServiceSpy as any).progressRecords.set(records as ProgressRecord[]);
    fixture.detectChanges();
    expect(component.getLatestBodyFat()).toBe(0);
  });

  it('should handle records with undefined notes', () => {
    const records = [{ id: '1', date: '2026-04-15', weight: 80 }];
    (progressServiceSpy as any).progressRecords.set(records as ProgressRecord[]);
    fixture.detectChanges();
    expect(component.getLatestWeight()).toBe(80);
  });

  it('should display history header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.history-header h2')?.textContent?.trim()).toBe('Progress History');
  });
});
