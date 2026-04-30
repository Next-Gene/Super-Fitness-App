export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealType: MealType;
  ingredients: Ingredient[];
  imageUrl?: string;
  createdAt: string;
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionGoal {
  id: string;
  userId: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  createdAt: string;
}

export interface DailyNutrition {
  date: string;
  meals: MealEntry[];
  calories: number;
  calorieGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
  weight?: number;
}

export interface MealEntry {
  mealId: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';