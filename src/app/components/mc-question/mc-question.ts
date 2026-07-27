import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { McExercise } from '../../models/exercise.model';

@Component({
  selector: 'app-mc-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mc-question.html',
  styleUrl: './mc-question.scss',
})
export class McQuestion {
  @Input({ required: true }) exercise!: McExercise;
  @Output() answered = new EventEmitter<{ correct: boolean }>();

  selectedIndex: number | null = null;
  isSubmitted: boolean = false;

  selectOption(index: number) {
    if (this.isSubmitted) return;

    this.selectedIndex = index;
    this.isSubmitted = true;
    const isCorrect = index === this.exercise.correct_index;
    this.answered.emit({ correct: isCorrect });
  }

  getOptionExplanation(index: number): string | null {
    if (!this.exercise.option_explanations || !this.exercise.option_explanations[index]) {
      return null;
    }
    return this.exercise.option_explanations[index];
  }
}

