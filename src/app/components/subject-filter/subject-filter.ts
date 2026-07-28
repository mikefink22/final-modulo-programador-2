import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubjectType } from '../../models/exercise.model';

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

@Component({
  selector: 'app-subject-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-filter.html',
  styleUrl: './subject-filter.scss',
})
export class SubjectFilter {
  @Input() selectedSubject: SubjectType | null = null;
  @Input() selectedLimit: number | null = 10;
  @Input() limitOptions: LimitOption[] = [];
  @Input() totalAvailableCount: number = 0;

  @Output() subjectSelected = new EventEmitter<SubjectType | null>();
  @Output() limitSelected = new EventEmitter<number | null>();
  @Output() startQuizRequested = new EventEmitter<void>();

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

