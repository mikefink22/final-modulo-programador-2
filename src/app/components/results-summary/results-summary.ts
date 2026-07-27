import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise } from '../../models/exercise.model';

export interface ExerciseStateItem {
  exercise: Exercise;
  isAnswered: boolean;
  isCorrect?: boolean;
}

export type ResultFilter = 'all' | 'unanswered' | 'incorrect' | 'correct';

@Component({
  selector: 'app-results-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-summary.html',
  styleUrl: './results-summary.scss',
})
export class ResultsSummary {
  @Input({ required: true }) score: number = 0;
  @Input({ required: true }) total: number = 0;
  @Input() exercisesState: ExerciseStateItem[] = [];
  
  @Output() restart = new EventEmitter<void>();
  @Output() goToQuestion = new EventEmitter<number>();

  selectedFilter: ResultFilter = 'all';

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
    this.goToQuestion.emit(originalIndex);
  }

  getQuestionTitle(exercise: Exercise): string {
    if ('question' in exercise) return exercise.question;
    if ('instructions' in exercise) return exercise.instructions;
    return 'Ejercicio de autoevaluación';
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
}

