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

  /**
   * Obtiene la lista de ejercicios para una materia específica o para todas las materias.
   * Carga dinámicamente los manifests (index.json) y cada tanda (tanda-N.json).
   */
  getExercises(subject?: SubjectType): Observable<Exercise[]> {
    const subjectsToLoad: SubjectType[] = subject ? [subject] : this.ALL_SUBJECTS;
    const subjectRequests = subjectsToLoad.map((sub) => this.loadSubjectExercises(sub));

    return forkJoin(subjectRequests).pipe(
      map((exerciseArrays) => this.shuffleArray(exerciseArrays.flat())),
      catchError((error) => {
        console.error('Error al cargar ejercicios:', error);
        return of([]);
      })
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
