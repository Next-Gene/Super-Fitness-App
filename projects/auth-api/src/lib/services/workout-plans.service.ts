import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../src/environments/environment';

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  workouts: string[];
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutPlansService {
  private readonly baseUrl = `${environment.baseUrl}/api/workout-plans`;

  constructor(private http: HttpClient) { }

  getWorkoutPlans(): Observable<WorkoutPlan[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => res.data?.workoutPlans || res.data || res)
    );
  }

  getWorkoutPlanById(id: string): Observable<WorkoutPlan> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  assignWorkoutToPlan(planId: string, workoutId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${planId}/assign-to/${workoutId}`, {});
  }
}  