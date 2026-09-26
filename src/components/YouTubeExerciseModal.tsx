import React, { useState } from 'react';
import { Play, ExternalLink, Copy, Check, Youtube, X, Dumbbell, ShieldCheck, Sparkles } from 'lucide-react';
import { 
  getYouTubeSearchUrl, 
  getStandardizedExerciseSearchTerm, 
  getCuratedCoachingOptions, 
  getBiomechanicalClassification 
} from '../lib/biomechanics';

interface YouTubeExerciseModalProps {
  exerciseName: string;
  targetMuscle?: string;
  equipment?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const YouTubeExerciseModal: React.FC<YouTubeExerciseModalProps> = ({
  exerciseName,
  targetMuscle,
  equipment,
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const cleanName = getStandardizedExerciseSearchTerm(exerciseName);
  const youtubeUrl = getYouTubeSearchUrl(exerciseName);
  const coachingOptions = getCuratedCoachingOptions(exerciseName);
  const bioClass = getBiomechanicalClassification(exerciseName, targetMuscle, equipment);

  if (!isOpen) return null;

  const handleCopyQuery = (query: string, id: string) => {
    navigator.clipboard.writeText(query);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleOpenYouTube = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E5E7EB] dark:border-[#2A2416] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 text-left">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-600/10 via-amber-500/5 to-transparent border-b border-[#E5E7EB] dark:border-[#2A2416] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                <span>Verified Exercise Tutorials</span>
                <span className="px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 font-bold text-[10px]">Verified Video</span>
              </span>
              <h3 className="text-lg font-bold text-[#1A1D1B] dark:text-[#E8ECE9]">
                Watch Form Tutorial
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#9EA8A2] hover:text-[#1A1D1B] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#202422] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Exercise Info Card */}
          <div className="bg-[#FAFAF8] dark:bg-[#1C1F1D] p-4 rounded-xl border border-[#E5E7EB] dark:border-[#2A2416]">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${bioClass.badgeColor}`}>
                  {bioClass.tierLabel}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#2563EB] dark:text-[#60A5FA] text-[11px] font-bold border border-[#3B82F6]/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA]" />
                  <span>Registry Verified</span>
                </span>
              </div>
              {targetMuscle && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA]">
                  {targetMuscle}
                </span>
              )}
            </div>
            <div className="text-lg sm:text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-1.5">
              {exerciseName}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-1 flex-wrap">
              <span className="font-semibold text-[#3B82F6] dark:text-[#60A5FA]">{bioClass.movementPattern}</span>
              <span>•</span>
              <span>{bioClass.jointType}</span>
              {equipment && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-[#3B82F6]" />
                    {equipment}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Primary Main YouTube Launcher */}
          <div className="space-y-2">
            <button
              onClick={() => handleOpenYouTube(youtubeUrl)}
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Open "{cleanName}" Video Tutorial on YouTube</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </button>

            <button
              onClick={() => handleCopyQuery(`${cleanName} proper form exercise tutorial`, 'main-query')}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#1E3A5F] text-[#1A1D1B] dark:text-[#E8ECE9] hover:bg-gray-50 dark:hover:bg-[#252A27] font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copiedId === 'main-query' ? (
                <>
                  <Check className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-[#2563EB] dark:text-[#60A5FA] font-bold">Standard Query Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>Copy Exact Search Query for YouTube App</span>
                </>
              )}
            </button>
          </div>

          {/* Curated Certified Coaching Channels List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Certified Coaching Channels & Form Breakdowns</span>
              </span>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">Direct Links</span>
            </div>

            <div className="space-y-2">
              {coachingOptions.map((opt) => {
                const isCopied = copiedId === opt.id;
                return (
                  <div
                    key={opt.id}
                    className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2220] border border-[#E5E7EB] dark:border-[#2A2416] flex items-center justify-between gap-3 hover:border-red-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-600/10 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {opt.avatarText}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] truncate">
                            {opt.name}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-[#282C2A] text-gray-700 dark:text-gray-300 shrink-0">
                            {opt.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2] truncate">
                          {opt.creator}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyQuery(opt.query, opt.id)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#252A27] hover:bg-gray-200 dark:hover:bg-[#303632] text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                        title={`Copy "${opt.query}"`}
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-[#3B82F6]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenYouTube(opt.url)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Watch</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#2A2416] flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
            <ShieldCheck className="w-4 h-4 text-[#B8922A] shrink-0" />
            <span>Search queries are cleaned of internal tags and optimized for injury-free joint mechanics and full active range of motion.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

