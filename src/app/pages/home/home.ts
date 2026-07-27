import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubjectFilter } from '../../components/subject-filter/subject-filter';
import { SubjectType } from '../../models/exercise.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SubjectFilter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private router = inject(Router);
  selectedSubject: SubjectType | null = null;

  onSubjectSelected(subject: SubjectType | null) {
    this.selectedSubject = subject;
  }

  startQuiz() {
    const queryParams = this.selectedSubject ? { subject: this.selectedSubject } : {};
    this.router.navigate(['/quiz'], { queryParams });
  }
}

