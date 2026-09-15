import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { UserProfile, MealLog } from '../types';
import { PieChart as PieIcon, Dumbbell, Wheat, Droplet, Flame, Target, Calendar, Info } from 'lucide-react';

interface D3MacroDonutChartProps {
  userProfile: UserProfile;
  mealLogs: MealLog[];
}

interface MacroSliceData {
  key: 'protein' | 'carbs' | 'fat';
  label: string;
  grams: number;
  calories: number;
  actualEnergyPct: number;
  targetGrams: number;
  targetCalories: number;
  targetEnergyPct: number;
  actualColor: string;
  targetColor: string;
}

export const D3MacroDonutChart: React.FC<D3MacroDonutChartProps> = ({
  userProfile,
  mealLogs,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Available dates in meal logs
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(mealLogs.map((m) => m.date))).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    if (!dates.includes(today)) {
      return [today, ...dates];
    }
    return dates;
  }, [mealLogs]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [hoveredSlice, setHoveredSlice] = useState<MacroSliceData | null>(null);

  // Filter meals for selected date
  const dayMeals = useMemo(() => {
    return mealLogs.filter((m) => m.date === selectedDate);
  }, [mealLogs, selectedDate]);

  // Aggregate consumed macros
  const totalProteinG = useMemo(() => {
    return Number(dayMeals.reduce((sum, m) => sum + (m.proteinG || 0), 0).toFixed(1));
  }, [dayMeals]);

  const totalCarbsG = useMemo(() => {
    return Number(dayMeals.reduce((sum, m) => sum + (m.carbsG || 0), 0).toFixed(1));
  }, [dayMeals]);

  const totalFatG = useMemo(() => {
    return Number(dayMeals.reduce((sum, m) => sum + (m.fatG || 0), 0).toFixed(1));
  }, [dayMeals]);

  const totalConsumedCals = useMemo(() => {
    const raw = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    if (raw > 0) return Math.round(raw);
    return Math.round(totalProteinG * 4 + totalCarbsG * 4 + totalFatG * 9);
  }, [dayMeals, totalProteinG, totalCarbsG, totalFatG]);

  // Calories per macro
  const proteinCals = Math.round(totalProteinG * 4);
  const carbsCals = Math.round(totalCarbsG * 4);
  const fatCals = Math.round(totalFatG * 9);
  const sumMacroCals = Math.max(1, proteinCals + carbsCals + fatCals);

  // Consumed macro percentage of energy
  const proteinEnergyPct = totalConsumedCals > 0 ? Math.round((proteinCals / sumMacroCals) * 100) : 0;
  const carbsEnergyPct = totalConsumedCals > 0 ? Math.round((carbsCals / sumMacroCals) * 100) : 0;
  const fatEnergyPct = totalConsumedCals > 0 ? Math.max(0, 100 - proteinEnergyPct - carbsEnergyPct) : 0;

  // Target macros configured in profile
  const targetProteinG = userProfile.dailyProtein || 150;
  const targetCarbsG = userProfile.dailyCarbs || 220;
  const targetFatG = userProfile.dailyFat || 65;
  const targetProteinCals = targetProteinG * 4;
  const targetCarbsCals = targetCarbsG * 4;
  const targetFatCals = targetFatG * 9;
  const targetTotalCals = targetProteinCals + targetCarbsCals + targetFatCals;

  const targetProteinPct = Math.round((targetProteinCals / targetTotalCals) * 100);
  const targetCarbsPct = Math.round((targetCarbsCals / targetTotalCals) * 100);
  const targetFatPct = Math.max(0, 100 - targetProteinPct - targetCarbsPct);

  // Macro dataset
  const macroData: MacroSliceData[] = useMemo(() => [
    {
      key: 'protein',
      label: 'Protein',
      grams: totalProteinG,
      calories: proteinCals,
      actualEnergyPct: proteinEnergyPct,
      targetGrams: targetProteinG,
      targetCalories: targetProteinCals,
      targetEnergyPct: targetProteinPct,
      actualColor: '#D4AF37', // Deep Teal
      targetColor: '#D4AF3780',
    },
    {
      key: 'carbs',
      label: 'Carbohydrates',
      grams: totalCarbsG,
      calories: carbsCals,
      actualEnergyPct: carbsEnergyPct,
      targetGrams: targetCarbsG,
      targetCalories: targetCarbsCals,
      targetEnergyPct: targetCarbsPct,
      actualColor: '#E8912D', // Warm Amber
      targetColor: '#E8912D80',
    },
    {
      key: 'fat',
      label: 'Fats',
      grams: totalFatG,
      calories: fatCals,
      actualEnergyPct: fatEnergyPct,
      targetGrams: targetFatG,
      targetCalories: targetFatCals,
      targetEnergyPct: targetFatPct,
      actualColor: '#6366F1', // Indigo / Slate Blue
      targetColor: '#6366F180',
    },
  ], [
    totalProteinG, totalCarbsG, totalFatG,
    proteinCals, carbsCals, fatCals,
    proteinEnergyPct, carbsEnergyPct, fatEnergyPct,
    targetProteinG, targetCarbsG, targetFatG,
    targetProteinCals, targetCarbsCals, targetFatCals,
    targetProteinPct, targetCarbsPct, targetFatPct,
  ]);

  // Render D3 Concentric Donut Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 320;
    const size = Math.min(containerWidth, 320);
    const width = size;
    const height = size;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clean slate

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Radius dimensions
    // Inner Ring: Target Macro Ratios (innerRadius: radius * 0.52, outerRadius: radius * 0.72)
    const innerRingInnerR = radius * 0.52;
    const innerRingOuterR = radius * 0.70;

    // Outer Ring: Actual Consumed Macro Distribution (innerRadius: radius * 0.76, outerRadius: radius * 0.96)
    const outerRingInnerR = radius * 0.75;
    const outerRingOuterR = radius * 0.96;

    // 1. INNER RING: Target Ratio Arc Generator
    const targetPie = d3
      .pie<MacroSliceData>()
      .sort(null)
      .value((d) => (d.targetEnergyPct > 0 ? d.targetEnergyPct : 1));

    const targetArc = d3
      .arc<d3.PieArcDatum<MacroSliceData>>()
      .innerRadius(innerRingInnerR)
      .outerRadius(innerRingOuterR)
      .padAngle(0.04)
      .cornerRadius(4);

    const targetG = g.append('g').attr('class', 'target-ring');

    targetG
      .selectAll('path')
      .data(targetPie(macroData))
      .enter()
      .append('path')
      .attr('d', targetArc as any)
      .attr('fill', (d) => d.data.actualColor)
      .attr('opacity', 0.28)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseenter', (_, d) => setHoveredSlice(d.data))
      .on('mouseleave', () => setHoveredSlice(null))
      .append('title')
      .text((d) => `Target ${d.data.label}: ${d.data.targetEnergyPct}% (${d.data.targetGrams}g)`);

    // 2. OUTER RING: Actual Macro Arc Generator
    const actualPie = d3
      .pie<MacroSliceData>()
      .sort(null)
      .value((d) => {
        if (totalConsumedCals === 0) return 33.3; // Default balanced placeholders if 0 logged
        return d.actualEnergyPct;
      });

    const actualArc = d3
      .arc<d3.PieArcDatum<MacroSliceData>>()
      .innerRadius(outerRingInnerR)
      .outerRadius(outerRingOuterR)
      .padAngle(0.04)
      .cornerRadius(6);

    const actualG = g.append('g').attr('class', 'actual-ring');

    const outerPaths = actualG
      .selectAll('path')
      .data(actualPie(macroData))
      .enter()
      .append('path')
      .attr('d', actualArc as any)
      .attr('fill', (d) => (totalConsumedCals === 0 ? '#9CA3AF30' : d.data.actualColor))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .style('transition', 'transform 0.15s ease-out, opacity 0.15s ease-out')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .attr('transform', 'scale(1.04)')
          .attr('opacity', 0.95);
        setHoveredSlice(d.data);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .attr('transform', 'scale(1)')
          .attr('opacity', 1);
        setHoveredSlice(null);
      });

    outerPaths.append('title').text(
      (d) =>
        `Actual ${d.data.label}: ${d.data.actualEnergyPct}% (${d.data.grams}g / ${d.data.calories} kcal)`
    );

    // Initial subtle transition
    outerPaths
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .attrTween('d', function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return (actualArc as any)(i(t));
        };
      });
  }, [macroData, totalConsumedCals]);

  // Macro deviation assessment
  const proteinDelta = proteinEnergyPct - targetProteinPct;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] shadow-xs space-y-5">
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-[#2A2416] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 dark:bg-[#F0D060]/10 flex items-center justify-center text-[#D4AF37] dark:text-[#F0D060]">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
              D3 Macro Distribution vs. Target Ratios
            </h3>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
            Outer ring: Consumed macro energy % • Inner ring: Target ratio configured in user profile
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9EA8A2]" />
          <select
            id="d3-macro-date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1E2220] text-gray-900 dark:text-white cursor-pointer"
          >
            {availableDates.map((date) => {
              const isToday = date === new Date().toISOString().split('T')[0];
              return (
                <option key={date} value={date}>
                  {isToday ? `Today (${date})` : date}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Visual: D3 Donut Chart + Center Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: D3 SVG Donut Visual */}
        <div 
          ref={containerRef}
          className="md:col-span-5 flex flex-col items-center justify-center relative min-h-[280px]"
        >
          <svg ref={svgRef} className="overflow-visible" />

          {/* Central Donut Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hoveredSlice ? (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {hoveredSlice.label}
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                  {hoveredSlice.actualEnergyPct}%
                </div>
                <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                  {hoveredSlice.grams}g • {hoveredSlice.calories} kcal
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Target: {hoveredSlice.targetEnergyPct}% ({hoveredSlice.targetGrams}g)
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Consumed</span>
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                  {totalConsumedCals}
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  of {userProfile.dailyCalories || targetTotalCals} kcal
                </div>
                <div className="text-[10px] font-bold text-[#D4AF37] dark:text-[#F0D060] mt-0.5">
                  {Math.round((totalConsumedCals / Math.max(1, userProfile.dailyCalories || targetTotalCals)) * 100)}% Target
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Comparative Breakdown Cards */}
        <div className="md:col-span-7 space-y-3">
          {macroData.map((macro) => {
            const delta = macro.actualEnergyPct - macro.targetEnergyPct;
            const gramDiff = Number((macro.grams - macro.targetGrams).toFixed(1));

            return (
              <div
                key={macro.key}
                onMouseEnter={() => setHoveredSlice(macro)}
                onMouseLeave={() => setHoveredSlice(null)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  hoveredSlice?.key === macro.key
                    ? 'ring-2 ring-[#D4AF37] dark:ring-[#F0D060] bg-gray-50 dark:bg-[#1E2220] border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#1E2220]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: macro.actualColor }} 
                    />
                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                      {macro.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {macro.grams}g <span className="text-[11px] font-normal text-gray-500">/ {macro.targetGrams}g target</span>
                    </span>
                    <span 
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        delta === 0 
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' 
                          : delta > 0 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {delta > 0 ? `+${delta}% vs target` : delta < 0 ? `${delta}% vs target` : 'On Target'}
                    </span>
                  </div>
                </div>

                {/* Comparative Dual Progress Bars */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    <span>Energy Ratio: <strong>{macro.actualEnergyPct}%</strong> (Target: {macro.targetEnergyPct}%)</span>
                    <span>{macro.calories} kcal</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex relative">
                    {/* Actual Bar */}
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(3, (macro.grams / Math.max(1, macro.targetGrams)) * 100))}%`,
                        backgroundColor: macro.actualColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Hypertrophy & Nutritional Science Rationale */}
          <div className="p-3.5 rounded-xl bg-[#FFFBF0]/60 dark:bg-[#2A2416]/30 border border-[#E6D7A8] dark:border-[#2A2416] text-xs text-[#6A5312] dark:text-[#F0D060] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">
                {totalProteinG >= targetProteinG 
                  ? '🎯 Protein Overload Threshold Achieved!' 
                  : `🌱 Needs ${(targetProteinG - totalProteinG).toFixed(1)}g more protein for optimal muscle protein synthesis.`}
              </span>
              <p className="text-[11px] text-[#A68523] dark:text-[#F0D060]/80">
                Target ratios are calibrated to your goal ({userProfile.goal}) with {targetProteinG}g protein ({(targetProteinG / (userProfile.weightKg || 70)).toFixed(1)} g/kg bodyweight).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
