# SPEC.md — Especificación Técnica y Contratos del Sistema

## 1. Objetivo del Sistema
Aplicación web de autoevaluación y práctica para el examen final de Programador Web (Angular, DRF, Metodologías).
Sin backend ni base de datos: el contenido de estudio se sirve directamente desde archivos JSON estáticos en `src/assets/data/`.

---

## 2. Modelo de Datos e Interfaces TypeScript

Los ejercicios utilizan una **discriminated union** discriminada por la propiedad `type` (`'mc'`, `'code'`, `'concept'`).

> **Nota sobre `option_explanations` (en `McExercise`)**: Campo opcional (`string[]`) que permite definir retroalimentación individual por cada opción (coincidiendo 1:1 con el array `options`), emulando la interfaz interactiva de cuestionarios de NotebookLM. Si no está presente, se utiliza únicamente el campo general `explanation`.

```typescript
export type SubjectType = 'angular' | 'drf' | 'metodologias' | 'programacion-web' | 'poo-python';
export type ExerciseType = 'mc' | 'code' | 'concept';

export interface BaseExercise {
  id: number;
  subject: SubjectType | string;
  topic: string;
  type: ExerciseType;
}

export interface McExercise extends BaseExercise {
  type: 'mc';
  question: string;
  code_snippet?: string | null;
  options: string[];
  correct_index: number;
  explanation: string;
  option_explanations?: string[];
}

export interface CodeExercise extends BaseExercise {
  type: 'code';
  instructions: string;
  starter_code: string;
  solution_code: string;
  explanation: string;
}

export interface ConceptExercise extends BaseExercise {
  type: 'concept';
  question: string;
  expected_answer: string;
  key_points: string[];
}

export interface QuestionHistoryRecord {
  exerciseKey: string; // `${subject}_${id}`
  lastAttemptTimestamp: number;
  lastResult: 'correct' | 'incorrect';
  timesCorrect: number;
  timesIncorrect: number;
}

export type Exercise = McExercise | CodeExercise | ConceptExercise;

/**
 * Type guard para validar integridad del objeto Exercise en tiempo de ejecución.
 */
export function isExercise(item: any): item is Exercise {
  if (!item || typeof item !== 'object' || typeof item.id !== 'number') return false;
  if (!['mc', 'code', 'concept'].includes(item.type)) return false;

  if (item.type === 'mc') {
    const hasValidOptions = Array.isArray(item.options) && 
           typeof item.correct_index === 'number' && 
           typeof item.explanation === 'string';
    if (!hasValidOptions) return false;
    if (item.option_explanations !== undefined && !Array.isArray(item.option_explanations)) {
      return false;
    }
    return true;
  }
  if (item.type === 'code') {
    return typeof item.starter_code === 'string' && 
           typeof item.solution_code === 'string';
  }
  if (item.type === 'concept') {
    return typeof item.expected_answer === 'string' && 
           Array.isArray(item.key_points);
  }
  return false;
}
```

---

## 3. Contrato de Componentes y Servicios

### 3.1 `QuizService`
- `getExercises(subject?: SubjectType, limit?: number): Observable<Exercise[]>`
- **Estructura en assets**: Carpetas `angular/`, `drf/`, `metodologias/`, `programacion-web/`, `poo-python/` dentro de `src/assets/data/`.
- **Algoritmo de Selección Ponderada y Muestreo Estratificado**:
  1. **Historial de Respuestas**: Rastrear por cada ejercicio (`${subject}_${id}`) su estado en `localStorage` (`practica_final_question_history`).
  2. **Sistema de Pesos por Pregunta**:
     - No vista: Peso 3 (Prioridad Máxima).
     - Fallada o en Mazo de Repaso: Peso 2 (Prioridad Alta).
     - Acertada lejana (> 24h): Peso 1 (Prioridad Media).
     - Acertada reciente (<= 24h): Peso 0 (Prioridad Baja).
  3. **Selección Ponderada en Materia Única**: Asigna `score = peso + Math.random()`, ordena descendente y extrae hasta el límite.
  4. **Muestreo Estratificado en "Todas las Materias"**:
     - Carga los ejercicios de las 5 materias por separado.
     - Divide el `limit` equitativamente entre las materias (ej. $\lfloor N / 5 \rfloor$), distribuyendo homogéneamente cualquier residuo.
     - Extrae las preguntas priorizadas correspondientes de cada materia.
     - Concatena y realiza un barajado final (Fisher-Yates) para alternar las materias en la sesión del quiz.
- **Identificadores**: Los `id` de `Exercise` deben ser únicos *dentro* de cada tanda JSON.

### 3.2 `quiz-router` (Componente Router de Ejercicio)
- `@Input() exercise!: Exercise`
- `@Output() answered = new EventEmitter<{ correct: boolean }>()`
- Utiliza `@switch (exercise.type)` en el template para renderizar `mc-question`, `code-exercise` o `concept-question`.

### 3.3 `mc-question`
- `@Input() exercise!: McExercise`
- `@Output() answered = new EventEmitter<{ correct: boolean }>()`
- Muestra `question`, `code_snippet` (si existe), y la lista de `options`.
- Al seleccionar una opción, compara el índice con `correct_index`, resalta la respuesta correcta/incorrecta y muestra `explanation`. Emit de `answered`.

### 3.4 `code-exercise`
- `@Input() exercise!: CodeExercise`
- `@Output() answered = new EventEmitter<{ correct: boolean }>()`
- Muestra `instructions` y `starter_code`.
- Botón "Ver solución" revela `solution_code` y `explanation`.
- Botones de autoevaluación ("Logré resolverlo correctamente" / "Necesito repasar") emiten `answered`.

### 3.5 `concept-question`
- `@Input() exercise!: ConceptExercise`
- `@Output() answered = new EventEmitter<{ correct: boolean }>()`
- Muestra `question`.
- Botón "Ver respuesta modelo" revela `expected_answer` y `key_points`.
- Botones de autoevaluación para que el usuario indique si cubrió los puntos clave. Emit de `answered`.

### 3.6 `subject-filter`
- `@Output() subjectSelected = new EventEmitter<SubjectType | null>()`
- Muestra botones o tarjetas para seleccionar la materia (Angular, DRF, Metodologías, o "Todas").

### 3.7 `results-summary`
- `@Input() score!: number`
- `@Input() total!: number`
- `@Output() restart = new EventEmitter<void>()`
- Muestra el puntaje obtenido, porcentaje de acierto y opción para reiniciar el quiz.

---

## 4. Estrategia de Testing y Verificación de JSONs

Para garantizar que los JSONs cargados en runtime sean válidos y funcionen correctamente en el flujo de práctica:

1. **Test Unitario de `QuizService` (`quiz.service.spec.ts`)**:
   - Testea la resolución de `index.json` y la agregación de `tanda-N.json` usando `HttpTestingController`.
   - Verifica que si una tanda incluye datos mal formateados, el servicio los filtre usando `isExercise(item)` sin romper la ejecución.
2. **Test de Integración sobre Assets (`data-integrity.spec.ts`)**:
   - Pruebas automáticas ejecutadas mediante `ng test` que leen directamente los archivos en `src/assets/data/` para validar que:
     - Todos los `index.json` contienen nombres de archivos existentes.
     - Cada tanda JSON es un array de objetos válidos según `isExercise`.
     - Ninguna opción en `McExercise` sobrepasa los límites de `options` y `correct_index`.

---

## 5. No incluido en esta versión (V1)
- Persistencia en backend o base de datos.
- Login o autenticación de usuarios.
