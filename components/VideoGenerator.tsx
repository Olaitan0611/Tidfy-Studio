import React, { useState, useEffect, useRef } from 'react';
import Spinner from './Spinner';
import MusicGenerationModal from './MusicGenerationModal';
import { generateVideo, VideoGenerationOptions } from '../services/geminiService';
import { SparklesIcon, ExclamationTriangleIcon, VideoCameraIcon, ArrowDownTrayIcon, SpeakerWaveIcon, SpeakerXMarkIcon, ArrowPathIcon, TrashIcon, ChevronDownIcon, MusicalNoteIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

const presetMusic = [
    { name: 'Amapiano Groove', url: null },
    { name: 'Afrobeat Chill', url: null },
    { name: 'Highlife Joy', url: null },
];

interface VideoGeneratorProps {
    lowBandwidth: boolean;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ lowBandwidth }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [resolution, setResolution] = useState<VideoResolution>(lowBandwidth ? '480p' : '720p');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentMessage, setCurrentMessage] = useState<string>(loadingMessages[0]);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [isLooping, setIsLooping] = useState<boolean>(true);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [history, setHistory] = useState<VideoHistoryItem[]>([]);
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

    // Background Music State
    const [backgroundMusic, setBackgroundMusic] = useState<{ name: string; url: string | null; source: 'preset' | 'upload' | 'ai' } | null>(null);
    const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
    const musicUploadRef = useRef<HTMLInputElement>(null);

    const messageInterval = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const speedMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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
        if (!isLoading && !videoUrl) {
           setResolution(lowBandwidth ? '480p' : '720p');
        }
    }, [lowBandwidth, isLoading, videoUrl]);


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
        return () => { if (messageInterval.current) clearInterval(messageInterval.current) };
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
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
                const newHistory = [newHistoryItem, ...prevHistory].slice(0, 5);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistory));
                return newHistory;
            });
        } catch (err: any) {
            setError((err as Error).message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = (type: 'video' | 'audio') => {
        let url, filename;
        if (type === 'video' && videoUrl) {
            url = videoUrl;
            filename = `${prompt.slice(0, 30).replace(/\s+/g, '_') || 'tidfy_video'}.mp4`;
        } else if (type === 'audio' && backgroundMusic?.url) {
            url = backgroundMusic.url;
            filename = `${backgroundMusic.name.replace(/\s+/g, '_')}.mp3`;
        } else {
            return;
        }

        const link = document.createElement('a');
        link.href = url;
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
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    };

    const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setBackgroundMusic({
                    name: file.name,
                    url: e.target?.result as string,
                    source: 'upload',
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleMusicGenerated = (audioData: string, musicPrompt: string) => {
        setBackgroundMusic({
            name: `AI Music: ${musicPrompt.slice(0, 20)}...`,
            url: `data:audio/wav;base64,${audioData}`,
            source: 'ai'
        });
    };

    const aspectRatioToClass = { '16:9': 'aspect-video', '9:16': 'aspect-[9/16]' };

    return (
    <>
        {isMusicModalOpen && (
            <MusicGenerationModal
                onClose={() => setIsMusicModalOpen(false)}
                onMusicGenerated={handleMusicGenerated}
            />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="space-y-6 flex flex-col">
                <div>
                    <label htmlFor="prompt-video" className="block text-sm font-medium text-text-primary mb-2">Prompt</label>
                    <textarea id="prompt-video" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A neon hologram of a cat driving a futuristic car..." className="w-full h-24 p-4 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition resize-none text-base" disabled={isLoading} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="aspect-ratio-video" className="block text-sm font-medium text-text-primary mb-2">Aspect Ratio</label>
                        <select id="aspect-ratio-video" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as VideoAspectRatio)} disabled={isLoading} className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition">
                            {VIDEO_ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="resolution-video" className="block text-sm font-medium text-text-primary mb-2">Resolution</label>
                        <select id="resolution-video" value={resolution} onChange={(e) => setResolution(e.target.value as VideoResolution)} disabled={isLoading} className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition">
                            {VIDEO_RESOLUTIONS.map(res => <option key={res.value} value={res.value}>{res.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Background Music (Optional)</label>
                    <div className="space-y-3 p-3 bg-surface-input/50 rounded-lg border border-border">
                        {backgroundMusic ? (
                             <div className="bg-surface p-2 rounded-lg flex items-center justify-between">
                                <div className="flex items-center min-w-0">
                                    <MusicalNoteIcon className="w-5 h-5 mr-3 text-secondary flex-shrink-0" />
                                    <p className="text-sm font-medium text-text-primary truncate">{backgroundMusic.name}</p>
                                </div>
                                <button onClick={() => setBackgroundMusic(null)} className="p-1 rounded-full text-text-secondary hover:bg-border">
                                    <XMarkIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-text-secondary mb-2">Select a preset or add your own audio.</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {presetMusic.map(music => (
                                        <button key={music.name} onClick={() => setBackgroundMusic({...music, source: 'preset'})} className="text-xs text-center bg-surface hover:bg-border font-semibold p-2 rounded-md transition-colors">{music.name}</button>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-border">
                                    <input type="file" ref={musicUploadRef} onChange={handleMusicUpload} hidden accept="audio/*" />
                                    <button onClick={() => musicUploadRef.current?.click()} className="w-1/2 text-sm flex items-center justify-center bg-surface hover:bg-border font-semibold p-2 rounded-md transition-colors"><CloudArrowUpIcon className="w-5 h-5 mr-2"/>Upload</button>
                                    <button onClick={() => setIsMusicModalOpen(true)} className="w-1/2 text-sm flex items-center justify-center bg-surface hover:bg-border font-semibold p-2 rounded-md transition-colors"><SparklesIcon className="w-5 h-5 mr-2"/>Generate AI</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                <button onClick={handleGenerate} disabled={isLoading} className="flex items-center justify-center w-full bg-secondary hover:bg-secondary-hover disabled:bg-secondary/20 disabled:cursor-not-allowed text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300">
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
                <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-text-primary">Generation History</h3>
                        {history.length > 0 && ( <button onClick={handleClearHistory} className="text-text-secondary hover:text-text-primary transition-colors flex items-center text-sm" title="Clear history" disabled={isLoading}><TrashIcon className="w-4 h-4 mr-1.5" />Clear</button>)}
                    </div>
                    {history.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto pr-2 grid grid-cols-3 gap-3">
                            {history.map((item, index) => (
                                <button key={index} onClick={() => handleHistoryClick(item)} className="relative aspect-video rounded-md overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary disabled:cursor-not-allowed bg-surface" disabled={isLoading} title={`Prompt: ${item.prompt}`}><video src={item.videoUrl} className="w-full h-full object-cover" preload="metadata" muted /><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center p-1"><p className="text-white text-xs text-center font-semibold">Reuse</p></div></button>
                            ))}
                        </div>
                    ) : ( <div className="text-center text-sm text-text-tertiary py-4 px-2 bg-surface-input/50 rounded-lg"><p>Your previous generations will appear here.</p></div> )}
                </div>
            </div>
            <div className="flex flex-col space-y-4">
                <div className={`w-full bg-surface-input/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border ${aspectRatioToClass[aspectRatio]}`}>
                    {isLoading ? ( <div className="text-center p-6"><p className="text-lg text-primary font-semibold">{currentMessage}</p><p className="text-text-secondary mt-2">Video generation can take several minutes.</p></div>
                    ) : videoUrl ? ( <video ref={videoRef} src={videoUrl} controls autoPlay loop={isLooping} muted={isMuted} className="w-full h-full object-cover"/>
                    ) : ( <div className="text-center text-text-tertiary p-8"><VideoCameraIcon className="w-16 h-16 mx-auto mb-4"/><p>Your generated video will appear here</p></div> )}
                </div>
                
                {videoUrl && !isLoading && (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => handleDownload('video')}
                            className="w-full flex items-center justify-center bg-secondary hover:bg-secondary-hover text-text-on-secondary font-bold py-3 px-6 rounded-lg transition-all duration-300 text-base flex-grow"
                        >
                            <ArrowDownTrayIcon className="w-6 h-6 mr-2" />
                            Download Video
                        </button>
                        {backgroundMusic?.url && (
                            <button
                                onClick={() => handleDownload('audio')}
                                className="w-full sm:w-auto flex items-center justify-center bg-surface hover:bg-border text-text-primary font-bold py-3 px-6 rounded-lg transition-colors"
                                title="Download Audio Track"
                            >
                                <MusicalNoteIcon className="w-5 h-5 mr-2" />
                                <span>Audio</span>
                            </button>
                        )}
                    </div>
                )}

                {backgroundMusic && !isLoading && videoUrl && (
                     <div className="bg-surface-input/50 border border-border rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-text-primary flex items-center"><MusicalNoteIcon className="w-5 h-5 mr-2 text-secondary"/>{backgroundMusic.name}</p>
                            {backgroundMusic.url && <audio src={backgroundMusic.url} controls className="h-8 max-w-[150px] sm:max-w-[200px]"/>}
                        </div>
                        {backgroundMusic.source === 'preset' && <p className="text-xs text-text-tertiary text-center">Preset audio will be available for download with your video.</p>}
                     </div>
                )}
                
                {videoUrl && !isLoading && (
                    <div className="bg-surface-input/50 border border-border rounded-xl p-3 flex flex-wrap items-center gap-y-4 gap-x-6">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full text-text-primary hover:bg-border transition-colors" title={isMuted ? "Unmute" : "Mute"}>{isMuted ? <SpeakerXMarkIcon className="w-6 h-6" /> : <SpeakerWaveIcon className="w-6 h-6" />}</button>
                            <button onClick={() => setIsLooping(!isLooping)} className={`p-2 rounded-full hover:bg-border transition-colors ${isLooping ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`} title={isLooping ? "Disable loop" : "Enable loop"}><ArrowPathIcon className="w-6 h-6" /></button>
                             <div className="relative" ref={speedMenuRef}>
                                <button onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)} className="flex items-center justify-center bg-surface-input hover:bg-border text-text-secondary font-medium py-2 px-3 rounded-lg transition-colors text-sm"><span>{playbackRate}x Speed</span><ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${isSpeedMenuOpen ? 'rotate-180' : ''}`} /></button>
                                {isSpeedMenuOpen && ( <div className="absolute bottom-full mb-2 w-full bg-border rounded-lg shadow-lg overflow-hidden z-10">{playbackSpeeds.map(speed => ( <button key={speed} onClick={() => { setPlaybackRate(speed); setIsSpeedMenuOpen(false); }} className={`w-full text-left px-3 py-2 text-sm transition-colors ${playbackRate === speed ? 'bg-secondary-hover text-text-on-secondary' : 'text-text-primary hover:bg-surface-input'}`}>{speed}x</button>))}</div>)}
                            </div>
                        </div>
                    </div>
                )}

                 {videoUrl && backgroundMusic && !isLoading && (
                    <p className="text-xs text-text-tertiary text-center p-2 bg-surface-input/50 rounded-md">
                        <strong>Pro Tip:</strong> Download both video and audio, then combine them in your favorite editor.
                    </p>
                )}
            </div>
        </div>
    </>
    );
};

export default VideoGenerator;