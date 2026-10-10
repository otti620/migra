import React from 'react';

interface DangoteLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
}

export const DangoteLogo: React.FC<DangoteLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  variant = 'full'
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-xs', sub: 'text-[7px]' },
    md: { icon: 'w-9 h-9', text: 'text-sm', sub: 'text-[9px]' },
    lg: { icon: 'w-12 h-12', text: 'text-lg', sub: 'text-[11px]' },
    xl: { icon: 'w-16 h-16', text: 'text-2xl', sub: 'text-xs' }
  };

  const currentSize = sizeMap[size];

  // Official Dangote Eagle + Red Crescent Horizon Vector
  const IconElement = (
    <div className={`relative ${currentSize.icon} shrink-0 flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
        {/* Red Horizon Crescent Blaze (Symbol of Rebirth & Breakthrough) */}
        <path
          d="M10 72 C 30 88, 70 88, 90 72 C 75 80, 25 80, 10 72 Z"
          fill="#DC2626"
        />
        <path
          d="M16 66 C 35 78, 65 78, 84 66 C 70 72, 30 72, 16 66 Z"
          fill="#EF4444"
        />

        {/* Majestic Blue Dangote Eagle (Symbol of Strength, Clear Vision & Dynamism) */}
        {/* Left Wing */}
        <path
          d="M50 48 C 38 32, 20 28, 12 36 C 24 44, 34 50, 44 54 Z"
          fill="#1E40AF"
        />
        <path
          d="M48 52 C 34 40, 16 38, 8 48 C 22 52, 34 56, 42 58 Z"
          fill="#2563EB"
        />

        {/* Right Wing */}
        <path
          d="M50 48 C 62 32, 80 28, 88 36 C 76 44, 66 50, 56 54 Z"
          fill="#1E40AF"
        />
        <path
          d="M52 52 C 66 40, 84 38, 92 48 C 78 52, 66 56, 58 58 Z"
          fill="#2563EB"
        />

        {/* Central Eagle Body & Head */}
        <path
          d="M50 20 C 46 20, 44 24, 46 28 C 47 30, 49 32, 50 36 C 51 32, 53 30, 54 28 C 56 24, 54 20, 50 20 Z"
          fill="#1D4ED8"
        />
        {/* Eagle Beak & Eye Detail */}
        <polygon points="50,26 53,29 50,32" fill="#F59E0B" />
        <circle cx="48.5" cy="24.5" r="1" fill="#FFFFFF" />

        {/* Torso & Tail Feathers */}
        <path
          d="M45 36 C 45 48, 47 62, 50 68 C 53 62, 55 48, 55 36 Z"
          fill="#1E3A8A"
        />
        <path
          d="M44 64 L 50 74 L 56 64 Z"
          fill="#1D4ED8"
        />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{IconElement}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {IconElement}
      <div className="flex flex-col justify-center">
        <div className={`font-black tracking-[0.18em] text-white leading-none ${currentSize.text} flex items-center gap-1.5`}>
          <span>DANGOTE</span>
          {size === 'lg' || size === 'xl' ? (
            <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded tracking-normal">
              REFINERY
            </span>
          ) : null}
        </div>
        {showSubtitle && (
          <span className={`font-bold text-amber-400 tracking-wider block mt-0.5 uppercase ${currentSize.sub}`}>
            Petroleum Refinery PLC
          </span>
        )}
      </div>
    </div>
  );
};
