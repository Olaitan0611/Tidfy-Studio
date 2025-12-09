import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import { generateImage, ImageGenerationOptions } from '../services/geminiService';
import { SparklesIcon, ExclamationTriangleIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ImageAspectRatio, IMAGE_ASPECT_RATIOS, ImageResolution, IMAGE_RESOLUTIONS } from '../types';

interface ImageHistoryItem {
  imageUrl: string;
  prompt: string;
  negativePrompt: string;
  aspectRatio: ImageAspectRatio;
  resolution: ImageResolution;
}

const LOCAL_STORAGE_KEY = 'tidfy-image-history-hq';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
    const [resolution, setResolution] = useState<ImageResolution>('1K');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ImageHistoryItem[]>([]);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to load image history from localStorage", error);
        }
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        try {
            const options: ImageGenerationOptions = { prompt, negativePrompt, aspectRatio, resolution };
            const url = await generateImage(options);
            setImageUrl(url);
            setHistory(prevHistory => {
                const newHistoryItem = { imageUrl: url, prompt, negativePrompt, aspectRatio, resolution };
                const newHistory = [newHistoryItem, ...prevHistory];
                const limitedHistory = newHistory.slice(0, 20); // Keep latest 20 items
                try {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(limitedHistory));
                } catch (e) {
                    console.error("Could not save history to localStorage", e);
                }
                return limitedHistory;
            });
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred while generating the image.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHistoryClick = (item: ImageHistoryItem) => {
        if (isLoading) return;
        setImageUrl(item.imageUrl);
        setPrompt(item.prompt);
        setNegativePrompt(item.negativePrompt);
        setAspectRatio(item.aspectRatio);
        setResolution(item.resolution);
    };

    const handleClearHistory = () => {
        setHistory([]);
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (e) {
            console.error("Could not clear history from localStorage", e);
        }
    };

    const aspectRatioToClass = {
        '1:1': 'aspect-square',
        '16:9': 'aspect-video',
        '9:16': 'aspect-[9/16]',
        '4:3': 'aspect-[4/3]',
        '3:4': 'aspect-[3/4]',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Panel: Controls */}
            <div className="space-y-6 flex flex-col">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-text-primary mb-2">Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A hyper-realistic portrait of a futuristic African queen..."
                        className="w-full h-32 p-4 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition resize-none text-base"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="negative-prompt" className="block text-sm font-medium text-text-primary mb-2">Negative Prompt (what to avoid)</label>
                    <textarea
                        id="negative-prompt"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g., blurry, cartoon, text"
                        className="w-full h-20 p-4 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition resize-none text-base"
                        disabled={isLoading}
                    />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="aspect-ratio" className="block text-sm font-medium text-text-primary mb-2">Aspect Ratio</label>
                        <select
                            id="aspect-ratio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}
                            disabled={isLoading}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            {IMAGE_ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="resolution-image" className="block text-sm font-medium text-text-primary mb-2">Quality / Resolution</label>
                        <select
                            id="resolution-image"
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value as ImageResolution)}
                            disabled={isLoading}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            {IMAGE_RESOLUTIONS.map(res => <option key={res.value} value={res.value}>{res.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full bg-secondary hover:bg-secondary-hover disabled:bg-secondary/20 disabled:cursor-not-allowed text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300"
                >
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                    {isLoading ? 'Creating Image...' : 'Generate Image'}
                </button>
                 {error && !isLoading && (
                    <div className="w-full flex items-center p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                        <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
                
                <div className="flex-grow"></div>
                {/* History Section */}
                <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center mb-4">
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
                        <div className="max-h-48 overflow-y-auto pr-2 grid grid-cols-4 gap-3">
                            {history.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleHistoryClick(item)}
                                    className="relative aspect-square rounded-md overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                    title={`Prompt: ${item.prompt}`}
                                >
                                    <img src={item.imageUrl} alt={`History item ${index + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center p-1">
                                        <p className="text-white text-xs text-center font-semibold">Reuse</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-text-tertiary py-4 px-2 bg-surface-input/50 rounded-lg">
                            <p>Your previous generations will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Right Panel: Output */}
            <div className={`w-full bg-surface-input/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border ${aspectRatioToClass[aspectRatio]}`}>
                {isLoading ? (
                     <div className="flex flex-col items-center text-text-secondary">
                        <Spinner className="w-16 h-16" />
                        <span className="mt-4">Generating...</span>
                    </div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-text-tertiary p-8">
                        <PhotoIcon className="w-16 h-16 mx-auto mb-4"/>
                        <p>Your generated image will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;