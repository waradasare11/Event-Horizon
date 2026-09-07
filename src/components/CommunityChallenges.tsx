import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Award, 
  Users, 
  Sparkles, 
  Target, 
  ChevronRight, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Medal, 
  Share2, 
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { UserProfile, WorkoutCompletionLog, MealLog, CommunityChallenge, ChallengeLeaderboardEntry } from '../types';
import confetti from 'canvas-confetti';

interface CommunityChallengesProps {
  userProfile: UserProfile;
  workoutLogs: WorkoutCompletionLog[];
  mealLogs: MealLog[];
  currentStreak: number;
}

const INITIAL_COMMUNITY_CHALLENGES: CommunityChallenge[] = [
  {
    id: 'volume-10m',
    title: '10,000,000 kg Collective Volume Quest',
    category: 'volume',
    description: 'Every bench press, squat, deadlift, and curl logged by PeakForm athletes counts toward our shared 10M kg goal.',
    targetMetric: 'Total Weight Lifted',
    currentCommunityTotal: 7428590,
    goalCommunityTotal: 10000000,
    unit: 'kg',
    participantCount: 4218,
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    rewardBadge: '🏆 Titan Lifter 2026',
    leaderboard: [
      {
        id: 'user_1',
        athleteName: 'Vikram Rajput',
        emailMasked: 'vi***t@gmail.com',
        rank: 1,
        totalScore: 148200,
        unit: 'kg',
        badge: '👑 Diamond Titan',
        lastActive: '12 min ago',
        cheersCount: 342,
      },
      {
        id: 'user_2',
        athleteName: 'Ananya Sharma',
        emailMasked: 'an***a@gmail.com',
        rank: 2,
        totalScore: 132450,
        unit: 'kg',
        badge: '⚡ Master Hypertrophy',
        lastActive: '45 min ago',
        cheersCount: 289,
      },
      {
        id: 'user_3',
        athleteName: 'Rohan Deshmukh',
        emailMasked: 'ro***h@gmail.com',
        rank: 3,
        totalScore: 119800,
        unit: 'kg',
        badge: '🔥 Powerhouse',
        lastActive: '2 hours ago',
        cheersCount: 215,
      },
      {
        id: 'user_4',
        athleteName: 'Pooja Iyer',
        emailMasked: 'po***r@gmail.com',
        rank: 4,
        totalScore: 98400,
        unit: 'kg',
        badge: '💪 Glute & Squat Specialist',
        lastActive: '3 hours ago',
        cheersCount: 164,
      },
      {
        id: 'user_5',
        athleteName: 'Sameer Khan',
        emailMasked: 'sa***n@gmail.com',
        rank: 5,
        totalScore: 87500,
        unit: 'kg',
        badge: '🎖️ Iron Athlete',
        lastActive: '5 hours ago',
        cheersCount: 122,
      },
    ],
  },
  {
    id: 'streak-100k',
    title: '100,000 Days Consistency Milestone',
    category: 'streak',
    description: 'Consistency beats intensity. Build your personal streak to boost the global community endurance score.',
    targetMetric: 'Total Workout Days Logged',
    currentCommunityTotal: 68420,
    goalCommunityTotal: 100000,
    unit: 'days',
    participantCount: 5120,
    startDate: '2026-07-01',
    endDate: '2026-10-31',
    rewardBadge: '🔥 Unbroken Iron Will',
    leaderboard: [
      {
        id: 'user_s1',
        athleteName: 'Kabir Mehta',
        emailMasked: 'ka***a@gmail.com',
        rank: 1,
        totalScore: 184,
        unit: 'days',
        badge: '💎 180+ Day Streak Legend',
        lastActive: 'Today',
        cheersCount: 512,
      },
      {
        id: 'user_s2',
        athleteName: 'Sneha Patel',
        emailMasked: 'sn***l@gmail.com',
        rank: 2,
        totalScore: 142,
        unit: 'days',
        badge: '🔥 100+ Day Club',
        lastActive: 'Today',
        cheersCount: 398,
      },
      {
        id: 'user_s3',
        athleteName: 'Amit Verma',
        emailMasked: 'am***a@gmail.com',
        rank: 3,
        totalScore: 98,
        unit: 'days',
        badge: '⚡ Relentless Warrior',
        lastActive: 'Yesterday',
        cheersCount: 265,
      },
    ],
  },
  {
    id: 'nutrition-clean',
    title: '50,000 Clean Protein & Macro Days',
    category: 'nutrition',
    description: 'Hit 90%+ of your daily protein target with precision meal tracking to claim the Golden Macro Seal.',
    targetMetric: 'Daily High-Protein Days',
    currentCommunityTotal: 34190,
    goalCommunityTotal: 50000,
    unit: 'days',
    participantCount: 3890,
    startDate: '2026-08-15',
    endDate: '2026-10-15',
    rewardBadge: '🥗 Master Nutritionist',
    leaderboard: [
      {
        id: 'user_n1',
        athleteName: 'Dr. Arjun Saxena',
        emailMasked: 'ar***a@gmail.com',
        rank: 1,
        totalScore: 89,
        unit: 'clean days',
        badge: '🧬 Perfect Macro Ratio',
        lastActive: 'Today',
        cheersCount: 420,
      },
      {
        id: 'user_n2',
        athleteName: 'Meera Nambiar',
        emailMasked: 'me***r@gmail.com',
        rank: 2,
        totalScore: 76,
        unit: 'clean days',
        badge: '🥑 High-Protein Vegan Ace',
        lastActive: 'Today',
        cheersCount: 310,
      },
    ],
  },
];

export const CommunityChallenges: React.FC<CommunityChallengesProps> = ({
  userProfile,
  workoutLogs,
  mealLogs,
  currentStreak,
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('volume-10m');
  const [activeFilter, setActiveFilter] = useState<'all' | 'volume' | 'streak' | 'nutrition'>('all');
  const [cheeredAthletes, setCheeredAthletes] = useState<Record<string, number>>({});
  const [joinedChallenges, setJoinedChallenges] = useState<Record<string, boolean>>({
    'volume-10m': true,
    'streak-100k': true,
    'nutrition-clean': true,
  });

  // Calculate current user's actual personal total volume lifted across all logged workouts
  const userTotalVolumeKg = useMemo(() => {
    return workoutLogs.reduce((total, log) => {
      if (log.totalVolumeKg && log.totalVolumeKg > 0) {
        return total + log.totalVolumeKg;
      }
      // Estimate if not recorded: duration * 120kg equivalent
      return total + (log.durationMin || 45) * 80;
    }, 0);
  }, [workoutLogs]);

  // Clean nutrition days logged
  const userCleanNutritionDays = useMemo(() => {
    const targetProtein = userProfile.dailyProtein || 140;
    const dateMap: Record<string, number> = {};
    mealLogs.forEach((m) => {
      dateMap[m.date] = (dateMap[m.date] || 0) + (m.proteinG || 0);
    });
    return Object.values(dateMap).filter((p) => p >= targetProtein * 0.85).length;
  }, [mealLogs, userProfile.dailyProtein]);

  const selectedChallenge = useMemo(() => {
    return INITIAL_COMMUNITY_CHALLENGES.find((c) => c.id === selectedChallengeId) || INITIAL_COMMUNITY_CHALLENGES[0];
  }, [selectedChallengeId]);

  // Merge current user dynamically into leaderboard
  const enrichedLeaderboard = useMemo(() => {
    let userScore = 0;
    let unit = selectedChallenge.unit;

    if (selectedChallenge.category === 'volume') {
      userScore = userTotalVolumeKg;
    } else if (selectedChallenge.category === 'streak') {
      userScore = Math.max(currentStreak, workoutLogs.length);
    } else if (selectedChallenge.category === 'nutrition') {
      userScore = userCleanNutritionDays;
    }

    const currentUserEntry: ChallengeLeaderboardEntry = {
      id: 'current_user',
      athleteName: `${userProfile.name || 'You'} (You)`,
      emailMasked: userProfile.email ? `${userProfile.email.slice(0, 3)}***@gmail.com` : 'you***@gmail.com',
      rank: 6,
      totalScore: userScore,
      unit,
      badge: '🚀 Active Challenger',
      lastActive: 'Just now',
      isCurrentUser: true,
      cheersCount: cheeredAthletes['current_user'] || 18,
    };

    const combined = [...selectedChallenge.leaderboard, currentUserEntry];
    // Sort descending by totalScore
    combined.sort((a, b) => b.totalScore - a.totalScore);
    // Assign ranks
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      cheersCount: (entry.cheersCount || 0) + (cheeredAthletes[entry.id] || 0),
    }));
  }, [selectedChallenge, userTotalVolumeKg, currentStreak, workoutLogs.length, userCleanNutritionDays, userProfile, cheeredAthletes]);

  const progressPercent = Math.min(
    100,
    Math.round((selectedChallenge.currentCommunityTotal / selectedChallenge.goalCommunityTotal) * 100)
  );

  const handleCheer = (athleteId: string) => {
    setCheeredAthletes((prev) => ({
      ...prev,
      [athleteId]: (prev[athleteId] || 0) + 1,
    }));
    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#0F6E5F', '#E8912D', '#3B82F6'],
      });
    } catch (e) {}
  };

  const handleJoinToggle = (challengeId: string) => {
    setJoinedChallenges((prev) => {
      const next = !prev[challengeId];
      if (next) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#0F6E5F', '#E8912D', '#10B981'],
          });
        } catch (e) {}
      }
      return { ...prev, [challengeId]: next };
    });
  };

  const filteredChallenges = INITIAL_COMMUNITY_CHALLENGES.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.category === activeFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Community Header */}
      <div className="bg-gradient-to-r from-[#0F6E5F] via-[#0D5B4F] to-[#134E48] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 mb-3 border border-white/10">
              <Users className="w-3.5 h-3.5" />
              PeakForm Global Athlete Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Community Challenges & Live Leaderboard
            </h1>
            <p className="text-sm text-emerald-100/90 mt-2 leading-relaxed">
              Lift together, stay accountable, and conquer massive community milestones. Your personal workouts and clean nutrition directly advance the global goal!
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[120px]">
              <div className="text-xs text-emerald-200">Your Lifted Volume</div>
              <div className="text-xl font-extrabold text-white mt-0.5">
                {userTotalVolumeKg.toLocaleString()} <span className="text-xs font-medium">kg</span>
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[120px]">
              <div className="text-xs text-emerald-200">Active Streak</div>
              <div className="text-xl font-extrabold text-[#E8912D] mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-current" />
                {currentStreak} <span className="text-xs font-medium text-white">days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-[#0F6E5F] text-white shadow-sm'
                : 'bg-white dark:bg-[#1E211F] text-[#5A605B] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-50'
            }`}
          >
            All Challenges ({INITIAL_COMMUNITY_CHALLENGES.length})
          </button>
          <button
            onClick={() => setActiveFilter('volume')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === 'volume'
                ? 'bg-[#0F6E5F] text-white shadow-sm'
                : 'bg-white dark:bg-[#1E211F] text-[#5A605B] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-50'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Lifting Volume
          </button>
          <button
            onClick={() => setActiveFilter('streak')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === 'streak'
                ? 'bg-[#0F6E5F] text-white shadow-sm'
                : 'bg-white dark:bg-[#1E211F] text-[#5A605B] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#E8912D]" />
            Consistency Streaks
          </button>
          <button
            onClick={() => setActiveFilter('nutrition')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === 'nutrition'
                ? 'bg-[#0F6E5F] text-white shadow-sm'
                : 'bg-white dark:bg-[#1E211F] text-[#5A605B] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Clean Nutrition
          </button>
        </div>

        <div className="text-xs text-[#5A605B] dark:text-[#9CA3AF] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#0F6E5F]" />
          Live Verified Athlete Logs
        </div>
      </div>

      {/* Main Challenge Grid & Active Milestone Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Milestone Progress & Challenge Selector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Featured Milestone Card */}
          <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#2A2E2C] rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F6E5F] dark:text-[#4ade80]">
                  Shared Community Milestone
                </span>
                <h2 className="text-xl font-bold text-[#1A1D1B] dark:text-[#E8ECE9] mt-0.5">
                  {selectedChallenge.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {selectedChallenge.rewardBadge}
                </span>
                <button
                  onClick={() => handleJoinToggle(selectedChallenge.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    joinedChallenges[selectedChallenge.id]
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-[#0F6E5F] text-white hover:bg-[#0D5B4F]'
                  }`}
                >
                  {joinedChallenges[selectedChallenge.id] ? '✓ Joined' : '+ Join Challenge'}
                </button>
              </div>
            </div>

            <p className="text-sm text-[#5A605B] dark:text-[#9CA3AF] mb-6">
              {selectedChallenge.description}
            </p>

            {/* Giant Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#1A1D1B] dark:text-[#E8ECE9]">
                  Community Progress: {selectedChallenge.currentCommunityTotal.toLocaleString()} / {selectedChallenge.goalCommunityTotal.toLocaleString()} {selectedChallenge.unit}
                </span>
                <span className="text-[#0F6E5F] dark:text-[#4ade80] text-sm font-extrabold">
                  {progressPercent}% Complete
                </span>
              </div>
              <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#0F6E5F] to-[#10B981] rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{(selectedChallenge.goalCommunityTotal - selectedChallenge.currentCommunityTotal).toLocaleString()} {selectedChallenge.unit} remaining</span>
                <span>{selectedChallenge.participantCount.toLocaleString()} athletes participating</span>
              </div>
            </div>

            {/* User Contribution Snapshot */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#1E211F] border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F6E5F]/15 text-[#0F6E5F] dark:text-[#4ade80] flex items-center justify-center font-bold">
                  {userProfile.name?.slice(0, 1) || 'U'}
                </div>
                <div>
                  <div className="text-xs text-gray-500">Your Verified Contribution</div>
                  <div className="text-sm font-bold text-[#1A1D1B] dark:text-white">
                    {selectedChallenge.category === 'volume' && `${userTotalVolumeKg.toLocaleString()} kg lifted`}
                    {selectedChallenge.category === 'streak' && `${currentStreak} day streak`}
                    {selectedChallenge.category === 'nutrition' && `${userCleanNutritionDays} clean protein days`}
                  </div>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg">
                <Zap className="w-3.5 h-3.5" />
                Contributing to Community Goal
              </div>
            </div>
          </div>

          {/* Other Available Challenges Carousel/List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#0F6E5F]" />
              Select Active Community Quest
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filteredChallenges.map((challenge) => {
                const isSelected = challenge.id === selectedChallengeId;
                return (
                  <button
                    key={challenge.id}
                    onClick={() => setSelectedChallengeId(challenge.id)}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 border-[#0F6E5F] shadow-sm'
                        : 'bg-white dark:bg-[#161817] border-gray-200 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#0F6E5F] dark:text-[#4ade80] mb-1 capitalize">
                      {challenge.category} Challenge
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                      {challenge.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                      <span>{challenge.participantCount} Lifters</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {Math.round((challenge.currentCommunityTotal / challenge.goalCommunityTotal) * 100)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Live Leaderboard */}
        <div className="bg-white dark:bg-[#161817] border border-[#E5E7EB] dark:border-[#2A2E2C] rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-[#1A1D1B] dark:text-[#E8ECE9]">
                Leaderboard Rankings
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
              Live Verified
            </span>
          </div>

          {/* Leaderboard entries list */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[480px] pr-1">
            {enrichedLeaderboard.map((entry) => {
              const isTop3 = entry.rank <= 3;
              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    entry.isCurrentUser
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-sm'
                      : isTop3
                      ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40'
                      : 'bg-gray-50/60 dark:bg-[#1E211F]/60 border-gray-200/70 dark:border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </div>

                    {/* Athlete Name & Masked Email */}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] truncate flex items-center gap-1.5">
                        {entry.athleteName}
                        {entry.isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[10px] font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                        <span>{entry.emailMasked}</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">{entry.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Cheers */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-[#0F6E5F] dark:text-[#4ade80]">
                        {entry.totalScore.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-400">{entry.unit}</div>
                    </div>

                    <button
                      onClick={() => handleCheer(entry.id)}
                      title="Send Cheers & Kudos"
                      className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 text-rose-500 flex items-center gap-1 text-[11px] font-bold transition-all shadow-xs"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{entry.cheersCount || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
            <Medal className="w-3.5 h-3.5 text-amber-500" />
            Top 10% athletes receive verified Community Trophy badges
          </div>
        </div>
      </div>
    </div>
  );
};
