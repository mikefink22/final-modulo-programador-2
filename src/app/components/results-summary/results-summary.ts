import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-results-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-summary.html',
  styleUrl: './results-summary.scss',
})
export class ResultsSummary {
  @Input({ required: true }) score: number = 0;
  @Input({ required: true }) total: number = 0;
  @Output() restart = new EventEmitter<void>();

  get percentage(): number {
    if (this.total === 0) return 0;
    return Math.round((this.score / this.total) * 100);
  }

  get feedbackMessage(): { title: string; subtitle: string; icon: string } {
    const pct = this.percentage;
    if (pct >= 90) {
      return {
        title: '¡Excelente Desempeño!',
        subtitle: 'Tenés un dominio sobresaliente de la materia. ¡Estás más que listo para el examen final!',
        icon: '🏆',
      };
    } else if (pct >= 70) {
      return {
        title: '¡Buen Trabajo!',
        subtitle: 'Tenés una base sólida. Repasá los conceptos fallados para asegurar la máxima calificación.',
        icon: '🌟',
      };
    } else if (pct >= 50) {
      return {
        title: 'Aprobado — A Reforzar',
        subtitle: 'Cubriste la mitad de los contenidos. Te recomendamos realizar otra tanda de práctica.',
        icon: '📚',
      };
    } else {
      return {
        title: 'Necesita Repaso',
        subtitle: 'No te preocupes, la práctica constante es la clave. Repasá los apuntes y volvé a intentarlo.',
        icon: '💪',
      };
    }
  }

  onRestart() {
    this.restart.emit();
  }
}

