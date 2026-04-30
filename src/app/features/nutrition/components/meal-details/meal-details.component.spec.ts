import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MealDetailsComponent } from './meal-details.component';
import { NutritionService, MealDetailsResponse } from '../../../../core/services/nutrition.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';

const mockMealDetails: MealDetailsResponse = {
  id: 1, name: 'Grilled Chicken Salad', description: 'Healthy protein-rich meal',
  mealType: 'Lunch', prepTime: 25, difficulty: 'Easy', imageUrl: '/images/chicken.jpg',
  isPremium: false, servings: 2, nutrition: { calories: 450, protein: 35, carbs: 20, fats: 20, fiber: 5, sugar: 3 },
  ingredients: [
    { name: 'Chicken Breast', amount: '200g' },
    { name: 'Mixed Greens', amount: '100g' },
    { name: 'Olive Oil', amount: '1 tbsp' }
  ],
  tags: ['High Protein', 'Low Carb', 'Gluten Free'],
  allergens: ['None'],
  variations: {
    'Hard': { name: 'Hard Version', calories: 500, modifications: ['Add extra protein', 'Increase portion'] }
  }
};

describe('MealDetailsComponent', () => {
  let component: MealDetailsComponent;
  let fixture: ComponentFixture<MealDetailsComponent>;
  let nutritionServiceSpy: jasmine.SpyObj<NutritionService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let routeSpy: any;

  beforeEach(async () => {
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    routeSpy = { snapshot: { paramMap: { get: () => '1' } } };

    const nSpy = jasmine.createSpyObj('NutritionService', ['getMealDetails'], {
      loading: signal(false)
    });

    nSpy.getMealDetails.and.returnValue(of(mockMealDetails));

    await TestBed.configureTestingModule({
      imports: [MealDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: NutritionService, useValue: nSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MealDetailsComponent);
    component = fixture.componentInstance;
    nutritionServiceSpy = TestBed.inject(NutritionService) as jasmine.SpyObj<NutritionService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch meal details on init using route param', () => {
    expect(nutritionServiceSpy.getMealDetails).toHaveBeenCalledWith(1);
  });

  it('should populate mealDetails signal with API response', fakeAsync(() => {
    tick();
    expect(component.mealDetails()?.name).toBe('Grilled Chicken Salad');
    expect(component.mealDetails()?.nutrition.calories).toBe(450);
  }));

  it('should display loading state when loading is true', () => {
    (nutritionServiceSpy as any).loading.set(true);
    fixture.detectChanges();
    const loadingState = fixture.nativeElement.querySelector('.loading-state');
    expect(loadingState).toBeTruthy();
    expect(loadingState.querySelector('p')?.textContent?.trim()).toContain('Loading meal details');
  });

  it('should display meal name when loaded', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe('Grilled Chicken Salad');
  }));

  it('should display meal description', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.description')?.textContent?.trim()).toBe('Healthy protein-rich meal');
  }));

  it('should display prep time', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const metaValues = compiled.querySelectorAll('.meta-stat .value');
    expect(metaValues[0].textContent?.trim()).toBe('25');
  }));

  it('should display difficulty level', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const metaValues = compiled.querySelectorAll('.meta-stat .value');
    expect(metaValues[1].textContent?.trim()).toBe('Easy');
  }));

  it('should display servings count', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const metaValues = compiled.querySelectorAll('.meta-stat .value');
    expect(metaValues[2].textContent?.trim()).toBe('2');
  }));

  it('should display nutrition facts with calories', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const nutriItems = compiled.querySelectorAll('.nutrition-card .nutri-value');
    expect(nutriItems[0].textContent?.trim()).toBe('450');
  }));

  it('should display protein value in nutrition', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const nutriItems = compiled.querySelectorAll('.nutrition-card .nutri-value');
    expect(nutriItems[1].textContent?.trim()).toBe('35g');
  }));

  it('should display carbs value in nutrition', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const nutriItems = compiled.querySelectorAll('.nutrition-card .nutri-value');
    expect(nutriItems[2].textContent?.trim()).toBe('20g');
  }));

  it('should display fat value in nutrition', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const nutriItems = compiled.querySelectorAll('.nutrition-card .nutri-value');
    expect(nutriItems[3].textContent?.trim()).toBe('20g');
  }));

  it('should display ingredients list', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const ingredients = compiled.querySelectorAll('.ingredient-item');
    expect(ingredients.length).toBe(3);
    expect(ingredients[0].querySelector('.ing-name')?.textContent?.trim()).toBe('Chicken Breast');
    expect(ingredients[0].querySelector('.ing-amount')?.textContent?.trim()).toBe('200g');
  }));

  it('should display tags', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const tags = compiled.querySelectorAll('.tag');
    expect(tags.length).toBe(3);
    expect(tags[0].textContent?.trim()).toBe('High Protein');
  }));

  it('should display allergens', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const allergens = compiled.querySelectorAll('.allergen-tag');
    expect(allergens.length).toBe(1);
  }));

  it('should display variations when available', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const variations = compiled.querySelectorAll('.variation-item');
    expect(variations.length).toBe(1);
  }));

  it('should return correct variation keys', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const keys = component.getVariationKeys();
    expect(keys).toEqual(['Hard']);
  }));

  it('should return empty array for variations when none exist', () => {
    component.mealDetails.set({ ...mockMealDetails, variations: undefined });
    fixture.detectChanges();
    expect(component.getVariationKeys()).toEqual([]);
  });

  it('should calculate correct percent for nutrition bars', () => {
    expect(component.getPercent(1000, 2000)).toBe(50);
    expect(component.getPercent(2500, 2000)).toBe(100);
    expect(component.getPercent(undefined, 2000)).toBe(0);
  });

  it('should go back when back button is clicked', () => {
    const backBtn = fixture.debugElement.query(By.css('.back-btn'));
    backBtn.triggerEventHandler('click', null);
    expect(locationSpy.back).toHaveBeenCalled();
  });

  it('should display empty state when meal is not found', () => {
    (nutritionServiceSpy as any).loading.set(false);
    component.mealDetails.set(null);
    fixture.detectChanges();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.querySelector('h3')?.textContent?.trim()).toBe('Meal not found');
  });

  it('should not fetch details when route param is missing', () => {
    routeSpy = { snapshot: { paramMap: { get: () => null } } };
    TestBed.resetTestingModule();

    const nSpy2 = jasmine.createSpyObj('NutritionService', ['getMealDetails'], { loading: signal(false) });

    TestBed.configureTestingModule({
      imports: [MealDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: NutritionService, useValue: nSpy2 },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    const fixture2 = TestBed.createComponent(MealDetailsComponent);
    fixture2.detectChanges();

    expect(nSpy2.getMealDetails).not.toHaveBeenCalled();
  });

  it('should handle error gracefully when API fails', () => {
    TestBed.resetTestingModule();
    const nSpy2 = jasmine.createSpyObj('NutritionService', ['getMealDetails'], { loading: signal(false) });
    nSpy2.getMealDetails.and.returnValue(throwError(() => new Error('API Error')));

    TestBed.configureTestingModule({
      imports: [MealDetailsComponent],
      providers: [
        provideRouter([]),
        { provide: NutritionService, useValue: nSpy2 },
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    const fixture2 = TestBed.createComponent(MealDetailsComponent);
    fixture2.detectChanges();

    expect(fixture2.componentInstance.mealDetails()).toBeNull();
  });

  it('should display premium badge when meal is premium', () => {
    component.mealDetails.set({ ...mockMealDetails, isPremium: true });
    fixture.detectChanges();
    const premiumBadge = fixture.nativeElement.querySelector('.premium-badge');
    expect(premiumBadge).toBeTruthy();
  });

  it('should not display premium badge for non-premium meals', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const premiumBadge = fixture.nativeElement.querySelector('.premium-badge');
    expect(premiumBadge).toBeFalsy();
  }));

  it('should display the add to meals button', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.btn-add-full');
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toBe("Add to Today's Meals");
  }));

  it('should display meal type badge', fakeAsync(() => {
    tick();
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.meal-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent?.trim()).toBe('Lunch');
  }));
});
