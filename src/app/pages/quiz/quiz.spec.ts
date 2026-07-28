import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Quiz } from './quiz';

describe('Quiz', () => {
  let component: Quiz;
  let fixture: ComponentFixture<Quiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Quiz],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Quiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle question navigation, skipping, and direct jumping', () => {
    component.exercises = [
      { id: 1, subject: 'drf', topic: 'Views', type: 'mc', question: 'Q1', options: ['A', 'B'], correct_index: 0, explanation: 'E1' },
      { id: 2, subject: 'drf', topic: 'Views', type: 'mc', question: 'Q2', options: ['C', 'D'], correct_index: 1, explanation: 'E2' },
      { id: 3, subject: 'drf', topic: 'Views', type: 'mc', question: 'Q3', options: ['E', 'F'], correct_index: 0, explanation: 'E3' },
    ];
    component.answersState = component.exercises.map(() => ({ isAnswered: false }));
    component.currentIndex = 0;

    // Responder la primera pregunta correctamente
    component.onAnswered({ correct: true, selectedOptionIndex: 0 });
    expect(component.score).toBe(1);
    expect(component.isCurrentAnswered).toBe(true);

    // Avanzar a la siguiente pregunta
    component.nextQuestion();
    expect(component.currentIndex).toBe(1);
    expect(component.isCurrentAnswered).toBe(false);

    // Omitir la pregunta 2
    component.skipQuestion();
    expect(component.currentIndex).toBe(2);

    // Retroceder a la pregunta 1
    component.goToPrevious();
    component.goToPrevious();
    expect(component.currentIndex).toBe(0);
    expect(component.isCurrentAnswered).toBe(true);

    // Saltar a la pregunta 3 directamente
    component.jumpToQuestion(2);
    expect(component.currentIndex).toBe(2);
  });

  it('should reload exercises when restartQuiz is called', () => {
    let loaded = false;
    component.loadExercises = () => { loaded = true; };
    component.restartQuiz();
    expect(loaded).toBe(true);
  });
});

