export const SAFETY_FLOORS = {
  MIN_CALORIES_MALE: 1500,
  MIN_CALORIES_FEMALE: 1200,
  MAX_WEEKLY_LOSS_PCT_BODYWEIGHT: 0.01, // Max 1% bodyweight loss per week to prevent lean tissue catabolism
  MIN_PROTEIN_PER_KG: 1.6, // g/kg bodyweight
  MIN_FAT_PER_KG: 0.6, // g/kg bodyweight for optimal endocrine/hormonal function
  MAX_DEFICIT_CALORIES: 750, // Avoid severe metabolic crash
  SURPLUS_CALORIES_LEAN_BULK: 250, // Optimal energy surplus for hyper-trophy with minimal fat gain
};

export function enforceSafetyFloors(
  calculatedCalories: number,
  sex: 'male' | 'female',
  weightKg: number
): { safeCalories: number; warning?: string } {
  const minFloor = sex === 'male' ? SAFETY_FLOORS.MIN_CALORIES_MALE : SAFETY_FLOORS.MIN_CALORIES_FEMALE;
  
  if (calculatedCalories < minFloor) {
    return {
      safeCalories: minFloor,
      warning: `Your deficit was clamped to the scientific safety floor (${minFloor} kcal/day) to preserve metabolic health and muscle mass.`,
    };
  }

  return { safeCalories: calculatedCalories };
}
