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
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37]/40 via-[#F0D060]/30 to-[#D4AF37]/40 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Logo Image */}
        <img
          src="/aroh-logo.png"
          alt="AROH Smart Fitness Logo"
          referrerPolicy="no-referrer"
          className="relative w-full h-full rounded-xl object-cover border border-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/20 bg-[#070707]"
        />

        {/* Small gold star accent */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 text-[#F0D060] pointer-events-none opacity-90">
          ✦
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-extrabold tracking-wider ${text} text-[#D4AF37] font-['Space_Grotesk',sans-serif]`}>
              AROH
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#070707] border border-[#D4AF37] text-[#D4AF37] tracking-wider">
              SMART
            </span>
          </div>
          <span className={`text-[#9A8F78] dark:text-[#D4AF37] font-medium tracking-widest uppercase mt-0.5 ${sub}`}>
            Smart Fitness
          </span>
        </div>
      )}
    </div>
  );
};
