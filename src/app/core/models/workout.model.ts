export interface Workout {
  id: string;
  name: string;
  description: string;
  category: WorkoutCategory;
  difficulty: Difficulty;
  duration: number;
  caloriesBurned: number;
  exercises?: Exercise[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  isPremium?: boolean;
  workoutPlanId?: number;
  videoUrl?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  duration: number;
  restTime: number;
  muscleGroup: string;
  equipment: string[];
  imageUrl?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  completedSets: number;
  totalSets: number;
  status: SessionStatus;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  workouts: Workout[];
  duration: number;
  difficulty: Difficulty;
  createdAt: string;
}

export type WorkoutCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'hiit'
  | 'balance'
  | 'recovery';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type SessionStatus = 'not_started' | 'in_progress' | 'completed' | 'cancelled';