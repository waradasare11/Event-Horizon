import React from 'react';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  RefreshCw, 
  Cookie, 
  Trash2, 
  Activity, 
  Mail, 
  MapPin,
  HeartPulse
} from 'lucide-react';
import { ArohLogo } from './ArohLogo';
import { GlobalSyncStatus } from './GlobalSyncStatus';
import { LegalTabType } from './LegalPagesModal';

interface FooterProps {
  onOpenLegal: (tab: LegalTabType) => void;
  onOpenReportError: () => void;
  isHostAdminUser: boolean;
  onTriggerAudit?: () => void;
  isAuditing?: boolean;
  precisionStatus?: 'active' | 'standby';
  onTogglePrecisionStatus?: () => void;
  onOpenPerformanceDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenLegal,
  onOpenReportError,
  isHostAdminUser,
  onTriggerAudit,
  isAuditing = false,
  precisionStatus = 'active',
  onTogglePrecisionStatus,
  onOpenPerformanceDashboard,
}) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#080B14] py-8 mt-auto transition-colors text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Tier: Logo, Sync Status, and Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3 flex-wrap">
            <ArohLogo size="sm" />
            <span className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400">
              • Evidence-Based Workout &amp; Nutrition Coaching
            </span>
            <GlobalSyncStatus />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="report-issue-footer-btn"
              type="button"
              onClick={onOpenReportError}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-semibold text-[11px] transition-all cursor-pointer"
              title="Report a bug, calculation discrepancy, or suggest an enhancement"
            >
              <span>Report Issue / Feedback</span>
            </button>

            {/* Host-only Debug & Latency Tools */}
            {isHostAdminUser && (
              <>
                {onTriggerAudit && (
                  <button
                    onClick={onTriggerAudit}
                    disabled={isAuditing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-semibold text-[11px] transition-all cursor-pointer disabled:opacity-50"
                    title="Audit workout programs against ExerciseRegistry"
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span>{isAuditing ? 'Auditing...' : 'Audit Registry'}</span>
                  </button>
                )}

                {onTogglePrecisionStatus && (
                  <button
                    id="precision-system-status-badge"
                    type="button"
                    onClick={onTogglePrecisionStatus}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-2xs ${
                      precisionStatus === 'active'
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      precisionStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    <span>Consensus: {precisionStatus === 'active' ? 'Active' : 'Standby'}</span>
                  </button>
                )}

                {onOpenPerformanceDashboard && (
                  <button
                    id="open-performance-dashboard-footer-btn"
                    type="button"
                    onClick={onOpenPerformanceDashboard}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-semibold text-[11px] transition-all cursor-pointer"
                    title="Open Real-time Service Latency & Telemetry Dashboard"
                  >
                    <Activity className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    <span>Host Latency</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Middle Tier: Mandatory Medical Disclaimer Quote */}
        <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed flex items-start gap-3">
          <HeartPulse className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-950 dark:text-amber-100 mr-1">Medical Disclaimer:</span>
            “AROH is a fitness tracking and education tool, not a doctor, dietitian, or physiotherapist. Meal calorie estimates can be wrong. Workout and form tips are general guidance. If you are under 18, have an injury, or a medical condition, get a parent/guardian and a qualified professional involved before you train or change how you eat.”
            <button
              onClick={() => onOpenLegal('disclaimer')}
              className="ml-2 font-semibold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
            >
              Read Full Disclaimer →
            </button>
          </div>
        </div>

        {/* Bottom Tier: Legal Navigation Links & Operator Attribution */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Legal Navigation Links with route paths */}
          <nav className="flex items-center gap-3 sm:gap-5 flex-wrap justify-center md:justify-start" aria-label="Legal Links">
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Privacy Policy under DPDP Act, 2023"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
              <span className="text-[10px] text-slate-400 font-mono">(/privacy)</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Terms of Service & 7-Day Trial"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms of Service</span>
              <span className="text-[10px] text-slate-400 font-mono">(/terms)</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <button
              type="button"
              onClick={() => onOpenLegal('disclaimer')}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Medical Disclaimer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Medical Disclaimer</span>
              <span className="text-[10px] text-slate-400 font-mono">(/disclaimer)</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <button
              type="button"
              onClick={() => onOpenLegal('refund')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="48-Hour Refund Policy"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refund Policy</span>
              <span className="text-[10px] text-slate-400 font-mono">(/refund)</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <button
              type="button"
              onClick={() => onOpenLegal('cookies')}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Cookies and Local Storage"
            >
              <Cookie className="w-3.5 h-3.5" />
              <span>Cookies</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <button
              type="button"
              onClick={() => onOpenLegal('delete-data')}
              className="text-red-600/80 dark:text-red-400/80 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer font-bold"
              title="Permanently Delete My Data & Account"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Data</span>
            </button>
          </nav>

          {/* Operator and Jurisdiction Info */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap justify-center">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-500" />
              <span>Warad Asare • Pune, Maharashtra, India</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-teal-500" />
              <a href="mailto:waradasare11@gmail.com" className="hover:underline text-teal-600 dark:text-teal-400">
                waradasare11@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
