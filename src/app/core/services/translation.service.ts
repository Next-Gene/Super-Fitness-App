import { Injectable, signal, computed, effect, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [lang: string]: Translation;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService implements OnDestroy {
  private readonly currentLangSubject = new BehaviorSubject<string>('en');
  private readonly translationsSubject = new BehaviorSubject<Translations>({});
  private readonly destroy$ = new Subject<void>();

  private readonly _currentLang = signal<string>('en');
  private readonly _isRTL = computed(() => this._currentLang() === 'ar');

  private translations: Translations = {
    en: {
      'app.title': 'Super Fitness',
      'app.subtitle': 'Transform Your Body',
      'nav.home': 'Home',
      'nav.dashboard': 'Dashboard',
      'nav.workouts': 'Workouts',
      'nav.progress': 'Progress',
      'nav.nutrition': 'Nutrition',
      'nav.profile': 'Profile',
      'nav.settings': 'Settings',
      'nav.logout': 'Logout',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.userName': 'Username',
      'auth.firstName': 'First Name',
      'auth.lastName': 'Last Name',
      'auth.phoneNumber': 'Phone Number',
      'auth.loginButton': 'Sign In',
      'auth.registerButton': 'Sign Up',
      'auth.noAccount': "Don't have an account?",
      'auth.haveAccount': 'Already have an account?',
      'dashboard.welcome': 'Welcome back',
      'dashboard.todayWorkout': "Today's Workout",
      'dashboard.calories': 'Calories Burned',
      'dashboard.workouts': 'Workouts',
      'dashboard.streak': 'Current Streak',
      'dashboard.quickStart': 'Quick Start',
      'dashboard.continueWorkout': 'Continue Workout',
      'dashboard.stats': 'Your Stats',
      'workout.list.title': 'Workouts',
      'workout.list.search': 'Search workouts...',
      'workout.list.filter': 'Filter',
      'workout.list.category': 'Category',
      'workout.list.difficulty': 'Difficulty',
      'workout.list.duration': 'Duration',
      'workout.list.calories': 'Calories',
      'workout.list.start': 'Start Workout',
      'workout.details.title': 'Workout Details',
      'workout.details.exercises': 'Exercises',
      'workout.details.sets': 'Sets',
      'workout.details.reps': 'Reps',
      'workout.details.rest': 'Rest',
      'workout.details.equipment': 'Equipment',
      'progress.title': 'Progress Tracking',
      'progress.weight': 'Weight',
      'progress.bodyFat': 'Body Fat',
      'progress.muscleMass': 'Muscle Mass',
      'progress.measurements': 'Measurements',
      'progress.history': 'History',
      'progress.add': 'Add Progress',
      'nutrition.title': 'Nutrition',
      'nutrition.mealPlan': 'Meal Plan',
      'nutrition.dailyCalories': 'Daily Calories',
      'nutrition.protein': 'Protein',
      'nutrition.carbs': 'Carbs',
      'nutrition.fat': 'Fat',
      'nutrition.breakfast': 'Breakfast',
      'nutrition.lunch': 'Lunch',
      'nutrition.dinner': 'Dinner',
      'nutrition.snack': 'Snack',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.success': 'Success',
      'common.noData': 'No data available',
      'common.minutes': 'min',
      'common.days': 'days',
      'common.kg': 'kg',
      'common.cal': 'cal',
      'theme.dark': 'Dark Mode',
      'theme.light': 'Light Mode',
      'theme.language': 'Language',
    },
    ar: {
      'app.title': 'اللياقة المتفوقة',
      'app.subtitle': 'حوّل جسدك',
      'nav.home': 'الرئيسية',
      'nav.dashboard': 'لوحة التحكم',
      'nav.workouts': 'التمارين',
      'nav.progress': 'التقدم',
      'nav.nutrition': 'التغذية',
      'nav.profile': 'الملف الشخصي',
      'nav.settings': 'الإعدادات',
      'nav.logout': 'تسجيل الخروج',
      'nav.login': 'تسجيل الدخول',
      'nav.register': 'إنشاء حساب',
      'auth.login': 'تسجيل الدخول',
      'auth.register': 'إنشاء حساب',
      'auth.email': 'البريد الإلكتروني',
      'auth.password': 'كلمة المرور',
      'auth.confirmPassword': 'تأكيد كلمة المرور',
      'auth.userName': 'اسم المستخدم',
      'auth.firstName': 'الاسم الأول',
      'auth.lastName': 'اسم العائلة',
      'auth.phoneNumber': 'رقم الهاتف',
      'auth.loginButton': 'دخول',
      'auth.registerButton': 'تسجيل',
      'auth.noAccount': 'ليس لديك حساب؟',
      'auth.haveAccount': 'لديك حساب بالفعل؟',
      'dashboard.welcome': 'مرحباً بعودتك',
      'dashboard.todayWorkout': 'تمارين اليوم',
      'dashboard.calories': 'السعرات المحروقة',
      'dashboard.workouts': 'التمارين',
      'dashboard.streak': 'السلسلة الحالية',
      'dashboard.quickStart': 'بداية سريعة',
      'dashboard.continueWorkout': 'متابعة التمرين',
      'dashboard.stats': 'إحصائياتك',
      'workout.list.title': 'التمارين',
      'workout.list.search': 'البحث عن التمارين...',
      'workout.list.filter': 'تصفية',
      'workout.list.category': 'الفئة',
      'workout.list.difficulty': 'الصعوبة',
      'workout.list.duration': 'المدة',
      'workout.list.calories': 'السعرات',
      'workout.list.start': 'بدء التمرين',
      'workout.details.title': 'تفاصيل التمرين',
      'workout.details.exercises': 'التمارين',
      'workout.details.sets': 'المجموعات',
      'workout.details.reps': 'التكرارات',
      'workout.details.rest': 'الراحة',
      'workout.details.equipment': 'المعدات',
      'progress.title': 'تتبع التقدم',
      'progress.weight': 'الوزن',
      'progress.bodyFat': 'دهون الجسم',
      'progress.muscleMass': 'كتلة العضلات',
      'progress.measurements': 'القياسات',
      'progress.history': 'السجل',
      'progress.add': 'إضافة تقد',
      'nutrition.title': 'التغذية',
      'nutrition.mealPlan': 'خطة الوجبات',
      'nutrition.dailyCalories': 'السعرات اليومية',
      'nutrition.protein': 'البروتين',
      'nutrition.carbs': 'الكربوهيدرات',
      'nutrition.fat': 'الدهون',
      'nutrition.breakfast': 'الفطور',
      'nutrition.lunch': 'الغداء',
      'nutrition.dinner': 'العشاء',
      'nutrition.snack': 'وجبة خفيفة',
      'common.save': 'حفظ',
      'common.cancel': 'إلغاء',
      'common.delete': 'حذف',
      'common.edit': 'تعديل',
      'common.add': 'إضافة',
      'common.loading': 'جاري التحميل...',
      'common.error': 'حدث خطأ',
      'common.success': 'نجاح',
      'common.noData': 'لا توجد بيانات',
      'common.minutes': 'دقيقة',
      'common.days': 'أيام',
      'common.kg': 'كغ',
      'common.cal': 'سعرة',
      'theme.dark': 'الوضع الداكن',
      'theme.light': 'الوضع الفاتح',
      'theme.language': 'اللغة',
    }
  };

  constructor() {
    this.loadStoredLanguage();
    this.translationsSubject.next(this.translations);
  }

  private loadStoredLanguage(): void {
    const storedLang = localStorage.getItem('language');
    if (storedLang && (storedLang === 'en' || storedLang === 'ar')) {
      this.setLanguage(storedLang);
    }
  }

  setLanguage(lang: string): void {
    if (lang === 'en' || lang === 'ar') {
      this._currentLang.set(lang);
      this.currentLangSubject.next(lang);
      localStorage.setItem('language', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }

  t(key: string): string {
    const lang = this._currentLang();
    return this.translations[lang]?.[key] || key;
  }

  getCurrentLang(): string {
    return this._currentLang();
  }

  toggleLanguage(): void {
    const newLang = this._currentLang() === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}