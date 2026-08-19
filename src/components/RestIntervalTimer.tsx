import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Heart, 
  Activity, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Zap, 
  ChevronUp, 
  ChevronDown, 
  X,
  Sparkles
} from 'lucide-react';

interface RestIntervalTimerProps {
  initialSeconds?: number;
  exerciseName?: string;
  onTimerComplete?: () => void;
  onClose?: () => void;
}

export const RestIntervalTimer: React.FC<RestIntervalTimerProps> = ({
  initialSeconds = 90,
  exerciseName = 'Inter-Set Recovery',
  onTimerComplete,
  onClose,
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Heart Rate Recovery Tracking State
  const [showHeartRateTracker, setShowHeartRateTracker] = useState<boolean>(false);
  const [peakHrBpm, setPeakHrBpm] = useState<string>('155');
  const [currentHrBpm, setCurrentHrBpm] = useState<string>('118');
  const [hrAssessment, setHrAssessment] = useState<{
    hrDrop: number;
    rating: 'Optimal CNS Readiness' | 'Standard Recovery' | 'Incomplete Recovery';
    color: string;
    advice: string;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update total seconds if initialSeconds changes
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setTimeLeft(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  // Audio Beep using Web Audio API
  const playChime = () => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Play 3 subtle rhythmic completion pings
      [0, 0.15, 0.3].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(idx === 2 ? 880 : 587.33, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.12);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      playChime();
      if (onTimerComplete) {
        onTimerComplete();
      }
      setIsActive(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Evaluate Heart Rate Recovery (HRR)
  const evaluateHeartRate = () => {
    const peak = Number(peakHrBpm);
    const curr = Number(currentHrBpm);
    if (!peak || !curr || peak <= curr) {
      setHrAssessment(null);
      return;
    }

    const drop = peak - curr;
    if (drop >= 30) {
      setHrAssessment({
        hrDrop: drop,
        rating: 'Optimal CNS Readiness',
        color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800',
        advice: 'Full parasympathetic reactivation and phosphocreatine resynthesis. Ready for max load/reps.',
      });
    } else if (drop >= 18) {
      setHrAssessment({
        hrDrop: drop,
        rating: 'Standard Recovery',
        color: 'text-[#0F6E5F] dark:text-[#5FD1B8] bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 border-[#0F6E5F]/30',
        advice: 'Sufficient cardiovascular recovery for working sets at targeted RPE.',
      });
    } else {
      setHrAssessment({
        hrDrop: drop,
        rating: 'Incomplete Recovery',
        color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800',
        advice: 'Heart rate remains elevated. Recommend +30-45s additional rest to avoid premature peripheral muscle fatigue.',
      });
    }
  };

  const adjustTime = (deltaSec: number) => {
    setTimeLeft((prev) => Math.max(0, prev + deltaSec));
    setTotalSeconds((prev) => Math.max(prev, prev + deltaSec));
  };

  const setPreset = (sec: number) => {
    setTotalSeconds(sec);
    setTimeLeft(sec);
    setIsActive(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = totalSeconds > 0 ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100) : 100;

  // Minimized floating bubble
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[#161817] text-white border border-[#0F6E5F]/50 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
        <div className="w-8 h-8 rounded-full bg-[#0F6E5F] flex items-center justify-center font-bold text-xs text-white">
          <Clock className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="text-[10px] text-[#9EA8A2] uppercase tracking-wider font-semibold">Resting</div>
          <div className="text-base font-extrabold font-mono text-[#5FD1B8]">{formatTime(timeLeft)}</div>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-lg bg-[#242826] hover:bg-[#323735] text-[#D1D5DB] transition-all cursor-pointer ml-1"
          title="Expand Rest Timer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161817] border-2 border-[#0F6E5F]/30 dark:border-[#0F6E5F]/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 text-left transition-all relative overflow-hidden">
      {/* Top Background Progress Bar */}
      <div 
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#0F6E5F] to-[#5FD1B8] transition-all duration-1000"
        style={{ width: `${progressPct}%` }}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-[#242826] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#5FD1B8] flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#5FD1B8]">
                Automated Rest Timer
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#9EA8A2] line-clamp-1">{exerciseName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-100 dark:hover:bg-[#1F2220] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Chime' : 'Mute Chime'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-100 dark:hover:bg-[#1F2220] transition-colors cursor-pointer"
            title="Minimize to floating widget"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-100 dark:hover:bg-[#1F2220] transition-colors cursor-pointer"
              title="Close Timer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Countdown Display & Quick Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Giant Timer Numbers */}
        <div className="sm:col-span-6 flex flex-col items-center sm:items-start">
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl sm:text-6xl font-extrabold font-mono tracking-tight transition-colors ${
              timeLeft === 0 ? 'text-[#16A34A] dark:text-[#4ADE80] animate-bounce' : 'text-[#1A1D1B] dark:text-[#E8ECE9]'
            }`}>
              {formatTime(timeLeft)}
            </span>
            {timeLeft === 0 && (
              <span className="text-xs font-bold text-[#16A34A] dark:text-[#4ADE80] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready for Next Set!
              </span>
            )}
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#9EA8A2] mt-0.5">
            ATP-CP resynthesis ~{progressPct}% restored ({totalSeconds}s total interval)
          </p>
        </div>

        {/* Play / Pause / Quick Adjust Buttons */}
        <div className="sm:col-span-6 flex items-center justify-center sm:justify-end gap-2 flex-wrap">
          <button
            onClick={() => adjustTime(-15)}
            className="px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-100 dark:hover:bg-[#202322] text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] transition-all cursor-pointer"
          >
            -15s
          </button>
          
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={() => adjustTime(30)}
            className="px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-100 dark:hover:bg-[#202322] text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] transition-all cursor-pointer"
          >
            +30s
          </button>

          <button
            onClick={() => {
              setTimeLeft(totalSeconds);
              setIsActive(true);
            }}
            className="p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-100 dark:hover:bg-[#202322] text-[#6B7280] dark:text-[#9EA8A2] transition-all cursor-pointer"
            title="Reset to Full Interval"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Science Preset Selector Pills */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2]">Evidence-Based Presets:</span>
        <button
          onClick={() => setPreset(60)}
          className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
            totalSeconds === 60 
              ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]' 
              : 'border-[#E5E7EB] dark:border-[#2A2E2C] bg-gray-50 dark:bg-[#1E201F] text-[#4B5563] dark:text-[#D1D5DB]'
          }`}
        >
          60s (Isolation/Arms)
        </button>
        <button
          onClick={() => setPreset(90)}
          className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
            totalSeconds === 90 
              ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]' 
              : 'border-[#E5E7EB] dark:border-[#2A2E2C] bg-gray-50 dark:bg-[#1E201F] text-[#4B5563] dark:text-[#D1D5DB]'
          }`}
        >
          90s (Hypertrophy)
        </button>
        <button
          onClick={() => setPreset(120)}
          className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
            totalSeconds === 120 
              ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]' 
              : 'border-[#E5E7EB] dark:border-[#2A2E2C] bg-gray-50 dark:bg-[#1E201F] text-[#4B5563] dark:text-[#D1D5DB]'
          }`}
        >
          120s (Moderate Compounds)
        </button>
        <button
          onClick={() => setPreset(180)}
          className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
            totalSeconds === 180 
              ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]' 
              : 'border-[#E5E7EB] dark:border-[#2A2E2C] bg-gray-50 dark:bg-[#1E201F] text-[#4B5563] dark:text-[#D1D5DB]'
          }`}
        >
          180s (Heavy Squat/Deadlift)
        </button>
      </div>

      {/* Heart Rate Recovery (HRR) Tracker Toggle */}
      <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#242826]">
        <button
          onClick={() => setShowHeartRateTracker(!showHeartRateTracker)}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#E8912D] hover:underline cursor-pointer"
        >
          <Heart className="w-3.5 h-3.5 fill-[#E8912D]" />
          <span>{showHeartRateTracker ? 'Hide Heart Rate Recovery (HRR) Monitor' : 'Check Heart Rate Recovery & CNS Readiness (Optional)'}</span>
        </button>

        {showHeartRateTracker && (
          <div className="mt-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#2A2E2C] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#E8912D]" />
                <span>1-Minute Heart Rate Recovery (HRR) Calculation</span>
              </div>
              <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">Smartwatch / Pulse check</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] mb-1">
                  Peak Post-Set HR (BPM):
                </label>
                <input
                  type="number"
                  value={peakHrBpm}
                  onChange={(e) => setPeakHrBpm(e.target.value)}
                  placeholder="e.g. 155"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#161817] text-[#1A1D1B] dark:text-[#E8ECE9] focus:ring-1 focus:ring-[#0F6E5F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA8A2] mb-1">
                  Current / Resting HR (BPM):
                </label>
                <input
                  type="number"
                  value={currentHrBpm}
                  onChange={(e) => setCurrentHrBpm(e.target.value)}
                  placeholder="e.g. 118"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#161817] text-[#1A1D1B] dark:text-[#E8ECE9] focus:ring-1 focus:ring-[#0F6E5F]"
                />
              </div>
            </div>

            <button
              onClick={evaluateHeartRate}
              className="w-full py-2 px-3 rounded-xl bg-[#0F6E5F] hover:bg-[#0C584C] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Analyze Cardiovascular & Autonomic Readiness
            </button>

            {hrAssessment && (
              <div className={`p-3 rounded-xl border text-xs space-y-1 ${hrAssessment.color}`}>
                <div className="font-bold flex items-center justify-between">
                  <span>{hrAssessment.rating} (Δ -{hrAssessment.hrDrop} BPM Drop)</span>
                  <span>{hrAssessment.hrDrop >= 30 ? '⚡ 100% Ready' : hrAssessment.hrDrop >= 18 ? '✓ Standard' : '⏳ Wait 30s'}</span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {hrAssessment.advice}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
