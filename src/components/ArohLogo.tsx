import React from 'react';

interface ArohLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const ArohLogo: React.FC<ArohLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
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
      {/* Cosmic Glowing Vortex Logo Container */}
      <div className={`relative ${img} shrink-0 group`}>
        {/* Ambient Neon Pulse Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/40 via-purple-600/40 to-indigo-500/40 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Logo Image */}
        <img
          src="/aroh-logo.png"
          alt="AROH Smart Fitness Logo"
          referrerPolicy="no-referrer"
          className="relative w-full h-full rounded-xl object-cover border border-cyan-400/40 shadow-lg shadow-cyan-500/20"
        />

        {/* Small 4-point sparkle accent */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-cyan-300 pointer-events-none opacity-80">
          ✦
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-wider ${text} bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-400 bg-clip-text text-transparent font-['Space_Grotesk',sans-serif]`}>
              AROH
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 tracking-wider">
              SMART
            </span>
          </div>
          <span className={`text-[#94A3B8] dark:text-[#A5B4FC] font-medium tracking-widest uppercase mt-0.5 ${sub}`}>
            Smart Fitness
          </span>
        </div>
      )}
    </div>
  );
};
