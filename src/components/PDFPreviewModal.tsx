import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  FileText,
  Download,
  Calendar,
  Eye,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Utensils,
  Dumbbell,
  Scale,
  UserCheck,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { UserProfile, MealLog, WorkoutCompletionLog, BodyMetric } from '../types';
import { generateUserDataPDFBlob, triggerPDFDownload } from '../lib/pdfExport';
import { jsPDF } from 'jspdf';

export interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  mealLogs: MealLog[];
  workoutLogs: WorkoutCompletionLog[];
  bodyMetrics?: BodyMetric[];
  initialStartDate?: string;
  initialEndDate?: string;
}

type DateRangePreset = 'all' | '7d' | '30d' | '90d' | 'month';

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  mealLogs = [],
  workoutLogs = [],
  bodyMetrics = [],
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [activePreset, setActivePreset] = useState<DateRangePreset>('all');

  const [includeMeals, setIncludeMeals] = useState<boolean>(true);
  const [includeWorkouts, setIncludeWorkouts] = useState<boolean>(true);
  const [includeMetrics, setIncludeMetrics] = useState<boolean>(true);
  const [includeProfile, setIncludeProfile] = useState<boolean>(true);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(1);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(true);

  const currentUrlRef = useRef<string | null>(null);

  // Sync initial dates if provided
  useEffect(() => {
    if (isOpen) {
      if (initialStartDate) setStartDate(initialStartDate);
      if (initialEndDate) setEndDate(initialEndDate);
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, []);

  // Quick Preset Handlers
  const handleApplyPreset = (preset: DateRangePreset) => {
    setActivePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (preset === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
      return;
    }

    if (preset === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
      return;
    }

    if (preset === '90d') {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
      return;
    }

    if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
      return;
    }
  };

  // Filter preview counts
  const filteredCounts = useMemo(() => {
    const filterItem = (dateStr?: string) => {
      if (!dateStr) return true;
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      return true;
    };

    const meals = mealLogs.filter((m) => filterItem(m.date || (m as { createdAt?: string }).createdAt?.split('T')[0]));
    const workouts = workoutLogs.filter((w) => filterItem(w.date || (w as { createdAt?: string }).createdAt?.split('T')[0]));
    const metrics = bodyMetrics.filter((b) => filterItem(b.date || (b as { createdAt?: string }).createdAt?.split('T')[0]));

    return {
      mealsCount: meals.length,
      workoutsCount: workouts.length,
      metricsCount: metrics.length,
    };
  }, [mealLogs, workoutLogs, bodyMetrics, startDate, endDate]);

  // Generate PDF Preview when options or modal opening change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const timer = setTimeout(() => {
      try {
        const result = generateUserDataPDFBlob({
          userProfile,
          mealLogs,
          workoutLogs,
          bodyMetrics,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          includeMeals,
          includeWorkouts,
          includeMetrics,
          includeProfile,
        });

        if (!isMounted) return;

        // Cleanup prior URL
        if (currentUrlRef.current) {
          URL.revokeObjectURL(currentUrlRef.current);
        }

        const newUrl = URL.createObjectURL(result.blob);
        currentUrlRef.current = newUrl;

        setPdfBlob(result.blob);
        setPdfUrl(newUrl);
        setPdfDoc(result.doc);
        setFilename(result.filename);
        setPageCount(result.doc.getNumberOfPages());
      } catch (err) {
        console.error('Failed generating PDF preview blob:', err);
      } finally {
        if (isMounted) {
          setIsGenerating(false);
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    isOpen,
    userProfile,
    mealLogs,
    workoutLogs,
    bodyMetrics,
    startDate,
    endDate,
    includeMeals,
    includeWorkouts,
    includeMetrics,
    includeProfile,
  ]);

  // Trigger Download Action
  const handleDownload = () => {
    if (!pdfDoc) {
      if (pdfBlob && pdfUrl) {
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = filename || 'AROH_Report.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return;
    }

    setIsDownloading(true);
    try {
      triggerPDFDownload(pdfDoc, filename || 'AROH_Report.pdf');
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Download trigger failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  const fileSizeKb = pdfBlob ? (pdfBlob.size / 1024).toFixed(1) : '0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
    >
      <div
        className="w-full max-w-5xl h-[92vh] max-h-[880px] bg-white dark:bg-[#0E1424] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-gray-900 dark:text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/70 dark:bg-[#0B101D]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-[#3B82F6] flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="pdf-preview-title" className="text-base font-bold text-gray-900 dark:text-white">
                  Report Preview & Date Range Export
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#3B82F6] border border-blue-200 dark:border-blue-900/50">
                  Client-Side PDF
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Filter workouts and nutrition logs, preview formatting, and save locally
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                showConfig
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-[#3B82F6] border border-blue-200 dark:border-blue-900/50'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Toggle filters & options"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Range Controls Bar (Collapsible) */}
        {showConfig && (
          <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800/70 bg-white dark:bg-[#0E1424] space-y-3 shrink-0">
            {/* Presets & Custom Date Pickers */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">Preset:</span>
                {(
                  [
                    { id: 'all', label: 'All Records' },
                    { id: '7d', label: 'Last 7 Days' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: 'month', label: 'This Month' },
                    { id: '90d', label: 'Last 90 Days' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      activePreset === preset.id && !startDate && !endDate && preset.id === 'all'
                        ? 'bg-[#3B82F6] text-white shadow-sm'
                        : activePreset === preset.id && (startDate || endDate || preset.id === 'all')
                        ? 'bg-[#3B82F6] text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Date Inputs */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setActivePreset('all');
                    }}
                    className="bg-transparent text-gray-900 dark:text-white text-xs outline-none cursor-pointer"
                    aria-label="Start date filter"
                  />
                </div>
                <span className="text-gray-400 text-xs">to</span>
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setActivePreset('all');
                    }}
                    className="bg-transparent text-gray-900 dark:text-white text-xs outline-none cursor-pointer"
                    aria-label="End date filter"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => handleApplyPreset('all')}
                    className="text-[11px] text-[#3B82F6] hover:underline px-1 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Section Toggles */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/60">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">Include:</span>

              <button
                type="button"
                onClick={() => setIncludeMeals(!includeMeals)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  includeMeals
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3B82F6] dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Nutrition & Meals ({filteredCounts.mealsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeWorkouts(!includeWorkouts)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  includeWorkouts
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3B82F6] dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Workouts & Volume ({filteredCounts.workoutsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeMetrics(!includeMetrics)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  includeMetrics
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3B82F6] dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Body Metrics ({filteredCounts.metricsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setIncludeProfile(!includeProfile)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  includeProfile
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[#3B82F6] dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 line-through'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Athlete Targets</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Preview Area */}
        <div className="flex-1 bg-gray-100 dark:bg-[#070B13] p-3 sm:p-5 overflow-hidden flex flex-col min-h-0 relative">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between pb-3 text-xs text-gray-600 dark:text-gray-400 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-xs sm:max-w-md">
                📄 {filename || 'AROH_Report.pdf'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 font-mono text-[11px]">
                {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 font-mono text-[11px]">
                ~{fileSizeKb} KB
              </span>
            </div>

            <div className="flex items-center gap-2">
              {pdfUrl && (
                <button
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3B82F6] hover:underline cursor-pointer"
                  title="Open PDF in browser viewer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in tab</span>
                </button>
              )}
            </div>
          </div>

          {/* Viewer Frame */}
          <div className="flex-1 w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative shadow-inner flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                <span className="text-xs font-semibold">Generating report preview...</span>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
                className="w-full h-full border-0 bg-white"
                title="Report PDF Preview"
              />
            ) : (
              <div className="text-center p-6 text-gray-500 text-xs">
                Preview unavailable. Click Download below to generate and save your report.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer & Actions */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0E1424] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              DPDP Act 2023 Compliant • 100% Client-Side Private Generation • ICMR & USDA Standards
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating || isDownloading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-50'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Report Downloaded!</span>
                </>
              ) : isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Download...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
