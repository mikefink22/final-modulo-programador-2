# PROMPTS.md — Plantillas de Prompts para Generación de Contenido con IA

> **NOTA DE ARQUITECTURA**: Este documento describe el flujo y las plantillas de prompts utilizadas en la notebook de IA (NotebookLM / Gemini). 
> **Es un proceso 100% externo a la aplicación Angular**. La app no interactúa con la IA; solo consume los archivos JSON estáticos generados y guardados en `src/assets/data/`.
> Se mantiene en este repositorio como referencia oficial para asegurar que el contenido generado cumpla con el contrato `Exercise` especificado en [`docs/spec.md`](spec.md).

---

## 1. Flujo de Generación de Contenido

1. Abrir un notebook dedicado en NotebookLM / Gemini para la materia elegida.
2. Cargar como fuentes **únicamente el material oficial de la cátedra** (apuntes, filminas, PDFs).
3. Aplicar la **Regla de Cero Alucinación**: La IA debe evaluar basándose exclusivamente en el material adjunto. Si un tema no figura en los apuntes, no se debe generar contenido sobre él.
4. Ejecutar los prompts de la Sección 2 (Lote Completo) o Sección 3 (Prompts Especializados por Tipo).
5. Copiar el JSON generado y guardarlo en `src/assets/data/<materia>/tanda-N.json`.
6. Registrar `"tanda-N.json"` dentro del array manifest de `src/assets/data/<materia>/index.json`.

---

## 2. Prompt Único por Lote (Genera los 3 tipos mezclados)

```text
Actuá como profesor universitario evaluando [MATERIA] a partir EXCLUSIVAMENTE del material adjunto en este notebook. No uses conocimiento externo ni general: si un concepto no está en el material provisto, no generes contenido sobre él.

Generá un JSON estricto (array único, sin markdown ni texto adicional fuera del JSON) con:
- 15 preguntas de opción múltiple (type: "mc")
- 8 ejercicios de código a completar (type: "code")
- 10 preguntas conceptuales abiertas (type: "concept")

Estructura exacta por tipo:

// type: "mc"
{
  "id": number,
  "subject": "[MATERIA]",
  "topic": "tema puntual del apunte",
  "type": "mc",
  "question": "pregunta concisa",
  "code_snippet": "código si aplica, o null",
  "options": ["opcion 0", "opcion 1", "opcion 2", "opcion 3"],
  "correct_index": 0,
  "explanation": "resumen general de por qué es correcta citando el material",
  "option_explanations": [
    "por qué la opción 0 es correcta o incorrecta",
    "por qué la opción 1 es correcta o incorrecta",
    "por qué la opción 2 es correcta o incorrecta",
    "por qué la opción 3 es correcta o incorrecta"
  ]
}

// type: "code"
{
  "id": number,
  "subject": "[MATERIA]",
  "topic": "tema puntual",
  "type": "code",
  "instructions": "qué tiene que lograr el código",
  "starter_code": "código con un bloque faltante marcado con _____ o TODO",
  "solution_code": "código completo correcto",
  "explanation": "por qué esa es la solución según el material"
}

// type: "concept"
{
  "id": number,
  "subject": "[MATERIA]",
  "topic": "tema puntual",
  "type": "concept",
  "question": "pregunta conceptual abierta",
  "expected_answer": "respuesta modelo completa",
  "key_points": ["punto clave 1", "punto clave 2", "punto clave 3"]
}

Los ids deben ser únicos dentro del array (numeración correlativa 1, 2, 3...).
Devolvé un único array JSON con los 33 objetos mezclados (no agrupados por tipo).
```

---

## 3. Prompts Especializados por Tipo de Ejercicio

Para evitar la contaminación entre campos o la mezcla de ejercicios en ejecuciones largas de IA, se pueden utilizar estos prompts específicos por cada tipo:

### 3.1 Opción Múltiple (`type: "mc"`)

```text
Actuá como profesor universitario evaluando [MATERIA] a partir EXCLUSIVAMENTE del material adjunto en este notebook. No uses conocimiento externo ni general.

Generá un JSON estricto (array de objetos único, sin bloques markdown ni texto adicional fuera del JSON) con [CANTIDAD] preguntas de opción múltiple con la siguiente estructura exacta:

[
  {
    "id": 1,
    "subject": "[MATERIA]",
    "topic": "tema puntual del apunte",
    "type": "mc",
    "question": "¿Pregunta sobre el concepto del apunte?",
    "code_snippet": "código fuente de apoyo si aplica, o null",
    "options": [
      "Opción A",
      "Opción B",
      "Opción C",
      "Opción D"
    ],
    "correct_index": 0,
    "explanation": "Explicación detallada de por qué la respuesta correcta es válida según el apunte.",
    "option_explanations": [
      "Por qué la opción 0 es correcta o incorrecta.",
      "Por qué la opción 1 es correcta o incorrecta.",
      "Por qué la opción 2 es correcta o incorrecta.",
      "Por qué la opción 3 es correcta o incorrecta."
    ]
  }
]

REGLAS DE VALIDACIÓN ESTRICTA:
- correct_index debe ser un entero entre 0 y 3 indicando el índice de la opción correcta en el array options.
- option_explanations debe contener exactamente 4 cadenas de texto que corresponden 1:1 a cada una de las 4 opciones.
```

### 3.2 Ejercicios de Código (`type: "code"`)

```text
Actuá como profesor universitario evaluando [MATERIA] a partir EXCLUSIVAMENTE del material adjunto en este notebook. No uses conocimiento externo ni general.

Generá un JSON estricto (array de objetos único, sin bloques markdown ni texto adicional fuera del JSON) con [CANTIDAD] ejercicios de código a completar con la siguiente estructura exacta:

[
  {
    "id": 1,
    "subject": "[MATERIA]",
    "topic": "tema puntual del apunte",
    "type": "code",
    "instructions": "Escribe la instrucción exacta de lo que debe resolver el código.",
    "starter_code": "Fragmento de código con la parte clave faltante expresada con _____ o un comentario // TODO",
    "solution_code": "Código fuente completo y funcional que resuelve la instrucción.",
    "explanation": "Explicación técnica basada exclusivamente en los apuntes de por qué esa es la solución correcta."
  }
]

REGLAS DE INTEGRIDAD ESTRICTA:
- Queda estrictamente prohibido mezclar las instrucciones o starter_code de un ejercicio con el solution_code o explanation de un ejercicio diferente.
- starter_code debe ser la versión incompleta del MISMO fragmento mostrado en solution_code.
- solution_code debe resolver directa e íntegramente la instrucción descrita en instructions.
```

### 3.3 Preguntas Conceptuales Abiertas (`type: "concept"`)

```text
Actuá como profesor universitario evaluando [MATERIA] a partir EXCLUSIVAMENTE del material adjunto en este notebook. No uses conocimiento externo ni general.

Generá un JSON estricto (array de objetos único, sin bloques markdown ni texto adicional fuera del JSON) con [CANTIDAD] preguntas conceptuales abiertas con la siguiente estructura exacta:

[
  {
    "id": 1,
    "subject": "[MATERIA]",
    "topic": "tema puntual del apunte",
    "type": "concept",
    "question": "Pregunta abierta sobre un concepto clave del apunte.",
    "expected_answer": "Respuesta modelo explicativa, clara y completa.",
    "key_points": [
      "Punto clave 1 que el estudiante debió incluir",
      "Punto clave 2 que el estudiante debió incluir",
      "Punto clave 3 que el estudiante debió incluir"
    ]
  }
]

REGLAS DE VALIDACIÓN ESTRICTA:
- key_points debe incluir entre 2 y 4 criterios/puntos clave breves para la autoevaluación del alumno.
```

---

## 4. Guía de Naming y Guardado

| Materia | Carpeta Destino | Valor de `[MATERIA]` en el prompt |
| :--- | :--- | :--- |
| **Angular** | `src/assets/data/angular/` | `"angular"` |
| **Django REST Framework** | `src/assets/data/drf/` | `"drf"` |
| **Metodologías** | `src/assets/data/metodologias/` | `"metodologias"` |
| **Programación Web** | `src/assets/data/programacion-web/` | `"programacion-web"` |
| **POO en Python** | `src/assets/data/poo-python/` | `"poo-python"` |

**Ejemplo de archivo manifest `src/assets/data/angular/index.json`**:
```json
[
  "tanda-1.json",
  "tanda-2.json"
]
```
