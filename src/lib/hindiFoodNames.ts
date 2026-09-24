import { findFood } from '../data/nutritionTable';

/**
 * Resolves the Hindi label for a food item if available in the verified nutritionTable.
 */
export function getFoodHindiName(foodName: string, explicitHindiName?: string): string | null {
  if (explicitHindiName && explicitHindiName.trim().length > 0) {
    return explicitHindiName.trim();
  }

  if (!foodName || typeof foodName !== 'string') return null;

  const matched = findFood(foodName);
  if (matched?.hindiName && matched.hindiName.trim().length > 0) {
    return matched.hindiName.trim();
  }

  return null;
}
