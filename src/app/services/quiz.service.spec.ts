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
    expect((exercises[0] as any).options).toEqual(expect.arrayContaining(['Directiva estructural', 'Componente', 'Pipe', 'Servicio']));
    expect((exercises[0] as any).options[(exercises[0] as any).correct_index]).toBe('Directiva estructural');
  });

  it('should preserve correct answer mapping when options are shuffled', async () => {
    const mockMc: Exercise = {
      id: 2,
      subject: 'drf',
      topic: 'Views',
      type: 'mc',
      question: '¿Qué es APIView?',
      options: ['Clase base de vista', 'Modelo DB', 'Filtro de búsqueda'],
      correct_index: 0,
      explanation: 'Es la clase base para vistas en DRF',
      option_explanations: ['Correcto', 'Incorrecto: es un ORM', 'Incorrecto: es para queries']
    };

    const exercisesPromise = firstValueFrom(service.getExercises('drf'));

    const indexReq = httpMock.expectOne('assets/data/drf/index.json');
    indexReq.flush(['tanda-1.json']);

    const tandaReq = httpMock.expectOne('assets/data/drf/tanda-1.json');
    tandaReq.flush([mockMc]);

    const exercises = await exercisesPromise;
    const loaded = exercises[0] as any;

    expect(loaded.options.length).toBe(3);
    const correctOptionText = loaded.options[loaded.correct_index];
    expect(correctOptionText).toBe('Clase base de vista');

    if (loaded.option_explanations) {
      expect(loaded.option_explanations[loaded.correct_index]).toBe('Correcto');
    }
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

  it('should manage question history in localStorage and calculate weights correctly', () => {
    localStorage.clear();
    const mockExercise: Exercise = {
      id: 5,
      subject: 'angular',
      topic: 'Directivas',
      type: 'mc',
      question: '¿Qué es ngFor?',
      options: ['Directiva estructural', 'Pipe'],
      correct_index: 0,
      explanation: 'Renderiza una lista.'
    };

    const historyBefore = service.getQuestionHistory();
    expect(Object.keys(historyBefore).length).toBe(0);

    // No vista -> Peso 3
    expect(service.calculateQuestionWeight(mockExercise, service.getQuestionHistory())).toBe(3);

    // Intento incorrecto -> Peso 2
    service.recordQuestionAttempt(mockExercise, false);
    let history = service.getQuestionHistory();
    expect(history['angular_5']?.lastResult).toBe('incorrect');
    expect(history['angular_5']?.timesIncorrect).toBe(1);
    expect(service.calculateQuestionWeight(mockExercise, history)).toBe(2);

    // Intento correcto reciente -> Peso 0
    service.recordQuestionAttempt(mockExercise, true);
    history = service.getQuestionHistory();
    expect(history['angular_5']?.lastResult).toBe('correct');
    expect(history['angular_5']?.timesCorrect).toBe(1);
    expect(service.calculateQuestionWeight(mockExercise, history)).toBe(0);
  });

  it('should manage discarded deck and restore questions correctly', () => {
    localStorage.clear();
    const mockExercise: Exercise = {
      id: 8,
      subject: 'angular',
      topic: 'Componentes',
      type: 'mc',
      question: '¿Qué es Input?',
      options: ['Decorador', 'Servicio'],
      correct_index: 0,
      explanation: 'Pasa datos.'
    };

    expect(service.getDiscardedDeckCount()).toBe(0);

    service.recordQuestionAttempt(mockExercise, true);
    expect(service.getDiscardedDeckCount()).toBe(1);
    expect(service.getDiscardedDeckCount('angular')).toBe(1);
    expect(service.getDiscardedDeckCount('drf')).toBe(0);

    service.restoreToMainDeck(8, 'angular');
    expect(service.getDiscardedDeckCount()).toBe(0);

    service.recordQuestionAttempt(mockExercise, true);
    expect(service.getDiscardedDeckCount()).toBe(1);
    service.restoreAllDiscarded();
    expect(service.getDiscardedDeckCount()).toBe(0);
  });
});
