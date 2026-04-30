import { TestBed } from '@angular/core/testing';
import { NutritionService, MealDetailsResponse } from './nutrition.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';

describe('NutritionService', () => {
  let service: NutritionService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockMealDetails: MealDetailsResponse = {
    id: 1,
    name: 'Test Meal',
    description: 'Description',
    mealType: 'Lunch',
    prepTime: 20,
    difficulty: 'Easy',
    isPremium: false,
    servings: 1,
    nutrition: { calories: 500, protein: 30, carbs: 50, fats: 15, fiber: 5, sugar: 5 },
    ingredients: [{ name: 'Ingredient 1', amount: '100g' }],
    tags: ['Healthy'],
    allergens: [],
    variations: null
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUser']);

    TestBed.configureTestingModule({
      providers: [
        NutritionService,
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(NutritionService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMeals', () => {
    it('should fetch and map meals successfully', () => {
      const mockResponse = { items: [{ id: 1, name: 'Meal 1', nutritionFacts: { calories: 400 } }] };
      apiServiceSpy.get.and.returnValue(of(mockResponse));

      service.getMeals().subscribe(meals => {
        expect(meals.length).toBe(1);
        expect(meals[0].name).toBe('Meal 1');
        expect(meals[0].calories).toBe(400);
      });

      expect(apiServiceSpy.get).toHaveBeenCalledWith('/nutrition/recommendations', jasmine.any(Object));
    });

    it('should return mock meals on error', () => {
      apiServiceSpy.get.and.returnValue(throwError(() => new Error('Server error')));

      service.getMeals().subscribe(meals => {
        expect(meals.length).toBeGreaterThan(0); // Should fall back to mock
        expect(service.error()).toBeTruthy();
      });
    });
  });

  describe('Meal Details', () => {
    it('should fetch meal details', () => {
      apiServiceSpy.get.and.returnValue(of({ data: mockMealDetails }));

      service.getMealDetails(1).subscribe(details => {
        expect(details.name).toBe('Test Meal');
      });

      expect(apiServiceSpy.get).toHaveBeenCalledWith('/nutrition/meals/1');
    });
  });

  describe('Daily Tip', () => {
    it('should fetch daily tip', () => {
      const mockTip = { tip: 'Eat more veggies', category: 'Health', title: 'Daily Tip' };
      apiServiceSpy.get.and.returnValue(of(mockTip));

      service.getDailyTip().subscribe(tip => {
        expect(tip.tip).toBe('Eat more veggies');
      });
    });
  });
});
