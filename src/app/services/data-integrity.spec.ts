import { describe, it, expect } from 'vitest';
import { isExercise, McExercise } from '../models/exercise.model';
import drfIndex from '../../assets/data/drf/index.json';
import drfTanda1 from '../../assets/data/drf/tanda-1.json';
import webIndex from '../../assets/data/programacion-web/index.json';
import webTanda1 from '../../assets/data/programacion-web/tanda-1.json';
import pooIndex from '../../assets/data/poo-python/index.json';
import pooTanda1 from '../../assets/data/poo-python/tanda-1.json';

describe('Data Integrity - Assets Validation', () => {
  it('drf index.json should list tanda-1.json', () => {
    expect(Array.isArray(drfIndex)).toBe(true);
    expect(drfIndex).toContain('tanda-1.json');
  });

  it('drf tanda-1.json should contain valid exercises according to isExercise', () => {
    expect(Array.isArray(drfTanda1)).toBe(true);
    expect(drfTanda1.length).toBeGreaterThan(0);

    drfTanda1.forEach((item) => {
      const valid = isExercise(item);
      expect(valid).toBe(true);

      if (item.type === 'mc') {
        const mc = item as McExercise;
        expect(mc.correct_index).toBeGreaterThanOrEqual(0);
        expect(mc.correct_index).toBeLessThan(mc.options.length);
      }
    });
  });

  it('programacion-web assets should be valid exercises', () => {
    expect(webIndex).toContain('tanda-1.json');
    expect(Array.isArray(webTanda1)).toBe(true);
    webTanda1.forEach((item) => {
      expect(isExercise(item)).toBe(true);
    });
  });

  it('poo-python assets should be valid exercises', () => {
    expect(pooIndex).toContain('tanda-1.json');
    expect(Array.isArray(pooTanda1)).toBe(true);
    pooTanda1.forEach((item) => {
      expect(isExercise(item)).toBe(true);
    });
  });
});
