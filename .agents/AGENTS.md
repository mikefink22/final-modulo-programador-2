# AGENTS.md — Protocolo y Reglas para Agentes de IA

## Stack Tecnológico
- Angular 21 (Componentes Standalone, sin `NgModules`).
- TypeScript (tipado estricto).
- Carga de datos estáticos desde `src/assets/data/` (sin backend / base de datos).

## Estructura de Proyecto
- `src/app/models/`       → Interfaces y tipos TypeScript (creados directamente en archivo).
- `src/app/services/`     → Generados vía `ng generate service services/<nombre>`.
- `src/app/components/`   → Generados vía `ng generate component components/<nombre>` (UI reutilizable).
- `src/app/pages/`        → Generados vía `ng generate component pages/<nombre>` (vistas principales).
- `src/assets/data/`      → Directorios por materia (`angular/`, `drf/`, `metodologias/`), cada uno con `index.json` (manifest) + `tanda-N.json`.
- `docs/`                 → Especificación técnica (`spec.md`), roadmap (`roadmap.md`) y prompts de IA (`prompts.md`).

---

## Protocolo de Git y Ramas (Paso a Paso)
1. **Verificar estado actual**: Ejecutar `git status` antes de iniciar cualquier tarea.
2. **Nunca trabajar directo sobre `main` ni `develop`**.
3. **Flujo de inicio de tarea**:
   - `git checkout develop`
   - `git pull origin develop`
   - `git checkout -b feature/<nombre-tarea>`
4. **Commits atómicos**: Realizar commits pequeños y frecuentes por cada hito completado y probado.
5. **Flujo de finalización de tarea y PR**:
   - Asegurar que `ng test` o compilación no arrojen errores.
   - **Pushear la rama feature**: `git push origin feature/<nombre-tarea>`.
   - **Entregar Walkthrough/Resumen para el PR**: Generar un artifact `walkthrough.md` con el resumen estructurado para que el usuario cree/pegue la descripción del Pull Request en GitHub.
   - **Esperar el merge manual del usuario en GitHub**.
   - **Sincronizar y limpiar local**:
     - `git checkout develop`
     - `git pull origin develop`
     - Actualizar `docs/roadmap.md` marcando el ítem completado `[x]`.
     - Commitear y pushear `develop`: `git push origin develop`.
     - Eliminar la rama local: `git branch -d feature/<nombre-tarea>`.

---

## Reglas de Desarrollo y Buenas Prácticas
1. **No crear carpetas vacías de antemano**: Permitir que `ng generate` o la creación explícita de archivos maneje las carpetas.
2. **Contrato de Componentes**: Releer `docs/spec.md` antes de crear o editar cualquier componente o servicio.
3. **Comunicación entre Componentes**: Utilizar exclusivamente `@Input` y `@Output` (`EventEmitter`) para intercambio de datos entre componentes UI. El estado global del quiz se maneja únicamente en `QuizService`.
4. **Tandas JSON**: Las tandas de ejercicios provienen del prompt documentado en `docs/prompts.md`. No editar manualmente el contenido salvo correcciones puntuales de sintaxis JSON.
5. **Nuevas Tandas**: Al agregar una nueva tanda (`tanda-N.json`), registrar siempre el nombre del archivo dentro del array manifest `index.json` de la materia correspondiente.
6. **Evolución del Modelo**: Si se agrega o modifica un campo en `Exercise`, actualizar `docs/spec.md` primero.

---

## Convención de Commits
Formato: `<tipo>(<alcance opcional>): <descripción concisa en español>`
- `feat:` Nuevas funcionalidades
- `fix:` Corrección de errores
- `chore:` Mantenimiento o configuración
- `docs:` Cambios en la documentación

**Estructura de Commits Cortos**: Usar múltiples flags `-m` para separar el título conciso de los detalles de la implementación:
```bash
git commit -m "<tipo>(<alcance>): <título corto en español>" -m "- <detalle de cambio 1>" -m "- <detalle de cambio 2>"
```

Ejemplo:
```bash
git commit -m "feat(quiz-service): cargar tandas dinámicas desde manifests" -m "- Leer index.json por materia" -m "- Aplicar forkJoin sobre tandas JSON"
```
