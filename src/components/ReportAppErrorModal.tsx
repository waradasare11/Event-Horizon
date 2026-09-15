import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bug, 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  Layers, 
  ShieldAlert 
} from 'lucide-react';
import { AppErrorReport } from '../types';
import { submitAppErrorReport } from '../lib/accuracyAndErrorReporting';
import { auth } from '../lib/firebase';
import { getGlobalSyncState } from '../lib/syncManager';

interface ReportAppErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (report: AppErrorReport) => void;
}

export const ReportAppErrorModal: React.FC<ReportAppErrorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [errorType, setErrorType] = useState<AppErrorReport['errorType']>('calculation_issue');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userSuggestedFix, setUserSuggestedFix] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<AppErrorReport | null>(null);

  if (!isOpen) return null;

  const syncState = getGlobalSyncState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const report = await submitAppErrorReport({
        errorType,
        title: title.trim(),
        description: description.trim(),
        userSuggestedFix: userSuggestedFix.trim() || undefined,
      });

      setSubmittedReport(report);
      setIsSubmitting(false);
      if (onSuccess) onSuccess(report);
    } catch (err) {
      console.error('Error submitting bug report:', err);
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedReport(null);
    setTitle('');
    setDescription('');
    setUserSuggestedFix('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="report-app-error-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      >
        <motion.div
          id="report-app-error-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Report System Issue & Accuracy Flag
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant AI Diagnostic Triage & Host Administrator Review
                </p>
              </div>
            </div>
            <button
              id="close-error-modal-btn"
              onClick={handleResetAndClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Submission Result / AI Diagnostic View */}
          {submittedReport ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#FFFBF0] dark:bg-[#2A2416]/30 border border-[#E6D7A8] dark:border-[#2A2416]/50 rounded-2xl text-[#8E701C] dark:text-[#F0D060]">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-[#B8922A] dark:text-[#F0D060]" />
                <div className="text-xs leading-relaxed">
                  <div className="font-bold text-sm">Issue Recorded Successfully</div>
                  <div>Report ID: <span className="font-mono">{submittedReport.id}</span></div>
                  <div>Stored in Firestore database for host inspection and prompt recalibration.</div>
                </div>
              </div>

              {/* AI Diagnostic Summary Card */}
              {submittedReport.aiAnalysisVerdict && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      AI Diagnostic Verdict
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
                      Severity: {submittedReport.aiAnalysisVerdict.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {submittedReport.aiAnalysisVerdict.rootCauseAnalysis}
                  </p>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-[#B8922A] dark:text-[#F0D060]">Recommended Action: </span>
                    {submittedReport.aiAnalysisVerdict.recommendedCorrection}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  id="close-error-report-done-btn"
                  onClick={handleResetAndClose}
                  className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Issue Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'calculation_issue', label: 'Calculation / Target Error' },
                    { id: 'bug', label: 'Functional Bug' },
                    { id: 'visual_defect', label: 'Visual / Layout Defect' },
                    { id: 'performance_lag', label: 'Latency / Sync Issue' },
                    { id: 'feature_suggestion', label: 'Feature Suggestion' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setErrorType(cat.id as any)}
                      className={`px-3 py-2 text-xs rounded-xl border font-medium text-left transition-all ${
                        errorType === cat.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Summary / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="error-report-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Daily step target calculation didn't adapt to selected occupation"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Details & Steps to Reproduce <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="error-report-desc-input"
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened, what was expected, and which values you entered..."
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Suggested Fix */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Suggested Fix or Adjustment <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="error-report-fix-input"
                  type="text"
                  value={userSuggestedFix}
                  onChange={(e) => setUserSuggestedFix(e.target.value)}
                  placeholder="e.g. Include standing occupation bonus in BMR/TDEE calculation formula"
                  className="w-full text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Client Diagnostic Badge */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Auto Diagnostics: {syncState.isOnline ? 'Online' : 'Offline'} • IndexedDB: Active • Queue: {syncState.pendingCount}
                </span>
                <span className="text-[10px] text-slate-400">Snapshot auto-attached</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-app-error-report-btn"
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing & Logging...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
