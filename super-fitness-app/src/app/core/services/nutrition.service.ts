import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { Meal, NutritionGoal, DailyNutrition, MealType } from '../models';

export interface MealRecommendation {
  id: number;
  name: string;
  description: string;
  mealType: string;
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface MealDetailsResponse {
  id: number;
  name: string;
  description: string;
  mealType: string;
  prepTime: number;
  difficulty: string;
  imageUrl?: string;
  isPremium: boolean;
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
  };
  ingredients: { name: string; amount: string }[];
  tags: string[];
  allergens: string[];
  variations: any;
}

export interface RandomMealSuggestion {
  id: number;
  name: string;
  description: string;
  mealType: string;
  difficulty: string;
  prepTimeInMinutes: number;
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  mainIngredients: string[];
}

export interface DailyTip {
  tip: string;
  category: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class NutritionService implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  private readonly _meals = signal<Meal[]>([]);
  private readonly _nutritionGoal = signal<NutritionGoal | null>(null);
  private readonly _dailyNutrition = signal<DailyNutrition | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  readonly meals = this._meals.asReadonly();
  readonly nutritionGoal = this._nutritionGoal.asReadonly();
  readonly dailyNutrition = this._dailyNutrition.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  getMeals(): Observable<Meal[]> {
    this._loading.set(true);

    return this.api.get<any>('/nutrition/recommendations', { page: '1', pageSize: '20' }).pipe(
      tap(response => {
        const mealsArray = response?.items || response?.data?.items || response;
        if (Array.isArray(mealsArray)) {
          const mappedMeals: Meal[] = mealsArray.map(m => ({
            id: String(m.id),
            name: m.name,
            description: m.description,
            calories: m.nutritionFacts?.calories || m.calories || 0,
            protein: m.nutritionFacts?.protein || m.protein || 0,
            carbs: m.nutritionFacts?.carbs || m.carbs || 0,
            fat: m.nutritionFacts?.fats || m.fats || 0,
            fiber: 0,
            mealType: (m.mealType as MealType) || 'lunch',
            ingredients: [],
            createdAt: new Date().toISOString(),
            imageUrl: m.imageUrl,
            nutritionFacts: {
              calories: m.nutritionFacts?.calories || m.calories || 0,
              protein: m.nutritionFacts?.protein || m.protein || 0,
              carbs: m.nutritionFacts?.carbs || m.carbs || 0,
              fat: m.nutritionFacts?.fats || m.fats || 0
            }
          }));
          this._meals.set(mappedMeals);
        } else {
          this._meals.set(this.getMockMeals());
        }
      }),
      map(response => {
        const mealsArray = response?.items || response?.data?.items || response;
        if (Array.isArray(mealsArray)) {
          return mealsArray.map(m => ({
            id: String(m.id),
            name: m.name,
            description: m.description,
            calories: m.nutritionFacts?.calories || m.calories || 0,
            protein: m.nutritionFacts?.protein || m.protein || 0,
            carbs: m.nutritionFacts?.carbs || m.carbs || 0,
            fat: m.nutritionFacts?.fats || m.fats || 0,
            fiber: 0,
            mealType: (m.mealType as MealType) || 'lunch',
            ingredients: [],
            createdAt: new Date().toISOString(),
            imageUrl: m.imageUrl,
            nutritionFacts: {
              calories: m.nutritionFacts?.calories || m.calories || 0,
              protein: m.nutritionFacts?.protein || m.protein || 0,
              carbs: m.nutritionFacts?.carbs || m.carbs || 0,
              fat: m.nutritionFacts?.fats || m.fats || 0
            }
          }));
        }
        return this.getMockMeals();
      }),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        return of(this.getMockMeals());
      }),
      tap(() => this._loading.set(false))
    );
  }

  private getMockMeals(): Meal[] {
    const mock = [
      { id: '1', name: 'Grilled Chicken Salad', description: 'Healthy protein-rich salad', mealType: 'Lunch' as MealType, calories: 450, protein: 35, carbs: 20, fat: 20 },
      { id: '2', name: 'Oatmeal with Fruits', description: 'Fiber-rich breakfast', mealType: 'Breakfast' as MealType, calories: 350, protein: 12, carbs: 50, fat: 8 },
      { id: '3', name: 'Salmon with Vegetables', description: 'Omega-3 rich dinner', mealType: 'Dinner' as MealType, calories: 550, protein: 40, carbs: 25, fat: 25 },
      { id: '4', name: 'Greek Yogurt Snack', description: 'Protein-packed snack', mealType: 'Snack' as MealType, calories: 150, protein: 15, carbs: 10, fat: 5 },
    ];
    return mock.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      fiber: 0,
      mealType: m.mealType,
      ingredients: [],
      createdAt: new Date().toISOString(),
      nutritionFacts: {
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat
      }
    }));
  }

  getMealDetails(id: number): Observable<MealDetailsResponse> {
    this._loading.set(true);

    return this.api.get<{ data: MealDetailsResponse }>(`/nutrition/meals/${id}`).pipe(
      map(response => response?.data),
      tap(() => this._loading.set(false)),
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        throw err;
      })
    );
  }

  getRandomMealSuggestion(): Observable<RandomMealSuggestion> {
    this._loading.set(true);

    return this.api.get<RandomMealSuggestion>('/nutrition/random-meal').pipe(
      catchError(err => {
        this._error.set(err.message);
        this._loading.set(false);
        throw err;
      }),
      tap(() => this._loading.set(false))
    );
  }

  getDailyTip(): Observable<DailyTip> {
    return this.api.get<DailyTip>('/nutrition/daily-tip').pipe(
      catchError(err => {
        return of({ tip: 'Stay hydrated!', category: 'general', title: 'Daily Tip' });
      })
    );
  }

  getDailyNutrition(): Observable<DailyNutrition> {
    this._loading.set(true);

    const user = this.authService.getUser();
    const userId = user?.id;

    if (!userId) {
      this._loading.set(false);
      return of(this.getDefaultDailyNutrition());
    }

    return this.api.get<any>(`/progress?userId=${userId}&period=weekly`).pipe(
      tap(response => {
        const nutrition = this.getDefaultDailyNutrition();
        
        if (response?.data?.weightHistory && response.data.weightHistory.length > 0) {
          const lastWeight = response.data.weightHistory[response.data.weightHistory.length - 1].weight;
          nutrition.weight = lastWeight;
        }
        
        if (response?.data?.statistics?.totalCaloriesBurned) {
          nutrition.calories = response.data.statistics.totalCaloriesBurned;
        }
        
        this._dailyNutrition.set(nutrition);
      }),
      map(response => {
        const nutrition = this.getDefaultDailyNutrition();
        
        if (response?.data?.weightHistory && response.data.weightHistory.length > 0) {
          const lastWeight = response.data.weightHistory[response.data.weightHistory.length - 1].weight;
          nutrition.weight = lastWeight;
        }
        
        if (response?.data?.statistics?.totalCaloriesBurned) {
          nutrition.calories = response.data.statistics.totalCaloriesBurned;
        }
        return nutrition;
      }),
      catchError(err => {
        this._error.set(err.message);
        this._dailyNutrition.set(this.getDefaultDailyNutrition());
        return of(this.getDefaultDailyNutrition());
      }),
      tap(() => this._loading.set(false))
    );
  }

  private getDefaultDailyNutrition(): DailyNutrition {
    return {
      date: new Date().toISOString(),
      meals: [],
      calories: 0,
      calorieGoal: 2000,
      protein: 0,
      proteinGoal: 150,
      carbs: 0,
      carbsGoal: 250,
      fat: 0,
      fatGoal: 65,
      weight: 0
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}