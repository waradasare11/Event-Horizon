import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';
import { LegalTabType } from './LegalPagesModal';

interface CookieBannerProps {
  onOpenLegal: (tab: LegalTabType) => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenLegal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('aroh_cookie_consent');
      if (!consent) {
        // Show after a brief delay for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Storage access disabled
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('aroh_cookie_consent', JSON.stringify({
        type: 'all',
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('aroh_cookie_consent', JSON.stringify({
        type: 'essential',
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-4 rounded-2xl bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in slide-in-from-bottom-5 duration-300"
      role="region"
      aria-label="Privacy and Cookie Notice"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#00D4FF]/10 text-[#0284C7] dark:text-[#38BDF8] border border-[#00D4FF]/20 shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Privacy &amp; Cookie Preferences
            </h4>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              aria-label="Dismiss cookie notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            We use essential local storage to save your workouts, offline meal logs, and authentication. We never sell your personal data. Aligned with India's <strong>DPDP Act, 2023</strong>.
          </p>
          <div className="pt-1 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenLegal('cookies')}
              className="text-[11px] font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline cursor-pointer"
            >
              Learn More
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleEssentialOnly}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Essential Only
        </button>
        <button
          type="button"
          onClick={handleAcceptAll}
          className="px-4 py-1.5 rounded-xl bg-[#0369A1] hover:bg-[#075985] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Accept All</span>
        </button>
      </div>
    </div>
  );
};
