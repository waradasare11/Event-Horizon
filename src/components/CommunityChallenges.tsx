import React, { useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Award, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Calendar,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { UserProfile, WorkoutCompletionLog, MealLog } from '../types';

interface CommunityChallengesProps {
  userProfile: UserProfile;
  workoutLogs: WorkoutCompletionLog[];
  mealLogs: MealLog[];
  currentStreak: number;
}

export const CommunityChallenges: React.FC<CommunityChallengesProps> = ({
  userProfile,
  workoutLogs,
  mealLogs,
  currentStreak,
}) => {
  // 1. Compute personal volume this week (last 7 days) from real workout logs
  const personalVolumeThisWeek = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    return workoutLogs
      .filter((log) => log.date >= sevenDaysAgoStr)
      .reduce((sum, log) => {
        if (log.totalVolumeKg && log.totalVolumeKg > 0) {
          return sum + log.totalVolumeKg;
        }
        return sum;
      }, 0);
  }, [workoutLogs]);

  // 2. Compute personal all-time volume from real workout logs
  const personalVolumeAllTime = useMemo(() => {
    return workoutLogs.reduce((sum, log) => {
      if (log.totalVolumeKg && log.totalVolumeKg > 0) {
        return sum + log.totalVolumeKg;
      }
      return sum;
    }, 0);
  }, [workoutLogs]);

  // 3. Compute clean nutrition adherence days from real meal logs
  const cleanNutritionDays = useMemo(() => {
    const targetProtein = userProfile.dailyProtein || 140;
    const dateMap: Record<string, number> = {};
    mealLogs.forEach((m) => {
      dateMap[m.date] = (dateMap[m.date] || 0) + (m.proteinG || 0);
    });
    return Object.values(dateMap).filter((p) => p >= targetProtein * 0.85).length;
  }, [mealLogs, userProfile.dailyProtein]);

  // 4. Sorted recent sessions from real athlete logs
  const recentSessions = useMemo(() => {
    return [...workoutLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [workoutLogs]);

  // 5. Personal milestone badges computed purely from this athlete's data
  const personalMilestones = useMemo(() => {
    return [
      {
        id: 'first-workout',
        title: 'First Step on the Iron Path',
        desc: 'Log your first completed training session',
        unlocked: workoutLogs.length >= 1,
        progress: `${Math.min(workoutLogs.length, 1)} / 1 session`,
        badge: '🥉 Debut Lifter',
      },
      {
        id: 'streak-7',
        title: '7-Day Discipline Master',
        desc: 'Maintain a 7-day consecutive workout streak',
        unlocked: currentStreak >= 7,
        progress: `${Math.min(currentStreak, 7)} / 7 days`,
        badge: '⚡ Consistent Warrior',
      },
      {
        id: 'vol-10k',
        title: '10,000 kg Volume Club',
        desc: 'Accumulate 10,000 kg of total resistance load',
        unlocked: personalVolumeAllTime >= 10000,
        progress: `${Math.min(personalVolumeAllTime, 10000).toLocaleString()} / 10,000 kg`,
        badge: '💪 Heavy Mover',
      },
      {
        id: 'protein-7',
        title: '7 Clean Nutrition Days',
        desc: 'Hit your daily protein target for 7 logged days',
        unlocked: cleanNutritionDays >= 7,
        progress: `${Math.min(cleanNutritionDays, 7)} / 7 days`,
        badge: '🥗 Fueling Ace',
      },
      {
        id: 'vol-50k',
        title: '50,000 kg Hypertrophy Club',
        desc: 'Lift 50,000 kg across all logged exercises',
        unlocked: personalVolumeAllTime >= 50000,
        progress: `${Math.min(personalVolumeAllTime, 50000).toLocaleString()} / 50,000 kg`,
        badge: '🔥 Iron Titan',
      },
    ];
  }, [workoutLogs.length, currentStreak, personalVolumeAllTime, cleanNutritionDays]);

  const athleteDisplayName = userProfile.name?.trim() || 'AROH Athlete';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4AF37] dark:text-[#F0D060]" />
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Personal Athletic Scoreboard
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#A68523] dark:text-[#F0D060] border border-[#D4AF37]/20">
              Verified Data Only
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Real performance telemetry for <strong>{athleteDisplayName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
          <ShieldCheck className="w-4 h-4 text-[#B8922A] dark:text-[#F0D060]" />
          <span>Zero Fabricated Social Proof</span>
        </div>
      </div>

      {/* Mandatory Empty State Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-left shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <h2 className="text-sm font-bold text-amber-950 dark:text-amber-200">
            Challenges unlock when more athletes join. For now this is your private scoreboard.
          </h2>
          <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
            AROH never displays artificial participant counts or simulated leaderboards. As real athletes join the community network, authentic multiplayer challenges and collective milestones will unlock right here.
          </p>
        </div>
      </div>

      {/* Real Personal Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Personal Workout Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Workout Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {currentStreak}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Consecutive training consistency
          </p>
        </div>

        {/* Card 2: Personal Volume This Week */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Volume This Week
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F0D060] flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {personalVolumeThisWeek.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-gray-500">kg</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Resistance tonnage moved in last 7 days
          </p>
        </div>

        {/* Card 3: Total Workouts Logged */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Sessions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {workoutLogs.length}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {workoutLogs.length === 1 ? 'workout' : 'workouts'}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            All-time completed training sessions
          </p>
        </div>

        {/* Card 4: All-Time Cumulative Volume */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              All-Time Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#B8922A] dark:text-[#F0D060] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {personalVolumeAllTime.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-gray-500">kg</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Cumulative career resistance workload
          </p>
        </div>
      </div>

      {/* Two Columns: Personal Milestones & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Personal Milestone Badges */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Personal Milestones
              </h2>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {personalMilestones.filter((m) => m.unlocked).length} of {personalMilestones.length} unlocked
            </span>
          </div>

          <div className="space-y-3">
            {personalMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  milestone.unlocked
                    ? 'bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 border-[#D4AF37]/30'
                    : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-70'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {milestone.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      {milestone.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {milestone.desc}
                  </p>
                  <div className="text-[10px] font-mono text-[#B8922A] dark:text-[#F0D060] font-semibold pt-0.5">
                    {milestone.progress}
                  </div>
                </div>

                <div className="shrink-0">
                  {milestone.unlocked ? (
                    <div className="w-7 h-7 rounded-full bg-[#A68523] text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Verified Workouts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37] dark:text-[#F0D060]" />
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Recent Training Sessions
              </h2>
            </div>
            <span className="text-xs font-medium text-gray-500">
              Last {recentSessions.length} recorded
            </span>
          </div>

          {recentSessions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-center space-y-2">
              <Dumbbell className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                No workouts logged yet. Complete a training session in the Workout tab to start building your scoreboard!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session, idx) => (
                <div
                  key={session.id || idx}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {session.dayName || 'Training Session'}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {session.date} • {session.durationMin || 45} min
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-[#D4AF37] dark:text-[#F0D060]">
                      {(session.totalVolumeKg || 0).toLocaleString()} kg
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {session.exercisesCompleted || session.loggedExercises?.length || 0} exercises
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
