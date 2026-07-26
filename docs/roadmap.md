# Roadmap — practica-final

Estado general del proyecto. Marcar cada ítem al completarlo (`[x]`).

## Fase 0 — Setup y Documentación
- [x] Inicialización del proyecto Angular (`ng new practica-final`)
- [x] Definición del modelo de datos (`Exercise`: `mc` | `code` | `concept`)
- [x] Definición de la arquitectura de datos estáticos y manifests (`index.json`)
- [x] Reestructuración y eficientización de la documentación (`README.md`, `spec.md`, `prompts.md`, `AGENTS.md`)
- [x] Crear `src/app/models/exercise.model.ts` con interfaces y type guards
- [x] Crear estructura inicial en `src/assets/data/<materia>/index.json` para las 3 materias

## Fase 1 — Servicio de datos
- [ ] Implementar `QuizService.getExercises()` con soporte para carga de manifests y aplanado
- [ ] Implementar type guard de validación `isExercise`
- [ ] Pruebas unitarias de `QuizService` y verificador de integridad de JSONs de assets

## Fase 2 — Contenido de Estudio
- [ ] Notebook Angular cargado con apuntes + primera tanda generada (`tanda-1.json`)
- [ ] Notebook DRF cargado con apuntes + primera tanda generada (`tanda-1.json`)
- [ ] Notebook Metodologías cargado con apuntes + primera tanda generada (`tanda-1.json`)

## Fase 3 — Componentes de UI
- [ ] `quiz-router` (switch dinámico por `type`)
- [ ] `mc-question` (módulo multiple choice)
- [ ] `code-exercise` (módulo de completar código / solución)
- [ ] `concept-question` (módulo de pregunta conceptual abierta)
- [ ] `subject-filter` (selector de materias)
- [ ] `results-summary` (resumen de puntaje final)

## Fase 4 — Páginas y Flujo
- [ ] `pages/home` (pantalla inicial con selección de materia)
- [ ] `pages/quiz` (ciclo de preguntas y acumulación de score)
- [ ] Configuración de ruteo Angular (Home → Quiz → Resultados)

## Fase 5 — Pulido y Experiencia de Usuario
- [ ] Orden aleatorio de preguntas (Shuffle)
- [ ] Modo "Solo las preguntas que fallé"
- [ ] Estilos CSS / Diseño responsive y accesible

---

## 📝 Notas de Avance
- **2026-07-26**: Análisis integral de coherencia documental. Reestructuración de `README.md` (100% en español), actualización de `spec.md` con interfaces TypeScript y estrategia de testing de JSON, clarificación de proceso externo en `prompts.md` y alineación con `.agents/AGENTS.md`.
- **2026-07-26**: Creación de `src/app/models/exercise.model.ts` (interfaces TypeScript y type guard `isExercise`) e inicialización de carpetas de datos `src/assets/data/{angular,drf,metodologias}/index.json`.
