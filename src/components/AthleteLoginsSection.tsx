import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  Crown,
  Sparkles,
  Smartphone,
  Laptop,
  Globe,
  Flame,
  Dumbbell,
  Apple,
  Droplets,
  Activity,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { fetchAthleteLogins, clearAthleteLoginsHistory } from '../lib/subscription';
import { AthleteLoginRecord } from '../types';

interface AthleteLoginsSectionProps {
  pin?: string;
  email?: string;
  onGrantVipToEmail?: (targetEmail: string) => void;
  onViewTimeline?: (targetEmail: string) => void;
}

export const AthleteLoginsSection: React.FC<AthleteLoginsSectionProps> = ({
  pin,
  email,
  onGrantVipToEmail,
  onViewTimeline,
}) => {
  const [logins, setLogins] = useState<AthleteLoginRecord[]>([]);
  const [aggregatedProfiles, setAggregatedProfiles] = useState<AthleteLoginRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterView, setFilterView] = useState<'all' | 'today' | 'profiles'>('profiles');
  const [selectedProfile, setSelectedProfile] = useState<AthleteLoginRecord | null>(null);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const loadLogins = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAthleteLogins(pin, email);
      if (data && data.success) {
        setLogins(data.logins || []);
        setAggregatedProfiles(data.aggregatedProfiles || []);
      }
    } catch (e) {
      console.warn('Error loading athlete logins:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogins();
  }, [pin, email]);

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear historical athlete login telemetry?')) return;
    setIsClearing(true);
    try {
      await clearAthleteLoginsHistory(pin, email);
      await loadLogins();
    } catch (e) {
      console.warn('Error clearing logins:', e);
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportCSV = () => {
    const recordsToExport = filterView === 'profiles' ? aggregatedProfiles : logins;
    if (recordsToExport.length === 0) return;

    const headers = [
      'Session ID',
      'Athlete Email',
      'Name',
      'Login Timestamp',
      'Device',
      'Browser',
      'OS',
      'Screen Resolution',
      'Timezone',
      'Age',
      'Sex',
      'Weight (kg)',
      'Height (cm)',
      'BMI',
      'Target Weight (kg)',
      'Fitness Goal',
      'Diet Type',
      'Experience Level',
      'Daily Calories',
      'Daily Protein (g)',
      'Daily Hydration (L)',
      'Workout Streak (days)',
      'Total Workouts Logged',
      'Subscription Plan',
      'Is Lifetime VIP',
    ];

    const rows = recordsToExport.map((r) => [
      `"${r.id}"`,
      `"${r.email}"`,
      `"${r.name}"`,
      `"${r.loginTimestamp}"`,
      `"${r.device}"`,
      `"${r.browser || ''}"`,
      `"${r.os || ''}"`,
      `"${r.screenResolution || ''}"`,
      `"${r.timezone || ''}"`,
      `"${r.age || ''}"`,
      `"${r.sex || ''}"`,
      `"${r.weightKg || ''}"`,
      `"${r.heightCm || ''}"`,
      `"${r.bmi || ''}"`,
      `"${r.targetWeightKg || ''}"`,
      `"${r.goal || ''}"`,
      `"${r.dietType || ''}"`,
      `"${r.experienceLevel || ''}"`,
      `"${r.dailyCalories || ''}"`,
      `"${r.dailyProtein || ''}"`,
      `"${r.hydrationLiters || ''}"`,
      `"${r.workoutStreakDays || 0}"`,
      `"${r.totalWorkoutsLogged || 0}"`,
      `"${r.subscriptionPlan || ''}"`,
      `"${r.isLifetimeVIP ? 'YES' : 'NO'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AROH_Athlete_Logins_And_Profiles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogins = useMemo(() => logins.filter((l) => l.loginTimestamp?.startsWith(todayStr)), [logins, todayStr]);

  const filteredItems = useMemo(() => {
    let source = filterView === 'profiles' ? aggregatedProfiles : (filterView === 'today' ? todayLogins : logins);
    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase().trim();
    return source.filter(
      (item) =>
        item.email.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.goal && item.goal.toLowerCase().includes(q)) ||
        (item.device && item.device.toLowerCase().includes(q)) ||
        (item.dietType && item.dietType.toLowerCase().includes(q))
    );
  }, [filterView, aggregatedProfiles, todayLogins, logins, searchQuery]);

  return (
    <div className="space-y-5 animate-in fade-in text-xs">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Athlete Live Logins & Complete Profile Registry</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              1000% Accurate Telemetry
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Real-time audit log of every athlete login event, device environment, and complete physiological profile.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadLogins}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredItems.length === 0}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-40"
            title="Export all login records and complete profiles to CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={isClearing || logins.length === 0}
            className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold flex items-center gap-1.5 cursor-pointer text-xs disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <div className="text-[10px] uppercase font-black text-gray-400">Unique Athletes</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-baseline justify-between">
            <span>{aggregatedProfiles.length}</span>
            <span className="text-[10px] font-bold text-gray-400">Registered</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <div className="text-[10px] uppercase font-black text-gray-400">Total Logins Logged</div>
          <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5 flex items-baseline justify-between">
            <span>{logins.length}</span>
            <span className="text-[10px] font-bold text-emerald-500">100% Tracked</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <div className="text-[10px] uppercase font-black text-gray-400">Active Today</div>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-0.5 flex items-baseline justify-between">
            <span>{todayLogins.length}</span>
            <span className="text-[10px] font-bold text-teal-500">Sessions</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#121413] border border-gray-200 dark:border-gray-800 shadow-2xs">
          <div className="text-[10px] uppercase font-black text-gray-400">VIP Athletes</div>
          <div className="text-xl font-black text-amber-500 mt-0.5 flex items-baseline justify-between">
            <span>{aggregatedProfiles.filter((p) => p.isLifetimeVIP).length}</span>
            <span className="text-[10px] font-bold text-amber-500">Lifetime</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logins by athlete email, name, goal, or device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161817] text-gray-900 dark:text-white text-xs outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-[#191B1A] border border-gray-200 dark:border-gray-800 shrink-0">
          <button
            type="button"
            onClick={() => setFilterView('profiles')}
            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
              filterView === 'profiles'
                ? 'bg-white dark:bg-[#121413] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Unique Athlete Profiles ({aggregatedProfiles.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterView('today')}
            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
              filterView === 'today'
                ? 'bg-white dark:bg-[#121413] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Today's Logins ({todayLogins.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterView('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
              filterView === 'all'
                ? 'bg-white dark:bg-[#121413] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            All Sessions ({logins.length})
          </button>
        </div>
      </div>

      {/* Profile & Login List Cards / Table */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-gray-500 bg-white dark:bg-[#161817] rounded-3xl border border-gray-200 dark:border-gray-800">
            <Users className="w-10 h-10 text-gray-400 mx-auto" />
            <div className="font-bold text-gray-700 dark:text-gray-300">No Login Telemetry Records Found</div>
            <p className="text-xs text-gray-400">
              {searchQuery ? `No athlete records match "${searchQuery}".` : 'Logins will automatically populate here whenever athletes open or authenticate into AROH AI.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredItems.map((record) => {
              const isSelected = selectedProfile?.id === record.id;
              const dateObj = new Date(record.loginTimestamp);
              const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={record.id}
                  className="p-4 rounded-3xl bg-white dark:bg-[#161817] border border-gray-200 dark:border-gray-800 shadow-2xs hover:border-emerald-500/40 transition-all space-y-3"
                >
                  {/* Top Row: User Identity & VIP Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {record.name ? record.name.charAt(0).toUpperCase() : record.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{record.name || 'Athlete'}</span>
                          {record.isLifetimeVIP && (
                            <span className="p-0.5 rounded-md bg-amber-500/15 text-amber-600 border border-amber-500/30" title="Lifetime VIP">
                              <Crown className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                          {record.email}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <Clock className="w-2.5 h-2.5 text-emerald-500" />
                        <span>{dateStr} {timeStr}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle Row: Physiological & Diet Parameters (100% Accurate) */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-gray-50/70 dark:bg-[#121413] border border-gray-100 dark:border-gray-800/60 text-[11px]">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Body Stats</span>
                      <span className="font-extrabold text-gray-800 dark:text-gray-200">
                        {record.weightKg ? `${record.weightKg} kg` : '--'}
                        {record.heightCm ? ` · ${record.heightCm} cm` : ''}
                      </span>
                      {record.bmi && <span className="text-[10px] text-emerald-600 block">BMI: {record.bmi}</span>}
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Goal & Diet</span>
                      <span className="font-extrabold text-gray-800 dark:text-gray-200 capitalize">
                        {record.goal?.replace('_', ' ') || 'Fitness'}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        {record.isStrictVegetarian ? 'Strict Veg' : (record.dietType || 'Standard')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase block">Activity & Targets</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {record.dailyCalories ? `${record.dailyCalories} kcal` : '--'}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {record.workoutStreakDays ? `🔥 ${record.workoutStreakDays}d streak` : 'Ready'}
                      </span>
                    </div>
                  </div>

                  {/* Device Telemetry Pill Row */}
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800 flex-wrap gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Smartphone className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{record.device || 'Web Client'}</span>
                      {record.timezone && <span className="text-gray-400">({record.timezone})</span>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onViewTimeline && (
                        <button
                          type="button"
                          onClick={() => onViewTimeline(record.email)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Timeline</span>
                        </button>
                      )}

                      {onGrantVipToEmail && (
                        <button
                          type="button"
                          onClick={() => onGrantVipToEmail(record.email)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Crown className="w-3 h-3" />
                          <span>Grant VIP</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
