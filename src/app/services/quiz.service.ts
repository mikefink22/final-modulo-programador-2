import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Exercise, SubjectType, isExercise, QuestionHistoryRecord } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private http = inject(HttpClient);
  private readonly ALL_SUBJECTS: SubjectType[] = [
    'programacion-web',
    'poo-python',
    'drf',
    'angular',
    'desarrollo-de-software',
  ];
  private readonly REVIEW_DECK_KEY = 'practica_final_review_deck';
  private readonly QUESTION_HISTORY_KEY = 'practica_final_question_history';

  private readonly SUBJECT_WEIGHTS: Record<SubjectType, number> = {
    'drf': 2.0,
    'angular': 2.0,
    'desarrollo-de-software': 1.7,
    'poo-python': 0.7,
    'programacion-web': 0.7,
  };

  /**
   * Obtiene el mapa del historial de respuestas guardado en localStorage.
   */
  getQuestionHistory(): Record<string, QuestionHistoryRecord> {
    try {
      const data = localStorage.getItem(this.QUESTION_HISTORY_KEY);
      if (!data) return {};
      const parsed = JSON.parse(data);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }

  /**
   * Obtiene la lista de claves (${subject}_${id}) de preguntas que pertenecen al Mazo Descartado
   * (respondidas correctamente en las últimas 24 horas).
   */
  getDiscardedDeckKeys(): Set<string> {
    const history = this.getQuestionHistory();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const set = new Set<string>();

    for (const key of Object.keys(history)) {
      const record = history[key];
      if (record && record.lastResult === 'correct' && now - record.lastAttemptTimestamp <= ONE_DAY_MS) {
        set.add(key);
      }
    }
    return set;
  }

  /**
   * Obtiene la cantidad de preguntas actualmente en el Mazo Descartado (opcionalmente filtrado por materia).
   */
  getDiscardedDeckCount(subject?: SubjectType): number {
    const discardedKeys = this.getDiscardedDeckKeys();
    if (!subject) return discardedKeys.size;
    return Array.from(discardedKeys).filter((k) => k.startsWith(`${subject}_`)).length;
  }

  /**
   * Restaura una pregunta del Mazo Descartado al Mazo Principal eliminando su bloqueo temporal.
   */
  restoreToMainDeck(exerciseId: number, subject: string): void {
    const history = this.getQuestionHistory();
    const key = `${subject}_${exerciseId}`;
    if (history[key]) {
      delete history[key];
      try {
        localStorage.setItem(this.QUESTION_HISTORY_KEY, JSON.stringify(history));
      } catch (err) {
        console.error('Error al actualizar el historial de preguntas:', err);
      }
    }
  }

  /**
   * Restaura todas las preguntas del Mazo Descartado al Mazo Principal (opcionalmente por materia).
   */
  restoreAllDiscarded(subject?: SubjectType): void {
    const history = this.getQuestionHistory();
    const discardedKeys = this.getDiscardedDeckKeys();
    let changed = false;

    for (const key of discardedKeys) {
      if (!subject || key.startsWith(`${subject}_`)) {
        delete history[key];
        changed = true;
      }
    }

    if (changed) {
      try {
        localStorage.setItem(this.QUESTION_HISTORY_KEY, JSON.stringify(history));
      } catch (err) {
        console.error('Error al restaurar preguntas descartadas:', err);
      }
    }
  }

  /**
   * Registra o actualiza el intento de una pregunta en el historial de localStorage.
   */
  recordQuestionAttempt(exercise: Exercise, isCorrect: boolean): void {
    const history = this.getQuestionHistory();
    const key = `${exercise.subject}_${exercise.id}`;
    const existing = history[key];
    const now = Date.now();

    if (existing) {
      history[key] = {
        ...existing,
        lastAttemptTimestamp: now,
        lastResult: isCorrect ? 'correct' : 'incorrect',
        timesCorrect: isCorrect ? existing.timesCorrect + 1 : existing.timesCorrect,
        timesIncorrect: isCorrect ? existing.timesIncorrect : existing.timesIncorrect + 1,
      };
    } else {
      history[key] = {
        exerciseKey: key,
        lastAttemptTimestamp: now,
        lastResult: isCorrect ? 'correct' : 'incorrect',
        timesCorrect: isCorrect ? 1 : 0,
        timesIncorrect: isCorrect ? 0 : 1,
      };
    }

    try {
      localStorage.setItem(this.QUESTION_HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.error('Error al guardar el historial de preguntas:', err);
    }
  }

  /**
   * Calcula el peso/prioridad de un ejercicio basado en el historial:
   * - No vista: Peso 3 (Prioridad Máxima)
   * - Fallada / En mazo de repaso: Peso 2 (Prioridad Alta)
   * - Acertada lejana (> 24h): Peso 1 (Prioridad Media)
   * - Acertada reciente (<= 24h): Peso 0 (Prioridad Baja)
   */
  calculateQuestionWeight(exercise: Exercise, history: Record<string, QuestionHistoryRecord>): number {
    const key = `${exercise.subject}_${exercise.id}`;
    const record = history[key];

    if (!record) {
      return 3;
    }

    if (record.lastResult === 'incorrect') {
      return 2;
    }

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const isOld = Date.now() - record.lastAttemptTimestamp > ONE_DAY_MS;

    if (record.lastResult === 'correct') {
      return isOld ? 1 : 0;
    }

    return 3;
  }

  /**
   * Ordena y selecciona ejercicios basándose en su peso de prioridad y un factor aleatorio suave.
   */
  selectPrioritizedExercises(exercises: Exercise[], limit?: number): Exercise[] {
    if (exercises.length === 0) return [];

    const history = this.getQuestionHistory();
    const reviewDeckKeys = new Set(
      this.getReviewDeck().map((ex) => `${ex.subject}_${ex.id}`)
    );

    const scored = exercises.map((exercise) => {
      let weight = this.calculateQuestionWeight(exercise, history);
      const key = `${exercise.subject}_${exercise.id}`;
      if (reviewDeckKeys.has(key)) {
        weight = Math.max(weight, 2);
      }
      const score = weight + Math.random();
      return { exercise, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const selected = scored.map((item) => item.exercise);

    if (limit !== undefined) {
      return selected.slice(0, limit);
    }

    return selected;
  }

  /**
   * Selecciona ejercicios distribuidos por tipo (60% MC, 20% Concept, 20% Code)
   * con fallback suave si no hay suficientes ítems disponibles de algún tipo.
   */
  selectExercisesByType(pool: Exercise[], limit: number): Exercise[] {
    if (pool.length === 0 || limit <= 0) return [];
    if (pool.length <= limit) {
      return this.selectPrioritizedExercises(pool, limit);
    }

    const objetivoMC = Math.round(limit * 0.6);
    const objetivoConcept = Math.floor(limit * 0.2);
    const objetivoCode = limit - objetivoMC - objetivoConcept;

    const poolMC = pool.filter((ex) => ex.type === 'mc');
    const poolConcept = pool.filter((ex) => ex.type === 'concept');
    const poolCode = pool.filter((ex) => ex.type === 'code');

    const seleccionadosMC = this.selectPrioritizedExercises(poolMC, objetivoMC);
    const seleccionadosConcept = this.selectPrioritizedExercises(poolConcept, objetivoConcept);
    const seleccionadosCode = this.selectPrioritizedExercises(poolCode, objetivoCode);

    const acumulado: Exercise[] = [
      ...seleccionadosMC,
      ...seleccionadosConcept,
      ...seleccionadosCode,
    ];

    if (acumulado.length < limit) {
      const faltantes = limit - acumulado.length;
      const seleccionadosSet = new Set(
        acumulado.map((ex) => `${ex.subject}_${ex.id}`)
      );
      const restantes = pool.filter(
        (ex) => !seleccionadosSet.has(`${ex.subject}_${ex.id}`)
      );
      const adicionales = this.selectPrioritizedExercises(restantes, faltantes);
      acumulado.push(...adicionales);
    }

    return this.shuffleArray(acumulado);
  }

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
   * Vacía las preguntas guardadas en el Mazo de Repaso (opcionalmente por materia).
   */
  clearReviewDeck(subject?: SubjectType): void {
    if (!subject) {
      try {
        localStorage.removeItem(this.REVIEW_DECK_KEY);
      } catch (err) {
        console.error('Error al vaciar Mazo de Repaso:', err);
      }
      return;
    }

    const deck = this.getReviewDeck();
    const updated = deck.filter((item) => item.subject !== subject);
    try {
      localStorage.setItem(this.REVIEW_DECK_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error al vaciar Mazo de Repaso:', err);
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
   * Devuelve un Observable con los ejercicios del Mazo de Repaso (filtrados, desordenados y con opciones aleatorizadas).
   */
  getReviewDeckExercises(subject?: SubjectType): Observable<Exercise[]> {
    const deck = this.getReviewDeck();
    const filtered = subject ? deck.filter((item) => item.subject === subject) : deck;
    const prepared = this.shuffleArray(filtered).map((ex) => this.shuffleExerciseOptions(ex));
    return of(prepared);
  }

  /**
   * Obtiene la lista de ejercicios para una materia específica o para todas las materias.
   * Excluye ejercicios activos en el Mazo Descartado (<24h acertadas).
   * Aplica muestreo estratificado ponderado por materia (SUBJECT_WEIGHTS) y reasignación de sobrantes.
   */
  getExercises(subject?: SubjectType, limit?: number): Observable<Exercise[]> {
    const discardedKeys = this.getDiscardedDeckKeys();

    if (subject) {
      return this.loadSubjectExercises(subject).pipe(
        map((exercises) => {
          const nonDiscarded = exercises.filter((ex) => !discardedKeys.has(`${ex.subject}_${ex.id}`));
          const pool = nonDiscarded.length > 0 ? nonDiscarded : exercises;
          const selected = limit && limit > 0
            ? this.selectExercisesByType(pool, limit)
            : this.selectPrioritizedExercises(pool);
          return selected.map((ex) => this.shuffleExerciseOptions(ex));
        }),
        catchError((error) => {
          console.error(`Error al cargar ejercicios de ${subject}:`, error);
          return of([]);
        })
      );
    }

    const subjectRequests = this.ALL_SUBJECTS.map((sub) =>
      this.loadSubjectExercises(sub).pipe(
        map((exercises) => ({ subject: sub, exercises }))
      )
    );

    return forkJoin(subjectRequests).pipe(
      map((results) => {
        const processedResults = results.map((r) => {
          const nonDiscarded = r.exercises.filter((ex) => !discardedKeys.has(`${ex.subject}_${ex.id}`));
          const pool = nonDiscarded.length > 0 ? nonDiscarded : r.exercises;
          return { subject: r.subject, exercises: pool };
        });

        if (!limit || limit <= 0) {
          const allPrioritized = processedResults.flatMap((r) =>
            this.selectPrioritizedExercises(r.exercises)
          );
          const shuffled = this.shuffleArray(allPrioritized);
          return shuffled.map((ex) => this.shuffleExerciseOptions(ex));
        }

        const totalWeight = this.ALL_SUBJECTS.reduce(
          (acc, sub) => acc + (this.SUBJECT_WEIGHTS[sub] || 1.0),
          0
        );

        let rawQuotas = processedResults.map((r) => {
          const weight = this.SUBJECT_WEIGHTS[r.subject] || 1.0;
          const targetQuota = Math.max(1, Math.round((limit * weight) / totalWeight));
          return { ...r, weight, targetQuota, assignedQuota: 0 };
        });

        let currentSum = rawQuotas.reduce((acc, q) => acc + q.targetQuota, 0);
        while (currentSum !== limit) {
          if (currentSum > limit) {
            const candidate = rawQuotas
              .filter((q) => q.targetQuota > 1)
              .sort((a, b) => b.targetQuota - a.targetQuota)[0];
            if (candidate) candidate.targetQuota--;
            else break;
          } else {
            const candidate = rawQuotas
              .sort((a, b) => b.weight - a.weight)[0];
            if (candidate) candidate.targetQuota++;
            else rawQuotas[0].targetQuota++;
          }
          currentSum = rawQuotas.reduce((acc, q) => acc + q.targetQuota, 0);
        }

        let excessPool = 0;
        rawQuotas.forEach((q) => {
          const availableCount = q.exercises.length;
          if (q.targetQuota > availableCount) {
            excessPool += q.targetQuota - availableCount;
            q.assignedQuota = availableCount;
          } else {
            q.assignedQuota = q.targetQuota;
          }
        });

        while (excessPool > 0) {
          const recipient = rawQuotas
            .filter((q) => q.exercises.length > q.assignedQuota)
            .sort((a, b) => b.weight - a.weight)[0];

          if (!recipient) break;
          recipient.assignedQuota++;
          excessPool--;
        }

        const selectedExercises: Exercise[] = [];
        rawQuotas.forEach((q) => {
          if (q.assignedQuota > 0) {
            const selected = this.selectExercisesByType(q.exercises, q.assignedQuota);
            selectedExercises.push(...selected);
          }
        });

        const finalShuffled = this.shuffleArray(selectedExercises);
        return finalShuffled.map((ex) => this.shuffleExerciseOptions(ex));
      }),
      catchError((error) => {
        console.error('Error al cargar ejercicios de todas las materias:', error);
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
   * Si el ejercicio es de tipo 'mc', desordena aleatoriamente sus opciones
   * y ajusta correct_index y option_explanations para mantener la integridad.
   */
  private shuffleExerciseOptions(exercise: Exercise): Exercise {
    if (exercise.type !== 'mc' || !exercise.options || exercise.options.length <= 1) {
      return exercise;
    }

    const items = exercise.options.map((optionText, idx) => ({
      option: optionText,
      explanation: exercise.option_explanations ? exercise.option_explanations[idx] : undefined,
      isCorrect: idx === exercise.correct_index,
    }));

    const shuffled = this.shuffleArray(items);
    const newCorrectIndex = shuffled.findIndex((item) => item.isCorrect);

    return {
      ...exercise,
      options: shuffled.map((item) => item.option),
      correct_index: newCorrectIndex,
      option_explanations: exercise.option_explanations
        ? shuffled.map((item) => item.explanation ?? '')
        : undefined,
    };
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
