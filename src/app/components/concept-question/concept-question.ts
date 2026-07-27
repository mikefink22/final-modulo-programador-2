import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptExercise } from '../../models/exercise.model';

@Component({
  selector: 'app-concept-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './concept-question.html',
  styleUrl: './concept-question.scss',
})
export class ConceptQuestion {
  @Input({ required: true }) exercise!: ConceptExercise;
  @Output() answered = new EventEmitter<{ correct: boolean }>();

  showModelAnswer: boolean = false;
  isSubmitted: boolean = false;

  toggleAnswer() {
    this.showModelAnswer = !this.showModelAnswer;
  }

  evaluate(correct: boolean) {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    this.answered.emit({ correct });
  }
}

