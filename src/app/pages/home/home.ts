import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubjectFilter } from '../../components/subject-filter/subject-filter';
import { SubjectType } from '../../models/exercise.model';
import { QuizService } from '../../services/quiz.service';

export interface LimitOption {
  value: number | null;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SubjectFilter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private router = inject(Router);
  private quizService = inject(QuizService);
  private cdr = inject(ChangeDetectorRef);

  selectedSubject: SubjectType | null = null;
  selectedLimit: number | null = 10;
  totalAvailableCount: number = 0;
  reviewDeckCount: number = 0;
  discardedDeckCount: number = 0;

  limitOptions: LimitOption[] = [];

  get selectedSubjectLabel(): string {
    if (!this.selectedSubject) return 'Todas las Materias';
    switch (this.selectedSubject) {
      case 'programacion-web': return 'Programación Web';
      case 'poo-python': return 'POO en Python';
      case 'drf': return 'Django REST Framework';
      case 'angular': return 'Angular 21';
      case 'desarrollo-de-software': return 'Desarrollo de Software';
      default: return 'Todas las Materias';
    }
  }

  ngOnInit() {
    this.updateAvailableCounts();
  }

  onSubjectSelected(subject: SubjectType | null) {
    this.selectedSubject = subject;
    this.updateAvailableCounts();

    setTimeout(() => {
      const limitBox = document.querySelector('.limit-selection-box') as HTMLElement;
      if (limitBox && window.innerWidth > 640) {
        limitBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        limitBox.classList.add('highlight-pulse');
        setTimeout(() => limitBox.classList.remove('highlight-pulse'), 1200);
      }
    }, 100);
  }

  selectLimit(limit: number | null) {
    this.selectedLimit = limit;
  }

  updateAvailableCounts() {
    const subjectParam = this.selectedSubject ?? undefined;
    this.reviewDeckCount = this.quizService.getReviewDeckCount(subjectParam);
    this.discardedDeckCount = this.quizService.getDiscardedDeckCount(subjectParam);

    this.quizService.getExerciseCount(subjectParam).subscribe((count) => {
      this.totalAvailableCount = count;
      this.buildLimitOptions(count);
      this.cdr.markForCheck();
    });
  }

  restoreDiscardedDeck() {
    const subjectParam = this.selectedSubject ?? undefined;
    this.quizService.restoreAllDiscarded(subjectParam);
    this.updateAvailableCounts();
  }

  clearReviewDeck() {
    const subjectParam = this.selectedSubject ?? undefined;
    this.quizService.clearReviewDeck(subjectParam);
    this.updateAvailableCounts();
  }

  private buildLimitOptions(total: number) {
    const defaultSteps = [5, 10, 15, 20, 25, 30];
    const validSteps = defaultSteps.filter((step) => step < total);

    this.limitOptions = validSteps.map((step) => ({
      value: step,
      label: `${step} preguntas`,
    }));

    this.limitOptions.push({
      value: null,
      label: `Todas (${total})`,
    });

    if (this.selectedLimit !== null && this.selectedLimit > total && total > 0) {
      this.selectedLimit = total;
    }
  }

  startQuiz() {
    const queryParams: any = {};
    if (this.selectedSubject) queryParams.subject = this.selectedSubject;
    if (this.selectedLimit) queryParams.limit = this.selectedLimit;
    this.router.navigate(['/quiz'], { queryParams });
  }

  startReviewQuiz() {
    if (this.reviewDeckCount === 0) return;
    const queryParams: any = { mode: 'review' };
    if (this.selectedSubject) queryParams.subject = this.selectedSubject;
    this.router.navigate(['/quiz'], { queryParams });
  }
}
