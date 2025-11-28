
import React, { useState } from 'react';
import Spinner from './Spinner';
import { generateImage, ImageGenerationOptions } from '../services/geminiService';
import { SparklesIcon, ExclamationTriangleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { ImageAspectRatio, IMAGE_ASPECT_RATIOS } from '../types';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        try {
            const options: ImageGenerationOptions = { prompt, negativePrompt, aspectRatio };
            const url = await generateImage(options);
            setImageUrl(url);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while generating the image.');
        } finally {
            setIsLoading(false);
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
            <div className="space-y-6">
                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A hyper-realistic portrait of a futuristic African queen..."
                        className="w-full h-32 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none text-base"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-300 mb-2">Negative Prompt (what to avoid)</label>
                    <textarea
                        id="negative-prompt"
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="e.g., blurry, cartoon, text"
                        className="w-full h-20 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none text-base"
                        disabled={isLoading}
                    />
                </div>
                 <div>
                    <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <select
                        id="aspect-ratio"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}
                        disabled={isLoading}
                        className="w-full p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-white"
                    >
                        {IMAGE_ASPECT_RATIOS.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
                    </select>
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
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
            </div>
            
            {/* Right Panel: Output */}
            <div className={`w-full bg-gray-800/50 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-700 ${aspectRatioToClass[aspectRatio]}`}>
                {isLoading ? (
                     <div className="flex flex-col items-center text-gray-400">
                        <Spinner className="w-16 h-16" />
                        <span className="mt-4">Generating...</span>
                    </div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-gray-500 p-8">
                        <PhotoIcon className="w-16 h-16 mx-auto mb-4"/>
                        <p>Your generated image will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;