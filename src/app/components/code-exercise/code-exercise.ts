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
  @Output() answered = new EventEmitter<{ correct: boolean }>();

  userCode: string = '';
  showSolution: boolean = false;
  isSubmitted: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['exercise'] && this.exercise) {
      this.userCode = '';
      this.showSolution = false;
      this.isSubmitted = false;
    }
  }

  onCodeInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.userCode = input.value;
  }

  toggleSolution() {
    this.showSolution = !this.showSolution;
  }

  get isExactMatch(): boolean {
    if (!this.userCode || !this.exercise.solution_code) return false;
    return this.userCode.trim().toLowerCase() === this.exercise.solution_code.trim().toLowerCase();
  }

  evaluate(correct: boolean) {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    this.answered.emit({ correct });
  }
}


