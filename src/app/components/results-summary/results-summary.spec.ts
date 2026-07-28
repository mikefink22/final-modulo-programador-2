import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsSummary } from './results-summary';

describe('ResultsSummary', () => {
  let component: ResultsSummary;
  let fixture: ComponentFixture<ResultsSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsSummary);
    component = fixture.componentInstance;
    component.score = 8;
    component.total = 10;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate percentage correctly', () => {
    expect(component.percentage).toBe(80);
  });

  it('should default viewMode to grid and allow changing to list', () => {
    expect(component.viewMode).toBe('grid');
    component.setViewMode('list');
    expect(component.viewMode).toBe('list');
    component.setViewMode('grid');
    expect(component.viewMode).toBe('grid');
  });

  it('should generate formatted tooltip text', () => {
    const mockExercise = {
      id: 1,
      subject: 'angular',
      topic: 'Standalone Components',
      type: 'mc' as const,
      question: '¿Qué es standalone?',
      options: ['A', 'B'],
      correct_index: 0,
      explanation: 'Explicación'
    };

    const tooltip = component.getTooltipText({ exercise: mockExercise, isAnswered: true, isCorrect: true }, 0);
    expect(tooltip).toContain('#1 [Correcta] — ANGULAR • Standalone Components: ¿Qué es standalone?');
  });

  it('should handle inline preview selection, navigation and closing', () => {
    const mockExercise = {
      id: 1,
      subject: 'angular',
      topic: 'Standalone Components',
      type: 'mc' as const,
      question: '¿Qué es standalone?',
      options: ['A', 'B'],
      correct_index: 0,
      explanation: 'Explicación'
    };
    component.exercisesState = [
      { exercise: mockExercise, isAnswered: true, isCorrect: true },
      { exercise: { ...mockExercise, id: 2 }, isAnswered: false }
    ];

    expect(component.selectedPreviewIndex).toBeNull();
    component.onSelectQuestion(0);
    expect(component.selectedPreviewIndex).toBe(0);
    expect(component.currentPreviewItem?.exercise.id).toBe(1);

    component.nextPreview();
    expect(component.selectedPreviewIndex).toBe(1);

    component.prevPreview();
    expect(component.selectedPreviewIndex).toBe(0);

    component.closePreview();
    expect(component.selectedPreviewIndex).toBeNull();
  });
});

