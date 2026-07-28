import React, { useState } from 'react';
import { generateImage, generateVideo } from '../services/geminiService';
import { PlayIcon, PhotoIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { CalabashDownloadIcon } from './CustomIcons';

const FABRIC_STYLES = [
  "Ankara-inspired",
  "Adire-inspired",
  "Kente-inspired",
  "Aso-oke-inspired",
  "Adinkra-symbol-inspired",
  "Modern fusion"
];

const GARMENT_TYPES = [
  "Fabric pattern only",
  "Dress",
  "Agbada",
  "Shirt",
  "Headwrap (gele)",
  "Full outfit"
];

const COLOR_PALETTES = [
  "Earth tones",
  "Bold & vibrant",
  "Monochrome indigo",
  "Pastel modern",
  "Gold accent"
];

interface AfricanFashionGeneratorProps {
    isAuthenticated?: boolean;
    onRequestLogin?: () => void;
}

const PREMADE_EXAMPLES = [
    {
        imageUrl: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&q=80&w=800",
        prompt: "Bold Ankara print with geometric orange and green patterns for a modern agbada"
    },
    {
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
        prompt: "Contemporary Kente-inspired dress with vibrant reds and golds"
    },
    {
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
        prompt: "Indigo Adire-inspired modern two-piece fusion outfit"
    }
];

const AfricanFashionGenerator: React.FC<AfricanFashionGeneratorProps> = ({ isAuthenticated = false, onRequestLogin }) => {
    const [designPrompt, setDesignPrompt] = useState('');
    const [fabricStyle, setFabricStyle] = useState(FABRIC_STYLES[0]);
    const [garmentType, setGarmentType] = useState(GARMENT_TYPES[0]);
    const [colorPalette, setColorPalette] = useState(COLOR_PALETTES[0]);
    
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [imageResults, setImageResults] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [imageError, setImageError] = useState('');

    const [animatePrompt, setAnimatePrompt] = useState('');
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoResult, setVideoResult] = useState<string | null>(null);
    const [videoError, setVideoError] = useState('');

    const handleGenerateImages = async () => {
        if (!designPrompt.trim()) {
            setImageError("Please describe your design idea.");
            return;
        }

        setIsGeneratingImages(true);
        setImageError('');
        setImageResults([]);
        setSelectedImageIndex(null);
        setVideoResult(null);

        try {
            const assembledPrompt = `High fashion editorial photography of African fashion. Style: ${fabricStyle}. Garment: ${garmentType}. Colors: ${colorPalette}. Description: ${designPrompt}. High quality, detailed, visually striking.`;
            
            // Generate 2 variations concurrently
            const [img1, img2] = await Promise.all([
                generateImage({
                    prompt: assembledPrompt + ' Variation 1',
                    aspectRatio: "3:4",
                    resolution: "1K"
                }),
                generateImage({
                    prompt: assembledPrompt + ' Variation 2, different angle or model',
                    aspectRatio: "3:4",
                    resolution: "1K"
                })
            ]);

            setImageResults([img1, img2]);
        } catch (err: any) {
            setImageError(err.message || 'Failed to generate design images.');
        } finally {
            setIsGeneratingImages(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (selectedImageIndex === null) return;
        if (!animatePrompt.trim()) {
            setVideoError("Please describe the motion.");
            return;
        }

        setIsGeneratingVideo(true);
        setVideoError('');
        setVideoResult(null);

        try {
            // Note: Currently Veo model in the service takes just a prompt. 
            // In a real implementation with image-to-video, we'd pass the image as well.
            // For now, we combine the original design info with the motion prompt.
            const fullVideoPrompt = `Video of African fashion. Style: ${fabricStyle}. Garment: ${garmentType}. Motion: ${animatePrompt}. High quality, realistic motion.`;
            
            const videoUrl = await generateVideo({
                prompt: fullVideoPrompt,
                aspectRatio: "16:9",
                resolution: "720p"
            });

            setVideoResult(videoUrl);
        } catch (err: any) {
            setVideoError(err.message || 'Failed to generate video.');
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    return (
        <div className="animate-fadeInUp max-w-5xl mx-auto space-y-8">
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-8">
                <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-secondary" />
                    Inspiration Showcase
                </h3>
                <p className="text-sm text-text-secondary mb-4">Check out what others have created (Examples)</p>
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                    {PREMADE_EXAMPLES.map((ex, idx) => (
                        <div key={idx} className="flex-none w-64 snap-center group relative rounded-xl overflow-hidden border border-border">
                            <img src={ex.imageUrl} alt={ex.prompt} className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                                <p className="text-white text-xs line-clamp-3">{ex.prompt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 text-secondary" />
                    Create Your Own Fabric & Fashion Design
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Design Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={designPrompt}
                            onChange={(e) => setDesignPrompt(e.target.value)}
                            placeholder="Describe your fabric or outfit idea, e.g. 'Bold Ankara print with geometric orange and green patterns for a modern agbada'"
                            maxLength={1000}
                            rows={4}
                            className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary resize-y"
                        />
                        <div className="text-right text-xs text-text-tertiary mt-1">
                            {designPrompt.length}/1000
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Fabric Style</label>
                            <select
                                value={fabricStyle}
                                onChange={(e) => setFabricStyle(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {FABRIC_STYLES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Garment Type</label>
                            <select
                                value={garmentType}
                                onChange={(e) => setGarmentType(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {GARMENT_TYPES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Color Palette</label>
                            <select
                                value={colorPalette}
                                onChange={(e) => setColorPalette(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {COLOR_PALETTES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {imageError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                            {imageError}
                        </div>
                    )}

                    <button
                        onClick={handleGenerateImages}
                        disabled={isGeneratingImages || !designPrompt.trim()}
                        className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                    >
                        {isGeneratingImages ? (
                            <>
                                <span className="animate-indigo-ripple"></span>
                                <span>Designing variations...</span>
                            </>
                        ) : (
                            <>
                                <PhotoIcon className="h-5 w-5" />
                                <span>Generate Design Variations</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {imageResults.length > 0 && (
                <div className="bg-surface border border-border rounded-xl p-6 shadow-sm animate-fadeInUp">
                    <h3 className="text-xl font-bold text-text-primary mb-2">Design Variations</h3>
                    <p className="text-text-secondary text-sm mb-6">Select a design to animate it into a video.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {imageResults.map((img, idx) => (
                            <div 
                                key={idx} 
                                className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${selectedImageIndex === idx ? 'border-secondary shadow-lg scale-[1.02]' : 'border-transparent hover:border-border'}`}
                                onClick={() => setSelectedImageIndex(idx)}
                            >
                                <img src={img} alt={`Variation ${idx + 1}`} className="w-full h-auto object-cover aspect-[3/4]" referrerPolicy="no-referrer" />
                                {selectedImageIndex === idx && (
                                    <div className="absolute top-4 right-4 bg-secondary text-white rounded-full p-1 shadow-md">
                                        <CheckCircleIcon className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {selectedImageIndex !== null && (
                        <div className="mt-8 p-6 bg-surface-input border border-border rounded-xl animate-fadeInUp space-y-6">
                            <h4 className="text-lg font-bold text-text-primary">Animate Your Design</h4>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Motion Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={animatePrompt}
                                    onChange={(e) => setAnimatePrompt(e.target.value)}
                                    placeholder="Describe the motion, e.g. 'Fabric flowing in the wind' or 'Model walking confidently on a runway'"
                                    rows={3}
                                    className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary resize-y"
                                />
                            </div>

                            {videoError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                                    {videoError}
                                </div>
                            )}

                            <button
                                onClick={handleGenerateVideo}
                                disabled={isGeneratingVideo || !animatePrompt.trim()}
                                className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                            >
                                {isGeneratingVideo ? (
                                    <>
                                        <span className="animate-indigo-ripple"></span>
                                        <span>Bringing your design to life...</span>
                                    </>
                                ) : (
                                    <>
                                        <PlayIcon className="h-5 w-5" />
                                        <span>Turn Into Video</span>
                                    </>
                                )}
                            </button>

                            {videoResult && (
                                <div className="mt-8 animate-fadeInUp">
                                    <h4 className="text-lg font-bold text-text-primary mb-4">Your Animated Design</h4>
                                    <div className="rounded-xl overflow-hidden border border-border shadow-md bg-black relative aspect-video">
                                        <video 
                                            src={videoResult} 
                                            controls 
                                            autoPlay 
                                            loop 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    {isAuthenticated ? (
                                        <a 
                                            href={videoResult} 
                                            download="african-fashion-animation.mp4"
                                            className="mt-4 flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                                        >
                                            <CalabashDownloadIcon className="h-5 w-5" />
                                            <span>Download Video</span>
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => onRequestLogin && onRequestLogin()}
                                            className="mt-4 flex items-center justify-center space-x-2 w-full py-3 px-4 rounded-lg font-medium bg-surface-input border border-border text-text-secondary hover:text-text-primary transition-colors"
                                        >
                                            <CalabashDownloadIcon className="h-5 w-5" />
                                            <span>Download Video</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            <div className="text-center text-sm text-text-tertiary px-4 pb-8">
                <p>Note: Generated designs are AI-inspired interpretations of traditional styles, not exact reproductions of trademarked prints. Use as inspiration.</p>
            </div>
        </div>
    );
};

export default AfricanFashionGenerator;
