
import React from 'react';

interface SpinnerProps {
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <span className={`animate-indigo-ripple ${className}`}></span>
  );
};

export default Spinner;