import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NutritionComponent } from './nutrition.component';
import { NutritionService } from '../../../core/services/nutrition.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DailyNutrition, Meal, MealType } from '../../../core/models';
import { By } from '@angular/platform-browser';

const mockMeals: Meal[] = [
  {
    id: '1', name: 'Grilled Chicken Salad', description: 'Healthy lunch', calories: 450,
    protein: 35, carbs: 20, fat: 20, fiber: 5, mealType: 'Lunch' as MealType,
    ingredients: [], createdAt: '2026-01-01', nutritionFacts: { calories: 450, protein: 35, carbs: 20, fat: 20 }
  },
  {
    id: '2', name: 'Oatmeal with Fruits', description: 'Fiber-rich breakfast', calories: 350,
    protein: 12, carbs: 50, fat: 8, fiber: 8, mealType: 'Breakfast' as MealType,
    ingredients: [], createdAt: '2026-01-01', nutritionFacts: { calories: 350, protein: 12, carbs: 50, fat: 8 }
  },
  {
    id: '3', name: 'Salmon with Vegetables', description: 'Omega-3 rich dinner', calories: 550,
    protein: 40, carbs: 25, fat: 25, fiber: 4, mealType: 'Dinner' as MealType,
    ingredients: [], createdAt: '2026-01-01', nutritionFacts: { calories: 550, protein: 40, carbs: 25, fat: 25 }
  }
];

const mockDailyNutrition: DailyNutrition = {
  date: '2026-01-01', meals: [], calories: 1200, calorieGoal: 2000,
  protein: 80, proteinGoal: 150, carbs: 180, carbsGoal: 250, fat: 45, fatGoal: 65
};

describe('NutritionComponent', () => {
  let component: NutritionComponent;
  let fixture: ComponentFixture<NutritionComponent>;
  let nutritionServiceSpy: jasmine.SpyObj<NutritionService>;

  beforeEach(async () => {
    const nSpy = jasmine.createSpyObj('NutritionService', ['getDailyNutrition', 'getMeals'], {
      meals: signal(mockMeals),
      dailyNutrition: signal(mockDailyNutrition),
      loading: signal(false)
    });

    nSpy.getDailyNutrition.and.returnValue(of(mockDailyNutrition));
    nSpy.getMeals.and.returnValue(of(mockMeals));

    await TestBed.configureTestingModule({
      imports: [NutritionComponent],
      providers: [
        provideRouter([]),
        { provide: NutritionService, useValue: nSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionComponent);
    component = fixture.componentInstance;
    nutritionServiceSpy = TestBed.inject(NutritionService) as jasmine.SpyObj<NutritionService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load nutrition and meals on init', () => {
    expect(nutritionServiceSpy.getDailyNutrition).toHaveBeenCalled();
    expect(nutritionServiceSpy.getMeals).toHaveBeenCalled();
  });

  it('should display page header with title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Nutrition');
  });

  it('should display calories from daily nutrition', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const currentEl = compiled.querySelector('.ring-center .current');
    expect(currentEl?.textContent?.trim()).toBe('1200');
  });

  it('should display calorie goal', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const goalEl = compiled.querySelector('.ring-center .goal');
    expect(goalEl?.textContent?.trim()).toContain('2000');
  });

  it('should calculate correct calories remaining', () => {
    expect(component.getCaloriesRemaining()).toBe(800);
  });

  it('should display remaining calories in summary', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const summaryP = compiled.querySelector('.summary-info p');
    expect(summaryP?.textContent?.trim()).toContain('800 remaining');
  });

  it('should display protein macro with correct value', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const proteinCards = compiled.querySelectorAll('.macro-card.protein .macro-value');
    expect(proteinCards[0].textContent?.trim()).toBe('80g');
  });

  it('should display carbs macro with correct value', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const carbCards = compiled.querySelectorAll('.macro-card.carbs .macro-value');
    expect(carbCards[0].textContent?.trim()).toBe('180g');
  });

  it('should display fat macro with correct value', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const fatCards = compiled.querySelectorAll('.macro-card.fat .macro-value');
    expect(fatCards[0].textContent?.trim()).toBe('45g');
  });

  it('should calculate correct protein percentage', () => {
    expect(component.getMacroPercent('protein')).toBeCloseTo(53.33, 1);
  });

  it('should calculate correct carbs percentage', () => {
    expect(component.getMacroPercent('carbs')).toBeCloseTo(72, 1);
  });

  it('should calculate correct fat percentage', () => {
    expect(component.getMacroPercent('fat')).toBeCloseTo(69.23, 1);
  });

  it('should show all meals when no filter selected', () => {
    component.selectedMealType.set('all');
    fixture.detectChanges();
    const filtered = component.getFilteredMeals();
    expect(filtered.length).toBe(3);
  });

  it('should filter meals by breakfast type', () => {
    component.selectedMealType.set('Breakfast');
    fixture.detectChanges();
    const filtered = component.getFilteredMeals();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Oatmeal with Fruits');
  });

  it('should filter meals by lunch type', () => {
    component.selectedMealType.set('Lunch');
    fixture.detectChanges();
    const filtered = component.getFilteredMeals();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe('Grilled Chicken Salad');
  });

  it('should display meal cards in the grid', () => {
    const cards = fixture.debugElement.queryAll(By.css('.meal-card'));
    expect(cards.length).toBe(3);
  });

  it('should display meal names in the cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h3Elements = compiled.querySelectorAll('.meal-body h3');
    expect(h3Elements[0].textContent?.trim()).toBe('Grilled Chicken Salad');
    expect(h3Elements[1].textContent?.trim()).toBe('Oatmeal with Fruits');
    expect(h3Elements[2].textContent?.trim()).toBe('Salmon with Vegetables');
  });

  it('should show empty state when no meals match filter', () => {
    component.selectedMealType.set('Snack');
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.querySelector('h3')?.textContent?.trim()).toBe('No meals found');
  });

  it('should have meal type tabs in the header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('.meal-tabs button');
    expect(tabs.length).toBe(5);
    expect(tabs[0].textContent?.trim()).toBe('All');
    expect(tabs[1].textContent?.trim()).toBe('Breakfast');
    expect(tabs[2].textContent?.trim()).toBe('Lunch');
    expect(tabs[3].textContent?.trim()).toBe('Dinner');
    expect(tabs[4].textContent?.trim()).toBe('Snack');
  });

  it('should highlight the active meal type tab', () => {
    component.selectedMealType.set('Breakfast');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const activeBtn = compiled.querySelector('.meal-tabs button.active');
    expect(activeBtn?.textContent?.trim()).toBe('Breakfast');
  });

  it('should change meal type when clicking a tab', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dinnerBtn = compiled.querySelectorAll('.meal-tabs button')[3] as HTMLElement;
    dinnerBtn.click();
    expect(component.selectedMealType()).toBe('Dinner');
  });

  it('should return correct SVG dash array for calories ring', () => {
    const dashArray = component.getCaloriesDashArray();
    const circumference = 2 * Math.PI * 45;
    const expectedFilled = (1200 / 2000) * circumference;
    expect(dashArray).toContain(expectedFilled.toFixed(10));
  });

  it('should return gradient for breakfast meal type', () => {
    const gradient = component.getMealGradient('Breakfast');
    expect(gradient).toContain('#f7c531');
  });

  it('should return gradient for lunch meal type', () => {
    const gradient = component.getMealGradient('Lunch');
    expect(gradient).toContain('#00ff88');
  });

  it('should return gradient for dinner meal type', () => {
    const gradient = component.getMealGradient('Dinner');
    expect(gradient).toContain('#e94560');
  });

  it('should return default gradient for unknown meal type', () => {
    const gradient = component.getMealGradient('Unknown');
    expect(gradient).toContain('#64748b');
  });

  it('should handle null daily nutrition gracefully', () => {
    (nutritionServiceSpy as any).dailyNutrition.set(null);
    fixture.detectChanges();
    expect(component.getCaloriesRemaining()).toBe(2000);
    expect(component.getMacroPercent('protein')).toBe(0);
  });

  it('should cap calories remaining at zero when over goal', () => {
    (nutritionServiceSpy as any).dailyNutrition.set({
      ...mockDailyNutrition, calories: 2500, calorieGoal: 2000
    });
    fixture.detectChanges();
    expect(component.getCaloriesRemaining()).toBe(0);
  });

  it('should cap macro percentages at 100', () => {
    (nutritionServiceSpy as any).dailyNutrition.set({
      ...mockDailyNutrition, protein: 200, proteinGoal: 150
    });
    fixture.detectChanges();
    expect(component.getMacroPercent('protein')).toBe(100);
  });
});
