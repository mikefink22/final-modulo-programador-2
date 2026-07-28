import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize categoryChips correctly', () => {
    expect(component.categoryChips.length).toBe(6);
    expect(component.categoryChips[0].id).toBeNull();
    expect(component.categoryChips[4].id).toBe('angular');
  });

  it('should select subject when selectSubjectFromChip is called', () => {
    component.selectSubjectFromChip('angular');
    expect(component.selectedSubject).toBe('angular');
  });
});

