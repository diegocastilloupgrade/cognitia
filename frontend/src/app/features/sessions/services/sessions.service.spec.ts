import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionsService],
    });

    service = TestBed.inject(SessionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls start endpoint with POST /sessions/:id/start', () => {
    service.startSession(10).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/sessions/10/start`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ id: 10, status: 'EN_EJECUCION' });
  });

  it('calls complete endpoint with POST /sessions/:id/complete', () => {
    service.completeSession(11).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/sessions/11/complete`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ id: 11, status: 'COMPLETADA' });
  });

  it('loads results list from /results/session/:id', () => {
    service.getSessionResults(20).subscribe((results) => {
      expect(results.length).toBe(1);
      expect(results[0].sessionId).toBe(20);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/results/session/20`);
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 1, sessionId: 20, itemCode: '3.1', positionInSession: 1, createdAt: '2026-04-15T10:00:00.000Z', evaluatedOutcome: 'ACIERTO', data: {} }
    ]);
  });
});
