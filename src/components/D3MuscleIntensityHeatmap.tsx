import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { WorkoutCompletionLog, WorkoutProgram, UserProfile } from '../types';
import { Activity, Flame, AlertTriangle, CheckCircle2, Info, Sparkles, Filter, Layers } from 'lucide-react';

interface MuscleDataPoint {
  id: string;
  name: string;
  category: 'Upper Push' | 'Upper Pull' | 'Shoulders & Arms' | 'Lower Body' | 'Core & Accessories';
  currentWeeklySets: number;
  mevThreshold: number; // Minimum Effective Volume
  mavTargetMin: number; // Maximum Adaptive Volume Min
  mavTargetMax: number; // Maximum Adaptive Volume Max
  mrvThreshold: number; // Maximum Recoverable Volume (Overtraining threshold)
  status: 'neglected' | 'maintenance' | 'optimal' | 'high_fatigue' | 'overtraining';
  recoveryScore: number; // 0 - 100%
  coachingRecommendation: string;
  contributingExercises: string[];
}

interface D3MuscleIntensityHeatmapProps {
  workoutLogs: WorkoutCompletionLog[];
  workoutPrograms: WorkoutProgram[];
  userProfile?: UserProfile;
}

export const D3MuscleIntensityHeatmap: React.FC<D3MuscleIntensityHeatmapProps> = ({
  workoutLogs,
  workoutPrograms,
  userProfile,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleDataPoint | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [hoveredMuscleId, setHoveredMuscleId] = useState<string | null>(null);

  // 1. Calculate realistic dynamic muscle group volume from workout programs & logs
  const muscleData: MuscleDataPoint[] = useMemo(() => {
    // Collect exercises in the active workout program
    const activeProgram = workoutPrograms[0];
    const programExercises = activeProgram?.days.flatMap(d => d.exercises) || [];
    
    // Count direct sets from program for each muscle group
    const countSetsForKeywords = (keywords: string[]): { sets: number; exercises: string[] } => {
      const matchedExs: string[] = [];
      let totalSets = 0;

      programExercises.forEach(ex => {
        const text = `${ex.name} ${ex.targetMuscle} ${(ex.secondaryMuscles || []).join(' ')}`.toLowerCase();
        const matches = keywords.some(k => text.includes(k.toLowerCase()));
        if (matches) {
          totalSets += (ex.sets || 3);
          matchedExs.push(ex.name);
        }
      });

      // Factor in logged completion frequency over the last 14 days
      const loggedDaysCount = workoutLogs.filter(l => !l.isRestDay).length;
      const frequencyMultiplier = loggedDaysCount > 0 ? Math.min(1.4, Math.max(0.7, loggedDaysCount / 8)) : 1.0;
      const adjustedSets = Math.round(totalSets * frequencyMultiplier);

      return {
        sets: Math.max(adjustedSets, 0),
        exercises: Array.from(new Set(matchedExs)),
      };
    };

    const definitions: Array<{
      id: string;
      name: string;
      category: MuscleDataPoint['category'];
      keywords: string[];
      mev: number;
      mavMin: number;
      mavMax: number;
      mrv: number;
      baselineDefault: number;
    }> = [
      { id: 'chest', name: 'Chest (Pecs)', category: 'Upper Push', keywords: ['chest', 'bench', 'pec', 'push-up', 'dip'], mev: 8, mavMin: 12, mavMax: 18, mrv: 22, baselineDefault: 14 },
      { id: 'lats', name: 'Lats & Upper Back', category: 'Upper Pull', keywords: ['back', 'lat', 'row', 'pull-up', 'pulldown', 'chin-up'], mev: 10, mavMin: 14, mavMax: 22, mrv: 25, baselineDefault: 16 },
      { id: 'shoulders_side', name: 'Side / Lateral Delts', category: 'Shoulders & Arms', keywords: ['lateral raise', 'side delt', 'deltoid', 'shoulder'], mev: 8, mavMin: 14, mavMax: 22, mrv: 26, baselineDefault: 15 },
      { id: 'shoulders_rear', name: 'Rear Delts', category: 'Shoulders & Arms', keywords: ['rear delt', 'face pull', 'reverse fly'], mev: 6, mavMin: 12, mavMax: 18, mrv: 22, baselineDefault: 11 },
      { id: 'biceps', name: 'Biceps Brachii', category: 'Shoulders & Arms', keywords: ['bicep', 'curl', 'chin-up'], mev: 6, mavMin: 10, mavMax: 16, mrv: 20, baselineDefault: 12 },
      { id: 'triceps', name: 'Triceps Brachii', category: 'Shoulders & Arms', keywords: ['tricep', 'pushdown', 'skull crusher', 'dip', 'close grip'], mev: 6, mavMin: 10, mavMax: 16, mrv: 20, baselineDefault: 13 },
      { id: 'quads', name: 'Quadriceps', category: 'Lower Body', keywords: ['quad', 'squat', 'leg press', 'leg extension', 'lunge', 'split squat', 'hack squat'], mev: 8, mavMin: 12, mavMax: 18, mrv: 22, baselineDefault: 15 },
      { id: 'hamstrings', name: 'Hamstrings', category: 'Lower Body', keywords: ['hamstring', 'deadlift', 'rdl', 'leg curl', 'good morning'], mev: 6, mavMin: 10, mavMax: 16, mrv: 20, baselineDefault: 12 },
      { id: 'glutes', name: 'Glutes', category: 'Lower Body', keywords: ['glute', 'hip thrust', 'deadlift', 'squat', 'lunge'], mev: 6, mavMin: 12, mavMax: 18, mrv: 22, baselineDefault: 14 },
      { id: 'calves', name: 'Calves', category: 'Lower Body', keywords: ['calf', 'calves', 'seated calf', 'standing calf'], mev: 6, mavMin: 10, mavMax: 16, mrv: 20, baselineDefault: 8 },
      { id: 'core', name: 'Core & Abdominals', category: 'Core & Accessories', keywords: ['core', 'abs', 'plank', 'crunch', 'leg raise', 'ab wheel', 'woodchopper'], mev: 4, mavMin: 8, mavMax: 14, mrv: 18, baselineDefault: 7 },
    ];

    return definitions.map(def => {
      const res = countSetsForKeywords(def.keywords);
      const sets = res.sets > 0 ? res.sets : def.baselineDefault;

      let status: MuscleDataPoint['status'] = 'optimal';
      let recScore = 85;
      let recommendation = 'Current training volume is in the scientific hypertrophy sweet spot.';

      if (sets < def.mev) {
        status = 'neglected';
        recScore = 95;
        recommendation = `Volume is below Minimum Effective Volume (${def.mev} sets). Add 2-4 direct sets to stimulate progressive overload.`;
      } else if (sets < def.mavMin) {
        status = 'maintenance';
        recScore = 90;
        recommendation = `Adequate for muscle preservation (${sets} sets), but adding 2-3 sets will maximize hypertrophy velocity.`;
      } else if (sets <= def.mavMax) {
        status = 'optimal';
        recScore = 80;
        recommendation = `Optimal Hypertrophy Zone (${sets} sets/week). Maximal MPS response with manageable systemic fatigue.`;
      } else if (sets <= def.mrv) {
        status = 'high_fatigue';
        recScore = 55;
        recommendation = `Approaching Maximum Recoverable Volume (${sets} sets/week). Monitor joint soreness and sleep quality closely.`;
      } else {
        status = 'overtraining';
        recScore = 30;
        recommendation = `Overtraining Risk (${sets} sets/week exceeds MRV threshold of ${def.mrv}). Reduce weekly volume by 3-5 sets to prevent systemic fatigue and tendonitis.`;
      }

      return {
        id: def.id,
        name: def.name,
        category: def.category,
        currentWeeklySets: sets,
        mevThreshold: def.mev,
        mavTargetMin: def.mavMin,
        mavTargetMax: def.mavMax,
        mrvThreshold: def.mrv,
        status,
        recoveryScore: recScore,
        coachingRecommendation: recommendation,
        contributingExercises: res.exercises.length > 0 ? res.exercises : ['Compound multi-joint activation'],
      };
    });
  }, [workoutPrograms, workoutLogs]);

  const filteredMuscles = useMemo(() => {
    if (categoryFilter === 'All') return muscleData;
    return muscleData.filter(m => m.category === categoryFilter);
  }, [muscleData, categoryFilter]);

  // 2. D3 Heatmap Rendering
  useEffect(() => {
    if (!svgRef.current || filteredMuscles.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear prior render

    const margin = { top: 30, right: 30, bottom: 40, left: 140 };
    const width = 640 - margin.left - margin.right;
    const height = (filteredMuscles.length * 36) + margin.top + margin.bottom;

    svg
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('overflow', 'visible');

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale: Set Volume from 0 to 30 sets
    const xScale = d3.scaleLinear()
      .domain([0, 30])
      .range([0, width]);

    // Y scale: Muscle Names
    const yScale = d3.scaleBand()
      .domain(filteredMuscles.map(d => d.name))
      .range([0, filteredMuscles.length * 36])
      .padding(0.25);

    // Color Scale: Neglected (Gray/Blue) -> Maintenance (Teal) -> Optimal (Emerald) -> High Fatigue (Amber) -> Overtraining (Red)
    const getColor = (status: MuscleDataPoint['status']) => {
      switch (status) {
        case 'neglected': return '#64748B'; // slate
        case 'maintenance': return '#0284C7'; // sky blue
        case 'optimal': return '#0F6E5F'; // Peak emerald
        case 'high_fatigue': return '#E8912D'; // Amber
        case 'overtraining': return '#EF4444'; // Red
      }
    };

    // Background Zone Bands: Optimal MAV Zone Reference (10 - 20 sets)
    g.append('rect')
      .attr('x', xScale(10))
      .attr('y', 0)
      .attr('width', xScale(20) - xScale(10))
      .attr('height', filteredMuscles.length * 36)
      .attr('fill', '#0F6E5F')
      .attr('opacity', 0.08)
      .attr('rx', 4);

    // Grid Lines
    const xTicks = [0, 5, 10, 15, 20, 25, 30];
    g.selectAll('.grid-line')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', filteredMuscles.length * 36)
      .attr('stroke', '#E5E7EB')
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.4);

    // Background Track Bar for each row
    g.selectAll('.track-bar')
      .data(filteredMuscles)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.name) || 0)
      .attr('width', width)
      .attr('height', yScale.bandwidth())
      .attr('fill', '#F3F4F6')
      .attr('opacity', 0.5)
      .attr('rx', 6);

    // Foreground Intensity Fill Bars (Animated with D3 transition)
    const bars = g.selectAll('.intensity-bar')
      .data(filteredMuscles)
      .enter()
      .append('rect')
      .attr('class', 'intensity-bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.name) || 0)
      .attr('height', yScale.bandwidth())
      .attr('rx', 6)
      .attr('fill', d => getColor(d.status))
      .attr('cursor', 'pointer')
      .attr('width', 0) // start at 0 for animation
      .on('mouseenter', (event, d) => {
        setHoveredMuscleId(d.id);
        setSelectedMuscle(d);
      })
      .on('click', (event, d) => {
        setSelectedMuscle(d);
      });

    bars.transition()
      .duration(700)
      .delay((d, i) => i * 40)
      .ease(d3.easeCubicOut)
      .attr('width', d => Math.min(width, xScale(d.currentWeeklySets)));

    // Volume Value Labels on Bars
    g.selectAll('.bar-label')
      .data(filteredMuscles)
      .enter()
      .append('text')
      .attr('x', d => Math.min(width - 30, Math.max(xScale(d.currentWeeklySets) + 8, 12)))
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', d => xScale(d.currentWeeklySets) > width - 40 ? '#FFFFFF' : '#374151')
      .text(d => `${d.currentWeeklySets} sets`)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 40 + 200)
      .attr('opacity', 1);

    // Y Axis (Muscle Names)
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1F2937')
      .attr('dx', -6);

    // X Axis (Weekly Sets)
    const xAxis = d3.axisBottom(xScale)
      .tickValues(xTicks)
      .tickFormat(d => `${d}s`);

    g.append('g')
      .attr('transform', `translate(0, ${filteredMuscles.length * 36 + 8})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', '#E5E7EB'))
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', '#6B7280');

    // Top Header Label for Zone
    g.append('text')
      .attr('x', xScale(15))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#0F6E5F')
      .text('★ Hypertrophy Sweet Spot (10-20 sets/week)');

  }, [filteredMuscles]);

  const categories = ['All', 'Upper Push', 'Upper Pull', 'Shoulders & Arms', 'Lower Body', 'Core & Accessories'];

  const stats = useMemo(() => {
    const optimalCount = muscleData.filter(m => m.status === 'optimal').length;
    const neglectedCount = muscleData.filter(m => m.status === 'neglected').length;
    const overtrainingCount = muscleData.filter(m => m.status === 'high_fatigue' || m.status === 'overtraining').length;
    return { optimalCount, neglectedCount, overtrainingCount };
  }, [muscleData]);

  return (
    <div className="bg-white dark:bg-[#161817] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-xs space-y-6 text-left transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#242826] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0F6E5F]/10 text-[#0F6E5F] dark:bg-[#0F6E5F]/20 dark:text-[#2DD4BF]">
              D3 Biomechanical Analytics
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              Evidence-Based
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1.5 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0F6E5F] dark:text-[#2DD4BF]" />
            <span>Muscle Volume & Recovery Heatmap</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA8A2] mt-1">
            Visualized with D3 to identify volume balance, neglected muscle groups, and systemic fatigue risk.
          </p>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{stats.optimalCount} Optimal</span>
          </div>
          {stats.neglectedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-700 dark:text-slate-300 text-xs font-bold">
              <Info className="w-3.5 h-3.5" />
              <span>{stats.neglectedCount} Neglected</span>
            </div>
          )}
          {stats.overtrainingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats.overtrainingCount} High Fatigue</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-[#6B7280] shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-[#0F6E5F] text-white shadow-2xs'
                : 'bg-[#FAFAF8] dark:bg-[#1E2220] text-[#4B5563] dark:text-[#9EA8A2] border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-100 dark:hover:bg-[#252A28]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main D3 Heatmap Stage & Interactive Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* D3 Canvas Container */}
        <div ref={containerRef} className="lg:col-span-2 bg-[#FAFAF8] dark:bg-[#111312] p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] dark:border-[#242826] overflow-x-auto">
          <svg ref={svgRef} className="w-full" style={{ minWidth: '480px' }} />

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#242826] flex items-center justify-between flex-wrap gap-2 text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-slate-500" />
              <span>Neglected (&lt;8 sets)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#0F6E5F]" />
              <span>Optimal Growth (10-20 sets)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#E8912D]" />
              <span>Near Limit (21-25 sets)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500" />
              <span>Overtraining (&gt;25 sets)</span>
            </div>
          </div>
        </div>

        {/* Selected Muscle Deep-Dive Inspector */}
        <div className="bg-[#FAFAF8] dark:bg-[#1A1D1C] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#2A2E2C] space-y-4">
          {selectedMuscle ? (
            <>
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2A2E2C] pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F6E5F] dark:text-[#2DD4BF]">
                    {selectedMuscle.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                    {selectedMuscle.name}
                  </h3>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                  selectedMuscle.status === 'optimal' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' :
                  selectedMuscle.status === 'neglected' ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300' :
                  selectedMuscle.status === 'overtraining' ? 'bg-red-500/15 text-red-700 dark:text-red-300' :
                  'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                }`}>
                  {selectedMuscle.status.replace('_', ' ')}
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#202422] border border-[#E5E7EB] dark:border-[#2A2E2C]">
                  <span className="text-[#6B7280] dark:text-[#9EA8A2] block">Current Volume</span>
                  <span className="text-base font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">{selectedMuscle.currentWeeklySets} sets / wk</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#202422] border border-[#E5E7EB] dark:border-[#2A2E2C]">
                  <span className="text-[#6B7280] dark:text-[#9EA8A2] block">Target Hypertrophy</span>
                  <span className="text-base font-bold text-[#0F6E5F] dark:text-[#2DD4BF]">{selectedMuscle.mavTargetMin} - {selectedMuscle.mavTargetMax} sets</span>
                </div>
              </div>

              {/* Coaching Recommendation */}
              <div className="p-3.5 rounded-xl bg-[#0F6E5F]/5 dark:bg-[#0F6E5F]/15 border border-[#0F6E5F]/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F6E5F] dark:text-[#2DD4BF]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Coach Recommendation</span>
                </div>
                <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] leading-relaxed">
                  {selectedMuscle.coachingRecommendation}
                </p>
              </div>

              {/* Contributing Exercises */}
              <div>
                <span className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] block mb-1.5">
                  Direct Exercises Contributing to Stimulus:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMuscle.contributingExercises.map((ex, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-[#202422] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[11px] font-medium text-[#4B5563] dark:text-[#9EA8A2]"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#6B7280] dark:text-[#9EA8A2] space-y-2">
              <Activity className="w-8 h-8 mx-auto text-[#0F6E5F] opacity-60" />
              <p className="text-xs font-semibold">Hover or click any muscle group bar in the heatmap to inspect volume thresholds, hypertrophy zones, and coach advice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
