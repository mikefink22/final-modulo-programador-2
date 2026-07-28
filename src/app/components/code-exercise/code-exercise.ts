import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExercise as ICodeExercise } from '../../models/exercise.model';

@Component({
  selector: 'app-code-exercise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-exercise.html',
  styleUrl: './code-exercise.scss',
})
export class CodeExercise implements OnChanges {
  @Input({ required: true }) exercise!: ICodeExercise;
  @Input() savedState?: { isAnswered: boolean; isCorrect?: boolean };
  @Output() answered = new EventEmitter<{ correct: boolean }>();

  userCode: string = '';
  showSolution: boolean = false;
  isSubmitted: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['exercise'] || changes['savedState']) && this.exercise) {
      if (this.savedState && this.savedState.isAnswered) {
        this.isSubmitted = true;
        this.showSolution = true;
      } else {
        this.userCode = this.exercise.starter_code || '';
        this.showSolution = false;
        this.isSubmitted = false;
      }
    }
  }

  onCodeInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.userCode = input.value;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = event.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const spaces = '    ';
      this.userCode = this.userCode.substring(0, start) + spaces + this.userCode.substring(end);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  }

  resetToStarterCode() {
    if (this.exercise && this.exercise.starter_code) {
      this.userCode = this.exercise.starter_code;
    }
  }

  toggleSolution() {
    this.showSolution = !this.showSolution;
  }

  get isExactMatch(): boolean {
    if (!this.userCode || !this.exercise.solution_code) return false;
    const cleanUser = this.userCode.trim().toLowerCase();
    const cleanSolution = this.exercise.solution_code.trim().toLowerCase();

    if (cleanUser === cleanSolution) {
      return true;
    }

    if (this.exercise.starter_code) {
      const filledCode = this.exercise.starter_code.replace(/_+/g, this.userCode.trim());
      if (filledCode.trim().toLowerCase() === cleanSolution) {
        return true;
      }
    }

    return false;
  }

  evaluate(correct: boolean) {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    this.answered.emit({ correct });
  }
}


