import { TestBed } from '@angular/core/testing';
import { ProgressService } from './progress.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { ProgressRecord } from '../models';

describe('ProgressService', () => {
  let service: ProgressService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockProgressRecord: ProgressRecord = {
    id: '1',
    date: new Date().toISOString(),
    weight: 75,
    bodyFat: 15
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getUser']);

    TestBed.configureTestingModule({
      providers: [
        ProgressService,
        { provide: ApiService, useValue: apiSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(ProgressService);
    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProgressHistory', () => {
    it('should fetch progress history successfully', () => {
      const mockResponse = { 
        data: { 
          weightHistory: [{ date: '2024-01-01', weight: 70 }] 
        } 
      };
      authServiceSpy.getUser.and.returnValue({ id: '1' } as any);
      apiServiceSpy.get.and.returnValue(of(mockResponse));

      service.getProgressHistory().subscribe(records => {
        expect(records.length).toBe(1);
        expect(records[0].weight).toBe(70);
      });

      expect(apiServiceSpy.get).toHaveBeenCalledWith('/progress', { userId: '1', period: 'weekly' });
    });

    it('should handle unauthorized user', () => {
      authServiceSpy.getUser.and.returnValue(null);
      
      service.getProgressHistory().subscribe(records => {
        expect(records.length).toBe(0);
        expect(service.loading()).toBeFalse();
      });
    });
  });

  describe('addProgress', () => {
    it('should log weight progress', () => {
      authServiceSpy.getUser.and.returnValue({ id: '1' } as any);
      apiServiceSpy.post.and.returnValue(of({ id: 'new-id' }));

      service.addProgress({ weight: 80 }).subscribe(record => {
        expect(record.weight).toBe(80);
      });

      expect(apiServiceSpy.post).toHaveBeenCalledWith('/progress/weight', jasmine.any(Object));
    });
  });
});
