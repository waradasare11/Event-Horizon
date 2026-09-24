import React, { useState } from 'react';
import { BrainCircuit, ShieldCheck, CheckCircle2, ChevronUp, ChevronDown, Sparkles, Activity } from 'lucide-react';

interface PrecisionSystemStatusProps {
  onOpenPerformanceDashboard?: () => void;
  isHostAdminUser?: boolean;
}

export const PrecisionSystemStatus: React.FC<PrecisionSystemStatusProps> = ({
  onOpenPerformanceDashboard,
  isHostAdminUser = false,
}) => {
  const [isConsensusActive, setIsConsensusActive] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Hidden for athletes — only host administrators have access to telemetry & consensus controls
  if (!isHostAdminUser) {
    return null;
  }

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
              ? 'bg-[#D4AF37]/10 text-[#A68523] dark:text-[#F0D060] border-[#D4AF37]/30 hover:bg-[#D4AF37]/20'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isConsensusActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0D060] opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isConsensusActive ? 'bg-[#D4AF37]' : 'bg-amber-500'
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
            className="p-1.5 rounded-xl bg-white dark:bg-[#111111] border border-[#E5E7EB] dark:border-[#2A2416] text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#D4AF37] dark:hover:text-[#F0D060] text-xs transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
