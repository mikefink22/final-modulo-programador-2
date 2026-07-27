import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeExercise } from './code-exercise';

describe('CodeExercise', () => {
  let component: CodeExercise;
  let fixture: ComponentFixture<CodeExercise>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeExercise],
    }).compileComponents();

    fixture = TestBed.createComponent(CodeExercise);
    component = fixture.componentInstance;
    component.exercise = {
      id: 1,
      subject: 'drf',
      topic: 'ViewSets',
      type: 'code',
      instructions: 'Completa la vista',
      starter_code: 'class MyView:',
      solution_code: 'class MyView(ModelViewSet):',
      explanation: 'Explicación del código',
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

