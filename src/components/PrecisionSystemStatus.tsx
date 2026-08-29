import React, { useState } from 'react';
import { BrainCircuit, ShieldCheck, CheckCircle2, ChevronUp, ChevronDown, Sparkles, Activity } from 'lucide-react';

interface PrecisionSystemStatusProps {
  onOpenPerformanceDashboard?: () => void;
}

export const PrecisionSystemStatus: React.FC<PrecisionSystemStatusProps> = ({
  onOpenPerformanceDashboard,
}) => {
  const [isConsensusActive, setIsConsensusActive] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const toggleStatus = () => {
    setIsConsensusActive((prev) => !prev);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleStatus}
          title="Click to toggle Multi-Model Consensus mode"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
            isConsensusActive
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isConsensusActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConsensusActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>

          <span className="tracking-tight">
            {isConsensusActive ? 'Multi-Model Consensus: Active' : 'Precision Engine: Standby'}
          </span>

          <BrainCircuit className="w-3.5 h-3.5 opacity-80" />
        </button>

        {onOpenPerformanceDashboard && (
          <button
            type="button"
            onClick={onOpenPerformanceDashboard}
            title="Open Host Performance Telemetry"
            className="p-1.5 rounded-xl bg-white dark:bg-[#1A1D1C] border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#0F6E5F] dark:hover:text-[#2DD4BF] text-xs transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
