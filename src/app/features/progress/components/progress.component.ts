import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressService } from '../../../core/services/progress.service';
import { ProgressRecord } from '../../../core/models';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss'
})
export class ProgressComponent implements OnInit, OnDestroy {
  readonly progressService = inject(ProgressService);

  readonly progressRecords = this.progressService.progressRecords;
  readonly isLoading = this.progressService.loading;

  showAddModal = signal(false);
  newProgress = signal<{ weight: number | null; bodyFat: number | null; notes: string }>({
    weight: null,
    bodyFat: null,
    notes: ''
  });

  ngOnInit(): void {
    this.loadProgress();
  }

  loadProgress(): void {
    this.progressService.getProgressHistory().subscribe();
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
    this.newProgress.set({ weight: null, bodyFat: null, notes: '' });
  }

  saveProgress(): void {
    const data = this.newProgress();
    if (data.weight !== null) {
      this.progressService.addProgress({
        weight: data.weight,
        bodyFat: data.bodyFat ?? undefined,
        notes: data.notes || undefined
      }).subscribe({
        next: () => this.closeAddModal()
      });
    }
  }

  getLatestWeight(): number {
    const records = this.progressRecords();
    if (records.length === 0) return 0;
    return records[0]?.weight ?? 0;
  }

  getLatestBodyFat(): number {
    const records = this.progressRecords();
    if (records.length === 0) return 0;
    return records[0]?.bodyFat ?? 0;
  }

  getWeightChange(): number {
    const records = this.progressRecords();
    if (records.length < 2) return 0;
    const first = records[0]?.weight ?? 0;
    const last = records[records.length - 1]?.weight ?? 0;
    return Math.round((first - last) * 10) / 10;
  }

  getDay(date: string): string {
    return new Date(date).getDate().toString();
  }

  getMonth(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short' });
  }

  ngOnDestroy(): void {}
}