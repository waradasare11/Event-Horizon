import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Calendar, 
  CheckSquare, 
  Square, 
  Download, 
  Copy, 
  Check, 
  X, 
  Layers, 
  Dumbbell, 
  Utensils, 
  Scale, 
  Sparkles, 
  User 
} from 'lucide-react';
import { UserProfile, BodyMetric, CheckInRecord, WorkoutCompletionLog, MealLog } from '../types';
import { exportGranularUserDataToCSV, generateGranularCSVString, GranularExportOptions } from '../lib/csvExport';

interface GranularCSVExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  bodyMetrics: BodyMetric[];
  checkIns?: CheckInRecord[];
  workoutLogs: WorkoutCompletionLog[];
  mealLogs: MealLog[];
}

export const GranularCSVExportModal: React.FC<GranularCSVExportModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  bodyMetrics,
  checkIns = [],
  workoutLogs,
  mealLogs,
}) => {
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | '90d' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [includeWorkouts, setIncludeWorkouts] = useState<boolean>(true);
  const [includeMeals, setIncludeMeals] = useState<boolean>(true);
  const [includeMetrics, setIncludeMetrics] = useState<boolean>(true);
  const [includeCheckIns, setIncludeCheckIns] = useState<boolean>(true);
  const [includeProfileMetadata, setIncludeProfileMetadata] = useState<boolean>(true);
  const [delimiter, setDelimiter] = useState<',' | ';'>(',');
  const [copied, setCopied] = useState<boolean>(false);

  // Compute active date boundaries
  const activeBoundaries = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (dateRange === 'all') {
      return { start: undefined, end: undefined };
    }
    if (dateRange === '7d') {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }
    if (dateRange === '30d') {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }
    if (dateRange === '90d') {
      const d = new Date();
      d.setDate(today.getDate() - 90);
      return { start: d.toISOString().split('T')[0], end: todayStr };
    }
    return { start: startDate, end: endDate };
  }, [dateRange, startDate, endDate]);

  // Compute record counts within range
  const filteredCounts = useMemo(() => {
    const { start, end } = activeBoundaries;
    const filterItem = <T extends { date: string }>(items: T[]) => {
      if (!items) return 0;
      if (!start && !end) return items.length;
      return items.filter((item) => {
        if (start && item.date < start) return false;
        if (end && item.date > end) return false;
        return true;
      }).length;
    };

    return {
      workouts: filterItem(workoutLogs),
      meals: filterItem(mealLogs),
      metrics: filterItem(bodyMetrics),
      checkIns: filterItem(checkIns),
    };
  }, [activeBoundaries, workoutLogs, mealLogs, bodyMetrics, checkIns]);

  const totalSelectedRecords = useMemo(() => {
    let count = 0;
    if (includeWorkouts) count += filteredCounts.workouts;
    if (includeMeals) count += filteredCounts.meals;
    if (includeMetrics) count += filteredCounts.metrics;
    if (includeCheckIns) count += filteredCounts.checkIns;
    return count;
  }, [includeWorkouts, includeMeals, includeMetrics, includeCheckIns, filteredCounts]);

  const exportOptions: GranularExportOptions = {
    userProfile,
    bodyMetrics,
    checkIns,
    workoutLogs,
    mealLogs,
    dateRange,
    startDate: activeBoundaries.start,
    endDate: activeBoundaries.end,
    includeWorkouts,
    includeMeals,
    includeMetrics,
    includeCheckIns,
    includeProfileMetadata,
    delimiter,
  };

  const handleTriggerExport = () => {
    exportGranularUserDataToCSV(exportOptions);
    onClose();
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = generateGranularCSVString(exportOptions);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed copying to clipboard', e);
    }
  };

  const handleSelectAll = (select: boolean) => {
    setIncludeWorkouts(select);
    setIncludeMeals(select);
    setIncludeMetrics(select);
    setIncludeCheckIns(select);
    setIncludeProfileMetadata(select);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        id="granular-csv-export-modal"
        className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 dark:bg-[#F0D060]/10 flex items-center justify-center text-[#D4AF37] dark:text-[#F0D060]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Export Data to CSV
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Filter by date range and select data types for your spreadsheet export
              </p>
            </div>
          </div>
          <button
            id="close-granular-csv-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* 1. Date Range Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
                <span>1. Select Date Range</span>
              </label>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {activeBoundaries.start ? `${activeBoundaries.start} to ${activeBoundaries.end}` : 'Complete history'}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: '7d', label: 'Past 7 Days' },
                { id: '30d', label: 'Past 30 Days' },
                { id: '90d', label: 'Past 90 Days' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom' },
              ].map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setDateRange(range.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                    dateRange === range.id
                      ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-2xs'
                      : 'bg-gray-50 dark:bg-[#1E2220] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#252A28]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range Pickers */}
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1C1F1E] border border-gray-200 dark:border-gray-700 mt-2">
                <div>
                  <span className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start Date:
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End Date:
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Select Data Types */}
          <div className="space-y-2.5 pt-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
                <span>2. Select Data Categories</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="text-[#D4AF37] dark:text-[#F0D060] hover:underline font-semibold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="text-gray-500 dark:text-gray-400 hover:underline font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {/* Workout Sessions */}
              <div 
                onClick={() => setIncludeWorkouts(!includeWorkouts)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  includeWorkouts 
                    ? 'bg-[#FFFBF0]/50 dark:bg-[#2A2416]/20 border-[#D4AF37]/50 dark:border-[#2A2416]' 
                    : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#D4AF37] dark:text-[#F0D060]">
                    {includeWorkouts ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Dumbbell className="w-3.5 h-3.5 text-gray-500" />
                      <span>Workout Sessions & Training Log</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      RPE, duration, exercises performed, volume (kg), and athlete notes
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-[#252A28] text-gray-700 dark:text-gray-300 shrink-0">
                  {filteredCounts.workouts} records
                </span>
              </div>

              {/* Meals & Nutrition */}
              <div 
                onClick={() => setIncludeMeals(!includeMeals)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  includeMeals 
                    ? 'bg-[#FFFBF0]/50 dark:bg-[#2A2416]/20 border-[#D4AF37]/50 dark:border-[#2A2416]' 
                    : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#D4AF37] dark:text-[#F0D060]">
                    {includeMeals ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5 text-gray-500" />
                      <span>Meal & Nutrition Logs</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Calories, protein, carbs, fat, fiber, meal timing and item breakdowns
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-[#252A28] text-gray-700 dark:text-gray-300 shrink-0">
                  {filteredCounts.meals} records
                </span>
              </div>

              {/* Body Metrics */}
              <div 
                onClick={() => setIncludeMetrics(!includeMetrics)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  includeMetrics 
                    ? 'bg-[#FFFBF0]/50 dark:bg-[#2A2416]/20 border-[#D4AF37]/50 dark:border-[#2A2416]' 
                    : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#D4AF37] dark:text-[#F0D060]">
                    {includeMetrics ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-gray-500" />
                      <span>Body Composition & Weight Logs</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Daily scale weigh-ins, body fat percentage, waist circumference
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-[#252A28] text-gray-700 dark:text-gray-300 shrink-0">
                  {filteredCounts.metrics} records
                </span>
              </div>

              {/* Weekly AI Check-Ins */}
              <div 
                onClick={() => setIncludeCheckIns(!includeCheckIns)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  includeCheckIns 
                    ? 'bg-[#FFFBF0]/50 dark:bg-[#2A2416]/20 border-[#D4AF37]/50 dark:border-[#2A2416]' 
                    : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#D4AF37] dark:text-[#F0D060]">
                    {includeCheckIns ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                      <span>Weekly AI Progress Reviews & Adjustments</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Adherence score, energy rating, calorie adjustments, and coach summaries
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-[#252A28] text-gray-700 dark:text-gray-300 shrink-0">
                  {filteredCounts.checkIns} records
                </span>
              </div>

              {/* User Profile Metadata */}
              <div 
                onClick={() => setIncludeProfileMetadata(!includeProfileMetadata)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  includeProfileMetadata 
                    ? 'bg-[#FFFBF0]/50 dark:bg-[#2A2416]/20 border-[#D4AF37]/50 dark:border-[#2A2416]' 
                    : 'bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-[#D4AF37] dark:text-[#F0D060]">
                    {includeProfileMetadata ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      <span>User Profile & Target Macro Snapshot</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Header metadata with goal, target weight, daily kcal and macro ratios
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-500">Header</span>
              </div>
            </div>
          </div>

          {/* 3. CSV Format Settings */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              CSV Column Delimiter:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDelimiter(',')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                  delimiter === ','
                    ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                    : 'bg-white dark:bg-[#1E2220] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                }`}
              >
                Comma (,) Standard
              </button>
              <button
                type="button"
                onClick={() => setDelimiter(';')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                  delimiter === ';'
                    ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                    : 'bg-white dark:bg-[#1E2220] text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                }`}
                title="Recommended for European Excel versions"
              >
                Semicolon (;) European
              </button>
            </div>
          </div>
        </div>

        {/* Footer Summary & Action Controls */}
        <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-bold text-gray-900 dark:text-white">{totalSelectedRecords}</span> records selected for export
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              disabled={totalSelectedRecords === 0}
              className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Copy CSV to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#B8922A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy CSV'}</span>
            </button>

            <button
              id="confirm-granular-csv-download-btn"
              type="button"
              onClick={handleTriggerExport}
              disabled={totalSelectedRecords === 0}
              className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#A68523] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
