import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConceptQuestion } from './concept-question';

describe('ConceptQuestion', () => {
  let component: ConceptQuestion;
  let fixture: ComponentFixture<ConceptQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptQuestion);
    component = fixture.componentInstance;
    component.exercise = {
      id: 1,
      subject: 'drf',
      topic: 'Autenticación',
      type: 'concept',
      question: '¿Cómo funciona JWT?',
      expected_answer: 'Usa tokens de acceso y refresco',
      key_points: ['Access Token', 'Refresh Token'],
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

