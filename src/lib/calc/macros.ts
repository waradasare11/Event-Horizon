import { GoalType, DietType } from '../../types';
import { SAFETY_FLOORS, enforceSafetyFloors } from './safety-floors';

export interface MacroTargetResult {
  dailyCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  weeklyRateKg: number;
  warning?: string;
}

/**
 * Calculates optimal macronutrient targets following evidence-based nutritional guidelines (Brad Schoenfeld, Eric Helms, ISSN).
 */
export function calculateMacros(
  tdee: number,
  goal: GoalType,
  sex: 'male' | 'female',
  weightKg: number,
  dietType: DietType
): MacroTargetResult {
  let targetCalories = tdee;
  let weeklyRateKg = 0;

  if (goal === 'lose_fat') {
    // 20-25% caloric deficit or ~500 kcal for ~0.5kg/week fat loss
    const deficit = Math.min(SAFETY_FLOORS.MAX_DEFICIT_CALORIES, Math.round(tdee * 0.22));
    targetCalories = tdee - deficit;
    weeklyRateKg = -0.5;
  } else if (goal === 'build_muscle') {
    // 200-300 kcal surplus (lean bulk)
    targetCalories = tdee + SAFETY_FLOORS.SURPLUS_CALORIES_LEAN_BULK;
    weeklyRateKg = 0.25;
  } else {
    // Recomposition (maintenance / slight recomp deficit of 100 kcal)
    targetCalories = tdee - 100;
    weeklyRateKg = -0.1;
  }

  // Apply safety floors
  const { safeCalories, warning } = enforceSafetyFloors(targetCalories, sex, weightKg);
  targetCalories = safeCalories;

  // Protein targets: 2.0g-2.2g/kg for cutting (high satiety & MPS retention), 1.8g-2.0g/kg for bulking
  let proteinPerKg = goal === 'lose_fat' ? 2.2 : goal === 'build_muscle' ? 1.8 : 2.0;

  // Slightly higher protein recommendation for vegan/plant-based diets due to biological value / amino acid distribution
  if (dietType === 'vegan') {
    proteinPerKg += 0.2;
  }

  const proteinG = Math.round(weightKg * proteinPerKg);
  const proteinCalories = proteinG * 4;

  // Fat target: 25% of total calories or minimum 0.7g/kg
  const minFatG = Math.round(weightKg * SAFETY_FLOORS.MIN_FAT_PER_KG);
  const calculatedFatG = Math.round((targetCalories * 0.25) / 9);
  const fatG = Math.max(minFatG, calculatedFatG);
  const fatCalories = fatG * 9;

  // Carbs: Remaining calories
  const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
  const carbsG = Math.round(remainingCalories / 4);

  // Fiber target: 14g per 1000 kcal (minimum 25g/day)
  const fiberG = Math.max(25, Math.round((targetCalories / 1000) * 14));

  return {
    dailyCalories: targetCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    weeklyRateKg,
    warning,
  };
}

/**
 * Calculates realistic, safe goal projection timeline
 */
export function calculateGoalTimeline(
  currentWeightKg: number,
  targetWeightKg: number,
  weeklyRateKg: number
): { weeksNeeded: number; projectedDate: string } {
  const weightDiff = Math.abs(currentWeightKg - targetWeightKg);
  const rate = Math.abs(weeklyRateKg) || 0.5;

  const weeksNeeded = Math.max(1, Math.ceil(weightDiff / rate));
  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + weeksNeeded * 7);

  const projectedDate = targetDateObj.toISOString().split('T')[0];

  return {
    weeksNeeded,
    projectedDate,
  };
}
