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
  Sparkles,
  Sliders,
  BellRing,
  Maximize2,
  Minimize2,
  Flame,
  Check
} from 'lucide-react';

interface RestIntervalTimerProps {
  initialSeconds?: number;
  exerciseName?: string;
  onTimerComplete?: () => void;
  onClose?: () => void;
  isFloating?: boolean;
  onDurationChange?: (seconds: number) => void;
}

export const RestIntervalTimer: React.FC<RestIntervalTimerProps> = ({
  initialSeconds = 90,
  exerciseName = 'Inter-Set Recovery',
  onTimerComplete,
  onClose,
  isFloating = true,
  onDurationChange,
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showCustomSettings, setShowCustomSettings] = useState<boolean>(false);
  const [customInputSec, setCustomInputSec] = useState<string>(String(initialSeconds));

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
    setCustomInputSec(String(initialSeconds));
    setIsActive(true);
  }, [initialSeconds]);

  // Audio Beep using Web Audio API & Mobile Vibration
  const triggerCompletionAlert = () => {
    // Vibrate device if supported on mobile
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 80, 150, 80, 250]);
      } catch (e) {}
    }

    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Play 3 subtle harmonic pings (F5, A5, C6 major triad)
      [
        { freq: 698.46, time: 0 },
        { freq: 880.00, time: 0.15 },
        { freq: 1046.50, time: 0.30 }
      ].forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.time + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + note.time);
        osc.stop(ctx.currentTime + note.time + 0.22);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  // Timer Countdown Tick
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      triggerCompletionAlert();
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
    setTotalSeconds((prev) => Math.max(1, prev + deltaSec));
  };

  const setPreset = (sec: number) => {
    setTotalSeconds(sec);
    setTimeLeft(sec);
    setCustomInputSec(String(sec));
    setIsActive(true);
    if (onDurationChange) onDurationChange(sec);
  };

  const handleApplyCustomDuration = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInputSec, 10);
    if (!isNaN(val) && val > 0 && val <= 1200) {
      setPreset(val);
      setShowCustomSettings(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = totalSeconds > 0 ? Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100) : 100;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  // Minimized floating bubble
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[#161817]/95 backdrop-blur-md text-white border-2 border-[#0F6E5F] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-3 hover:scale-105 transition-all">
        {/* Circular Progress Ring */}
        <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
          <svg className="w-11 h-11 transform -rotate-90">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-gray-700"
              strokeWidth="3.5"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-[#2DD4BF] transition-all duration-500"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
            {timeLeft}s
          </div>
        </div>

        <div className="text-left cursor-pointer" onClick={() => setIsMinimized(false)}>
          <div className="text-[10px] text-[#9EA8A2] uppercase tracking-wider font-bold line-clamp-1 max-w-[120px]">
            {exerciseName}
          </div>
          <div className="text-base font-black font-mono text-[#5FD1B8]">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-l border-gray-700 pl-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-2 rounded-lg bg-[#242826] hover:bg-[#323735] text-white transition-all cursor-pointer"
            title={isActive ? 'Pause Rest' : 'Resume Rest'}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          </button>
          
          <button
            onClick={() => adjustTime(30)}
            className="p-1.5 px-2 rounded-lg bg-[#0F6E5F] hover:bg-[#0D5B4F] text-xs font-bold text-white transition-all cursor-pointer"
            title="+30s Rest"
          >
            +30s
          </button>

          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 rounded-lg bg-[#242826] hover:bg-[#323735] text-[#D1D5DB] transition-all cursor-pointer"
            title="Expand Full Rest Timer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-left transition-all ${
      isFloating 
        ? 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[480px] max-h-[88vh] overflow-y-auto bg-white/95 dark:bg-[#161817]/95 backdrop-blur-md border-2 border-[#0F6E5F] rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4'
        : 'bg-white dark:bg-[#161817] border-2 border-[#0F6E5F]/30 dark:border-[#0F6E5F]/40 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden'
    }`}>
      {/* Top Background Progress Bar */}
      <div 
        className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-[#0F6E5F] via-[#2DD4BF] to-[#5FD1B8] transition-all duration-1000"
        style={{ width: `${progressPct}%` }}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-[#242826] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0F6E5F]/10 dark:bg-[#0F6E5F]/20 text-[#0F6E5F] dark:text-[#5FD1B8] flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F6E5F] text-white">
                Rest Timer
              </span>
              <span className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] line-clamp-1">
                {exerciseName}
              </span>
            </div>
            <span className="text-[11px] text-[#6B7280] dark:text-[#9EA8A2]">
              ATP-CP recovery ~{progressPct}% restored
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCustomSettings(!showCustomSettings)}
            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showCustomSettings 
                ? 'bg-[#0F6E5F] text-white border-[#0F6E5F]' 
                : 'border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-100 dark:hover:bg-[#1F2220]'
            }`}
            title="Custom Duration Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-100 dark:hover:bg-[#1F2220] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio Chime' : 'Mute Audio Chime'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg border border-[#E5E7EB] dark:border-[#2A2E2C] text-[#6B7280] dark:text-[#9EA8A2] hover:bg-gray-100 dark:hover:bg-[#1F2220] transition-colors cursor-pointer"
            title="Minimize to Floating Bubble"
          >
            <Minimize2 className="w-4 h-4" />
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

      {/* CUSTOM DURATION SETTINGS PANEL */}
      {showCustomSettings && (
        <form onSubmit={handleApplyCustomDuration} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1E201F] border border-[#E5E7EB] dark:border-[#282C2A] space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#0F6E5F] dark:text-[#5FD1B8]" />
              <span>Custom Rest Duration Setting</span>
            </span>
            <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">1s – 1200s (20 mins)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="5"
                max="1200"
                value={customInputSec}
                onChange={(e) => setCustomInputSec(e.target.value)}
                placeholder="Seconds (e.g. 75)"
                className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] bg-white dark:bg-[#161817] text-[#1A1D1B] dark:text-[#E8ECE9] focus:ring-1 focus:ring-[#0F6E5F]"
              />
              <span className="absolute right-3 top-2 text-xs text-[#6B7280] dark:text-[#9EA8A2] font-semibold">seconds</span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F6E5F] hover:bg-[#0D5B4F] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Set & Start
            </button>
          </div>

          {/* Quick Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="15"
              max="300"
              step="15"
              value={customInputSec}
              onChange={(e) => setCustomInputSec(e.target.value)}
              className="w-full accent-[#0F6E5F] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">
              <span>15s</span>
              <span>60s</span>
              <span>120s</span>
              <span>180s</span>
              <span>300s</span>
            </div>
          </div>
        </form>
      )}

      {/* Main Countdown Display & Quick Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
        {/* Giant Timer Numbers */}
        <div className="sm:col-span-6 flex flex-col items-center sm:items-start">
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl sm:text-6xl font-black font-mono tracking-tight transition-colors ${
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
            Total interval: {totalSeconds}s ({Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s)
          </p>
        </div>

        {/* Play / Pause / Quick Adjust Buttons */}
        <div className="sm:col-span-6 flex items-center justify-center sm:justify-end gap-2 flex-wrap">
          <button
            onClick={() => adjustTime(-15)}
            className="px-2.5 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-100 dark:hover:bg-[#202322] text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] transition-all cursor-pointer"
            title="Minus 15 seconds"
          >
            -15s
          </button>
          
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
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
            className="px-2.5 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#2A2E2C] hover:bg-gray-100 dark:hover:bg-[#202322] text-xs font-bold text-[#1A1D1B] dark:text-[#E8ECE9] transition-all cursor-pointer"
            title="Add 30 seconds"
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

      {/* Evidence-Based Science Presets */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#6B7280] dark:text-[#9EA8A2]">Evidence-Based Presets:</span>
          <span className="text-[10px] text-[#0F6E5F] dark:text-[#5FD1B8] font-semibold">Click to load</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => setPreset(45)}
            className={`text-xs p-2 rounded-xl border font-bold transition-all text-center cursor-pointer ${
              totalSeconds === 45 
                ? 'bg-[#0F6E5F] text-white border-[#0F6E5F] shadow-xs' 
                : 'border-[#E5E7EB] dark:border-[#2A2E2C] bg-gray-50 dark:bg-[#1E201F] text-[#4B5563] dark:text-[#D1D5DB] hover:border-[#0F6E5F]'
            }`}
          >
            <div>45s</div>
            <div className="text-[9px] opacity-75 font-normal">Calves/Abs</div>
          </button>

          <button
            onClick={() => setPreset(60)}
            className={`text-xs p-2 rounded-xl border font-bold transition-all text-center cursor-pointer ${
              totalSeconds === 60 
                ? 'bg-[#0F6E5F] text-white border-[#0F6E5F] shadow-xs' 
                : 'border-[#E5E7EB] dark:border-[#2A2E2C] bg-gray-50 dark:bg-[#1E201F] text-[#4B5563] dark:text-[#D1D5DB] hover:border-[#0F6E5F]'
            }`}
          >
            <div>60s</div>
            <div className="text-[9px] opacity-75 font-normal">Isolation/Arms</div>
          </button>

          <button
            onClick={() => setPreset(90)}
            className={`text-xs p-2 rounded-xl border font-bold transition-all text-center cursor-pointer ${
              totalSeconds === 90 
                ? 'bg-[#0F6E5F] text-white border-[#0F6E5F] shadow-xs' 
                : 'border-[#E5E7EB] dark:border-[#2A2E2C] bg-gray-50 dark:bg-[#1E201F] text-[#4B5563] dark:text-[#D1D5DB] hover:border-[#0F6E5F]'
            }`}
          >
            <div>90s</div>
            <div className="text-[9px] opacity-75 font-normal">Hypertrophy</div>
          </button>

          <button
            onClick={() => setPreset(180)}
            className={`text-xs p-2 rounded-xl border font-bold transition-all text-center cursor-pointer ${
              totalSeconds === 180 
                ? 'bg-[#0F6E5F] text-white border-[#0F6E5F] shadow-xs' 
                : 'border-[#E5E7EB] dark:border-[#2A2E2C] bg-gray-50 dark:bg-[#1E201F] text-[#4B5563] dark:text-[#D1D5DB] hover:border-[#0F6E5F]'
            }`}
          >
            <div>180s</div>
            <div className="text-[9px] opacity-75 font-normal">Squat/Deadlift</div>
          </button>
        </div>
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
              <span className="text-[10px] text-[#6B7280] dark:text-[#9EA8A2]">Pulse check</span>
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
