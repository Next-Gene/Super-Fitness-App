import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionService } from '../../../core/services/nutrition.service';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition.component.html',
  styleUrl: './nutrition.component.scss'
})
export class NutritionComponent implements OnInit, OnDestroy {
  readonly nutritionService = inject(NutritionService);

  readonly meals = this.nutritionService.meals;
  readonly dailyNutrition = this.nutritionService.dailyNutrition;
  readonly isLoading = this.nutritionService.loading;

  selectedMealType = signal<string>('all');

  ngOnInit(): void {
    this.loadNutrition();
  }

  loadNutrition(): void {
    this.nutritionService.getDailyNutrition().subscribe();
    this.nutritionService.getMeals().subscribe();
  }

  getFilteredMeals() {
    const type = this.selectedMealType();
    if (type === 'all') {
      return this.meals();
    }
    return this.meals().filter(m => m.mealType === type);
  }

  getCaloriesRemaining(): number {
    const current = this.dailyNutrition()?.calories ?? 0;
    const goal = this.dailyNutrition()?.calorieGoal ?? 2000;
    return Math.max(goal - current, 0);
  }

  getCaloriesDashArray(): string {
    const current = this.dailyNutrition()?.calories ?? 0;
    const goal = this.dailyNutrition()?.calorieGoal ?? 2000;
    const percent = Math.min((current / goal) * 100, 100);
    const circumference = 2 * Math.PI * 45;
    const filled = (percent / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  getMacroPercent(type: 'protein' | 'carbs' | 'fat'): number {
    const nutrition = this.dailyNutrition();
    if (!nutrition) return 0;
    
    if (type === 'protein') {
      return Math.min((nutrition.protein / (nutrition.proteinGoal || 150)) * 100, 100);
    } else if (type === 'carbs') {
      return Math.min((nutrition.carbs / (nutrition.carbsGoal || 250)) * 100, 100);
    } else {
      return Math.min((nutrition.fat / (nutrition.fatGoal || 65)) * 100, 100);
    }
  }

  ngOnDestroy(): void {}
}