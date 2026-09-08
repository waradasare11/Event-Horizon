import React from 'react';

export const DashboardSkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse text-left">
      {/* Top Banner / Hero Skeleton */}
      <div className="p-6 rounded-3xl bg-slate-100/80 dark:bg-[#151C2C]/80 border border-slate-200 dark:border-[#232B3E] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-7 w-64 bg-slate-300 dark:bg-slate-700 rounded-xl" />
            <div className="h-3.5 w-80 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid (Calories, Protein, Carbs, Fats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-100/70 dark:bg-[#151C2C]/70 border border-slate-200 dark:border-[#232B3E] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-8 w-28 bg-slate-300 dark:bg-slate-700 rounded-lg" />
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-300 dark:bg-slate-600 rounded-full w-2/3" />
            </div>
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Primary Analytics & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Nutrition / Meals) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-100/70 dark:bg-[#151C2C]/70 border border-slate-200 dark:border-[#232B3E] space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-40 bg-slate-300 dark:bg-slate-700 rounded-md" />
              <div className="h-3 w-56 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="p-4 rounded-xl bg-slate-200/50 dark:bg-[#1B2337] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-300 dark:bg-slate-700 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-slate-300 dark:bg-slate-600 rounded" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-slate-300 dark:bg-slate-700 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Workout & Motivation) */}
        <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-[#151C2C]/70 border border-slate-200 dark:border-[#232B3E] space-y-4">
          <div className="h-5 w-36 bg-slate-300 dark:bg-slate-700 rounded-md" />
          <div className="h-40 rounded-2xl bg-slate-200/60 dark:bg-[#1A2234] flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-cyan-500 animate-spin" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-10 w-full bg-slate-300 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const AnalysisSkeletonLoader: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse text-left">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-100/80 dark:bg-[#151C2C]/80 border border-slate-200 dark:border-[#232B3E] shadow-sm space-y-3">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-7 w-72 bg-slate-300 dark:bg-slate-700 rounded-xl" />
        <div className="h-4 w-96 max-w-full bg-slate-200 dark:bg-slate-800 rounded" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-100/70 dark:bg-[#151C2C]/70 border border-slate-200 dark:border-[#232B3E] space-y-2.5"
          >
            <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-20 bg-slate-300 dark:bg-slate-700 rounded-lg" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-[#151C2C]/70 border border-slate-200 dark:border-[#232B3E] space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-slate-300 dark:bg-slate-700 rounded-md" />
          <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-200/50 dark:bg-[#1A2234] flex items-end p-4 gap-3">
          {[40, 65, 80, 55, 90, 75, 85, 60, 95, 70, 85, 100].map((h, idx) => (
            <div
              key={idx}
              className="flex-1 bg-slate-300 dark:bg-slate-700 rounded-t-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
