import { UserProfile, MealLog } from '../types';
import { sendWorkoutNotification } from './notifications';

export interface SmartNutritionAlert {
  id: string;
  type: 'low_protein' | 'calorie_ceiling' | 'calorie_lag' | 'optimal' | 'off_target_macros';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionableTip: string;
  metrics: {
    caloriesConsumed: number;
    calorieTarget: number;
    caloriePercentage: number;
    proteinConsumed: number;
    proteinTarget: number;
    proteinPercentage: number;
  };
  timestamp: string;
}

const LAST_NOTIFICATION_KEY = 'peakform_last_nutrition_notif_time';

/**
 * Evaluates current daily nutrition logs against the user's specific caloric & protein targets
 */
export function evaluateNutritionAlert(
  userProfile: UserProfile,
  mealLogs: MealLog[]
): SmartNutritionAlert | null {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = mealLogs.filter((m) => m.date === todayStr);

  const caloriesConsumed = todayLogs.reduce((sum, m) => sum + m.calories, 0);
  const proteinConsumed = Number(todayLogs.reduce((sum, m) => sum + m.proteinG, 0).toFixed(1));

  const calorieTarget = userProfile.dailyCalories || 2000;
  const proteinTarget = userProfile.dailyProtein || 140;

  const caloriePercentage = Math.round((caloriesConsumed / Math.max(1, calorieTarget)) * 100);
  const proteinPercentage = Math.round((proteinConsumed / Math.max(1, proteinTarget)) * 100);

  const now = new Date();
  const currentHour = now.getHours();

  const metrics = {
    caloriesConsumed,
    calorieTarget,
    caloriePercentage,
    proteinConsumed,
    proteinTarget,
    proteinPercentage,
  };

  // If no meals logged yet, return null
  if (todayLogs.length === 0) {
    return null;
  }

  // 1. Critical Discrepancy: Significant Calorie Consumption with Negligible Protein
  if (caloriePercentage >= 40 && proteinPercentage < 25) {
    return {
      id: `alert_low_protein_${todayStr}`,
      type: 'low_protein',
      severity: 'warning',
      title: '⚠️ Low Protein Ratio Alert',
      message: `You've used ${caloriePercentage}% of today's calories (${caloriesConsumed} kcal) but only logged ${proteinPercentage}% of your protein goal (${proteinConsumed.toFixed(0)}g / ${proteinTarget}g).`,
      actionableTip: `To prevent muscle catabolism on your ${userProfile.goal === 'lose_fat' ? 'fat loss cut' : 'training plan'}, prioritize 35-45g of dense protein (chicken breast, low-fat paneer, tofu, Greek yogurt, or whey) on your next meal.`,
      metrics,
      timestamp: now.toISOString(),
    };
  }

  // 2. Fat Loss Specific: Calorie Budget Approaching Ceiling Early in the Day
  if (userProfile.goal === 'lose_fat' && caloriePercentage >= 85 && currentHour < 18) {
    return {
      id: `alert_deficit_ceiling_${todayStr}`,
      type: 'calorie_ceiling',
      severity: 'warning',
      title: '⚠️ Calorie Deficit Budget Alert',
      message: `You are at ${caloriePercentage}% of your daily energy ceiling (${caloriesConsumed} / ${calorieTarget} kcal) before 6:00 PM.`,
      actionableTip: `Shift upcoming evening meals to high-satiety, high-volume foods: leafy salads with lemon-mustard dressing, steamed vegetables, clear broths, and pure lean protein to stay strictly in your deficit.`,
      metrics,
      timestamp: now.toISOString(),
    };
  }

  // 3. Muscle Gain Specific: Caloric Intake Lagging in Evening
  if (userProfile.goal === 'build_muscle' && currentHour >= 18 && caloriePercentage < 55) {
    return {
      id: `alert_surplus_lag_${todayStr}`,
      type: 'calorie_lag',
      severity: 'info',
      title: '📈 Calorie Surplus Growth Alert',
      message: `You have consumed only ${caloriePercentage}% of your muscle-building energy target (${caloriesConsumed} / ${calorieTarget} kcal) with limited evening time remaining.`,
      actionableTip: `Ensure an anabolic surplus by having a nutrient-dense snack: oatmeal with banana & peanut butter, whole milk with whey, or roasted almonds and Greek yogurt before bed.`,
      metrics,
      timestamp: now.toISOString(),
    };
  }

  // 4. Optimal Tracking Harmony
  if (
    (caloriePercentage >= 50 && proteinPercentage >= 50) ||
    (caloriePercentage >= 80 && proteinPercentage >= 80)
  ) {
    return {
      id: `alert_optimal_${todayStr}`,
      type: 'optimal',
      severity: 'success',
      title: '✅ Macros on Target',
      message: `Excellent tracking! You're at ${caloriePercentage}% calories (${caloriesConsumed} kcal) and ${proteinPercentage}% protein (${proteinConsumed.toFixed(0)}g), perfectly calibrated for your ${userProfile.goal}.`,
      actionableTip: `Maintain standard hydration (aim for ${userProfile.hydrationLiters || 3.5}L water) and prepare your next scheduled meal.`,
      metrics,
      timestamp: now.toISOString(),
    };
  }

  return null;
}

/**
 * Checks and pushes a browser notification if off-target and hasn't notified recently
 */
export async function triggerSmartNutritionNotificationIfOffTarget(
  userProfile: UserProfile,
  mealLogs: MealLog[]
): Promise<boolean> {
  const alert = evaluateNutritionAlert(userProfile, mealLogs);
  if (!alert || alert.severity === 'success') {
    return false;
  }

  if (typeof window === 'undefined') return false;

  // Rate-limit browser notifications to once every 3 hours for the same alert type
  const lastTimeStr = localStorage.getItem(LAST_NOTIFICATION_KEY);
  const now = Date.now();
  if (lastTimeStr) {
    const lastTime = parseInt(lastTimeStr, 10);
    if (now - lastTime < 3 * 60 * 60 * 1000) {
      return false; // recently notified
    }
  }

  // Push browser notification
  const sent = await sendWorkoutNotification(
    alert.title,
    `${alert.message} Tip: ${alert.actionableTip}`,
    { sound: true }
  );

  if (sent) {
    localStorage.setItem(LAST_NOTIFICATION_KEY, now.toString());
  }

  return sent;
}
