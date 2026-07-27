import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExercise as ICodeExercise } from '../../models/exercise.model';

@Component({
  selector: 'app-code-exercise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-exercise.html',
  styleUrl: './code-exercise.scss',
})
export class CodeExercise {
  @Input({ required: true }) exercise!: ICodeExercise;
  @Output() answered = new EventEmitter<{ correct: boolean }>();

  showSolution: boolean = false;
  isSubmitted: boolean = false;

  toggleSolution() {
    this.showSolution = !this.showSolution;
  }

  evaluate(correct: boolean) {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    this.answered.emit({ correct });
  }
}

