import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptExercise } from '../../models/exercise.model';

@Component({
  selector: 'app-concept-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './concept-question.html',
  styleUrl: './concept-question.scss',
})
export class ConceptQuestion implements OnChanges {
  @Input({ required: true }) exercise!: ConceptExercise;
  @Output() answered = new EventEmitter<{ correct: boolean }>();

  userAnswer: string = '';
  showModelAnswer: boolean = false;
  isSubmitted: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['exercise'] && this.exercise) {
      this.userAnswer = '';
      this.showModelAnswer = false;
      this.isSubmitted = false;
    }
  }

  onAnswerInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.userAnswer = input.value;
  }

  toggleAnswer() {
    this.showModelAnswer = !this.showModelAnswer;
  }

  evaluate(correct: boolean) {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    this.answered.emit({ correct });
  }
}


