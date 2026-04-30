import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NutritionService, MealDetailsResponse } from '../../../../core/services/nutrition.service';

@Component({
  selector: 'app-meal-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meal-details.component.html',
  styleUrl: './meal-details.component.scss'
})
export class MealDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly nutritionService = inject(NutritionService);
  readonly location = inject(Location);

  mealDetails = signal<MealDetailsResponse | null>(null);
  loading = this.nutritionService.loading;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.nutritionService.getMealDetails(+id).subscribe({
        next: (data) => this.mealDetails.set(data),
        error: () => {}
      });
    }
  }

  goBack() {
    this.location.back();
  }

  getPercent(value: number | undefined, goal: number): number {
    if (!value) return 0;
    return Math.min((value / goal) * 100, 100);
  }

  getVariationKeys(): string[] {
    const variations = this.mealDetails()?.variations;
    if (!variations) return [];
    return Object.keys(variations);
  }
}