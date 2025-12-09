import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-full w-auto"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} /> 
            <stop offset="100%" style={{ stopColor: '#F472B6', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path
          d="M10,0 H30 A10,10 0 0 1 40,10 V30 A10,10 0 0 1 30,40 H10 A10,10 0 0 1 0,30 V10 A10,10 0 0 1 10,0 z"
          className="fill-secondary"
        />
        <path
          d="M12,8 H28 V14 H12 z M18,14 V32 H22 V14 z"
          fill="url(#grad1)"
        />
         <path 
            d="M20, 21 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0"
            className="fill-background"
        />
         <path 
            d="M20, 21 m -2, 0 a 2,2 0 1,0 4,0 a 2,2 0 1,0 -4,0"
            className="fill-secondary"
        />
      </svg>
      <span className="text-3xl font-bold tracking-tight text-text-primary">
        Tid<span className="text-primary">fy</span>
      </span>
    </div>
  );
};

export default Logo;