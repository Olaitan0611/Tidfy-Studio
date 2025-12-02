import React, { useState, useEffect, useRef } from 'react';
import ApiKeySelector from './ApiKeySelector';
import Spinner from './Spinner';
import { generateVideo, VideoGenerationOptions } from '../services/geminiService';
import { SparklesIcon, ExclamationTriangleIcon, VideoCameraIcon, ArrowDownTrayIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowPathIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { VideoAspectRatio, VideoResolution, VIDEO_ASPECT_RATIOS, VIDEO_RESOLUTIONS } from '../types';

const loadingMessages = [
    "Summoning digital spirits...",
    "Choreographing pixels...",
    "Rendering your vision into reality...",
    "This might take a few moments, great art needs time...",
    "Assembling the cinematic dream...",
    "The AI is painting with light and motion...",
];

const playbackSpeeds = [0.5, 1, 1.5, 2];

interface VideoHistoryItem {
  videoUrl: string;
  prompt: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
}

const LOCAL_STORAGE_KEY = 'tidfy-video-history';

const VideoGenerator: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [resolution, setResolution] = useState<VideoResolution>('720p');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentMessage, setCurrentMessage] = useState<string>(loadingMessages[0]);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [isLooping, setIsLooping] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [history, setHistory] = useState<VideoHistoryItem[]>([]);
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

    const messageInterval = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const speedMenuRef = useRef<HTMLDivElement>(null);

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

        try {
            const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to load video history from localStorage", error);
        }
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
    
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
            videoRef.current.loop = isLooping;
            videoRef.current.muted = isMuted;
        }
    }, [playbackRate, isLooping, isMuted, videoUrl]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
                setIsSpeedMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setPlaybackRate(1);
        try {
            const options: VideoGenerationOptions = { prompt, aspectRatio, resolution };
            const url = await generateVideo(options);
            setVideoUrl(url);

            setHistory(prevHistory => {
                const newHistoryItem = { videoUrl: url, prompt, aspectRatio, resolution };
                const newHistory = [newHistoryItem, ...prevHistory];
                const limitedHistory = newHistory.slice(0, 5); // Videos are large, limit to 5
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(limitedHistory));
                } catch (e) {
                    console.error("Could not save video history to localStorage", e);
                    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                        setError("Could not save to history: storage is full. Please clear history.");
                    }
                }
                return limitedHistory;
            });
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
    
    const handleDownload = () => {
        if (!videoUrl) return;
        const link = document.createElement('a');
        link.href = videoUrl;
        const filename = `${prompt.slice(0, 30).replace(/\s+/g, '_') || 'tidfy_video'}.mp4`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleHistoryClick = (item: VideoHistoryItem) => {
        if (isLoading) return;
        setVideoUrl(item.videoUrl);
        setPrompt(item.prompt);
        setAspectRatio(item.aspectRatio);
        setResolution(item.resolution);
    };

    const handleClearHistory = () => {
        setHistory([]);
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (e) {
            console.error("Could not clear video history from localStorage", e);
        }
    };


    if (apiKeySelected === null) {
        return <div className="flex justify-center items-center h-64"><Spinner className="w-12 h-12" /></div>;
    }

    if (!apiKeySelected) {
        return <ApiKeySelector onKeySelected={() => setApiKeySelected(true)} featureName="Videos" />;
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
                        className="w-full h-32 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none text-base"
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
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-white"
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
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-white"
                        >
                            {VIDEO_RESOLUTIONS.map(res => <option key={res} value={res}>{res}</option>)}
                        </select>
                    </div>
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
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
                <div className="flex-grow"></div>
                {/* History Section */}
                <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center mb-4">
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
                        <div className="max-h-48 overflow-y-auto pr-2 grid grid-cols-3 gap-3">
                            {history.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleHistoryClick(item)}
                                    className="relative aspect-video rounded-md overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:cursor-not-allowed bg-gray-900"
                                    disabled={isLoading}
                                    title={`Prompt: ${item.prompt}`}
                                >
                                    <video src={item.videoUrl} className="w-full h-full object-cover" preload="metadata" muted />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center p-1">
                                        <p className="text-white text-xs text-center font-semibold">Reuse</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-gray-500 py-4 px-2 bg-gray-800/50 rounded-lg">
                            <p>Your previous generations will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Right Panel: Output */}
             <div className="flex flex-col space-y-4">
                <div className={`w-full bg-gray-800/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-700 ${aspectRatioToClass[aspectRatio]}`}>
                    {isLoading ? (
                        <div className="text-center p-6">
                            <p className="text-lg text-fuchsia-400 font-semibold">{currentMessage}</p>
                            <p className="text-gray-400 mt-2">Video generation can take several minutes. Please be patient.</p>
                        </div>
                    ) : videoUrl ? (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            controls
                            autoPlay
                            loop={isLooping}
                            muted={isMuted}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center text-gray-500 p-8">
                            <VideoCameraIcon className="w-16 h-16 mx-auto mb-4"/>
                            <p>Your generated video will appear here</p>
                        </div>
                    )}
                </div>

                {videoUrl && !isLoading && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 flex flex-wrap items-center justify-between gap-y-4 gap-x-6">
                        {/* Playback Controls */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}
                            </button>
                            <button
                                onClick={() => setIsLooping(!isLooping)}
                                className={`p-2 rounded-full hover:bg-gray-700 transition-colors ${isLooping ? 'text-fuchsia-400' : 'text-gray-400 hover:text-white'}`}
                                title={isLooping ? "Disable loop" : "Enable loop"}
                            >
                                <ArrowPathIcon className="w-6 h-6" />
                            </button>
                            
                            <div className="h-6 w-px bg-gray-600"></div>
                            
                             <div className="relative" ref={speedMenuRef}>
                                <button
                                    onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                                    className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                                >
                                    <span>{playbackRate}x Speed</span>
                                    <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${isSpeedMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isSpeedMenuOpen && (
                                    <div className="absolute bottom-full mb-2 w-full bg-gray-600 rounded-lg shadow-lg overflow-hidden z-10">
                                        {playbackSpeeds.map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => {
                                                    setPlaybackRate(speed);
                                                    setIsSpeedMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                                    playbackRate === speed
                                                    ? 'bg-cyan-600 text-white'
                                                    : 'text-gray-200 hover:bg-gray-500'
                                                }`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info & Actions */}
                        <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-900/50 text-gray-300 border border-gray-600">
                                {resolution}
                            </span>

                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                title="Download Video"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                Download
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;