import React, { useEffect } from 'react';
import { X, Sparkles, RefreshCw, CheckCircle2, Cloud } from 'lucide-react';

interface SyncToastProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  detail?: string;
  timestamp?: string;
  source?: 'drive' | 'firestore' | 'manual';
}

export const SyncToast: React.FC<SyncToastProps> = ({
  isOpen,
  onClose,
  message = 'Cloud Sync Successful',
  detail = 'All workouts, nutrition logs, and athlete metrics were safely retrieved and synchronized with your local device.',
  timestamp,
  source = 'drive',
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayTime = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div
      id="cloud-sync-toast"
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#0F1528]/95 dark:bg-[#0B0F1E]/95 backdrop-blur-xl border border-[#3B82F6]/40 shadow-2xl shadow-[#3B82F6]/20 p-4 text-[#F8FAFC]">
        {/* Glowing Cosmic Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D4FF] via-[#3B82F6] to-indigo-500" />
        
        {/* Radial Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#3B82F6]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5">
          {/* Vortex Status Icon */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#3B82F6]/20 border border-[#00D4FF]/50 flex items-center justify-center text-[#38BDF8] shadow-inner">
              <CheckCircle2 className="w-5 h-5 text-[#38BDF8] animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3B82F6]" />
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 font-['Space_Grotesk',sans-serif]">
                <span>{message}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/30 text-[#38BDF8]">
                  {source === 'drive' ? 'Google Drive' : 'Cloud DB'}
                </span>
              </h4>
            </div>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {detail}
            </p>

            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              <span>Synced at {displayTime}</span>
              <span>•</span>
              <span className="text-[#38BDF8]/90 font-medium">Local Cache Active</span>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
