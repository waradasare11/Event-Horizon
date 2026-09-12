import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Send, 
  ShieldCheck, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AIAccuracyReport } from '../types';
import { submitAIAccuracyReport } from '../lib/accuracyAndErrorReporting';
import { auth } from '../lib/firebase';

interface ReportAccuracyModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'meal_scanner' | 'biomechanics' | 'nutrition_planner' | 'coach_chat';
  targetId?: string;
  aiOutputSummary: string;
  confidenceScoreAtScan?: number;
  modelConsensusRating?: string;
  ingredientConfidenceBreakdown?: Array<{
    name: string;
    weightG?: number;
    calories?: number;
    proteinG?: number;
    confidenceScorePct?: number;
    ingredientSource?: string;
  }>;
  modelConsensusResult?: any;
  originalPayload?: any;
  onReportSubmitted?: (report: AIAccuracyReport) => void;
}

export const ReportAccuracyModal: React.FC<ReportAccuracyModalProps> = ({
  isOpen,
  onClose,
  feature,
  targetId,
  aiOutputSummary,
  confidenceScoreAtScan = 94,
  modelConsensusRating = 'High (92-97%)',
  ingredientConfidenceBreakdown,
  modelConsensusResult,
  originalPayload,
  onReportSubmitted,
}) => {
  const [issueCategory, setIssueCategory] = useState<AIAccuracyReport['issueCategory']>(
    feature === 'biomechanics' ? 'incorrect_joint_angle' : 'inaccurate_portion_grams'
  );
  const [userFeedback, setUserFeedback] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFeedback.trim()) return;

    setIsSubmitting(true);
    const user = auth.currentUser;

    try {
      const report = await submitAIAccuracyReport({
        userId: user?.uid || 'guest_user',
        userEmail: user?.email || 'guest@peakform.ai',
        userName: user?.displayName || 'Peak Athlete',
        feature,
        targetId,
        aiOutputSummary,
        issueCategory,
        userFeedback: userFeedback.trim(),
        suggestedCorrection: suggestedCorrection.trim(),
        confidenceScoreAtScan,
        modelConsensusRating,
        ingredientConfidenceBreakdown,
        modelConsensusResult,
        originalPayload,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      if (onReportSubmitted) {
        onReportSubmitted(report);
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setUserFeedback('');
        setSuggestedCorrection('');
      }, 1800);
    } catch (err) {
      console.error('Failed submitting accuracy report:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="report-accuracy-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      >
        <motion.div
          id="report-accuracy-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Report AI Prediction Accuracy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Help refine multi-model vision accuracy & precision
                </p>
              </div>
            </div>
            <button
              id="close-accuracy-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Notification */}
          {isSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Feedback Logged to Improvement Queue
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Thank you! Your feedback has been queued in Firestore for host review and model instruction tuning.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Context preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Target Item:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{aiOutputSummary}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Model Consensus:</span>
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {modelConsensusRating || 'AI Estimate'}
                  </span>
                </div>
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  What aspect was inaccurate?
                </label>
                <select
                  id="accuracy-issue-category-select"
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as any)}
                  className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100"
                >
                  {feature === 'biomechanics' ? (
                    <>
                      <option value="incorrect_joint_angle">Incorrect Joint Angle / Depth</option>
                      <option value="misidentified_exercise">Misidentified Exercise Movement</option>
                      <option value="other">Faulty Mechanical Cue / Advice</option>
                    </>
                  ) : (
                    <>
                      <option value="inaccurate_portion_grams">Inaccurate Portion Weight (Grams)</option>
                      <option value="incorrect_food_item">Incorrect Food or Ingredient Name</option>
                      <option value="faulty_macro_calculation">Faulty Calorie / Protein Calculations</option>
                      <option value="dietary_preference_violation">Dietary Restriction Conflict (Non-veg/Allergy)</option>
                      <option value="other">Other Visual Misidentification</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="accuracy-feedback-input"
                  required
                  rows={3}
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder={
                    feature === 'biomechanics'
                      ? 'e.g. Squat depth was actually below parallel (105 degrees), but model flagged high hip hinge...'
                      : 'e.g. The plate had 150g Paneer Bhurji, but was identified as scrambled eggs or 80g...'
                  }
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none"
                />
              </div>

              {/* Suggested Correction */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Suggested Correction / True Ingredients</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                      Supervised Fine-Tuning Queue
                    </span>
                  </label>
                </div>
                <textarea
                  id="accuracy-suggested-correction-input"
                  rows={2}
                  value={suggestedCorrection}
                  onChange={(e) => setSuggestedCorrection(e.target.value)}
                  placeholder="e.g. 150g Cooked Low-Fat Paneer (260 kcal, 31g protein), 2 Whole Wheat Phulkas (140g, 240 kcal)"
                  className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Stored as structured JSON in Firestore for continuous model supervision and calibration.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="submit-accuracy-report-btn"
                  type="submit"
                  disabled={isSubmitting || !userFeedback.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Logging...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit to Queue
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
