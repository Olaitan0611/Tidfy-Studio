import React from 'react';
import Logo from './Logo';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-background/50 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-screen-2xl mx-auto py-3 px-4 sm:px-6 md:px-8">
        <Logo className="h-9" />
      </div>
    </header>
  );
};

export default Header;