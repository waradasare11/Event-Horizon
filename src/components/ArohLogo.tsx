import React from 'react';

interface ArohLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  hideSubtitleBelow1100?: boolean;
}

export const ArohLogo: React.FC<ArohLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  hideSubtitleBelow1100 = false,
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { img: 'w-10 h-10', text: 'text-xl', sub: 'text-[11px]' },
    lg: { img: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm' },
  };

  const { img, text, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Vortex Logo Container - Cosmic Navy & Electric Blue */}
      <div className={`relative ${img} shrink-0 group`}>
        {/* Ambient Electric Blue Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#3B82F6]/40 via-[#60A5FA]/30 to-[#3B82F6]/40 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Logo Image without CSS filter */}
        <img
          src="/aroh-logo.png"
          alt="AROH Smart Fitness Logo"
          referrerPolicy="no-referrer"
          className="relative w-full h-full rounded-xl object-cover border border-[#3B82F6]/50 shadow-lg shadow-[#3B82F6]/20 bg-[#0B1220]"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-wider ${text} text-[#2563EB] dark:text-[#60A5FA] font-['Space_Grotesk',sans-serif]`}>
              AROH
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#0B1220] border border-[#3B82F6] text-[#60A5FA] tracking-wider">
              SMART
            </span>
          </div>
          <span className={`text-[#8BA3C7] font-medium tracking-widest uppercase mt-0.5 ${sub} ${hideSubtitleBelow1100 ? 'hidden min-[1100px]:block' : ''}`}>
            Smart Fitness
          </span>
        </div>
      )}
    </div>
  );
};
