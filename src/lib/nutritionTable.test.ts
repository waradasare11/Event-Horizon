import { describe, it, expect } from 'vitest';
import { 
  findFood, 
  scaleToGrams, 
  atwaterKcal, 
  NUTRITION_TABLE 
} from '../data/nutritionTable';

describe('AROH Nutrition Table Verification & Atwater Physics', () => {

  it('contains comprehensive verified food benchmarks from IFCT 2017 & USDA', () => {
    expect(NUTRITION_TABLE.length).toBeGreaterThanOrEqual(30);

    const sabudana = findFood('sabudana khichdi');
    expect(sabudana).toBeDefined();
    expect(sabudana?.source).toBe('IFCT');
    expect(sabudana?.per100g.carbsG).toBe(38.0);

    const paneer = findFood('low fat paneer');
    expect(paneer).toBeDefined();
    expect(paneer?.per100g.proteinG).toBe(20.5);

    const chicken = findFood('grilled chicken breast');
    expect(chicken).toBeDefined();
    expect(chicken?.source).toBe('USDA');
    expect(chicken?.per100g.proteinG).toBe(31.0);
  });

  it('obeys Atwater energy balance: |kcal - (p*4 + c*4 + f*9)| / kcal < 0.12 for every table row', () => {
    for (const row of NUTRITION_TABLE) {
      const { kcal, proteinG, carbsG, fatG } = row.per100g;
      const calculatedAtwater = proteinG * 4 + carbsG * 4 + fatG * 9;
      const diff = Math.abs(kcal - calculatedAtwater);
      const relativeError = diff / Math.max(1, kcal);

      expect(
        relativeError,
        `Food '${row.name}' failed Atwater check: stated ${kcal} kcal vs calculated ${calculatedAtwater.toFixed(1)} (error ${(relativeError * 100).toFixed(1)}%)`
      ).toBeLessThan(0.12);
    }
  });

  it('resolves roti, chapati, and phulka to the exact same whole-wheat roti entry', () => {
    const fromRoti = findFood('roti');
    const fromChapati = findFood('chapati');
    const fromPhulka = findFood('phulka');

    expect(fromRoti).toBeDefined();
    expect(fromChapati).toBeDefined();
    expect(fromPhulka).toBeDefined();

    expect(fromRoti?.id).toBe('roti-whole-wheat');
    expect(fromChapati?.id).toBe('roti-whole-wheat');
    expect(fromPhulka?.id).toBe('roti-whole-wheat');
  });

  it('prevents "chicken tikka masala" from matching "grilled chicken breast"', () => {
    const match = findFood('chicken tikka masala');
    expect(match).toBeDefined();
    // It must match the chicken tikka masala dish, NEVER the plain chicken breast!
    expect(match?.id).toBe('chicken-tikka-masala-gravy');
    expect(match?.id).not.toBe('chicken-breast-grilled');
  });

  it('prevents "egg fried rice" from matching "boiled egg"', () => {
    const match = findFood('egg fried rice');
    expect(match).toBeDefined();
    expect(match?.id).toBe('egg-fried-rice');
    expect(match?.id).not.toBe('egg-whole-boiled');
  });

  it('returns null for unknown foods rather than making an unverified guess', () => {
    const alienFood = findFood('Martian Blue Lichen Salad');
    expect(alienFood).toBeNull();

    const completelyUnknown = findFood('xyz123randomqwerty');
    expect(completelyUnknown).toBeNull();
  });

  it('scales 100g low-fat paneer to 50g with exact halving across all macronutrients', () => {
    const paneer = findFood('low fat paneer');
    expect(paneer).toBeDefined();
    if (!paneer) return;

    const scaled100 = scaleToGrams(paneer, 100);
    expect(scaled100.proteinG).toBe(20.5);
    expect(scaled100.kcal).toBe(175);

    const scaled50 = scaleToGrams(paneer, 50);
    expect(scaled50.proteinG).toBe(10.3); // 20.5 / 2 = 10.25 -> 10.3
    expect(scaled50.kcal).toBe(88); // 175 / 2 = 87.5 -> 88
    expect(scaled50.calciumMg).toBe(240); // 480 / 2 = 240
  });

  it('scales micronutrients dynamically (iron, calcium, fiber) when portion weight changes', () => {
    const roti = findFood('roti');
    expect(roti).toBeDefined();
    if (!roti) return;

    const oneRoti = scaleToGrams(roti, 35); // standard ~35g roti
    const twoRotis = scaleToGrams(roti, 70); // 2 rotis = 70g

    expect(twoRotis.fiberG).toBeCloseTo(oneRoti.fiberG * 2, 0.1);
    expect(twoRotis.ironMg).toBeCloseTo((oneRoti.ironMg || 0) * 2, 0.1);
    expect(twoRotis.calciumMg).toBeCloseTo((oneRoti.calciumMg || 0) * 2, 1);
  });
});
