import React from 'react';
import Logo from './Logo';
import { WifiIcon, SignalSlashIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { KenteCogIcon } from './CustomIcons';
import { auth, signOut } from '../firebase';

interface HeaderProps {
  onSettingsClick: () => void;
  onLoginClick?: () => void;
  isOnline: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick, onLoginClick, isOnline }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background/50 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-screen-2xl mx-auto py-3 px-4 sm:px-6 md:px-8 flex justify-between items-center">
        <Logo className="h-9" />
        <div className="flex items-center space-x-4">
            <div 
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isOnline 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-red-500/10 text-red-400'
              }`}
              title={isOnline ? 'You are online' : 'You are offline. Some features may be unavailable.'}
            >
                {isOnline ? <WifiIcon className="h-4 w-4" /> : <SignalSlashIcon className="h-4 w-4" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <button
                onClick={onSettingsClick}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-input transition-colors"
                aria-label="Open settings"
            >
                <KenteCogIcon className="h-6 w-6" />
            </button>
            {auth.currentUser ? (
              <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full text-text-secondary hover:text-red-400 hover:bg-surface-input transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
              >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            ) : (
              <button
                  onClick={onLoginClick}
                  className="px-4 py-2 rounded-lg bg-secondary text-white font-medium hover:bg-secondary-hover transition-colors text-sm"
              >
                  Log In / Sign Up
              </button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;