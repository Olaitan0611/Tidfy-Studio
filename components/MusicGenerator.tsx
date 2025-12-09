import React, { useState, useRef, useEffect } from 'react';
import Spinner from './Spinner';
import { generateMusic } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { SparklesIcon, ExclamationTriangleIcon, PlayIcon, PauseIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/24/solid';
import { MusicGenre, MusicMood, MusicInstrument, MUSIC_GENRES, MUSIC_MOODS, MUSIC_INSTRUMENTS } from '../types';

interface MusicHistoryItem {
    audioData: string;
    prompt: string;
    genre: MusicGenre;
    mood: MusicMood;
    instrument: MusicInstrument;
}

const LOCAL_STORAGE_KEY = 'tidfy-music-history';

const MusicGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [genre, setGenre] = useState<MusicGenre>('Amapiano');
    const [mood, setMood] = useState<MusicMood>('Energetic');
    const [instrument, setInstrument] = useState<MusicInstrument>('Log Drum');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [musicData, setMusicData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<MusicHistoryItem[]>([]);
    
    // Playback state
    const [activePlayingSource, setActivePlayingSource] = useState<'main' | 'history' | null>(null);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState<number | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        try {
            const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedHistory) setHistory(JSON.parse(savedHistory));
        } catch (e) {
            console.error("Failed to load music history from localStorage", e);
        }
        
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const stopAudio = () => {
        if(audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
            audioSourceRef.current = null;
        }
        setActivePlayingSource(null);
        setActiveHistoryIndex(null);
    };

    const playAudio = async (base64Audio: string, source: 'main' | 'history', index: number | null = null) => {
        if (!audioContextRef.current) return;
        
        stopAudio();

        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        try {
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContextRef.current,
                24000,
                1,
            );
            const sourceNode = audioContextRef.current.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.connect(audioContextRef.current.destination);
            sourceNode.onended = stopAudio;
            sourceNode.start();
            audioSourceRef.current = sourceNode;
            setActivePlayingSource(source);
            if(source === 'history') {
                setActiveHistoryIndex(index);
            }
        } catch (e) {
            console.error("Error playing audio:", e);
            setError("Could not play audio file.");
        }
    };
    
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please describe the music you want to create.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMusicData(null);
        stopAudio();
        
        try {
            const data = await generateMusic({ prompt, genre, mood, instrument });
            setMusicData(data);
            
            setHistory(prev => {
                const newHistoryItem = { audioData: data, prompt, genre, mood, instrument };
                const newHistory = [newHistoryItem, ...prev].slice(0, 20);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
                return newHistory;
            });

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while generating music.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearHistory = () => {
        stopAudio();
        setHistory([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    const handleHistoryPlay = (item: MusicHistoryItem, index: number) => {
        if (activePlayingSource === 'history' && activeHistoryIndex === index) {
            stopAudio();
        } else {
            playAudio(item.audioData, 'history', index);
        }
    };

    const handleHistoryReuse = (item: MusicHistoryItem) => {
        setPrompt(item.prompt);
        setGenre(item.genre);
        setMood(item.mood);
        setInstrument(item.instrument);
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Panel: Controls */}
            <div className="space-y-6">
                 <div>
                    <label htmlFor="prompt-music" className="block text-sm font-medium text-text-primary mb-2">Description</label>
                     <textarea
                        id="prompt-music"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Fast-paced beat for a travel vlog intro..."
                        className="w-full h-28 p-4 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition resize-none text-lg"
                        disabled={isLoading}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="genre-music" className="block text-sm font-medium text-text-primary mb-2">Genre</label>
                        <select
                            id="genre-music"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value as MusicGenre)}
                            disabled={isLoading}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            {MUSIC_GENRES.map(g => <option key={g.value} value={g.value}>{g.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="mood-music" className="block text-sm font-medium text-text-primary mb-2">Mood</label>
                        <select
                            id="mood-music"
                            value={mood}
                            onChange={(e) => setMood(e.target.value as MusicMood)}
                            disabled={isLoading}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            {MUSIC_MOODS.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="instrument-music" className="block text-sm font-medium text-text-primary mb-2">Instrument</label>
                        <select
                            id="instrument-music"
                            value={instrument}
                            onChange={(e) => setInstrument(e.target.value as MusicInstrument)}
                            disabled={isLoading}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            {MUSIC_INSTRUMENTS.map(i => <option key={i.value} value={i.value}>{i.name}</option>)}
                        </select>
                    </div>
                </div>

                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full bg-secondary hover:bg-secondary-hover disabled:bg-secondary/20 disabled:cursor-not-allowed text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300"
                >
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                    {isLoading ? 'Composing Beat...' : 'Generate Music'}
                </button>
            </div>
            {/* Right Panel: History & Output */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-text-primary">Generation History</h3>
                    {history.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            className="text-text-secondary hover:text-text-primary transition-colors flex items-center text-sm"
                            title="Clear history"
                            disabled={isLoading}
                        >
                            <TrashIcon className="w-4 h-4 mr-1.5" />
                            Clear
                        </button>
                    )}
                </div>
                {history.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2 bg-surface-input/50 p-4 rounded-lg">
                        {history.map((item, index) => (
                            <div key={index} className="bg-surface/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary truncate font-medium" title={item.prompt}>{item.prompt}</p>
                                    <p className="text-xs text-text-secondary">{`${item.genre} • ${item.mood} • ${item.instrument}`}</p>
                                </div>
                                <div className="flex items-center ml-4">
                                    <button
                                        onClick={() => handleHistoryReuse(item)}
                                        className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                                        title="Reuse settings"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleHistoryPlay(item, index)}
                                        className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                                        title="Play audio"
                                    >
                                        {activePlayingSource === 'history' && activeHistoryIndex === index ? (
                                            <PauseIcon className="w-5 h-5 text-secondary" />
                                        ) : (
                                            <PlayIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-sm text-text-tertiary py-4 px-2 bg-surface-input/50 rounded-lg">
                        <p>Your generated music will appear here.</p>
                    </div>
                )}

                {error && (
                    <div className="flex items-center p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                        <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                
                {musicData && !isLoading && (
                    <div className="flex justify-center items-center bg-surface-input/50 border-2 border-border p-6 rounded-xl">
                         <button onClick={() => activePlayingSource === 'main' ? stopAudio() : playAudio(musicData, 'main')} className="bg-secondary p-4 rounded-full text-text-on-secondary hover:bg-secondary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary">
                            {activePlayingSource === 'main' ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                        </button>
                        <div className="ml-6 text-lg font-medium">
                            <p>{activePlayingSource === 'main' ? 'Playing...' : 'Latest Track Ready'}</p>
                            <p className="text-sm text-text-secondary">Click to play/pause</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MusicGenerator;
