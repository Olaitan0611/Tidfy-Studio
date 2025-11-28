
import React, { useState, useEffect, useRef } from 'react';
import ApiKeySelector from './ApiKeySelector';
import Spinner from './Spinner';
import { generateVideo, VideoGenerationOptions } from '../services/geminiService';
import { SparklesIcon, ExclamationTriangleIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { VideoAspectRatio, VideoResolution, VIDEO_ASPECT_RATIOS, VIDEO_RESOLUTIONS } from '../types';

const loadingMessages = [
    "Summoning digital spirits...",
    "Choreographing pixels...",
    "Rendering your vision into reality...",
    "This might take a few moments, great art needs time...",
    "Assembling the cinematic dream...",
    "The AI is painting with light and motion...",
];

const VideoGenerator: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [resolution, setResolution] = useState<VideoResolution>('720p');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentMessage, setCurrentMessage] = useState<string>(loadingMessages[0]);

    const messageInterval = useRef<number | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            } else {
                setApiKeySelected(true);
            }
        };
        checkApiKey();
    }, []);

    useEffect(() => {
        if (isLoading) {
            messageInterval.current = window.setInterval(() => {
                setCurrentMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 3000);
        } else if (messageInterval.current) {
            clearInterval(messageInterval.current);
            messageInterval.current = null;
        }

        return () => {
            if (messageInterval.current) {
                clearInterval(messageInterval.current);
            }
        };
    }, [isLoading]);


    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        try {
            const options: VideoGenerationOptions = { prompt, aspectRatio, resolution };
            const url = await generateVideo(options);
            setVideoUrl(url);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(errorMessage);
            if (errorMessage.includes("Requested entity was not found")) {
                setError("API key not found or invalid. Please select your key again.");
                setApiKeySelected(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (apiKeySelected === null) {
        return <div className="flex justify-center items-center h-64"><Spinner className="w-12 h-12" /></div>;
    }

    if (!apiKeySelected) {
        return <ApiKeySelector onKeySelected={() => setApiKeySelected(true)} />;
    }

    const aspectRatioToClass = {
        '16:9': 'aspect-video',
        '9:16': 'aspect-[9/16]',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Panel: Controls */}
            <div className="space-y-6 flex flex-col">
                <div>
                    <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
                    <textarea
                        id="prompt-video"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A neon hologram of a cat driving a futuristic car at top speed..."
                        className="w-full h-32 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none text-base"
                        disabled={isLoading}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="aspect-ratio-video" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                        <select
                            id="aspect-ratio-video"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)}
                            disabled={isLoading}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white"
                        >
                            {VIDEO_ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="resolution-video" className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                        <select
                            id="resolution-video"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value as VideoResolution)}
                            disabled={isLoading}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white"
                        >
                            {VIDEO_RESOLUTIONS.map(res => <option key={res} value={res}>{res}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex-grow"></div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
                >
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                    {isLoading ? 'Generating Masterpiece...' : 'Generate Video'}
                </button>
                 {error && !isLoading && (
                 <div className="flex items-center p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
                )}
            </div>
            {/* Right Panel: Output */}
            <div className={`w-full bg-gray-800/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-700 ${aspectRatioToClass[aspectRatio]}`}>
                 {isLoading ? (
                    <div className="text-center p-6">
                        <p className="text-lg text-indigo-400 font-semibold">{currentMessage}</p>
                        <p className="text-gray-400 mt-2">Video generation can take several minutes. Please be patient.</p>
                    </div>
                ) : videoUrl ? (
                    <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                ) : (
                     <div className="text-center text-gray-500 p-8">
                        <VideoCameraIcon className="w-16 h-16 mx-auto mb-4"/>
                        <p>Your generated video will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;