import { describe, it, expect } from 'vitest';
import { 
  executeMultiModelConsensusReconciliation, 
  validateAndCalibrateFoodItem,
  findVerifiedFoodBenchmark,
  ModelScanCandidate,
  VERIFIED_BENCHMARKS
} from './mealConsensus';
import { auditVegetarianCompliance } from './api';

describe('Meal Scanner Multi-Model Consensus & Weighted-Confidence Logic', () => {

  it('contains comprehensive verified food benchmarks from USDA and ICMR-IFCT', () => {
    expect(VERIFIED_BENCHMARKS.length).toBeGreaterThanOrEqual(10);
    
    const sabudana = findVerifiedFoodBenchmark('sabudana khichdi');
    expect(sabudana).toBeDefined();
    expect(sabudana?.database).toBe('ICMR-IFCT');
    expect(sabudana?.per100g.carbsG).toBe(36.0);

    const paneer = findVerifiedFoodBenchmark('low fat paneer');
    expect(paneer).toBeDefined();
    expect(paneer?.per100g.proteinG).toBe(20.5);

    const chicken = findVerifiedFoodBenchmark('grilled chicken breast');
    expect(chicken).toBeDefined();
    expect(chicken?.database).toBe('USDA FoodData Central');
    expect(chicken?.per100g.proteinG).toBe(31.0);
  });

  it('calibrates portion macros against verified database with 100% mathematical precision', () => {
    const rawPaneer = {
      name: 'Paneer Cubes',
      weightG: 200,
    };
    const calibrated = validateAndCalibrateFoodItem(rawPaneer, 3, 3);
    
    expect(calibrated.weightG).toBe(200);
    expect(calibrated.verifiedByDatabase).toBe(true);
    expect(calibrated.proteinG).toBe(41.0); // 20.5 * 2
    expect(calibrated.calories).toBe(350); // 175 * 2
    expect(calibrated.confidenceScorePct).toBeGreaterThanOrEqual(95);
    expect(calibrated.modelAgreementCount).toBe(3);
  });

  it('applies 4-4-9 Atwater method fallback when food is not in local benchmark database', () => {
    const customFood = {
      name: 'Exotic Dragonfruit Smoothie Bowl',
      weightG: 150,
      proteinG: 10,
      carbsG: 30,
      fatG: 5,
    };
    const calibrated = validateAndCalibrateFoodItem(customFood, 2, 3);
    
    // (10*4 + 30*4 + 5*9) = 40 + 120 + 45 = 205 kcal
    expect(calibrated.calories).toBe(205);
    expect(calibrated.proteinG).toBe(10);
    expect(calibrated.carbsG).toBe(30);
    expect(calibrated.fatG).toBe(5);
    expect(calibrated.verifiedByDatabase).toBe(false);
    expect(calibrated.confidenceScorePct).toBeGreaterThanOrEqual(80);
  });

  it('executes multi-model consensus when all 3 models agree on dish structure', () => {
    const model1: ModelScanCandidate = {
      modelName: 'Gemini 3.7 Vision',
      mealTitle: 'High-Protein Paneer and Roti Plate',
      items: [
        { name: 'Low-Fat Paneer', weightG: 150 },
        { name: 'Whole Wheat Roti', weightG: 80 },
      ],
    };

    const model2: ModelScanCandidate = {
      modelName: 'Gemini 3.1 Flash',
      mealTitle: 'Paneer Tikka with Phulka',
      items: [
        { name: 'Paneer', weightG: 150 },
        { name: 'Chapati', weightG: 80 },
      ],
    };

    const model3: ModelScanCandidate = {
      modelName: 'Gemini 2.5 Flash',
      mealTitle: 'Cottage Cheese and Flatbread',
      items: [
        { name: 'Cottage Cheese Paneer', weightG: 150 },
        { name: 'Roti', weightG: 80 },
      ],
    };

    const result = executeMultiModelConsensusReconciliation([model1, model2, model3]);

    expect(result.items.length).toBe(2);
    expect(result.items[0].modelAgreementCount).toBe(3);
    expect(result.items[1].modelAgreementCount).toBe(3);
    expect(result.modelConsensus?.overallConsensusScore).toBeGreaterThanOrEqual(95);
    expect(result.modelConsensus?.consensusRating).toBe('High Confidence');
    expect(result.modelConsensus?.consensusVoteRatio).toBe('3/3 Models in Agreement');
  });

  it('harmonizes portion weights via weighted averaging when models estimate varied weights', () => {
    const model1: ModelScanCandidate = {
      modelName: 'Gemini 3.7 Vision (Volumetric 3D)',
      mealTitle: 'Soya Chunks Rice Bowl',
      items: [
        { name: 'Soya Chunks', weightG: 100 },
        { name: 'Steamed Basmati Rice', weightG: 200 },
      ],
    };

    const model2: ModelScanCandidate = {
      modelName: 'Gemini 3.1 Flash (Culinary)',
      items: [
        { name: 'Soya Chunks', weightG: 120 }, // 120g
        { name: 'White Rice', weightG: 180 }, // 180g
      ],
    };

    const model3: ModelScanCandidate = {
      modelName: 'Gemini 2.5 Flash (USDA Validator)',
      items: [
        { name: 'Textured Vegetable Protein (Soya)', weightG: 110 }, // 110g
        { name: 'Cooked Rice', weightG: 220 }, // 220g
      ],
    };

    const result = executeMultiModelConsensusReconciliation([model1, model2, model3]);

    // Expected harmonized weights:
    // Soya: (100 + 120 + 110) / 3 = 110g
    // Rice: (200 + 180 + 220) / 3 = 200g
    const soyaItem = result.items.find((i) => i.name.toLowerCase().includes('soya'));
    const riceItem = result.items.find((i) => i.name.toLowerCase().includes('rice'));

    expect(soyaItem).toBeDefined();
    expect(soyaItem?.weightG).toBe(110);
    // 21g protein per 100g * 1.1 = 23.1g protein
    expect(soyaItem?.proteinG).toBe(23.1);

    expect(riceItem).toBeDefined();
    expect(riceItem?.weightG).toBe(200);
    // 130 kcal * 2 = 260 kcal
    expect(riceItem?.calories).toBe(260);

    expect(result.totalCalories).toBe((soyaItem?.calories || 0) + (riceItem?.calories || 0));
    expect(result.totalProteinG).toBe(Number(((soyaItem?.proteinG || 0) + (riceItem?.proteinG || 0)).toFixed(1)));
  });

  it('penalizes consensus score and identifies single-model item outliers', () => {
    const model1: ModelScanCandidate = {
      modelName: 'Gemini 3.7 Vision',
      items: [
        { name: 'Steamed White Basmati Rice', weightG: 150 },
        { name: 'Cooked Moong Dal', weightG: 100 },
        { name: 'Side Salad', weightG: 50 }, // Only model 1 detected this
      ],
    };

    const model2: ModelScanCandidate = {
      modelName: 'Gemini 3.1 Flash',
      items: [
        { name: 'White Rice', weightG: 150 },
        { name: 'Moong Dal', weightG: 100 },
      ],
    };

    const model3: ModelScanCandidate = {
      modelName: 'Gemini 2.5 Flash',
      items: [
        { name: 'Rice', weightG: 150 },
        { name: 'Yellow Dal', weightG: 100 },
      ],
    };

    const result = executeMultiModelConsensusReconciliation([model1, model2, model3]);

    const salad = result.items.find((i) => i.name.toLowerCase().includes('salad'));
    expect(salad).toBeDefined();
    expect(salad?.modelAgreementCount).toBe(1); // Single model vote
    expect(salad?.confidenceScorePct).toBeLessThan(result.items[0].confidenceScorePct);
  });

  it('detects and flags dietary compliance violations on vegetarian meal candidates', () => {
    const mealPayload = {
      mealTitle: 'Chicken and Rice Salad',
      items: [
        { name: 'Grilled Chicken Breast', weightG: 150 },
        { name: 'Basmati Rice', weightG: 100 },
      ],
    };

    const audit = auditVegetarianCompliance(mealPayload);
    expect(audit.isCompliant).toBe(false);
    expect(audit.violations.length).toBeGreaterThanOrEqual(1);
    expect(audit.violations[0].keyword).toBe('chicken');
  });

  it('passes vegetarian compliance for plant-based Indian meals', () => {
    const vegMealPayload = {
      mealTitle: 'Paneer Bhurji with Roti and Dal Tadka',
      items: [
        { name: 'Paneer Bhurji', weightG: 150 },
        { name: 'Whole Wheat Roti', weightG: 60 },
        { name: 'Moong Dal Tadka', weightG: 100 },
      ],
    };

    const audit = auditVegetarianCompliance(vegMealPayload);
    expect(audit.isCompliant).toBe(true);
    expect(audit.violations.length).toBe(0);
  });
});
