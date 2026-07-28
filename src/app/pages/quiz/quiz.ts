import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Exercise, SubjectType } from '../../models/exercise.model';
import { QuizRouter } from '../../components/quiz-router/quiz-router';
import { ResultsSummary } from '../../components/results-summary/results-summary';

export interface QuestionAnswerState {
  isAnswered: boolean;
  isCorrect?: boolean;
  selectedOptionIndex?: number;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, QuizRouter, ResultsSummary],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private quizService = inject(QuizService);
  private cdr = inject(ChangeDetectorRef);

  subject?: SubjectType;
  exercises: Exercise[] = [];
  answersState: QuestionAnswerState[] = [];
  currentIndex: number = 0;
  score: number = 0;

  isLoading: boolean = true;
  errorMessage: string | null = null;
  isFinished: boolean = false;

  limit?: number;
  mode?: string;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const subjectParam = params['subject'] as SubjectType | undefined;
      const limitParam = params['limit'] ? parseInt(params['limit'], 10) : undefined;
      const modeParam = params['mode'] as string | undefined;

      this.subject = subjectParam;
      this.limit = limitParam && !isNaN(limitParam) ? limitParam : undefined;
      this.mode = modeParam;

      this.loadExercises();
    });
  }

  loadExercises() {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    const exercises$ = this.mode === 'review' 
      ? this.quizService.getReviewDeckExercises(this.subject)
      : this.quizService.getExercises(this.subject, this.limit);

    exercises$.subscribe({
      next: (data) => {
        this.exercises = data;
        this.answersState = data.map(() => ({ isAnswered: false }));
        this.currentIndex = 0;
        this.score = 0;
        this.isFinished = false;
        this.isLoading = false;

        if (data.length === 0) {
          this.errorMessage = this.mode === 'review' 
            ? 'No hay preguntas en tu Mazo de Repaso para esta materia.' 
            : 'No se encontraron ejercicios cargados para esta materia.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar ejercicios:', err);
        this.errorMessage = 'Ocurrió un error al cargar los ejercicios de práctica.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  get currentExercise(): Exercise | undefined {
    return this.exercises[this.currentIndex];
  }

  get currentSavedState(): QuestionAnswerState | undefined {
    return this.answersState[this.currentIndex];
  }

  get isCurrentAnswered(): boolean {
    return this.answersState[this.currentIndex]?.isAnswered ?? false;
  }

  get progressPercentage(): number {
    if (this.exercises.length === 0) return 0;
    return Math.round(((this.currentIndex + 1) / this.exercises.length) * 100);
  }

  get exercisesStateSummary() {
    return this.exercises.map((exercise, index) => ({
      exercise,
      isAnswered: this.answersState[index]?.isAnswered ?? false,
      isCorrect: this.answersState[index]?.isCorrect,
    }));
  }

  onAnswered(event: { correct: boolean; selectedOptionIndex?: number }) {
    const current = this.currentExercise;
    if (!current) return;

    this.answersState[this.currentIndex] = {
      isAnswered: true,
      isCorrect: event.correct,
      selectedOptionIndex: event.selectedOptionIndex,
    };

    this.score = this.answersState.filter((state) => state.isCorrect === true).length;

    this.quizService.recordQuestionAttempt(current, event.correct);

    if (event.correct) {
      this.quizService.removeFromReviewDeck(current.id, current.subject);
    } else {
      this.quizService.addToReviewDeck(current);
    }

    this.cdr.markForCheck();
  }

  skipQuestion() {
    const current = this.currentExercise;
    if (current && !this.isCurrentAnswered) {
      this.quizService.addToReviewDeck(current);
    }

    this.nextQuestion();
  }

  finishQuiz() {
    this.isFinished = true;
    this.cdr.markForCheck();
  }

  private scrollActiveChipIntoView(): void {
    setTimeout(() => {
      const activeChip = document.querySelector('.chip-btn.chip-active');
      activeChip?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);
  }

  nextQuestion() {
    if (this.currentIndex < this.exercises.length - 1) {
      this.currentIndex++;
      this.scrollActiveChipIntoView();
    } else {
      this.finishQuiz();
    }
    this.cdr.markForCheck();
  }

  goToPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollActiveChipIntoView();
      this.cdr.markForCheck();
    }
  }

  jumpToQuestion(index: number) {
    if (index >= 0 && index < this.exercises.length) {
      this.currentIndex = index;
      this.isFinished = false;
      this.scrollActiveChipIntoView();
      this.cdr.markForCheck();
    }
  }

  restartQuiz() {
    this.loadExercises();
  }

  goHome() {
    this.router.navigate(['/']);
  }
}


