import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Camera, 
  Sliders, 
  Search, 
  CreditCard, 
  FolderLock, 
  Download, 
  Trash2, 
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface HelpArticle {
  id: string;
  title: string;
  category: 'Scanner & Food' | 'Billing & Privacy' | 'Data & Safety';
  icon: React.ElementType;
  summary: string;
  content: string[];
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'scan',
    title: 'Scan: How to scan a meal',
    category: 'Scanner & Food',
    icon: Camera,
    summary: 'Point your camera at your plate or thali in good lighting. AROH identifies visible foods.',
    content: [
      'Position your phone camera directly above your plate, bowl, or thali in well-lit conditions.',
      'Tap Capture. The vision engine detects individual visible foods and segments portions based on dish geometry.',
      'Scientific limit: A photograph cannot measure hidden cooking oil, added sugars, or exact density. Always review the detected items before confirming.',
      'If identification fails or an item is obscured, AROH will notify you clearly rather than guessing.'
    ],
  },
  {
    id: 'quick-log',
    title: 'Quick Log: Quick log calories & protein',
    category: 'Scanner & Food',
    icon: Search,
    summary: 'Quickly log meals, calories, and protein in seconds without waiting for image recognition.',
    content: [
      'Need to log your meal in 10 seconds? Open the Food tab and tap Quick Log or Search.',
      'Type any dish name in Hindi, regional Indian terms, or English (e.g., "khichdi", "idli", "rajma", "paneer bhurji", "boiled eggs").',
      'You can also directly enter custom calories and protein numbers in one step.',
      'Direct verified table lookup ensures instant, accurate macro tracking.'
    ],
  },
  {
    id: 'fix-grams',
    title: 'Fix Grams: Fix grams in one tap',
    category: 'Scanner & Food',
    icon: Sliders,
    summary: 'Adjust the portion slider or gram input. All macros and calories recompute instantly.',
    content: [
      'Every logged or scanned food item features an interactive portion slider and numeric gram field.',
      'Move the slider or tap to enter the exact cooked grams (e.g., 45g roti, 150g dal, 100g paneer).',
      'The engine immediately recomputes calories, protein, carbs, fats, and micronutrients from the authoritative database tables (ICMR-IFCT for Indian dishes, USDA FoodData Central for international foods).',
      'Locking in accurate grams gives you laboratory-grade macro tracking without guess-work.'
    ],
  },
  {
    id: 'billing',
    title: 'Billing: Transparent prepaid plans (₹89 / ₹239 / ₹919)',
    category: 'Billing & Privacy',
    icon: CreditCard,
    summary: 'Clear prepaid plans: 7-day free trial, ₹89/month, ₹239/3 months, or ₹919/year. Zero surprise debits.',
    content: [
      'AROH begins with a full-featured 7-day free trial at ₹0 with no payment details required upfront.',
      'When your trial finishes, you choose between Monthly (₹89), Quarterly (₹239), or Yearly (₹919) access.',
      'All subscriptions are one-time prepayments processed securely through authorized Indian payment gateways (UPI, debit/credit cards, and net banking).',
      'There are zero surprise recurring auto-debits.'
    ],
  },
  {
    id: 'drive-backup',
    title: 'Drive Optional Backup: AROH AI personal Google Drive folder',
    category: 'Billing & Privacy',
    icon: FolderLock,
    summary: 'Optionally sync your health data directly into your personal Google Drive account in the AROH AI folder.',
    content: [
      'AROH can sync directly with your personal Google Drive account if you choose to enable cloud backup.',
      'All workout logs, meal entries, and profile settings are saved in an app-dedicated folder named "AROH AI" (AROH_UserMemory.json).',
      'Because the files live in your own personal cloud storage, you retain sovereign ownership of your biometric and training data at all times.',
      'If you prefer to stay local, you can use the app without connecting Drive.'
    ],
  },
  {
    id: 'export',
    title: 'Export: How to export your data',
    category: 'Data & Safety',
    icon: Download,
    summary: 'Download your entire training and nutrition history as a JSON or CSV file at any moment.',
    content: [
      'Open Settings & Tools from the header gear icon or Progress tab.',
      'Locate the "Export CSV" or "Export Athlete History" action.',
      'Tap Export to immediately download a comprehensive CSV or JSON archive containing all logged workouts, nutrition entries, body metrics, and personal records.',
      'You can open and analyze this data in Excel, Google Sheets, or personal fitness archives.'
    ],
  },
  {
    id: 'delete-data',
    title: 'Delete Data: How to delete your data (DPDP Act, 2023)',
    category: 'Data & Safety',
    icon: Trash2,
    summary: 'Complete right to erasure under Indian privacy regulations. Purge local or cloud records anytime.',
    content: [
      'Under India\'s Digital Personal Data Protection (DPDP) Act 2023, you have absolute authority to erase your personal records.',
      'To delete local browser cache: Open Settings → Diagnostics → Clear Local Storage.',
      'To permanently delete cloud backups: Simply open your Google Drive and delete the "AROH AI" folder.',
      'You may also request complete server-side unlinking by contacting our privacy desk at support@aroh.in.'
    ],
  },
  {
    id: 'parent-consent',
    title: 'Parent Consent: Under-18 athlete safety & guardian consent',
    category: 'Data & Safety',
    icon: ShieldAlert,
    summary: 'Adolescent safety guidelines. Users aged 13-17 require verified parental or guardian consent.',
    content: [
      'AROH is designed for adult physical training. Users under 13 years of age are strictly prohibited from using the platform.',
      'Athletes aged 13 to 17 require verified parental or guardian consent before following structured calorie deficits or intense resistance programs.',
      'Young growing athletes must avoid extreme caloric restriction, aggressive cutting phases, or lifting heavy loads without in-person adult coaching.',
      'Always consult a certified pediatrician or sports medicine physician before starting new training regimens.'
    ],
  },
];

interface HelpArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultArticleId?: string;
}

export const HelpArticlesModal: React.FC<HelpArticlesModalProps> = ({
  isOpen,
  onClose,
  defaultArticleId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(defaultArticleId || 'scan-meal');

  if (!isOpen) return null;

  const filteredArticles = HELP_ARTICLES.filter((article) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query) ||
      article.content.some((c) => c.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl max-h-[88vh] bg-white dark:bg-[#151716] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Help & User Guide</h2>
              <p className="text-xs text-gray-500">8 quick guides for food logging, billing, and data privacy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles (e.g. grams, scan, billing, Drive, delete)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121413] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>
        </div>

        {/* Articles List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-gray-500">No help articles match your search query.</p>
            </div>
          ) : (
            filteredArticles.map((article) => {
              const isExpanded = expandedArticleId === article.id;
              const Icon = article.icon;

              return (
                <div
                  key={article.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-[#3B82F6]/40 bg-[#FFFBF0]/20 dark:bg-[#2A2416]/10'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121413] hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                    className="w-full p-4 flex items-start justify-between text-left gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {article.title}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {article.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {article.summary}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400 shrink-0 pt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-[#3B82F6]/20 text-xs text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                      {article.content.map((paragraph, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-[#1D4ED8] dark:text-[#60A5FA] font-bold">•</span>
                          <span>{paragraph}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50 dark:bg-gray-900/20">
          <span>Need direct assistance? Email support@aroh.in</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
