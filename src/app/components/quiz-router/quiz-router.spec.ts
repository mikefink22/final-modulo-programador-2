import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizRouter } from './quiz-router';

describe('QuizRouter', () => {
  let component: QuizRouter;
  let fixture: ComponentFixture<QuizRouter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizRouter],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizRouter);
    component = fixture.componentInstance;
    component.exercise = {
      id: 1,
      subject: 'drf',
      topic: 'Serializers',
      type: 'mc',
      question: '¿Qué es ModelSerializer?',
      options: ['A', 'B'],
      correct_index: 0,
      explanation: 'Explicación',
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

