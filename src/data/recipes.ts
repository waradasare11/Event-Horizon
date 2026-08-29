import { CustomGeneratedRecipe } from '../types';
import { VEGETARIAN_RECIPES } from './vegetarianRecipes';
import { NON_VEG_RECIPES } from './nonVegRecipes';

export interface PreBuiltRecipe extends CustomGeneratedRecipe {
  dietCategory: 'vegetarian' | 'non_veg';
  cuisine: string;
}

export const PREBUILT_RECIPES: PreBuiltRecipe[] = [
  ...VEGETARIAN_RECIPES,
  ...NON_VEG_RECIPES,
];

export const RECIPES_DATABASE = PREBUILT_RECIPES;
export type RecipeItem = PreBuiltRecipe;

export function getRecipesByDiet(
  dietFilter: string,
  mealType: string = 'All',
  searchQuery?: string
): PreBuiltRecipe[] {
  const normFilter = (dietFilter || 'all').toLowerCase().trim();
  const isVegQuery = normFilter === 'vegetarian' || normFilter === 'vegan' || normFilter === 'eggetarian' || normFilter === 'strict_veg' || normFilter.includes('veg');
  const isNonVegQuery = normFilter === 'non_veg' || normFilter === 'non_vegetarian' || normFilter === 'omnivore' || normFilter === 'meat';

  return PREBUILT_RECIPES.filter((r) => {
    // Strict vegetarian filter check
    if (isVegQuery && r.dietCategory !== 'vegetarian') {
      return false;
    }
    if (isNonVegQuery && r.dietCategory !== 'non_veg') {
      return false;
    }
    if (mealType !== 'All') {
      const cat = r.mealCategory.toLowerCase();
      const filter = mealType.toLowerCase();
      if (!cat.includes(filter) && !filter.includes(cat)) {
        return false;
      }
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = r.recipeName.toLowerCase().includes(q);
      const matchCuisine = r.cuisine.toLowerCase().includes(q);
      const matchIng = r.ingredients.some((i) => i.item.toLowerCase().includes(q));
      if (!matchName && !matchCuisine && !matchIng) return false;
    }
    return true;
  });
}

export function getFilteredRecipes(
  dietFilter: string,
  searchQuery?: string
): PreBuiltRecipe[] {
  return getRecipesByDiet(dietFilter, 'All', searchQuery);
}
