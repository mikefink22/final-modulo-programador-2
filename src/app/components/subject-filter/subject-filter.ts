import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubjectType } from '../../models/exercise.model';
import { QuizService } from '../../services/quiz.service';

export interface SubjectOption {
  id: SubjectType | null;
  label: string;
  badge: string;
  description: string;
  icon: string;
}

export interface LimitOption {
  value: number | null;
  label: string;
}

export interface ConfirmModalConfig {
  title: string;
  message: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string;
  action: () => void;
}

export interface ConfirmModalState extends ConfirmModalConfig {
  isOpen: boolean;
}

@Component({
  selector: 'app-subject-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-filter.html',
  styleUrl: './subject-filter.scss',
})
export class SubjectFilter {
  private quizService = inject(QuizService);
  private router = inject(Router);

  @Input() selectedSubject: SubjectType | null = null;
  @Input() selectedLimit: number | null = 10;
  @Input() limitOptions: LimitOption[] = [];
  @Input() totalAvailableCount: number = 0;

  @Output() subjectSelected = new EventEmitter<SubjectType | null>();
  @Output() limitSelected = new EventEmitter<number | null>();
  @Output() startQuizRequested = new EventEmitter<void>();
  @Output() deckUpdated = new EventEmitter<void>();
  @Output() confirmRequested = new EventEmitter<ConfirmModalConfig>();

  getReviewCount(subjectId: SubjectType | null): number {
    return this.quizService.getReviewDeckCount(subjectId ?? undefined);
  }

  getDiscardedCount(subjectId: SubjectType | null): number {
    return this.quizService.getDiscardedDeckCount(subjectId ?? undefined);
  }

  onStartReview(subjectId: SubjectType | null, event: Event) {
    event.stopPropagation();
    const queryParams: any = { mode: 'review' };
    if (subjectId) queryParams.subject = subjectId;
    this.router.navigate(['/quiz'], { queryParams });
  }

  onClearReview(subjectId: SubjectType | null, event: Event) {
    event.stopPropagation();
    const subjectName = this.subjects.find((s) => s.id === subjectId)?.label ?? 'todas las materias';
    
    this.confirmRequested.emit({
      title: 'Vaciar Mazo de Repaso',
      message: `¿Estás seguro de que deseas vaciar las preguntas acumuladas de repaso para ${subjectName}?`,
      icon: '🗑️',
      confirmText: 'Sí, Vaciar Mazo',
      cancelText: 'Cancelar',
      confirmClass: 'btn-danger',
      action: () => {
        this.quizService.clearReviewDeck(subjectId ?? undefined);
        this.deckUpdated.emit();
      },
    });
  }

  onRestoreDiscarded(subjectId: SubjectType | null, event: Event) {
    event.stopPropagation();
    const subjectName = this.subjects.find((s) => s.id === subjectId)?.label ?? 'todas las materias';
    
    this.confirmRequested.emit({
      title: 'Reincorporar Preguntas',
      message: `¿Deseas reincorporar las preguntas descartadas en las últimas 24 horas para ${subjectName} al mazo activo?`,
      icon: '♻️',
      confirmText: 'Sí, Reincorporar',
      cancelText: 'Cancelar',
      confirmClass: 'btn-success',
      action: () => {
        this.quizService.restoreAllDiscarded(subjectId ?? undefined);
        this.deckUpdated.emit();
      },
    });
  }

  subjects: SubjectOption[] = [
    {
      id: null,
      label: 'Todas las Materias',
      badge: 'Mix Complete',
      description: 'Evaluación integrada de todo el programa de la carrera',
      icon: '✨',
    },
    {
      id: 'programacion-web',
      label: 'Programación Web',
      badge: 'Frontend Base',
      description: 'HTML, CSS, Bootstrap, JS, DOM y Arquitectura Cliente-Servidor',
      icon: '🌐',
    },
    {
      id: 'poo-python',
      label: 'POO en Python',
      badge: 'Backend Base',
      description: 'Clases, Herencia, Encapsulamiento, Modularidad y Excepciones',
      icon: '🐍',
    },
    {
      id: 'drf',
      label: 'Django REST Framework',
      badge: 'Backend Avanzado',
      description: 'Serializers, ViewSets, Autenticación y APIs RESTful',
      icon: '⚡',
    },
    {
      id: 'angular',
      label: 'Angular 21',
      badge: 'Frontend Avanzado',
      description: 'Components Standalone, Signals, RxJS y Routing',
      icon: '🅰️',
    },
    {
      id: 'desarrollo-de-software',
      label: 'Desarrollo de Software',
      badge: 'Procesos',
      description: 'Scrum, Kanban, Gitflow y estimaciones',
      icon: '🚀',
    },
  ];

  selectSubject(subject: SubjectType | null) {
    this.selectedSubject = subject;
    this.subjectSelected.emit(subject);
  }

  onSelectLimit(limit: number | null, event: Event) {
    event.stopPropagation();
    this.selectedLimit = limit;
    this.limitSelected.emit(limit);
  }

  onStartQuiz(event: Event) {
    event.stopPropagation();
    this.startQuizRequested.emit();
  }
}

