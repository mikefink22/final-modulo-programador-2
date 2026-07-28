# Roadmap — practica-final

Estado general del proyecto. Marcar cada ítem al completarlo (`[x]`).

## Fase 0 — Setup y Documentación
- [x] Inicialización del proyecto Angular (`ng new practica-final`)
- [x] Definición del modelo de datos (`Exercise`: `mc` | `code` | `concept`)
- [x] Definición de la arquitectura de datos estáticos y manifests (`index.json`)
- [x] Reestructuración y eficientización de la documentación (`README.md`, `spec.md`, `prompts.md`, `AGENTS.md`)
- [x] Crear `src/app/models/exercise.model.ts` con interfaces y type guards
- [x] Crear estructura inicial en `src/assets/data/<materia>/index.json` para las 5 materias

## Fase 1 — Servicio de datos
- [x] Implementar `QuizService.getExercises()` con soporte para carga de manifests y aplanado
- [x] Implementar type guard de validación `isExercise`
- [x] Pruebas unitarias de `QuizService` y verificador de integridad de JSONs de assets

## Fase 2 — Contenido de Estudio
- [x] Notebook Programación Web cargado con apuntes + primera tanda generada (`tanda-1.json`)
- [x] Notebook POO en Python cargado con apuntes + primera tanda generada (`tanda-1.json`)
- [x] Notebook DRF cargado con apuntes + primera tanda generada (`tanda-1.json`)
- [ ] Notebook Angular cargado con apuntes + primera tanda generada (`tanda-1.json`)
- [ ] Notebook Metodologías cargado con apuntes + primera tanda generada (`tanda-1.json`)

## Fase 3 — Componentes de UI
- [x] `quiz-router` (switch dinámico por `type`)
- [x] `mc-question` (módulo multiple choice)
- [x] `code-exercise` (módulo de completar código / solución)
- [x] `concept-question` (módulo de pregunta conceptual abierta)
- [x] `subject-filter` (selector de materias)
- [x] `results-summary` (resumen de puntaje final)

## Fase 4 — Páginas y Flujo
- [x] `pages/home` (pantalla inicial con selección de materia)
- [x] `pages/quiz` (ciclo de preguntas y acumulación de score)
- [x] Configuración de ruteo Angular (Home → Quiz → Resultados)

## Fase 5 — Pulido y Experiencia de Usuario
- [x] Orden aleatorio de preguntas (Shuffle)
- [x] Modo "Solo las preguntas que fallé"
- [x] Distribución pedagógica balanceada por tipo de ejercicio (60% MC / 20% Concept / 20% Code) con fallback y barajado intermezclado
- [x] Badges visuales por tipo de ejercicio y barra superior de acciones rápidas en resultados
- [x] Estilos CSS / Diseño responsive y accesible

---

## 📝 Notas de Avance
- **2026-07-26**: Análisis integral de coherencia documental. Reestructuración de `README.md` (100% en español), actualización de `spec.md` con interfaces TypeScript y estrategia de testing de JSON, clarificación de proceso externo en `prompts.md` y alineación con `.agents/AGENTS.md`.
- **2026-07-26**: Creación de `src/app/models/exercise.model.ts` (interfaces TypeScript y type guard `isExercise`) e inicialización de carpetas de datos `src/assets/data/{angular,drf,metodologias}/index.json`.
- **2026-07-26**: Implementación de `QuizService` con `HttpClient`, `provideHttpClient`, carga de manifests `index.json`, desanidado con `switchMap`, aplanado de ejercicios y suite de pruebas unitarias en `quiz.service.spec.ts`.
- **2026-07-26**: Implementación de componentes UI (`quiz-router`, `mc-question`, `code-exercise`, `concept-question`, `subject-filter`, `results-summary`), páginas (`home`, `quiz`), ruteo y shuffle de preguntas. Integration en `develop`.
- **2026-07-26**: Implementación del selector dinámico de cantidad de preguntas por ronda (5, 10, 15, 20 o "Todas") y soporte del parámetro limit en QuizService y la vista Home.
- **2026-07-27**: Implementación de navegación libre en el Quiz, desglose detallado de respuestas en pantalla de resultados y modo "Repasar preguntas falladas" (Review Deck).
- **2026-07-27**: Reestructuración e integración del mapa completo de 5 materias (Programación Web, POO en Python, DRF, Angular y Metodologías) con assets y manifests estáticos.
- **2026-07-28**: Implementación de la distribución pedagógica balanceada por tipo de ejercicio (60% MC, 20% Concept, 20% Code), corrección de cálculo de cuotas exactas, mezcla aleatoria intermezclada, badges por tipo en la pantalla de resultados y barra de menú superior para acciones rápidas.
- **2026-07-28**: Implementación del diseño responsive y optimización UX móvil en pantallas angostas (375px), incluyendo contador compacto `1/10`, botón `Saltar ↷`, botón flotante `Siguiente →`, adaptabilidad de bloques de código y flex wrapping en encabezados.

