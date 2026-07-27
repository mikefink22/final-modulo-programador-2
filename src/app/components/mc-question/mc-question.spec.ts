import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { McQuestion } from './mc-question';

describe('McQuestion', () => {
  let component: McQuestion;
  let fixture: ComponentFixture<McQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McQuestion],
    }).compileComponents();

    fixture = TestBed.createComponent(McQuestion);
    component = fixture.componentInstance;
    component.exercise = {
      id: 1,
      subject: 'drf',
      topic: 'Serializers',
      type: 'mc',
      question: '¿Qué es ModelSerializer?',
      options: ['Clase que simplifica serializers', 'Vista', 'Filtro'],
      correct_index: 0,
      explanation: 'Explicación del serializer',
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

