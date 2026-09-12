import React from 'react';
import { Compass, ArrowLeft, Shield, FileText, AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ArohLogo } from './ArohLogo';

interface NotFoundPageProps {
  onNavigate?: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  const handleNav = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#111312] text-[#1A1D1B] dark:text-[#E8ECE9] font-sans flex flex-col selection:bg-[#0F6E5F]/20 selection:text-[#0F6E5F] transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#161817]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            href="/"
            onClick={(e) => handleNav('/', e)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <ArohLogo size="sm" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 dark:text-white group-hover:text-[#0F6E5F] dark:group-hover:text-[#2DD4BF] transition-colors">
                AROH
              </span>
              <span className="text-[10px] text-gray-500 font-medium -mt-0.5">
                AI Fitness &amp; Nutrition Coaching
              </span>
            </div>
          </a>

          <a
            href="/"
            onClick={(e) => handleNav('/', e)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F6E5F] text-white text-xs font-semibold hover:bg-[#0D5B4F] transition-all shadow-xs cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to App</span>
          </a>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-teal-500/10 dark:bg-teal-500/20 border-2 border-teal-500/30 flex items-center justify-center text-[#0F6E5F] dark:text-[#2DD4BF] mb-6 shadow-lg animate-in zoom-in-95">
          <Compass className="w-10 h-10" />
        </div>

        <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mb-3">
          Error 404 • Page Not Found
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
          This route does not exist.
        </h1>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
          The requested page could not be located. You might have mistyped the address or the page has moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <a
            href="/"
            onClick={(e) => handleNav('/', e)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to AROH App</span>
          </a>

          <a
            href="/privacy"
            onClick={(e) => handleNav('/privacy', e)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 hover:border-[#0F6E5F] text-gray-800 dark:text-gray-200 font-semibold text-sm transition-all cursor-pointer shadow-xs"
          >
            <Shield className="w-4 h-4 text-[#0F6E5F]" />
            <span>Privacy Policy</span>
          </a>
        </div>

        {/* Helpful Links Grid */}
        <div className="w-full max-w-lg p-5 rounded-2xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 text-left shadow-xs space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Available Legal &amp; Compliance Pages:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a
              href="/privacy"
              onClick={(e) => handleNav('/privacy', e)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Privacy Policy (/privacy)</span>
            </a>
            <a
              href="/terms"
              onClick={(e) => handleNav('/terms', e)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Terms of Service (/terms)</span>
            </a>
            <a
              href="/disclaimer"
              onClick={(e) => handleNav('/disclaimer', e)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Medical Disclaimer (/disclaimer)</span>
            </a>
            <a
              href="/refund"
              onClick={(e) => handleNav('/refund', e)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
              <span>Refund Policy (/refund)</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-[#161817]/60 py-6 text-xs text-gray-500 text-center">
        <div className="max-w-5xl mx-auto px-4 space-y-1">
          <p>Operated by Warad Asare (AROH AI Technologies) • Pune, Maharashtra, India</p>
          <p>
            Contact:{' '}
            <a href="mailto:waradasare11@gmail.com" className="text-teal-600 dark:text-teal-400 underline">
              waradasare11@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};
