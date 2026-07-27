import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { McExercise } from '../../models/exercise.model';

@Component({
  selector: 'app-mc-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mc-question.html',
  styleUrl: './mc-question.scss',
})
export class McQuestion implements OnChanges {
  @Input({ required: true }) exercise!: McExercise;
  @Input() savedState?: { isAnswered: boolean; selectedOptionIndex?: number };
  @Output() answered = new EventEmitter<{ correct: boolean; selectedOptionIndex?: number }>();

  selectedIndex: number | null = null;
  isSubmitted: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['exercise'] || changes['savedState']) {
      if (this.savedState && this.savedState.isAnswered) {
        this.isSubmitted = true;
        this.selectedIndex = this.savedState.selectedOptionIndex ?? null;
      } else {
        this.selectedIndex = null;
        this.isSubmitted = false;
      }
    }
  }

  selectOption(index: number) {
    if (this.isSubmitted) return;

    this.selectedIndex = index;
    this.isSubmitted = true;
    const isCorrect = index === this.exercise.correct_index;
    this.answered.emit({ correct: isCorrect, selectedOptionIndex: index });
  }

  getOptionExplanation(index: number): string | null {
    if (!this.exercise.option_explanations || !this.exercise.option_explanations[index]) {
      return null;
    }
    return this.exercise.option_explanations[index];
  }
}

