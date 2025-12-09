import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      className={`${
        checked ? 'bg-secondary' : 'bg-surface'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background`}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'en' | 'sw';
    setLanguage: (lang: 'en' | 'sw') => void;
    lowBandwidth: boolean;
    setLowBandwidth: (val: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, language, setLanguage, lowBandwidth, setLowBandwidth }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slideUpFadeIn space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">Settings & Accessibility</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-surface-input">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-border">
                    {/* Language Settings */}
                    <div>
                        <label htmlFor="language-select" className="block text-sm font-medium text-text-primary mb-2">
                            App Language
                        </label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'en' | 'sw')}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            <option value="en">English</option>
                            <option value="sw">Kiswahili</option>
                        </select>
                         <p className="text-xs text-text-tertiary mt-1">More languages like Yoruba and Zulu are coming soon.</p>
                    </div>

                    {/* Low Bandwidth Mode */}
                    <div className="flex items-center justify-between p-3 bg-surface-input rounded-lg">
                        <div>
                           <p className="font-medium text-text-primary">Low-Bandwidth Mode</p>
                           <p className="text-sm text-text-secondary">Optimizes for slower connections.</p>
                        </div>
                        <Toggle checked={lowBandwidth} onChange={setLowBandwidth} />
                    </div>

                    {/* Offline Mode Info */}
                     <div className="p-4 bg-surface-input/50 rounded-lg border border-border">
                        <h4 className="font-semibold text-text-primary mb-1">Offline Access</h4>
                        <p className="text-sm text-text-secondary">
                            You can continue working on your text-based projects like scripts even when offline. Media generation requires an active internet connection. Your work will sync automatically when you reconnect.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full bg-secondary hover:bg-secondary-hover text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default SettingsModal;
