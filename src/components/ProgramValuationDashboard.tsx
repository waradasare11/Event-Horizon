import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Crown,
  DollarSign,
  Gift,
  Users,
  Calendar,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  PieChart,
  Award,
  Zap,
  Layers
} from 'lucide-react';
import { fetchProgramValuation } from '../lib/subscription';

interface ProgramValuationDashboardProps {
  pin?: string;
  email?: string;
}

export const ProgramValuationDashboard: React.FC<ProgramValuationDashboardProps> = ({
  pin,
  email,
}) => {
  const [data, setData] = useState<{
    totalGrantedMarketValueINR: number;
    projectedPotentialRevenueINR: number;
    verifiedCashCollectedINR: number;
    totalTrainingMonthsGifted: number;
    totalLifetimeVIPs: number;
    totalActiveVIPs: number;
    totalGrantsRecorded: number;
    avgGiftValuePerAthlete: number;
    planDistribution: Record<string, { count: number; valueINR: number }>;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadValuation = async () => {
    setIsLoading(true);
    try {
      const res = await fetchProgramValuation(pin, email);
      if (res && res.success) {
        setData(res.valuation);
      }
    } catch (e) {
      console.warn('Error loading program valuation:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadValuation();
  }, [pin, email]);

  if (isLoading) {
    return (
      <div className="p-8 rounded-3xl bg-gray-50/60 dark:bg-[#111111] border border-gray-200 dark:border-gray-800 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#B8922A] mx-auto" />
        <div className="text-xs font-bold text-gray-500">Calculating Host Free Subscription Program ROI & Market Value...</div>
      </div>
    );
  }

  const valuation = data || {
    totalGrantedMarketValueINR: 0,
    projectedPotentialRevenueINR: 0,
    verifiedCashCollectedINR: 0,
    totalTrainingMonthsGifted: 0,
    totalLifetimeVIPs: 0,
    totalActiveVIPs: 0,
    totalGrantsRecorded: 0,
    avgGiftValuePerAthlete: 0,
    planDistribution: {},
  };

  const totalCalculatedScale = Math.max(
    valuation.totalGrantedMarketValueINR,
    valuation.projectedPotentialRevenueINR,
    valuation.verifiedCashCollectedINR,
    1
  );

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FAFAF8] via-white to-[#FAF3E0]/20 dark:from-[#111111] dark:via-[#121413] dark:to-[#111111]/10 border-2 border-[#D4AF37]/20 shadow-sm space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A68523] to-[#D4AF37] text-white flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white">
                Host Free Subscription Valuation & Revenue Mini-Dashboard
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#D4AF37]/15 text-[#A68523] dark:text-[#F0D060] border border-[#D4AF37]/30">
                Live Valuation
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Comparative impact analysis: Market Value Gifted vs Projected 12-Month Revenue & Verified Collections.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadValuation}
          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate</span>
        </button>
      </div>

      {/* 3 Main KPI Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* 1. Market Value Gifted */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-900 dark:text-amber-300">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span>Total Granted Free Value</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
              Official Price
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            ₹{valuation.totalGrantedMarketValueINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1 border-t border-amber-500/20">
            <span>{valuation.totalGrantsRecorded} Total Athletes</span>
            <span className="font-bold text-amber-600">Avg ₹{valuation.avgGiftValuePerAthlete}/user</span>
          </div>
        </div>

        {/* 2. Projected Potential Revenue */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#6A5312] dark:text-[#F0D060]">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#B8922A]" />
              <span>Projected 12M Revenue</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8E701C] dark:text-[#F0D060]">
              Forward Outlook
            </span>
          </div>
          <div className="text-2xl font-black text-[#B8922A] dark:text-[#F0D060] tracking-tight">
            ₹{valuation.projectedPotentialRevenueINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1 border-t border-[#D4AF37]/20">
            <span>Active VIP Community</span>
            <span className="font-bold text-[#B8922A]">{valuation.totalActiveVIPs} Active Accounts</span>
          </div>
        </div>

        {/* 3. Verified Collected Revenue */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/30 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-blue-900 dark:text-blue-300">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Cash Collected</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-800 dark:text-blue-300">
              UPI Direct
            </span>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
            ₹{valuation.verifiedCashCollectedINR.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between pt-1 border-t border-blue-500/20">
            <span>Settlement: Direct Gateway</span>
            <span className="font-bold text-blue-600">100% Cryptographic</span>
          </div>
        </div>

      </div>

      {/* Visual Relative Comparison Bar Chart */}
      <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs font-black text-gray-700 dark:text-gray-300">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#B8922A]" />
            <span>Market Valuation Comparative Analysis</span>
          </span>
          <span className="text-gray-400 text-[11px]">Calculated INR Values</span>
        </div>

        {/* Comparative Bars */}
        <div className="space-y-2 text-xs">
          {/* Bar 1: Granted Value */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Granted Free Subscription Market Value</span>
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                ₹{valuation.totalGrantedMarketValueINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (valuation.totalGrantedMarketValueINR / totalCalculatedScale) * 100)}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
              />
            </div>
          </div>

          {/* Bar 2: Projected Potential */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="font-bold text-[#A68523] dark:text-[#F0D060] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>Projected 12-Month Forward Revenue Potential</span>
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                ₹{valuation.projectedPotentialRevenueINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (valuation.projectedPotentialRevenueINR / totalCalculatedScale) * 100)}%` }}
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F0D060] rounded-full transition-all duration-700"
              />
            </div>
          </div>

          {/* Bar 3: Cash Collected */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Verified Cash Collections</span>
              </span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                ₹{valuation.verifiedCashCollectedINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                style={{ width: `${Math.max(2, Math.min(100, (valuation.verifiedCashCollectedINR / totalCalculatedScale) * 100))}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-[#F0D060] rounded-full transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Program Impact Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#B8922A]" />
            <span>Training Gifted</span>
          </div>
          <div className="text-base font-black text-gray-900 dark:text-white mt-1">
            {valuation.totalTrainingMonthsGifted} Months
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-500" />
            <span>Lifetime VIPs</span>
          </div>
          <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-1">
            {valuation.totalLifetimeVIPs} Athletes
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
            <Users className="w-3 h-3 text-[#B8922A]" />
            <span>Active VIP Pool</span>
          </div>
          <div className="text-base font-black text-[#B8922A] dark:text-[#F0D060] mt-1">
            {valuation.totalActiveVIPs} Active
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800">
          <div className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
            <Award className="w-3 h-3 text-[#B8922A]" />
            <span>Host Verified</span>
          </div>
          <div className="text-base font-black text-[#B8922A] dark:text-[#F0D060] mt-1">
            100% Cryptographic
          </div>
        </div>
      </div>

    </div>
  );
};
