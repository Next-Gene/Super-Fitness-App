export interface Progress {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

export interface ProgressRecord {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  notes?: string;
}

export interface ProgressUpdate {
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

export interface ProgressStats {
  totalWorkouts: number;
  totalCalories: number;
  currentStreak: number;
  longestStreak: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  averageDuration: number;
}