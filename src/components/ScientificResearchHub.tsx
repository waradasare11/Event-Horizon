import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  Globe, 
  Flame, 
  Dumbbell, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  Zap, 
  Info,
  Clock,
  ArrowRight,
  TrendingDown,
  Activity
} from 'lucide-react';
import { UserProfile, SearchCitation } from '../types';

interface ResearchResponseData {
  query: string;
  synthesisText: string;
  citations: SearchCitation[];
  generatedAt: string;
}

interface ScientificResearchHubProps {
  userProfile: UserProfile;
}

const RESEARCH_PILLARS = [
  {
    category: 'Fat Loss & Energy Balance',
    icon: Flame,
    color: 'text-[#E8912D] bg-[#E8912D]/10 border-[#E8912D]/20',
    topics: [
      {
        title: 'Metabolic Adaptation & Refeeds',
        query: 'What does sports science research say about metabolic adaptation during prolonged caloric deficits, non-exercise activity thermogenesis (NEAT) drop, and diet breaks/refeed days for preserving resting metabolic rate and leptin?',
      },
      {
        title: 'Satiety Index & Protein Leverage',
        query: 'What are the most evidence-based dietary strategies for maximizing fullness and satiety in a calorie deficit according to the Satiety Index and protein leverage hypothesis?',
      },
      {
        title: 'Target Rate of Fat Loss',
        query: 'What is the optimal weekly rate of fat loss (e.g. 0.5% to 1.0% body weight per week) to maximize adipose tissue reduction while preventing lean muscle loss according to ISSN and sports science meta-analyses?',
      },
    ],
  },
  {
    category: 'Muscle Building & Hypertrophy',
    icon: Dumbbell,
    color: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20',
    topics: [
      {
        title: 'Optimal Weekly Volume & RPE/RIR',
        query: 'What is the scientific consensus on weekly training set volume per muscle group (e.g. 10-20 hard sets/week) and proximity to failure (RPE 7-9 / 1-3 RIR) for maximizing muscle hypertrophy according to Brad Schoenfeld research?',
      },
      {
        title: 'Lengthened Partials & Stretch-Mediated Hypertrophy',
        query: 'What does recent 2023-2025 biomechanical and exercise science literature reveal about stretch-mediated hypertrophy and lengthened partial repetitions across different muscle groups?',
      },
      {
        title: 'Daily Protein Distribution & Leucine Threshold',
        query: 'What is the optimal daily protein intake (1.6 to 2.2 g/kg) and per-meal leucine threshold (~2.5-3g leucine or 0.4g/kg) to maximize 24-hour muscle protein synthesis (MPS)?',
      },
    ],
  },
  {
    category: 'Evidence-Based Supplements & Longevity',
    icon: Zap,
    color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20',
    topics: [
      {
        title: 'Creatine Monohydrate Meta-Analyses',
        query: 'What does peer-reviewed sports science research and ISSN position stands conclude regarding creatine monohydrate dosing (3-5g daily), timing, intramuscular phosphocreatine saturation, and cognitive benefits?',
      },
      {
        title: 'Caffeine & Pre-Workout Ergogenics',
        query: 'What is the scientifically validated dose of caffeine (3-6 mg/kg) for power output, strength endurance, and fat oxidation, and how does timing 45-60 min pre-workout affect performance?',
      },
      {
        title: 'Sleep, Cortisol & Muscle Recovery',
        query: 'How does sleep deprivation (under 7 hours) affect circulating cortisol levels, testosterone-to-cortisol ratio, insulin sensitivity, and muscle protein breakdown in resistance-trained athletes?',
      },
    ],
  },
];

export const ScientificResearchHub: React.FC<ScientificResearchHubProps> = ({ userProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearching, setIsSearching] = useState(false);
  const [activeResearch, setActiveResearch] = useState<ResearchResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecuteResearch = async (queryText: string, categoryName?: string) => {
    if (!queryText.trim() || isSearching) return;
    setSearchQuery(queryText);
    setIsSearching(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/research-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          userGoal: `${userProfile.goal} (Weight: ${userProfile.weightKg}kg, Target: ${userProfile.targetWeightKg}kg)`,
          topicCategory: categoryName || selectedCategory,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.details || resData.error || 'Failed to complete scientific search');
      }

      setActiveResearch(resData.data);
    } catch (err: any) {
      console.error('Research error:', err);
      setErrorMessage(err.message || 'Unable to fetch research data. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 text-left">
      {/* Banner / Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Google Search Grounded • Peer-Reviewed Fitness Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D1B] tracking-tight">
            Scientific Research & Literature Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            Real-time evidence synthesis powered by Gemini 3.7 Flash with Google Search Grounding. Query peer-reviewed sports science journals, ISSN position stands, meta-analyses, and clinical trials on health, fat loss, muscle hypertrophy, and supplements.
          </p>
        </div>

        <div className="bg-[#FAFAF8] p-4 rounded-2xl border border-[#E5E7EB] shrink-0 w-full md:w-auto">
          <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-bold mb-1">
            Active Research Focus
          </div>
          <div className="text-sm font-extrabold text-[#D4AF37] flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#E8912D]" />
            <span>{userProfile.goal === 'lose_fat' ? 'Evidence-Based Fat Loss' : userProfile.goal === 'build_muscle' ? 'Hypertrophy & MPS Science' : 'Body Recomposition'}</span>
          </div>
          <div className="text-[11px] text-[#6B7280] mt-1">
            Caloric Target: {userProfile.dailyCalories} kcal • {userProfile.dailyProtein}g protein
          </div>
        </div>
      </div>

      {/* SEARCH INPUT BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteResearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#9CA3AF] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scientific research (e.g., optimal protein per meal, best quad exercises EMG, creatine timing, diet breaks)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              className="w-full text-xs sm:text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3.5 rounded-2xl bg-[#D4AF37] text-white text-xs sm:text-sm font-bold hover:bg-[#A68523] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#E8912D]" />
                <span>Searching Online Literature...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#E8912D]" />
                <span>Synthesize Research</span>
              </>
            )}
          </button>
        </form>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMessage}
          </div>
        )}
      </div>

      {/* ACTIVE RESEARCH RESULTS VIEW */}
      {activeResearch && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D4AF37]/30 shadow-md space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-white">
                  Synthesized Evidence
                </span>
                <span className="text-xs text-[#6B7280]">
                  Updated {activeResearch.generatedAt}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1A1D1B]">
                {activeResearch.query}
              </h2>
            </div>
            <button
              onClick={() => setActiveResearch(null)}
              className="text-xs text-[#6B7280] hover:text-[#1A1D1B] font-semibold self-start sm:self-auto"
            >
              Clear Result ✕
            </button>
          </div>

          {/* Research Synthesis Content */}
          <div className="prose prose-sm max-w-none text-[#1A1D1B] leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm bg-[#FAFAF8] p-5 sm:p-6 rounded-2xl border border-[#E5E7EB]">
            {activeResearch.synthesisText}
          </div>

          {/* Live Citations & Grounding Sources */}
          {activeResearch.citations && activeResearch.citations.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1A1D1B] uppercase tracking-wider">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                <span>Live Grounded Scientific Sources & Citations ({activeResearch.citations.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {activeResearch.citations.map((cite, idx) => (
                  <a
                    key={idx}
                    href={cite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#D4AF37] hover:shadow-xs transition-all flex items-start justify-between gap-2 group"
                  >
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[#1A1D1B] truncate group-hover:text-[#D4AF37]">
                        {cite.title || 'Peer-Reviewed Source'}
                      </div>
                      <div className="text-[10px] text-[#6B7280] truncate mt-0.5">
                        {cite.domain || cite.url}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#D4AF37] shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CURATED EVIDENCE-BASED RESEARCH PILLARS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-bold text-[#1A1D1B]">
              Core Scientific Pillars & Literature Reviews
            </h2>
          </div>
          <span className="text-xs text-[#6B7280]">
            Click any topic to trigger instant deep search
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {RESEARCH_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pillar.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-[#1A1D1B]">
                      {pillar.category}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {pillar.topics.map((topic, tIdx) => (
                      <button
                        key={tIdx}
                        onClick={() => handleExecuteResearch(topic.query, pillar.category)}
                        disabled={isSearching}
                        className="w-full text-left p-3 rounded-2xl bg-[#FAFAF8] border border-[#E5E7EB] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#1A1D1B] group-hover:text-[#D4AF37]">
                            {topic.title}
                          </div>
                          <div className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                            {topic.query}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB]/60 flex items-center justify-between text-[11px] text-[#6B7280]">
                  <span>Grounding: PubMed / ISSN / ACSM</span>
                  <span className="font-semibold text-[#D4AF37]">Live Ready</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
