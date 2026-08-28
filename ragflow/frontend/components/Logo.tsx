interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

const Logo = ({ className = "", variant = 'full' }: LogoProps) => {
  if (variant === 'icon') {
    return (
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="icon-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6"/>
          </linearGradient>
        </defs>
        
        {/* Rounded square border */}
        <rect x="4" y="4" width="56" height="56" rx="12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3"/>
        
        {/* R letter with arrow integrated */}
        <g transform="translate(16, 16)">
          <path 
            d="M4 4 L4 28 M4 4 L14 4 C18 4 18 10 14 10 L4 10 M14 10 L20 28" 
            stroke="url(#icon-gradient)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Play arrow accent */}
          <path d="M 20 14 L 28 18 L 20 22 Z" fill="currentColor" opacity="0.8"/>
        </g>
        
        {/* Chat bubble tail */}
        <path d="M 32 60 L 28 64 L 36 64 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
      </svg>
    );
  }

  return (
    <svg 
      width="140" 
      height="32" 
      viewBox="0 0 200 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="full-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      
      {/* Icon with border */}
      <rect x="2" y="2" width="36" height="36" rx="8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2"/>
      
      {/* R letter with arrow */}
      <g transform="translate(8, 8)">
        <path 
          d="M3 3 L3 21 M3 3 L11 3 C14 3 14 7.5 11 7.5 L3 7.5 M11 7.5 L15 21" 
          stroke="url(#full-gradient)" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        {/* Arrow accent */}
        <path d="M 15 11 L 22 14 L 15 17 Z" fill="currentColor" opacity="0.7"/>
      </g>
      
      {/* Text: RagFlow */}
      <text 
        x="48" 
        y="28" 
        fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif" 
        fontSize="24" 
        fontWeight="600" 
        fill="currentColor" 
        letterSpacing="-0.5"
      >
        RagFlow
      </text>
    </svg>
  );
};

export default Logo;

