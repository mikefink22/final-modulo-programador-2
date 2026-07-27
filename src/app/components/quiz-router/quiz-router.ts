import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise, McExercise, CodeExercise as ICodeExercise, ConceptExercise } from '../../models/exercise.model';
import { McQuestion } from '../mc-question/mc-question';
import { CodeExercise } from '../code-exercise/code-exercise';
import { ConceptQuestion } from '../concept-question/concept-question';

@Component({
  selector: 'app-quiz-router',
  standalone: true,
  imports: [CommonModule, McQuestion, CodeExercise, ConceptQuestion],
  templateUrl: './quiz-router.html',
  styleUrl: './quiz-router.scss',
})
export class QuizRouter {
  @Input({ required: true }) exercise!: Exercise;
  @Output() answered = new EventEmitter<{ correct: boolean }>();

  get mcExercise(): McExercise {
    return this.exercise as McExercise;
  }

  get codeExercise(): ICodeExercise {
    return this.exercise as ICodeExercise;
  }

  get conceptExercise(): ConceptExercise {
    return this.exercise as ConceptExercise;
  }

  onAnswered(event: { correct: boolean }) {
    this.answered.emit(event);
  }
}

