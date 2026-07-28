import React, { useState, useEffect } from 'react';
import { generateAfricanSongSample } from '../services/geminiService';
import { PlayIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { CalabashDownloadIcon } from './CustomIcons';

const AFRICAN_COUNTRIES = {
  "Nigeria": ["Yoruba", "Igbo", "Hausa", "Pidgin English", "Edo", "Tiv"],
  "South Africa": ["Zulu", "Xhosa", "Afrikaans", "Sotho", "Tswana"],
  "Kenya": ["Swahili", "Kikuyu", "Luo", "Kamba", "Kalenjin"],
  "Ghana": ["Twi", "Ewe", "Ga", "Fante", "Dagbani"],
  "Tanzania": ["Swahili", "Sukuma", "Chaga", "Gogo", "Haya"],
  "Ethiopia": ["Amharic", "Oromo", "Somali", "Tigrinya", "Sidama"],
  "Egypt": ["Arabic", "Nubian", "Domari"],
  "Morocco": ["Arabic", "Tamazight", "French"],
  "Uganda": ["Luganda", "Swahili", "Runyakitara", "Lusoga"],
  "Senegal": ["Wolof", "Pulaar", "Serer", "Jola", "Mandinka"]
};

const MUSIC_STYLES = ["Afrobeats", "Amapiano", "Hip-hop", "Highlife", "Gospel", "Chill"];

const PREMADE_SONG_EXAMPLES = [
    {
        title: "Lagos Nights",
        style: "Afrobeats",
        country: "Nigeria",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "Jozi Groove",
        style: "Amapiano",
        country: "South Africa",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "Nairobi Breeze",
        style: "Chill",
        country: "Kenya",
        audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
];

interface AfricanSongGeneratorProps {
    isAuthenticated?: boolean;
    onRequestLogin?: () => void;
}

const AfricanSongGenerator: React.FC<AfricanSongGeneratorProps> = ({ isAuthenticated = false, onRequestLogin }) => {
    const [lyrics, setLyrics] = useState('');
    const [country, setCountry] = useState(Object.keys(AFRICAN_COUNTRIES)[0]);
    const [language, setLanguage] = useState(AFRICAN_COUNTRIES[Object.keys(AFRICAN_COUNTRIES)[0] as keyof typeof AFRICAN_COUNTRIES][0]);
    const [style, setStyle] = useState(MUSIC_STYLES[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [samples, setSamples] = useState<string[]>([]);

    // Update languages when country changes
    useEffect(() => {
        const countryLangs = AFRICAN_COUNTRIES[country as keyof typeof AFRICAN_COUNTRIES];
        if (countryLangs && countryLangs.length > 0) {
            setLanguage(countryLangs[0]);
        }
    }, [country]);

    const handleGenerate = async () => {
        if (!lyrics.trim()) {
            setError("Please paste some lyrics first.");
            return;
        }
        
        setLoading(true);
        setError('');
        setSamples([]);

        try {
            // Generate two samples concurrently
            const [sample1, sample2] = await Promise.all([
                generateAfricanSongSample({ lyrics, country, language, style, variation: 1 }),
                generateAfricanSongSample({ lyrics, country, language, style, variation: 2 })
            ]);

            setSamples([
                `data:audio/wav;base64,${sample1}`,
                `data:audio/wav;base64,${sample2}`
            ]);
        } catch (err: any) {
            setError(err.message || 'Failed to generate song samples.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadClick = () => {
        if (!isAuthenticated) {
            if (onRequestLogin) onRequestLogin();
        } else {
            alert("Downloading full-quality track... (Simulated)");
        }
    };

    return (
        <div className="animate-fadeInUp max-w-4xl mx-auto space-y-8">
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-8">
                <h3 className="text-xl font-bold text-text-primary mb-4">Inspiration Showcase</h3>
                <p className="text-sm text-text-secondary mb-4">Listen to what others have created (Examples)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PREMADE_SONG_EXAMPLES.map((ex, idx) => (
                        <div key={idx} className="bg-surface-input border border-border rounded-xl p-4 flex flex-col items-center text-center space-y-3 shadow-sm hover:border-secondary transition-colors">
                            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                                <PlayIcon className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-text-primary text-sm">{ex.title}</h4>
                                <p className="text-xs text-text-tertiary">{ex.style} • {ex.country}</p>
                            </div>
                            <audio controls src={ex.audioSrc} className="w-full h-8" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-text-primary mb-6">Create Your African Song</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Song Lyrics <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            placeholder="Paste your song lyrics here..."
                            maxLength={2500}
                            rows={6}
                            className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary resize-y"
                        />
                        <div className="text-right text-xs text-text-tertiary mt-1">
                            {lyrics.length}/2500
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">African Country</label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {Object.keys(AFRICAN_COUNTRIES).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Native Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {(AFRICAN_COUNTRIES[country as keyof typeof AFRICAN_COUNTRIES] || []).map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Music Style</label>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {MUSIC_STYLES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !lyrics.trim()}
                        className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <>
                                <span className="animate-indigo-ripple"></span>
                                <span>Creating your song samples...</span>
                            </>
                        ) : (
                            <>
                                <PlayIcon className="h-5 w-5" />
                                <span>Generate My Song</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {samples.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary">Your Previews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {samples.map((sample, index) => (
                            <div key={index} className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2">
                                    <PlayIcon className="h-8 w-8 text-secondary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-text-primary">Sample {index + 1}</h4>
                                    <p className="text-sm text-text-tertiary">20-30s Watermarked Preview</p>
                                </div>
                                
                                <audio controls src={sample} className="w-full mt-4" />
                                
                                <button
                                    onClick={handleDownloadClick}
                                    className={`w-full mt-6 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                                        isAuthenticated 
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-surface-input border border-border text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    {isAuthenticated ? (
                                        <>
                                            <CalabashDownloadIcon className="h-5 w-5" />
                                            <span>Download Full Track</span>
                                        </>
                                    ) : (
                                        <>
                                            <CalabashDownloadIcon className="h-5 w-5" />
                                            <span>Download Full Track</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AfricanSongGenerator;
