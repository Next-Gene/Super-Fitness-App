import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make GET request with params', () => {
    const mockData = { id: 1, name: 'Test' };
    const params = { page: 1, size: 10 };

    service.get('/test', params).subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(request => 
      request.url === `${environment.baseUrl}/test` && 
      request.params.get('page') === '1' && 
      request.params.get('size') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should make POST request with body', () => {
    const mockData = { success: true };
    const body = { name: 'New Item' };

    service.post('/test', body).subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/test`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockData);
  });

  it('should set error state on request failure', () => {
    service.get('/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne(`${environment.baseUrl}/test`);
    req.error(new ErrorEvent('Network error'));

    expect(service.error()).toBeTruthy();
  });

  it('should update lastUpdated on success', () => {
    expect(service.lastUpdated()).toBeNull();
    service.get('/test').subscribe();
    const req = httpMock.expectOne(`${environment.baseUrl}/test`);
    req.flush({});
    expect(service.lastUpdated()).toBeDefined();
  });
});
