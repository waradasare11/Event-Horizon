import React from 'react';

interface ArohBrandTextProps {
  className?: string;
  suffix?: string;
  showBadge?: boolean;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const ArohBrandText: React.FC<ArohBrandTextProps> = ({
  className = '',
  suffix = '',
  showBadge = false,
  size = 'base',
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl sm:text-4xl',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 align-baseline ${className}`}>
      <span
        className={`font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent font-['Space_Grotesk',sans-serif] ${sizeClasses[size]}`}
      >
        AROH
      </span>
      {suffix && (
        <span className={`font-bold text-slate-800 dark:text-slate-100 ${sizeClasses[size]}`}>
          {suffix}
        </span>
      )}
      {showBadge && (
        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 tracking-wider font-['Space_Grotesk',sans-serif]">
          SMART
        </span>
      )}
    </span>
  );
};
