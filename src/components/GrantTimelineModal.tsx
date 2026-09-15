import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Crown,
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
  Ticket,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Zap,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { fetchGrantTimeline } from '../lib/subscription';
import { GrantTimelineEvent, HostGrantedSubscription } from '../types';

interface GrantTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail: string;
}

export const GrantTimelineModal: React.FC<GrantTimelineModalProps> = ({
  isOpen,
  onClose,
  targetEmail,
}) => {
  const [timelineEvents, setTimelineEvents] = useState<GrantTimelineEvent[]>([]);
  const [grantDetails, setGrantDetails] = useState<HostGrantedSubscription | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('Active');
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined);
  const [isLifetime, setIsLifetime] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTimeline = async () => {
    if (!targetEmail) return;
    setIsLoading(true);
    try {
      const data = await fetchGrantTimeline(targetEmail);
      if (data && data.success) {
        setTimelineEvents(data.events || []);
        setGrantDetails(data.grant || null);
        setCurrentStatus(data.currentStatus || 'Active');
        setExpiresAt(data.expiresAt);
        setIsLifetime(!!data.isLifetime);
      }
    } catch (e) {
      console.warn('Error loading grant timeline:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && targetEmail) {
      loadTimeline();
    }
  }, [isOpen, targetEmail]);

  if (!isOpen) return null;

  // Calculate remaining days if not lifetime
  let daysRemaining: number | null = null;
  if (!isLifetime && expiresAt) {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'initial_grant':
        return <Crown className="w-4 h-4 text-[#D4AF37]" />;
      case 'coupon_redeemed':
        return <Ticket className="w-4 h-4 text-amber-500" />;
      case 'extension_added':
        return <Zap className="w-4 h-4 text-[#D4AF37]" />;
      case 'notification_dispatched':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'status_changed':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'repaired_synced':
        return <Activity className="w-4 h-4 text-[#D4AF37]" />;
      default:
        return <Clock className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121413] rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden text-left my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#B8922A] dark:text-[#F0D060]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Athlete Grant Timeline & History
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#D4AF37]/15 text-[#A68523] dark:text-[#F0D060] border border-[#D4AF37]/30">
                  Cryptographic Audit
                </span>
              </div>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {targetEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadTimeline}
              disabled={isLoading}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors cursor-pointer"
              title="Refresh Timeline"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#B8922A]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Status Banner Card */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111111] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
            <div className="text-[10px] font-black uppercase text-gray-400">Current Status</div>
            <div className="font-extrabold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${currentStatus === 'Active' || isLifetime ? 'bg-[#D4AF37] animate-pulse' : 'bg-rose-500'}`} />
              <span>{isLifetime ? 'Active (Lifetime VIP)' : currentStatus}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
            <div className="text-[10px] font-black uppercase text-gray-400">Active Plan</div>
            <div className="font-extrabold text-[#B8922A] dark:text-[#F0D060] mt-1 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>{grantDetails?.planName || (isLifetime ? 'Lifetime Master VIP' : 'Pro VIP Plan')}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
            <div className="text-[10px] font-black uppercase text-gray-400">Expiration Date</div>
            <div className="font-extrabold text-gray-900 dark:text-white mt-1">
              {isLifetime ? (
                <span className="text-[#B8922A] dark:text-[#F0D060] font-bold">Never Expires (Lifetime)</span>
              ) : expiresAt ? (
                <span>
                  {new Date(expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  {daysRemaining !== null && (
                    <span className={`ml-1.5 text-[10px] font-bold ${daysRemaining <= 3 ? 'text-amber-500 font-black' : 'text-gray-400'}`}>
                      ({daysRemaining}d left)
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-gray-400">Not Set</span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Vertical Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {isLoading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#B8922A] mx-auto" />
              <div className="font-bold text-gray-500">Reconstructing cryptographically verified grant timeline...</div>
            </div>
          ) : timelineEvents.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-gray-400">
              <Clock className="w-8 h-8 mx-auto text-gray-300" />
              <div className="font-bold text-gray-600 dark:text-gray-300">No Historical Events Recorded</div>
              <p className="text-xs">No administrative actions or timeline entries found for this athlete.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#D4AF37] before:via-[#D4AF37] before:to-gray-200 dark:before:to-gray-800">
              {timelineEvents.map((evt, idx) => {
                const dateObj = new Date(evt.timestamp);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={evt.id || idx} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-[27px] top-1 w-6 h-6 rounded-full bg-white dark:bg-[#121413] border-2 border-[#D4AF37] shadow-xs flex items-center justify-center z-10">
                      {getEventIcon(evt.eventType)}
                    </div>

                    {/* Timeline Event Card */}
                    <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#191B1A] border border-gray-200 dark:border-gray-800 space-y-2 hover:border-[#D4AF37]/40 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 dark:text-white text-xs">
                            {evt.title}
                          </span>
                          {evt.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#D4AF37]/15 text-[#A68523] dark:text-[#F0D060] border border-[#D4AF37]/30">
                              {evt.badge}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] font-mono text-gray-400">
                          {formattedDate} at {formattedTime}
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-200/50 dark:border-gray-800/50">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#B8922A] dark:text-[#F0D060]" />
                          <span>Actor: <strong>{evt.actor}</strong></span>
                        </div>
                        {evt.durationLabel && (
                          <div className="font-semibold text-[#B8922A] dark:text-[#F0D060]">
                            {evt.durationLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111111] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-400">
            Total {timelineEvents.length} Cryptographically Verified Event(s)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Timeline
          </button>
        </div>

      </div>
    </div>
  );
};
