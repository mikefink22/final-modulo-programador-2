import { describe, it, expect } from 'vitest';
import { isExercise, McExercise } from '../models/exercise.model';
import drfIndex from '../../assets/data/drf/index.json';
import drfTanda1 from '../../assets/data/drf/tanda-1.json';


describe('Data Integrity - Assets Validation', () => {
  it('drf index.json should list tanda-1.json', () => {
    expect(Array.isArray(drfIndex)).toBe(true);
    expect(drfIndex).toContain('tanda-1.json');
  });

  it('drf tanda-1.json should contain valid exercises according to isExercise', () => {
    expect(Array.isArray(drfTanda1)).toBe(true);
    expect(drfTanda1.length).toBeGreaterThan(0);

    drfTanda1.forEach((item, index) => {
      const valid = isExercise(item);
      expect(valid).toBe(true);

      if (item.type === 'mc') {
        const mc = item as McExercise;
        expect(mc.correct_index).toBeGreaterThanOrEqual(0);
        expect(mc.correct_index).toBeLessThan(mc.options.length);
      }
    });
  });
});
