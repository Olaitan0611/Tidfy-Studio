import React from 'react';
import { FilmIcon } from '@heroicons/react/24/solid';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 bg-gray-950/50 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto py-4 px-4 sm:px-6 md:px-8">
        <div className="flex items-center space-x-3">
          <FilmIcon className="h-8 w-8 text-indigo-500" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tid<span className="text-indigo-400">fy</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
