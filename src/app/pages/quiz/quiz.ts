import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';
import { Exercise, SubjectType } from '../../models/exercise.model';
import { QuizRouter } from '../../components/quiz-router/quiz-router';
import { ResultsSummary } from '../../components/results-summary/results-summary';

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

  subject?: SubjectType;
  exercises: Exercise[] = [];
  currentIndex: number = 0;
  score: number = 0;

  isLoading: boolean = true;
  errorMessage: string | null = null;
  isCurrentAnswered: boolean = false;
  isFinished: boolean = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const subjectParam = params['subject'] as SubjectType | undefined;
      this.subject = subjectParam;
      this.loadExercises();
    });
  }

  loadExercises() {
    this.isLoading = true;
    this.errorMessage = null;

    this.quizService.getExercises(this.subject).subscribe({
      next: (data) => {
        this.exercises = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.errorMessage = 'No se encontraron ejercicios cargados para esta materia.';
        }
      },
      error: (err) => {
        console.error('Error al cargar ejercicios:', err);
        this.errorMessage = 'Ocurrió un error al cargar los ejercicios de práctica.';
        this.isLoading = false;
      },
    });
  }

  get currentExercise(): Exercise | undefined {
    return this.exercises[this.currentIndex];
  }

  get progressPercentage(): number {
    if (this.exercises.length === 0) return 0;
    return Math.round(((this.currentIndex + 1) / this.exercises.length) * 100);
  }

  onAnswered(event: { correct: boolean }) {
    if (this.isCurrentAnswered) return;
    this.isCurrentAnswered = true;
    if (event.correct) {
      this.score++;
    }
  }

  nextQuestion() {
    if (!this.isCurrentAnswered) return;

    if (this.currentIndex < this.exercises.length - 1) {
      this.currentIndex++;
      this.isCurrentAnswered = false;
    } else {
      this.isFinished = true;
    }
  }

  restartQuiz() {
    this.currentIndex = 0;
    this.score = 0;
    this.isCurrentAnswered = false;
    this.isFinished = false;
  }

  goHome() {
    this.router.navigate(['/']);
  }
}

