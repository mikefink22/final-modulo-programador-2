import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsSummary } from './results-summary';

describe('ResultsSummary', () => {
  let component: ResultsSummary;
  let fixture: ComponentFixture<ResultsSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsSummary);
    component = fixture.componentInstance;
    component.score = 8;
    component.total = 10;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate percentage correctly', () => {
    expect(component.percentage).toBe(80);
  });
});

