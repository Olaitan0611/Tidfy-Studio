
import React, { useState, useRef, useEffect } from 'react';
import Spinner from './Spinner';
import { generateAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { SparklesIcon, ExclamationTriangleIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { AudioVoice, AUDIO_VOICES } from '../types';

const AudioGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [voice, setVoice] = useState<AudioVoice>('Zephyr');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [audioData, setAudioData] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const playAudio = async (base64Audio: string) => {
        if (!audioContextRef.current) return;
        
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }

        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            audioContextRef.current,
            24000,
            1,
        );
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
            setIsPlaying(false);
            audioSourceRef.current = null;
        }
        source.start();
        audioSourceRef.current = source;
        setIsPlaying(true);
    };
    
    const stopAudio = () => {
        if(audioSourceRef.current) {
            audioSourceRef.current.stop();
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
            await playAudio(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while generating audio.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            stopAudio();
        } else if (audioData) {
            playAudio(audioData);
        }
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="space-y-6">
                 <div>
                    <label htmlFor="prompt-audio" className="block text-sm font-medium text-gray-300 mb-2">Text</label>
                     <textarea
                        id="prompt-audio"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter text to convert to speech..."
                        className="w-full h-36 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none text-lg"
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
                        className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white"
                    >
                        {AUDIO_VOICES.map(v => <option key={v.value} value={v.value}>{v.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 w-full sm:w-auto"
                >
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                    {isLoading ? 'Synthesizing Audio...' : 'Generate Audio'}
                </button>
            </div>

            {error && (
                <div className="flex items-center p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            
            {audioData && !isLoading && (
                <div className="flex justify-center items-center bg-gray-800/50 border-2 border-gray-700 p-6 rounded-xl">
                    <button onClick={handlePlayPause} className="bg-indigo-500 p-4 rounded-full text-white hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                        {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8"/>}
                    </button>
                    <div className="ml-6 text-lg font-medium">
                        <p>{isPlaying ? 'Playing...' : 'Audio Ready'}</p>
                        <p className="text-sm text-gray-400">Click to play/pause</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioGenerator;