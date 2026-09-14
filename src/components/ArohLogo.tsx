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
      {/* Brand Vortex Logo Container - Black & Gold Theme */}
      <div className={`relative ${img} shrink-0 group`}>
        {/* Ambient Gold Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/30 via-yellow-500/25 to-amber-600/30 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Logo Image */}
        <img
          src="/aroh-logo.png"
          alt="AROH Smart Fitness Logo"
          referrerPolicy="no-referrer"
          className="relative w-full h-full rounded-xl object-cover border border-amber-400/40 shadow-lg shadow-amber-500/10 bg-black"
        />

        {/* Small gold star accent */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-amber-400 pointer-events-none opacity-90">
          ✦
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-wider ${text} bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent font-['Space_Grotesk',sans-serif]`}>
              AROH
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 tracking-wider">
              SMART
            </span>
          </div>
          <span className={`text-[#A1A1AA] dark:text-[#D4AF37] font-medium tracking-widest uppercase mt-0.5 ${sub}`}>
            Smart Fitness
          </span>
        </div>
      )}
    </div>
  );
};
