import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
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

  it('should return empty array if index.json is empty', async () => {
    const exercisesPromise = firstValueFrom(service.getExercises('angular'));

    const req = httpMock.expectOne('assets/data/angular/index.json');
    expect(req.request.method).toBe('GET');
    req.flush([]);

    const exercises = await exercisesPromise;
    expect(exercises).toEqual([]);
  });

  it('should load tandas from index.json and filter valid exercises', async () => {
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

    const exercisesPromise = firstValueFrom(service.getExercises('angular'));

    const indexReq = httpMock.expectOne('assets/data/angular/index.json');
    indexReq.flush(['tanda-1.json']);

    const tandaReq = httpMock.expectOne('assets/data/angular/tanda-1.json');
    tandaReq.flush([mockMc, { invalid: 'invalid exercise object' }]);

    const exercises = await exercisesPromise;
    expect(exercises.length).toBe(1);
    expect(exercises[0]).toEqual(mockMc);
  });

  it('should manage review deck in localStorage correctly', () => {
    localStorage.clear();
    const mockExercise: Exercise = {
      id: 10,
      subject: 'drf',
      topic: 'Serializers',
      type: 'mc',
      question: '¿Qué es ModelSerializer?',
      options: ['Clase de serializador', 'Vistas', 'Modelos', 'Filtros'],
      correct_index: 0,
      explanation: 'Genera campos automáticamente.'
    };

    expect(service.getReviewDeckCount()).toBe(0);

    service.addToReviewDeck(mockExercise);
    expect(service.getReviewDeckCount()).toBe(1);
    expect(service.getReviewDeckCount('drf')).toBe(1);
    expect(service.getReviewDeckCount('angular')).toBe(0);

    service.removeFromReviewDeck(10, 'drf');
    expect(service.getReviewDeckCount()).toBe(0);
  });
});
