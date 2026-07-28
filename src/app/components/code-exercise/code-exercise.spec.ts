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

  it('should initialize userCode with starter_code on ngOnChanges', () => {
    component.ngOnChanges({
      exercise: {
        currentValue: component.exercise,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    expect(component.userCode).toBe('class MyView:');
  });

  it('should reset userCode to starter_code when resetToStarterCode is called', () => {
    component.userCode = 'modified code';
    component.resetToStarterCode();
    expect(component.userCode).toBe('class MyView:');
  });

  it('should insert 4 spaces when Tab key is pressed', () => {
    component.userCode = 'line1\nline2';
    const textarea = document.createElement('textarea');
    textarea.value = component.userCode;
    textarea.selectionStart = 5;
    textarea.selectionEnd = 5;

    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    Object.defineProperty(event, 'target', { value: textarea, enumerable: true });

    component.onKeyDown(event);
    expect(component.userCode).toBe('line1    \nline2');
  });
});

