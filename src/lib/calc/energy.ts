/**
 * Mifflin-St Jeor BMR Equation
 * Widely validated in exercise physiology literature as the most accurate standard formula for estimating Basal Metabolic Rate.
 */
export function calculateBMR(
  sex: 'male' | 'female',
  weightKg: number,
  heightCm: number,
  age: number
): number {
  if (sex === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

/**
 * Total Daily Energy Expenditure (TDEE) multiplier based on weekly training frequency
 */
export function calculateTDEE(bmr: number, trainingDaysPerWeek: number): number {
  let multiplier = 1.2; // Sedentary base

  if (trainingDaysPerWeek <= 2) {
    multiplier = 1.375; // Light activity
  } else if (trainingDaysPerWeek <= 4) {
    multiplier = 1.55; // Moderate activity
  } else if (trainingDaysPerWeek <= 6) {
    multiplier = 1.725; // Very active
  } else {
    multiplier = 1.9; // Extremely active / athlete
  }

  return Math.round(bmr * multiplier);
}
