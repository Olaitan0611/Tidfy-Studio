import React, { useState } from 'react';
import Spinner from './Spinner';
import { generateMusic } from '../services/geminiService';
import { MusicGenre, MusicMood, MusicInstrument, MUSIC_GENRES, MUSIC_MOODS, MUSIC_INSTRUMENTS } from '../types';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface MusicGenerationModalProps {
  onClose: () => void;
  onMusicGenerated: (audioData: string, prompt: string) => void;
}

const MusicGenerationModal: React.FC<MusicGenerationModalProps> = ({ onClose, onMusicGenerated }) => {
    const [prompt, setPrompt] = useState<string>('Energetic Amapiano beat for a travel video');
    const [genre, setGenre] = useState<MusicGenre>('Amapiano');
    const [mood, setMood] = useState<MusicMood>('Energetic');
    const [instrument, setInstrument] = useState<MusicInstrument>('Log Drum');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please describe the music you want to create.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await generateMusic({ prompt, genre, mood, instrument });
            onMusicGenerated(data, prompt);
            onClose();
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slideUpFadeIn space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text-primary">Generate Custom Music</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-surface-input">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="space-y-4 pt-4 border-t border-border">
                     <div>
                        <label htmlFor="prompt-music-modal" className="block text-sm font-medium text-text-primary mb-2">Description</label>
                        <textarea
                            id="prompt-music-modal"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-24 p-4 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition resize-none text-base"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="genre-music-modal" className="block text-sm font-medium text-text-primary mb-2">Genre</label>
                            <select id="genre-music-modal" value={genre} onChange={(e) => setGenre(e.target.value as MusicGenre)} disabled={isLoading} className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition">
                                {MUSIC_GENRES.map(g => <option key={g.value} value={g.value}>{g.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="mood-music-modal" className="block text-sm font-medium text-text-primary mb-2">Mood</label>
                            <select id="mood-music-modal" value={mood} onChange={(e) => setMood(e.target.value as MusicMood)} disabled={isLoading} className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition">
                                {MUSIC_MOODS.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="instrument-music-modal" className="block text-sm font-medium text-text-primary mb-2">Instrument</label>
                            <select id="instrument-music-modal" value={instrument} onChange={(e) => setInstrument(e.target.value as MusicInstrument)} disabled={isLoading} className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition">
                                {MUSIC_INSTRUMENTS.map(i => <option key={i.value} value={i.value}>{i.name}</option>)}
                            </select>
                        </div>
                    </div>
                     {error && (
                        <div className="flex items-center p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-secondary hover:bg-secondary-hover disabled:bg-secondary/20 disabled:cursor-not-allowed text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300"
                >
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                    {isLoading ? 'Composing...' : 'Generate & Add to Video'}
                </button>
            </div>
        </div>
    );
};

export default MusicGenerationModal;
