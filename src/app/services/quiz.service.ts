import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Exercise, SubjectType, isExercise } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private http = inject(HttpClient);
  private readonly ALL_SUBJECTS: SubjectType[] = ['angular', 'drf', 'metodologias'];
  private readonly REVIEW_DECK_KEY = 'practica_final_review_deck';

  /**
   * Obtiene las preguntas guardadas en el Mazo de Repaso desde localStorage.
   */
  getReviewDeck(): Exercise[] {
    try {
      const data = localStorage.getItem(this.REVIEW_DECK_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed.filter(isExercise) : [];
    } catch {
      return [];
    }
  }

  /**
   * Añade un ejercicio al Mazo de Repaso si aún no existe.
   */
  addToReviewDeck(exercise: Exercise): void {
    const deck = this.getReviewDeck();
    const exists = deck.some((item) => item.id === exercise.id && item.subject === exercise.subject);
    if (!exists) {
      deck.push(exercise);
      try {
        localStorage.setItem(this.REVIEW_DECK_KEY, JSON.stringify(deck));
      } catch (err) {
        console.error('Error al guardar en localStorage:', err);
      }
    }
  }

  /**
   * Elimina un ejercicio del Mazo de Repaso cuando se responde correctamente.
   */
  removeFromReviewDeck(exerciseId: number, subject: string): void {
    const deck = this.getReviewDeck();
    const updated = deck.filter((item) => !(item.id === exerciseId && item.subject === subject));
    try {
      localStorage.setItem(this.REVIEW_DECK_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error al actualizar localStorage:', err);
    }
  }

  /**
   * Obtiene la cantidad de preguntas guardadas en el Mazo de Repaso (opcionalmente filtrado por materia).
   */
  getReviewDeckCount(subject?: SubjectType): number {
    const deck = this.getReviewDeck();
    if (!subject) return deck.length;
    return deck.filter((item) => item.subject === subject).length;
  }

  /**
   * Devuelve un Observable con los ejercicios del Mazo de Repaso (filtrados y desordenados).
   */
  getReviewDeckExercises(subject?: SubjectType): Observable<Exercise[]> {
    const deck = this.getReviewDeck();
    const filtered = subject ? deck.filter((item) => item.subject === subject) : deck;
    return of(this.shuffleArray(filtered));
  }

  /**
   * Obtiene la lista de ejercicios para una materia específica o para todas las materias.
   * Si se especifica limit, devuelve únicamente los primeros N ejercicios aleatorios.
   */
  getExercises(subject?: SubjectType, limit?: number): Observable<Exercise[]> {
    const subjectsToLoad: SubjectType[] = subject ? [subject] : this.ALL_SUBJECTS;
    const subjectRequests = subjectsToLoad.map((sub) => this.loadSubjectExercises(sub));

    return forkJoin(subjectRequests).pipe(
      map((exerciseArrays) => {
        const allExercises = this.shuffleArray(exerciseArrays.flat());
        if (limit && limit > 0) {
          return allExercises.slice(0, limit);
        }
        return allExercises;
      }),
      catchError((error) => {
        console.error('Error al cargar ejercicios:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene el total de ejercicios disponibles para una materia o para todas.
   */
  getExerciseCount(subject?: SubjectType): Observable<number> {
    const subjectsToLoad: SubjectType[] = subject ? [subject] : this.ALL_SUBJECTS;
    const subjectRequests = subjectsToLoad.map((sub) => this.loadSubjectExercises(sub));

    return forkJoin(subjectRequests).pipe(
      map((exerciseArrays) => exerciseArrays.flat().length),
      catchError(() => of(0))
    );
  }

  /**
   * Algoritmo Fisher-Yates para desordenar aleatoriamente la lista de ejercicios.
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Carga las tandas de una materia leyendo su index.json manifest.
   */
  private loadSubjectExercises(subject: SubjectType): Observable<Exercise[]> {
    const manifestUrl = `assets/data/${subject}/index.json`;

    return this.http.get<string[]>(manifestUrl).pipe(
      map((files) => (Array.isArray(files) ? files : [])),
      catchError(() => of([])),
      switchMap((fileNames) => {
        if (fileNames.length === 0) return of([]);

        const tandaRequests = fileNames.map((fileName) =>
          this.http.get<any[]>(`assets/data/${subject}/${fileName}`).pipe(
            map((items) => (Array.isArray(items) ? items.filter(isExercise) : [])),
            catchError((err) => {
              console.warn(`No se pudo cargar la tanda assets/data/${subject}/${fileName}:`, err);
              return of([]);
            })
          )
        );

        return forkJoin(tandaRequests).pipe(
          map((tandaArrays) => tandaArrays.flat())
        );
      }),
      catchError(() => of([]))
    );
  }
}
