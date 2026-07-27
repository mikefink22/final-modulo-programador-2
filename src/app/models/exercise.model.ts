export type SubjectType = 'angular' | 'drf' | 'metodologias';
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
