import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { QuizService } from './quiz.service';
import { Exercise } from '../models/exercise.model';

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuizService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array if index.json is empty', (done) => {
    service.getExercises('angular').subscribe((exercises) => {
      expect(exercises).toEqual([]);
      done();
    });

    const req = httpMock.expectOne('assets/data/angular/index.json');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should load tandas from index.json and filter valid exercises', (done) => {
    const mockMc: Exercise = {
      id: 1,
      subject: 'angular',
      topic: 'Directivas',
      type: 'mc',
      question: '¿Qué es ngIf?',
      options: ['Directiva estructural', 'Componente', 'Pipe', 'Servicio'],
      correct_index: 0,
      explanation: 'Es una directiva estructural'
    };

    service.getExercises('angular').subscribe((exercises) => {
      expect(exercises.length).toBe(1);
      expect(exercises[0]).toEqual(mockMc);
      done();
    });

    const indexReq = httpMock.expectOne('assets/data/angular/index.json');
    indexReq.flush(['tanda-1.json']);

    const tandaReq = httpMock.expectOne('assets/data/angular/tanda-1.json');
    tandaReq.flush([mockMc, { invalid: 'invalid exercise object' }]);
  });
});
