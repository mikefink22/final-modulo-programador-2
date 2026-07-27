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

@Component({
  selector: 'app-subject-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-filter.html',
  styleUrl: './subject-filter.scss',
})
export class SubjectFilter {
  @Input() selectedSubject: SubjectType | null = null;
  @Output() subjectSelected = new EventEmitter<SubjectType | null>();

  subjects: SubjectOption[] = [
    {
      id: null,
      label: 'Todas las Materias',
      badge: 'Mix',
      description: 'Evaluación integrada de todo el programa',
      icon: '✨',
    },
    {
      id: 'angular',
      label: 'Angular 21',
      badge: 'Frontend',
      description: 'Components Standalone, Signals, RxJS y Routing',
      icon: '🅰️',
    },
    {
      id: 'drf',
      label: 'Django REST Framework',
      badge: 'Backend',
      description: 'Serializers, ViewSets, Auth y API Restful',
      icon: '🐍',
    },
    {
      id: 'metodologias',
      label: 'Metodologías Ágiles',
      badge: 'Procesos',
      description: 'Scrum, Kanban, Gitflow y estimaciones',
      icon: '🚀',
    },
  ];

  selectSubject(subject: SubjectType | null) {
    this.selectedSubject = subject;
    this.subjectSelected.emit(subject);
  }
}

