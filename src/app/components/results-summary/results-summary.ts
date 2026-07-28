import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise } from '../../models/exercise.model';
import { QuizRouter } from '../quiz-router/quiz-router';

export interface ExerciseStateItem {
  exercise: Exercise;
  isAnswered: boolean;
  isCorrect?: boolean;
}

export type ResultFilter = 'all' | 'unanswered' | 'incorrect' | 'correct';

@Component({
  selector: 'app-results-summary',
  standalone: true,
  imports: [CommonModule, QuizRouter],
  templateUrl: './results-summary.html',
  styleUrl: './results-summary.scss',
})
export class ResultsSummary {
  @Input({ required: true }) score: number = 0;
  @Input({ required: true }) total: number = 0;
  @Input() exercisesState: ExerciseStateItem[] = [];
  
  @Output() restart = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();
  @Output() goToQuestion = new EventEmitter<number>();

  selectedFilter: ResultFilter = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  selectedPreviewIndex: number | null = null;

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  get currentPreviewItem(): ExerciseStateItem | null {
    if (this.selectedPreviewIndex === null || !this.exercisesState[this.selectedPreviewIndex]) {
      return null;
    }
    return this.exercisesState[this.selectedPreviewIndex];
  }

  closePreview() {
    this.selectedPreviewIndex = null;
  }

  prevPreview() {
    if (this.selectedPreviewIndex !== null && this.selectedPreviewIndex > 0) {
      this.selectedPreviewIndex--;
    }
  }

  nextPreview() {
    if (this.selectedPreviewIndex !== null && this.selectedPreviewIndex < this.exercisesState.length - 1) {
      this.selectedPreviewIndex++;
    }
  }

  editQuestionInQuiz(originalIndex: number) {
    this.goToQuestion.emit(originalIndex);
  }

  getTooltipText(item: ExerciseStateItem, index: number): string {
    const ex = item.exercise;
    const status = !item.isAnswered ? 'Sin responder' : item.isCorrect ? 'Correcta' : 'Incorrecta';
    const topic = ex.topic ? `${ex.subject.toUpperCase()} • ${ex.topic}` : ex.subject.toUpperCase();
    const title = this.getQuestionTitle(ex);
    return `#${index + 1} [${status}] — ${topic}: ${title}`;
  }

  getSubjectAbbr(subject: string): string {
    if (!subject) return '';
    const s = subject.toLowerCase();
    if (s.includes('angular')) return 'ANGULAR';
    if (s.includes('drf')) return 'DRF';
    if (s.includes('metodologias') || s.includes('desarrollo')) return 'DEV';
    if (s.includes('web') || s.includes('programacion')) return 'WEB';
    if (s.includes('poo') || s.includes('python')) return 'POO';
    return s.substring(0, 6).toUpperCase();
  }



  get percentage(): number {
    if (this.total === 0) return 0;
    return Math.round((this.score / this.total) * 100);
  }

  get unansweredCount(): number {
    return this.exercisesState.filter((item) => !item.isAnswered).length;
  }

  get incorrectCount(): number {
    return this.exercisesState.filter((item) => item.isAnswered && item.isCorrect === false).length;
  }

  get correctCount(): number {
    return this.exercisesState.filter((item) => item.isAnswered && item.isCorrect === true).length;
  }

  get filteredExercisesState(): { item: ExerciseStateItem; originalIndex: number }[] {
    return this.exercisesState
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        if (this.selectedFilter === 'unanswered') return !item.isAnswered;
        if (this.selectedFilter === 'incorrect') return item.isAnswered && item.isCorrect === false;
        if (this.selectedFilter === 'correct') return item.isAnswered && item.isCorrect === true;
        return true;
      });
  }

  setFilter(filter: ResultFilter) {
    this.selectedFilter = filter;
  }

  onSelectQuestion(originalIndex: number) {
    this.selectedPreviewIndex = originalIndex;
  }

  getQuestionTitle(exercise: Exercise): string {
    if ('question' in exercise) return exercise.question;
    if ('instructions' in exercise) return exercise.instructions;
    return 'Ejercicio de autoevaluación';
  }

  getExerciseTypeLabel(exercise: Exercise): string {
    if (exercise.type === 'mc') return 'Opción Múltiple';
    if (exercise.type === 'concept') return 'Conceptual';
    if (exercise.type === 'code') return 'Código';
    return '';
  }

  getExerciseTypeBadgeClass(exercise: Exercise): string {
    if (exercise.type === 'mc') return 'type-badge-mc';
    if (exercise.type === 'concept') return 'type-badge-concept';
    if (exercise.type === 'code') return 'type-badge-code';
    return '';
  }

  get feedbackMessage(): { title: string; subtitle: string; icon: string } {
    const pct = this.percentage;
    if (pct >= 90) {
      return {
        title: '¡Excelente Desempeño!',
        subtitle: 'Tenés un dominio sobresaliente de la materia. ¡Estás más que listo para el examen final!',
        icon: '🏆',
      };
    } else if (pct >= 70) {
      return {
        title: '¡Buen Trabajo!',
        subtitle: 'Tenés una base sólida. Repasá los conceptos fallados o no respondidos para asegurar la máxima calificación.',
        icon: '🌟',
      };
    } else if (pct >= 50) {
      return {
        title: 'Aprobado — A Reforzar',
        subtitle: 'Cubriste la mitad de los contenidos. Te recomendamos repasar las preguntas pendientes.',
        icon: '📚',
      };
    } else {
      return {
        title: 'Necesita Repaso',
        subtitle: 'No te preocupes, la práctica constante es la clave. Volvé a intentar las preguntas sin responder o incorrectas.',
        icon: '💪',
      };
    }
  }

  onRestart() {
    this.restart.emit();
  }

  onGoHome() {
    this.goHome.emit();
  }
}

