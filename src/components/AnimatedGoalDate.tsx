import React, { useEffect, useState } from 'react';
import { Sparkles, Calendar, Clock, Trophy } from 'lucide-react';

interface AnimatedGoalDateProps {
  targetDateStr: string;
  totalDays: number;
  totalWeeks: number;
  className?: string;
}

export const AnimatedGoalDate: React.FC<AnimatedGoalDateProps> = ({
  targetDateStr,
  totalDays,
  totalWeeks,
  className = '',
}) => {
  const [displayedDays, setDisplayedDays] = useState<number>(0);
  const [displayedWeeks, setDisplayedWeeks] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [formattedDateText, setFormattedDateText] = useState<string>('');

  useEffect(() => {
    setIsDone(false);
    let startTime: number | null = null;
    const duration = 1800; // 1.8 seconds smooth animation
    const targetDaysVal = Math.max(1, totalDays);
    const targetWeeksVal = Math.max(1, totalWeeks);

    const now = new Date();
    const finalDate = new Date(now.getTime() + targetDaysVal * 24 * 60 * 60 * 1000);

    const stepAnimation = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Smooth cubic-bezier ease out: 1 - Math.pow(1 - progress, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentDays = Math.round(easeOut * targetDaysVal);
      const currentWeeks = Math.max(1, Math.round(easeOut * targetWeeksVal));
      
      const intermediateDate = new Date(now.getTime() + currentDays * 24 * 60 * 60 * 1000);
      
      setDisplayedDays(currentDays);
      setDisplayedWeeks(currentWeeks);
      setFormattedDateText(
        intermediateDate.toLocaleDateString('en-US', {
          weekday: progress > 0.8 ? 'long' : undefined,
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );

      if (progress < 1) {
        requestAnimationFrame(stepAnimation);
      } else {
        setDisplayedDays(targetDaysVal);
        setDisplayedWeeks(targetWeeksVal);
        setFormattedDateText(
          finalDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        );
        setIsDone(true);
      }
    };

    const animFrame = requestAnimationFrame(stepAnimation);
    return () => cancelAnimationFrame(animFrame);
  }, [targetDateStr, totalDays, totalWeeks]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>Milestone Horizon</span>
        </span>
        {isDone && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>100% Calculated</span>
          </span>
        )}
      </div>

      <div className="relative overflow-hidden py-1">
        <div
          className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-amber-300 transition-all duration-300 drop-shadow-sm font-sans ${
            !isDone ? 'scale-[1.02] text-amber-200 blur-[0.3px]' : 'scale-100'
          }`}
        >
          {formattedDateText || targetDateStr}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm text-emerald-100/90">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
          <Clock className="w-4 h-4 text-emerald-300" />
          <span className="font-extrabold text-white">{displayedWeeks} Weeks</span>
          <span className="text-emerald-200">({displayedDays} Days from Today)</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-[11px] text-emerald-200">
          <Calendar className="w-3.5 h-3.5 text-amber-300" />
          <span>Zero-Guesswork Timeline</span>
        </div>
      </div>
    </div>
  );
};
