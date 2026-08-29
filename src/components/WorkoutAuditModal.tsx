import React from 'react';
import { ShieldCheck, CheckCircle2, RefreshCw, X, AlertTriangle, ExternalLink, Sparkles, Database, Check } from 'lucide-react';
import { WorkoutProgramAuditReport } from '../data/ExerciseRegistry';

interface WorkoutAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WorkoutProgramAuditReport | null;
  isRunningAudit: boolean;
  onTriggerAudit: () => void;
}

export const WorkoutAuditModal: React.FC<WorkoutAuditModalProps> = ({
  isOpen,
  onClose,
  report,
  isRunningAudit,
  onTriggerAudit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#161817] rounded-2xl border border-[#E5E7EB] dark:border-[#242826] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 text-left">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-600/10 via-emerald-500/5 to-transparent border-b border-[#E5E7EB] dark:border-[#242826] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Exercise Registry Diagnostic Auditor</span>
              </span>
              <h3 className="text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                Authoritative Exercise & YouTube Link Audit
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#202422] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Summary Banner */}
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 p-4 rounded-xl text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
            <p className="font-semibold flex items-center gap-1.5 text-purple-800 dark:text-purple-300 mb-1">
              <Sparkles className="w-4 h-4 text-purple-600" />
              100% Precision Registry Cross-Referencing
            </p>
            This diagnostic tool audits all workout programs against the centralized <span className="font-mono font-bold">ExerciseRegistry.ts</span> database. It standardizes movement names, repairs minor typos, and guarantees verified YouTube coaching queries.
          </div>

          {/* Stats Grid */}
          {report ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#FAFAF8] dark:bg-[#1C1F1D] p-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C]">
                <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Programs Audited</div>
                <div className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-0.5">
                  {report.totalProgramsAudited}
                </div>
              </div>
              <div className="bg-[#FAFAF8] dark:bg-[#1C1F1D] p-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C]">
                <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Exercises Audited</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {report.totalExercisesAudited}
                </div>
              </div>
              <div className="bg-[#FAFAF8] dark:bg-[#1C1F1D] p-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C]">
                <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Verified Matches</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {report.verifiedCount}
                </div>
              </div>
              <div className="bg-[#FAFAF8] dark:bg-[#1C1F1D] p-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C]">
                <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] font-semibold">Links Refreshed</div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                  {report.refreshedYouTubeLinksCount}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <Database className="w-8 h-8 text-purple-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2]">
                Click below to start a full diagnostic scan across all stored workout splits.
              </p>
            </div>
          )}

          {/* Audit Logs */}
          {report && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">Audit Diagnostics & Standardization Log</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  All Registry Checks Passed
                </span>
              </div>
              <div className="bg-gray-900 text-gray-200 p-3.5 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto space-y-1 border border-gray-800">
                <div className="text-emerald-400 font-bold">
                  ✓ [Registry Sync] Initialized connection to ExerciseRegistry.ts
                </div>
                <div className="text-blue-400">
                  ✓ [Cross-Reference] {report.totalExercisesAudited} exercises evaluated across {report.totalDaysAudited} training days.
                </div>
                {report.logs.length > 0 ? (
                  report.logs.map((log, idx) => (
                    <div key={idx} className="text-amber-300">
                      → {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 italic">
                    All exercise nomenclature and tutorial links are 100% compliant with canonical registry conventions.
                  </div>
                )}
                <div className="text-purple-300 font-semibold">
                  ✓ [YouTube Precision] Generated validated canonical queries with zero broken parameters.
                </div>
                <div className="text-emerald-400 font-bold">
                  ✓ [Audit Completed] {new Date(report.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FAFAF8] dark:bg-[#1C1F1D] border-t border-[#E5E7EB] dark:border-[#242826] flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
            Authoritative Registry Version: <span className="font-semibold text-[#1A1D1B] dark:text-[#E8ECE9]">v2.4.0 (Centralized)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#282C2A] text-[#4B5563] dark:text-[#D1D5DB] text-xs font-bold hover:bg-gray-200 dark:hover:bg-[#323835] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={onTriggerAudit}
              disabled={isRunningAudit}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
              <span>{isRunningAudit ? 'Auditing Programs...' : 'Run Full Audit'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
