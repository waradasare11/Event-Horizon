import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { Dumbbell, Wheat, Droplet, Flame, PieChart as PieIcon } from 'lucide-react';
import { UserProfile, MealLog } from '../types';

interface MacroDonutChartProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
}

export const MacroDonutChart: React.FC<MacroDonutChartProps> = ({
  userProfile,
  mealLogs,
}) => {
  const totalCalories = mealLogs.reduce((sum, m) => sum + m.calories, 0);
  const totalProteinG = Number(mealLogs.reduce((sum, m) => sum + m.proteinG, 0).toFixed(1));
  const totalCarbsG = Number(mealLogs.reduce((sum, m) => sum + m.carbsG, 0).toFixed(1));
  const totalFatG = Number(mealLogs.reduce((sum, m) => sum + m.fatG, 0).toFixed(1));

  // Calories derived from each macro
  const proteinCals = Math.round(totalProteinG * 4);
  const carbsCals = Math.round(totalCarbsG * 4);
  const fatCals = Math.round(totalFatG * 9);
  const calculatedMacroCals = proteinCals + carbsCals + fatCals;

  const proteinEnergyPct = calculatedMacroCals > 0 ? Math.round((proteinCals / calculatedMacroCals) * 100) : 0;
  const carbsEnergyPct = calculatedMacroCals > 0 ? Math.round((carbsCals / calculatedMacroCals) * 100) : 0;
  const fatEnergyPct = calculatedMacroCals > 0 ? Math.round((fatCals / calculatedMacroCals) * 100) : 0;

  // Target macro percentages from profile
  const targetProteinCals = (userProfile.dailyProtein || 140) * 4;
  const targetCarbsCals = (userProfile.dailyCarbs || 200) * 4;
  const targetFatCals = (userProfile.dailyFat || 60) * 9;
  const totalTargetCals = targetProteinCals + targetCarbsCals + targetFatCals;

  const targetProteinPct = Math.round((targetProteinCals / Math.max(1, totalTargetCals)) * 100);
  const targetCarbsPct = Math.round((targetCarbsCals / Math.max(1, totalTargetCals)) * 100);
  const targetFatPct = Math.round((targetFatCals / Math.max(1, totalTargetCals)) * 100);

  // Data for Recharts Donut Pie
  const chartData = [
    {
      name: 'Protein',
      grams: totalProteinG,
      calories: proteinCals,
      percentage: proteinEnergyPct,
      color: '#3B82F6',
      unit: 'g',
    },
    {
      name: 'Carbohydrates',
      grams: totalCarbsG,
      calories: carbsCals,
      percentage: carbsEnergyPct,
      color: '#3B82F6',
      unit: 'g',
    },
    {
      name: 'Essential Fats',
      grams: totalFatG,
      calories: fatCals,
      percentage: fatEnergyPct,
      color: '#E8912D',
      unit: 'g',
    },
  ];

  // If no meals logged yet, show a subtle placeholder slice
  const displayData = calculatedMacroCals > 0 
    ? chartData.filter((d) => d.grams > 0)
    : [{ name: 'Awaiting Meal Logs', grams: 0, calories: 0, percentage: 100, color: '#9CA3AF', unit: 'g' }];

  return (
    <div className="bg-white dark:bg-[#111111] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-5 transition-colors text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-[#2A2416] pb-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#3B82F6] dark:text-[#60A5FA]" />
            <span>Today's Real-Time Macro Distribution</span>
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
            Calorie energy ratio split across Protein (4 kcal/g), Carbs (4 kcal/g), and Fats (9 kcal/g).
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] shrink-0">
          {totalCalories} kcal Total
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]">
          <div className="w-full h-52 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={calculatedMacroCals > 0 ? 4 : 0}
                  dataKey="calories"
                  strokeWidth={2}
                  stroke={typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? '#111111' : '#FFFFFF'}
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      if (data.name === 'Awaiting Meal Logs') return null;
                      return (
                        <div className="bg-[#1E201F] text-white text-xs p-3 rounded-xl shadow-lg border border-[#2A2416]">
                          <div className="font-bold flex items-center gap-1.5" style={{ color: data.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                            {data.name}
                          </div>
                          <div className="mt-1 text-gray-200">
                            {data.grams}g • {data.calories} kcal ({data.percentage}% of energy)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Display */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                {totalCalories}
              </div>
              <div className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2] uppercase font-semibold">
                kcal logged
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
            {calculatedMacroCals > 0 ? 'Live Energy Proportion' : 'Log your first meal to populate macros'}
          </span>
        </div>

        {/* Macro Details & Target Comparison */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Protein Bar */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#282C2A] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#3B82F6] dark:text-[#60A5FA]">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Protein</span>
                <span className="text-[11px] font-normal text-[#6B7280] dark:text-[#9EA8A2]">
                  ({totalProteinG}g / {userProfile.dailyProtein}g)
                </span>
              </div>
              <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9] text-xs">
                {proteinEnergyPct}% <span className="font-normal text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">(Target ~{targetProteinPct}%)</span>
              </div>
            </div>
            <div className="w-full bg-[#E5E7EB] dark:bg-[#282C2A] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#3B82F6] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((totalProteinG / Math.max(1, userProfile.dailyProtein)) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
              <span>{proteinCals} kcal from protein</span>
              <span>{Math.max(0, userProfile.dailyProtein - totalProteinG).toFixed(0)}g left</span>
            </div>
          </div>

          {/* Carbs Bar */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#282C2A] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#3B82F6]">
                <Wheat className="w-3.5 h-3.5" />
                <span>Carbohydrates</span>
                <span className="text-[11px] font-normal text-[#6B7280] dark:text-[#9EA8A2]">
                  ({totalCarbsG}g / {userProfile.dailyCarbs || 200}g)
                </span>
              </div>
              <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9] text-xs">
                {carbsEnergyPct}% <span className="font-normal text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">(Target ~{targetCarbsPct}%)</span>
              </div>
            </div>
            <div className="w-full bg-[#E5E7EB] dark:bg-[#282C2A] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#3B82F6] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((totalCarbsG / Math.max(1, userProfile.dailyCarbs || 200)) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
              <span>{carbsCals} kcal from carbs</span>
              <span>{Math.max(0, (userProfile.dailyCarbs || 200) - totalCarbsG).toFixed(0)}g left</span>
            </div>
          </div>

          {/* Fats Bar */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#282C2A] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#E8912D]">
                <Droplet className="w-3.5 h-3.5" />
                <span>Essential Fats</span>
                <span className="text-[11px] font-normal text-[#6B7280] dark:text-[#9EA8A2]">
                  ({totalFatG}g / {userProfile.dailyFat || 60}g)
                </span>
              </div>
              <div className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9] text-xs">
                {fatEnergyPct}% <span className="font-normal text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">(Target ~{targetFatPct}%)</span>
              </div>
            </div>
            <div className="w-full bg-[#E5E7EB] dark:bg-[#282C2A] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#E8912D] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((totalFatG / Math.max(1, userProfile.dailyFat || 60)) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
              <span>{fatCals} kcal from fats</span>
              <span>{Math.max(0, (userProfile.dailyFat || 60) - totalFatG).toFixed(0)}g left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
