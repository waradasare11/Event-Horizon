import React from 'react';
import { Sparkles, BrainCircuit, Bot } from 'lucide-react';

/**
 * Shimmer pulse animation skeleton for Meal Analysis inference
 */
export const MealAnalysisSkeleton: React.FC<{ progressMessage?: string }> = ({ progressMessage }) => {
  return (
    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-sm overflow-hidden animate-pulse text-left transition-all">
      {/* Top Banner Skeleton */}
      <div className="p-5 sm:p-6 border-b border-[#E5E7EB] dark:border-[#2A2416] bg-gradient-to-r from-[#FAFAF8] to-white dark:from-[#111111] dark:to-[#111111]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Image Placeholder */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#E5E7EB] dark:bg-[#2A2416] shrink-0" />
            
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-36 bg-[#D4AF37]/20 dark:bg-[#D4AF37]/30 rounded-full" />
                <div className="h-4 w-24 bg-[#E5E7EB] dark:bg-[#2A2416] rounded-full" />
              </div>
              <div className="h-7 w-64 sm:w-80 bg-[#E5E7EB] dark:bg-[#2A2416] rounded-lg" />
              <div className="h-3.5 w-full max-w-md bg-[#E5E7EB]/70 dark:bg-[#2A2416]/70 rounded" />
            </div>
          </div>

          {/* Goal Alignment Badge Skeleton */}
          <div className="h-10 w-28 bg-[#E5E7EB] dark:bg-[#2A2416] rounded-xl self-start sm:self-auto" />
        </div>
      </div>

      {/* 4 Macro Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 sm:p-6 bg-[#FAFAF8]/50 dark:bg-[#111111] border-b border-[#E5E7EB] dark:border-[#2A2416]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#111111] p-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2416] space-y-2">
            <div className="h-3 w-16 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
            <div className="h-6 w-20 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
            <div className="h-2.5 w-24 bg-[#E5E7EB]/60 dark:bg-[#2A2416]/60 rounded" />
          </div>
        ))}
      </div>

      {/* Detected Food Items Skeleton */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
          <div className="h-4 w-20 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2416] bg-[#FAFAF8] dark:bg-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-40 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
                  <div className="h-4 w-16 bg-[#D4AF37]/20 dark:bg-[#D4AF37]/30 rounded-md" />
                </div>
                <div className="h-3 w-32 bg-[#E5E7EB]/70 dark:bg-[#2A2416]/70 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-16 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
                <div className="h-6 w-16 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
                <div className="h-6 w-16 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* AI Recommendations Card Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#D4AF37]/5 dark:bg-[#D4AF37]/15 border border-[#D4AF37]/20 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060] animate-spin" />
              <div className="h-4 w-48 bg-[#D4AF37]/30 rounded" />
            </div>
            <div className="h-3 w-full bg-[#D4AF37]/20 rounded" />
            <div className="h-3 w-5/6 bg-[#D4AF37]/20 rounded" />
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] space-y-2.5">
            <div className="h-4 w-40 bg-[#E5E7EB] dark:bg-[#2A2416] rounded" />
            <div className="h-3 w-full bg-[#E5E7EB]/70 dark:bg-[#2A2416]/70 rounded" />
            <div className="h-3 w-3/4 bg-[#E5E7EB]/70 dark:bg-[#2A2416]/70 rounded" />
          </div>
        </div>

        {/* Live Status indicator */}
        {progressMessage && (
          <div className="mt-4 p-3 rounded-xl bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 border border-[#D4AF37]/20 flex items-center gap-3">
            <BrainCircuit className="w-5 h-5 text-[#D4AF37] dark:text-[#F0D060] animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-[#D4AF37] dark:text-[#F0D060]">
              {progressMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Skeleton message bubble for AICoachChat inference
 */
export const AICoachChatSkeleton: React.FC = () => {
  return (
    <div className="flex items-start gap-3 justify-start animate-in fade-in duration-200">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shrink-0 ring-4 ring-[#D4AF37]/20 animate-pulse">
        <Bot className="w-4 h-4" />
      </div>

      {/* Bubble with Shimmer lines */}
      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3.5 bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-left shadow-xs space-y-2.5 animate-pulse">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-3 w-28 bg-[#D4AF37]/30 dark:bg-[#D4AF37]/40 rounded-full" />
          <div className="h-3 w-16 bg-[#E5E7EB] dark:bg-[#2A2416] rounded-full" />
        </div>
        <div className="h-3.5 w-full bg-[#E5E7EB] dark:bg-[#282C2A] rounded" />
        <div className="h-3.5 w-11/12 bg-[#E5E7EB] dark:bg-[#282C2A] rounded" />
        <div className="h-3.5 w-4/5 bg-[#E5E7EB] dark:bg-[#282C2A] rounded" />
        <div className="h-3.5 w-3/5 bg-[#E5E7EB] dark:bg-[#282C2A] rounded" />

        <div className="pt-2 border-t border-[#E5E7EB]/50 dark:border-[#2A2416] flex items-center gap-2">
          <div className="h-4 w-20 bg-[#E8912D]/20 rounded-md" />
          <div className="h-4 w-24 bg-[#D4AF37]/20 rounded-md" />
        </div>
      </div>
    </div>
  );
};
