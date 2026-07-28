import React, { useState, useRef, useEffect } from 'react';
import Spinner from './Spinner';
import { generateAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { SparklesIcon, ExclamationTriangleIcon, PlayIcon, PauseIcon, ArrowPathIcon, TrashIcon, SpeakerWaveIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { WovenBasketUploadIcon } from './CustomIcons';
import { AudioVoice, AUDIO_VOICES } from '../types';

interface AudioHistoryItem {
    audioData: string;
    prompt: string;
    voice: string; // Store the full voice name
    rate: number;
    pitch: number;
}

const LOCAL_STORAGE_KEY = 'tidfy-audio-history';
const CLONED_VOICE_FLAG_KEY = 'tidfy-voice-cloned';
const CLONED_VOICE_NAME_KEY = 'tidfy-voice-name';
const CLONE_VOICE_NAME = '✨ Clone My Voice';


const AudioGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [voice, setVoice] = useState<string>('Chidinma (Nigerian Female)'); // Store full name
    const [rate, setRate] = useState<number>(1);
    const [pitch, setPitch] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
    const [audioData, setAudioData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<AudioHistoryItem[]>([]);
    
    // Voice Cloning State
    const [isVoiceCloned, setIsVoiceCloned] = useState<boolean>(false);
    const [clonedSampleName, setClonedSampleName] = useState<string | null>(null);
    const [isCloning, setIsCloning] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
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

            const clonedFlag = localStorage.getItem(CLONED_VOICE_FLAG_KEY);
            const clonedName = localStorage.getItem(CLONED_VOICE_NAME_KEY);
            if (clonedFlag === 'true' && clonedName) {
                setIsVoiceCloned(true);
                setClonedSampleName(clonedName);
            }
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
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
        
        const selectedVoiceOption = AUDIO_VOICES.find(v => v.name === voice);
        if (!selectedVoiceOption) {
            setError("Invalid voice selected. Please choose another.");
            return;
        }
        
        if (selectedVoiceOption.value === 'CLONED_VOICE' && !isVoiceCloned) {
            setError('Please upload an audio sample to clone a voice first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAudioData(null);
        stopAudio();
        
        try {
            const generationVoice = selectedVoiceOption.value;
            const data = await generateAudio({ prompt, voice: generationVoice, rate, pitch });
            setAudioData(data);
            
            setHistory(prev => {
                const newHistory = [{ audioData: data, prompt, voice, rate, pitch }, ...prev].slice(0, 20);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
                return newHistory;
            });

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while generating audio.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreview = async () => {
        const selectedVoiceOption = AUDIO_VOICES.find(v => v.name === voice);
        if (!selectedVoiceOption) {
            setError("Invalid voice selected.");
            return;
        }
        if (selectedVoiceOption.value === 'CLONED_VOICE' && !isVoiceCloned) {
            setError('Please upload a sample to preview a cloned voice.');
            return;
        }

        setIsPreviewing(true);
        setError(null);
        
        try {
            const previewText = "Hello, this is a preview of my voice at the current settings.";
            const generationVoice = selectedVoiceOption.value;
            const data = await generateAudio({ 
                prompt: previewText, 
                voice: generationVoice, 
                rate, 
                pitch 
            });
            await playAudio(data, 'main');
        } catch (err: any) {
            setError(err.message || 'Could not generate preview.');
        } finally {
            setIsPreviewing(false);
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
        setRate(item.rate);
        setPitch(item.pitch);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setIsCloning(true);
        
        // Simulate cloning process
        setTimeout(() => {
            setIsCloning(false);
            setIsVoiceCloned(true);
            setClonedSampleName(file.name);
            localStorage.setItem(CLONED_VOICE_FLAG_KEY, 'true');
            localStorage.setItem(CLONED_VOICE_NAME_KEY, file.name);
        }, 3000);
    };

    const handleRemoveClonedVoice = () => {
        setIsVoiceCloned(false);
        setClonedSampleName(null);
        localStorage.removeItem(CLONED_VOICE_FLAG_KEY);
        localStorage.removeItem(CLONED_VOICE_NAME_KEY);
        setVoice('Chidinma (Nigerian Female)'); // Revert to a default voice
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Panel: Controls */}
            <div className="space-y-6">
                 <div>
                    <label htmlFor="prompt-audio" className="block text-sm font-medium text-text-primary mb-2">Text</label>
                     <textarea
                        id="prompt-audio"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter text to convert to speech..."
                        className="w-full h-28 p-4 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition resize-none text-base"
                        disabled={isLoading || isCloning || isPreviewing}
                    />
                </div>
                 <div>
                    <label htmlFor="voice-audio" className="block text-sm font-medium text-text-primary mb-2">Voice</label>
                    <select
                        id="voice-audio"
                        value={voice}
                        onChange={(e) => setVoice(e.target.value)}
                        disabled={isLoading || isCloning || isPreviewing}
                        className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                    >
                        {AUDIO_VOICES.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="rate-audio" className="block text-sm font-medium text-text-primary mb-2">
                            Speech Rate <span className="text-text-tertiary font-normal">({rate.toFixed(1)}x)</span>
                        </label>
                        <input
                            id="rate-audio"
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            disabled={isLoading || isCloning || isPreviewing}
                            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-secondary"
                        />
                    </div>
                    <div>
                        <label htmlFor="pitch-audio" className="block text-sm font-medium text-text-primary mb-2">
                            Pitch <span className="text-text-tertiary font-normal">({pitch > 0 ? '+' : ''}{pitch.toFixed(1)})</span>
                        </label>
                        <input
                            id="pitch-audio"
                            type="range"
                            min="-20"
                            max="20"
                            step="1"
                            value={pitch}
                            onChange={(e) => setPitch(parseFloat(e.target.value))}
                            disabled={isLoading || isCloning || isPreviewing}
                            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-secondary"
                        />
                    </div>
                </div>


                {voice === CLONE_VOICE_NAME && (
                    <div className="p-4 bg-surface-input/50 rounded-lg border-2 border-dashed border-border transition-all duration-300">
                        {!isVoiceCloned && !isCloning && (
                            <div className="text-center">
                                <WovenBasketUploadIcon className="w-10 h-10 mx-auto text-text-secondary mb-2" />
                                <h4 className="font-semibold text-text-primary">Upload Audio Sample</h4>
                                <p className="text-xs text-text-tertiary mb-4">WAV or MP3, max 1 minute, clear voice.</p>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} hidden accept="audio/wav, audio/mpeg" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-surface hover:bg-border text-text-primary font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                                >
                                    Choose File
                                </button>
                            </div>
                        )}
                        {isCloning && (
                            <div className="flex flex-col items-center justify-center p-4">
                                <Spinner className="w-8 h-8"/>
                                <p className="mt-3 text-text-secondary font-medium">Cloning voice...</p>
                            </div>
                        )}
                        {isVoiceCloned && !isCloning && (
                            <div className="flex items-center justify-between">
                                <div className='flex items-center min-w-0'>
                                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-text-primary truncate" title={clonedSampleName ?? undefined}>
                                           {clonedSampleName}
                                        </p>
                                        <p className="text-xs text-green-400">Voice ready to use</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRemoveClonedVoice}
                                    className="p-2 text-text-tertiary hover:text-red-500 transition-colors"
                                    title="Remove cloned voice"
                                >
                                    <XCircleIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                 <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handlePreview}
                        disabled={isLoading || isCloning || isPreviewing}
                        className="flex items-center justify-center w-full sm:w-1/3 border-2 border-secondary hover:bg-secondary/10 disabled:border-secondary/20 disabled:text-text-tertiary disabled:cursor-not-allowed text-secondary font-bold py-3 px-4 rounded-lg transition-all duration-300"
                    >
                        {isPreviewing ? <Spinner className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6 mr-2" />}
                        {isPreviewing ? 'Generating...' : 'Preview'}
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || isCloning || isPreviewing}
                        className="flex items-center justify-center w-full sm:w-2/3 bg-secondary hover:bg-secondary-hover disabled:bg-secondary/20 disabled:cursor-not-allowed text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300"
                    >
                        {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                        {isLoading ? 'Synthesizing...' : 'Generate Audio'}
                    </button>
                </div>
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
                        {history.map((item, index) => {
                            const voiceName = item.voice === CLONE_VOICE_NAME
                                ? 'Cloned Voice'
                                : item.voice;

                            return (
                                <div key={index} className="bg-surface/50 p-3 rounded-lg flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-text-primary truncate font-medium" title={item.prompt}>{item.prompt}</p>
                                        <p className="text-xs text-text-secondary">{`${voiceName} · Rate: ${item.rate.toFixed(1)} · Pitch: ${item.pitch.toFixed(1)}`}</p>
                                    </div>
                                    <div className="flex items-center ml-4">
                                        <button
                                            onClick={() => handleHistoryReuse(item)}
                                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                                            title="Reuse settings"
                                            disabled={isCloning || isPreviewing}
                                        >
                                            <ArrowPathIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleHistoryPlay(item, index)}
                                            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                                            title="Play audio"
                                            disabled={isCloning || isPreviewing}
                                        >
                                            {activePlayingSource === 'history' && activeHistoryIndex === index ? (
                                                <PauseIcon className="w-5 h-5 text-secondary" />
                                            ) : (
                                                <PlayIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                     <div className="text-center text-sm text-text-tertiary py-4 px-2 bg-surface-input/50 rounded-lg">
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
                    <div className="flex justify-center items-center bg-surface-input/50 border-2 border-border p-6 rounded-xl">
                         <button onClick={() => activePlayingSource === 'main' ? stopAudio() : playAudio(audioData, 'main')} className="bg-secondary p-4 rounded-full text-text-on-secondary hover:bg-secondary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary">
                            {activePlayingSource === 'main' ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                        </button>
                        <div className="ml-6 text-lg font-medium">
                            <p>{activePlayingSource === 'main' ? 'Playing...' : 'Latest Audio Ready'}</p>
                            <p className="text-sm text-text-secondary">Click to play/pause</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioGenerator;