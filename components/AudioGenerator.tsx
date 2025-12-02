import React, { useState, useRef, useEffect } from 'react';
import Spinner from './Spinner';
import { generateAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { SparklesIcon, ExclamationTriangleIcon, PlayIcon, PauseIcon, ArrowPathIcon, TrashIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { AudioVoice, AUDIO_VOICES } from '../types';

interface AudioHistoryItem {
    audioData: string;
    prompt: string;
    voice: AudioVoice;
}

const LOCAL_STORAGE_KEY = 'tidfy-audio-history';

const AudioGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [voice, setVoice] = useState<AudioVoice>('Zephyr');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [audioData, setAudioData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<AudioHistoryItem[]>([]);
    
    // Playback state
    const [activePlayingSource, setActivePlayingSource] = useState<'main' | 'history' | null>(null);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState<number | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        try {
            const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load audio history", e);
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
            setError('Please enter some text to generate audio.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAudioData(null);
        stopAudio();
        
        try {
            const data = await generateAudio(prompt, voice);
            setAudioData(data);
            
            setHistory(prev => {
                const newHistory = [{ audioData: data, prompt, voice }, ...prev].slice(0, 20);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
                return newHistory;
            });

            await playAudio(data, 'main');
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while generating audio.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClearHistory = () => {
        stopAudio();
        setHistory([]);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    const handleHistoryPlay = (item: AudioHistoryItem, index: number) => {
        if (activePlayingSource === 'history' && activeHistoryIndex === index) {
            stopAudio();
        } else {
            playAudio(item.audioData, 'history', index);
        }
    };

    const handleHistoryReuse = (item: AudioHistoryItem) => {
        setPrompt(item.prompt);
        setVoice(item.voice);
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Panel: Controls */}
            <div className="space-y-6">
                 <div>
                    <label htmlFor="prompt-audio" className="block text-sm font-medium text-gray-300 mb-2">Text</label>
                     <textarea
                        id="prompt-audio"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter text to convert to speech..."
                        className="w-full h-36 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none text-lg"
                        disabled={isLoading}
                    />
                </div>
                 <div>
                    <label htmlFor="voice-audio" className="block text-sm font-medium text-gray-300 mb-2">Voice</label>
                    <select
                        id="voice-audio"
                        value={voice}
                        onChange={(e) => setVoice(e.target.value as AudioVoice)}
                        disabled={isLoading}
                        className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-white"
                    >
                        {AUDIO_VOICES.map(v => <option key={v.value} value={v.value}>{v.name}</option>)}
                    </select>
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
                >
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                    {isLoading ? 'Synthesizing Audio...' : 'Generate Audio'}
                </button>
            </div>
            {/* Right Panel: History & Output */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-200">Generation History</h3>
                    {history.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
                            title="Clear history"
                            disabled={isLoading}
                        >
                            <TrashIcon className="w-4 h-4 mr-1.5" />
                            Clear
                        </button>
                    )}
                </div>
                {history.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2 bg-gray-800/50 p-4 rounded-lg">
                        {history.map((item, index) => (
                            <div key={index} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate font-medium" title={item.prompt}>{item.prompt}</p>
                                    <p className="text-xs text-gray-400">{AUDIO_VOICES.find(v => v.value === item.voice)?.name}</p>
                                </div>
                                <div className="flex items-center ml-4">
                                    <button
                                        onClick={() => handleHistoryReuse(item)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                        title="Reuse prompt and voice"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleHistoryPlay(item, index)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                        title="Play audio"
                                    >
                                        {activePlayingSource === 'history' && activeHistoryIndex === index ? (
                                            <PauseIcon className="w-5 h-5 text-cyan-400" />
                                        ) : (
                                            <PlayIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-sm text-gray-500 py-4 px-2 bg-gray-800/50 rounded-lg">
                        <p>Your previous generations will appear here.</p>
                    </div>
                )}

                {error && (
                    <div className="flex items-center p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                        <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                
                {audioData && !isLoading && (
                    <div className="flex justify-center items-center bg-gray-800/50 border-2 border-gray-700 p-6 rounded-xl">
                         <button onClick={() => activePlayingSource === 'main' ? stopAudio() : playAudio(audioData, 'main')} className="bg-cyan-500 p-4 rounded-full text-white hover:bg-cyan-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500">
                            {activePlayingSource === 'main' ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                        </button>
                        <div className="ml-6 text-lg font-medium">
                            <p>{activePlayingSource === 'main' ? 'Playing...' : 'Latest Audio Ready'}</p>
                            <p className="text-sm text-gray-400">Click to play/pause</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioGenerator;