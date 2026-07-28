# PracticaFinal — App de Autoevaluación

Aplicación web interactiva desarrollada en **Angular** (Componentes Standalone) para la preparación y autoevaluación en el examen final de la carrera de Programador Web (materias: **Angular**, **Django REST Framework** y **Metodología de Desarrollo de Sistemas**).

El proyecto opera **sin backend ni base de datos**: todo el contenido de estudio se sirve dinámicamente desde archivos JSON estáticos precargados en el cliente.

---

## 🚀 Arquitectura y Cómo Funciona

1. **Generación de Contenido con IA (Proceso Externo)**:
   - El material de estudio oficial (PDFs, apuntes de cátedra) se procesa mediante una notebook de IA (NotebookLM / Gemini) siguiendo una plantilla de prompt estandarizada.
   - La IA produce tandas de ejercicios tipados (`mc` para multiple choice, `code` para ejercicios de código y `concept` para preguntas abiertas).
2. **Almacenamiento Estático**:
   - Cada tanda de contenido se almacena como un archivo JSON (`tanda-N.json`) en `src/assets/data/<materia>/` y se registra en su correspondiente manifest `index.json`.
3. **Carga y Quiz Dinámico en Angular**:
   - La aplicación Angular consume los JSONs dinámicamente mediante `QuizService` y renderiza el flujo de autoevaluación filtrable por materia y tema.

---

## 🧠 Sistema Pedagógico de Estudio y Mazos Inteligentes

La aplicación utiliza un algoritmo de selección adaptativo diseñado para maximizar la eficiencia del estudio:

1. **Gestión de Mazos de Ejercicios**:
   - **Mazo Principal (Activo)**: Prioriza preguntas no vistas o acertadas hace tiempo.
   - **Mazo de Repaso**: Acumula ejercicios fallados o saltados para refuerzo prioritario.
   - **Mazo Descartado (Dominadas)**: Las preguntas acertadas recientemente (< 24h) se excluyen temporalmente de la rotación para evitar repeticiones innecesarias. El estudiante puede reincorporarlas al Mazo Principal en cualquier momento desde la pantalla de inicio.

2. **Muestreo Estratificado Ponderado ("Todas las Materias")**:
   - Distribuye las cuotas de cada ronda priorizando las materias centrales del examen (`Django REST Framework` y `Angular` con peso **2.0**, `Desarrollo de Software` con **1.7**) y asignando cuotas reducidas a las materias de repaso base (`POO en Python` y `Programación Web` con **0.7**).
   - Si el cupo de una materia supera su banco activo disponible, las vacantes se reasignan dinámicamente a las materias principales.

3. **Distribución Pedagógica Balanceada por Tipo (60% MC / 20% Concept / 20% Code)**:
   - Para mantener coherencia pedagógica en cada ronda y ejercitar distintas capacidades cognitivas (reconocimiento, teoría explicativa y aplicación práctica), las rondas se arman con una proporción ideal de **60% Opción Múltiple (`mc`)**, **20% Conceptual (`concept`)** y **20% Código (`code`)** (ej. ronda de 5 preguntas: 3 MC, 1 Concept, 1 Code; 10 preguntas: 6 MC, 2 Concept, 2 Code).
   - **Manejo de Excepciones (Fallback Graceful)**: Si una materia o lote carece de suficientes preguntas de algún tipo (ej. sin ejercicios de código cargados), los cupos faltantes se rellenan automáticamente con los ejercicios de mayor prioridad del resto del pool sin romper la ronda.

---

## 📂 Estructura del Repositorio

```text
practica-final/
├── .agents/
│   └── AGENTS.md          # Reglas de trabajo para agentes y asistentes de IA
├── docs/
│   ├── spec.md            # Especificación técnica, modelo de datos e interfaces
│   ├── roadmap.md         # Checklist y estado de avance por fases
│   └── prompts.md         # Plantilla del prompt externo para generación de tandas JSON
├── src/
│   ├── app/
│   │   ├── models/        # Interfaces TypeScript (Exercise, McExercise, etc.)
│   │   ├── services/      # Servicios (QuizService para carga de datos)
│   │   ├── components/    # Componentes UI reusables (quiz-router, mc-question, etc.)
│   │   └── pages/         # Pantallas principales (home, quiz)
│   └── assets/
│       └── data/          # Tandas e índices de contenido JSON por materia
└── README.md
```

---

## 📚 Documentación Interna

- 📋 **[Especificación Técnica (spec.md)](docs/spec.md)**: Interfaces TypeScript, contratos de componentes y estrategia de validación/testing.
- 🗺️ **[Roadmap del Proyecto (roadmap.md)](docs/roadmap.md)**: Checklist detallado del avance del desarrollo por fases.
- 🤖 **[Prompts de Generación (prompts.md)](docs/prompts.md)**: Plantilla estándar para generar tandas de ejercicios mediante la notebook de IA.
- 🤖 **[Protocolo de Agentes (.agents/AGENTS.md)](.agents/AGENTS.md)**: Guía de comandos, reglas y flujo de git para asistentes de IA.

---

## 🛠️ Comandos de Desarrollo Local

### Requisitos Previos
- Node.js (v18 o superior)
- Angular CLI (`npm install -g @angular/cli`)

### Servidor de Desarrollo
Para ejecutar la aplicación localmente:
```bash
npm install
ng serve -o
```
Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente ante cualquier cambio en el código fuente.

### Pruebas Unitarias
Para ejecutar las pruebas unitarias:
```bash
ng test
```

### Compilación para Producción
Para compilar los artefactos de producción:
```bash
ng build
```
Los archivos optimizados se generarán dentro de la carpeta `dist/`.
