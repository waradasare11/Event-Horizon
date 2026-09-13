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
    id: 'scan-meal',
    title: 'How to scan a meal',
    category: 'Scanner & Food',
    icon: Camera,
    summary: 'Point your camera at your plate or thali in good lighting. AROH identifies visible items.',
    content: [
      'Position your phone camera directly above your plate, bowl, or thali in well-lit conditions.',
      'Tap Capture. AROH will detect individual visible foods and estimate portions based on dish geometry.',
      'Scientific limit: A photograph cannot measure hidden cooking oil, added sugars, or exact density. Always review the detected items before confirming.',
      'If identification fails or an item is obscured, AROH will visibly notify you rather than hallucinating an imaginary meal.'
    ],
  },
  {
    id: 'fix-grams',
    title: 'How to fix grams in one tap',
    category: 'Scanner & Food',
    icon: Sliders,
    summary: 'Adjust the portion slider to your exact cooked grams. All calories and micros recompute instantly.',
    content: [
      'After scanning, each detected food appears with an interactive portion slider.',
      'Move the slider or type the exact grams you cooked (e.g. 45g roti, 150g dal, 100g paneer).',
      'The engine immediately recomputes calories, protein, carbs, fats, and micronutrients from the authoritative database tables (ICMR-IFCT for Indian dishes, USDA FoodData Central for international foods).',
      'Locking in accurate grams gives you laboratory-grade macro tracking without relying on automated guess-work.'
    ],
  },
  {
    id: 'type-meal',
    title: 'How to type a meal (manual entry)',
    category: 'Scanner & Food',
    icon: Search,
    summary: 'Search over 8,000 verified foods from ICMR-IFCT and USDA without AI estimation.',
    content: [
      'Prefer manual logging? Open the Food view and switch to the Search / Type tab.',
      'Type any dish name in Hindi, regional Indian terms, or English (e.g., "khichdi", "idli", "rajma", "paneer bhurji").',
      'Select the exact preparation from the verified database and specify your portion in grams or standard bowl/katori sizes.',
      'Direct table lookup guarantees zero AI hallucinations with 100% verified nutrient figures.'
    ],
  },
  {
    id: 'billing-plans',
    title: 'Billing & transparent pricing',
    category: 'Billing & Privacy',
    icon: CreditCard,
    summary: 'Clear one-time plans: 7-day free trial, ₹89/month, ₹239/quarter, or ₹919/year. No surprise debits.',
    content: [
      'AROH begins with a full-featured 7-day free trial at ₹0 with no credit card required upfront.',
      'When your trial finishes, you choose between Monthly (₹89), Quarterly (₹239), or Yearly (₹919) access.',
      'All subscriptions are one-time prepayments processed securely through authorized Indian payment gateways (UPI, debit/credit cards, and net banking).',
      'There are zero surprise recurring auto-debits unless you explicitly establish an authorized UPI mandate.'
    ],
  },
  {
    id: 'drive-folder',
    title: 'Your personal Google Drive folder (AROH AI)',
    category: 'Billing & Privacy',
    icon: FolderLock,
    summary: 'Your health logs live inside your own Google Drive in an app-dedicated "AROH AI" folder.',
    content: [
      'Unlike closed-wall fitness applications that hold your health history hostage, AROH syncs directly with your personal Google Drive.',
      'All workout logs, meal entries, and profile settings are stored in an app-dedicated folder named "AROH AI".',
      'Because the files are in your cloud storage, you retain sovereign ownership of your biometric and lifestyle data at all times.'
    ],
  },
  {
    id: 'export-data',
    title: 'How to export your data',
    category: 'Data & Safety',
    icon: Download,
    summary: 'Download your entire training and nutrition history as a JSON or CSV file at any moment.',
    content: [
      'Open Settings & Tools from the header gear icon.',
      'Locate the "Export Athlete History" action.',
      'Tap Export to immediately download a comprehensive JSON archive containing all logged workouts, nutrition entries, weight weigh-ins, and personal bests.',
      'You can import or analyze this data in spreadsheets, research tools, or personal fitness archives.'
    ],
  },
  {
    id: 'delete-data',
    title: 'How to delete your data (DPDP Act, 2023)',
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
    id: 'under-18-consent',
    title: 'Under-18 parental consent & safety',
    category: 'Data & Safety',
    icon: ShieldAlert,
    summary: 'Adolescent safety guidelines. Users aged 13-17 require verified guardian consent.',
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
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-[#0F6E5F] dark:text-[#2DD4BF] flex items-center justify-center">
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
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121413] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      ? 'border-teal-500/40 bg-teal-50/20 dark:bg-teal-950/10'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121413] hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                    className="w-full p-4 flex items-start justify-between text-left gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-[#0F6E5F] dark:text-[#2DD4BF] flex items-center justify-center shrink-0 mt-0.5">
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
                    <div className="px-4 pb-4 pt-1 border-t border-teal-500/20 text-xs text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                      {article.content.map((paragraph, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
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
